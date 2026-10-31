import type { Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { start } from "../src/index.js";
import { cleanupTempDb, createTempSqlitePath, runDbmate } from "./helpers/migrate-temp-db.js";

let server: Server | undefined;
let sqlitePath: string | undefined;
let baseUrl = "";

afterEach(async () => {
  if (server !== undefined) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => (error ? reject(error) : resolve()));
    });
    server = undefined;
  }
  if (sqlitePath !== undefined) {
    cleanupTempDb(sqlitePath);
    sqlitePath = undefined;
  }
});

async function boot(): Promise<void> {
  sqlitePath = createTempSqlitePath("integration");
  runDbmate(sqlitePath, "up");
  process.env.SQLITE_PATH = sqlitePath;
  server = await start(0);
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("server did not bind a port");
  }
  // AC-05: process listens on loopback only — no remote bind.
  expect(address.address).toBe("127.0.0.1");
  baseUrl = `http://127.0.0.1:${address.port}`;
}

async function json(
  path: string,
  init?: RequestInit,
): Promise<{ status: number; body: unknown }> {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();
  const body = text === "" ? null : (JSON.parse(text) as unknown);
  return { status: response.status, body };
}

describe("integration core flows (AC-01…AC-17)", () => {
  it("opens a stair, refuses empty names and a second open, finishes, shows progress (AC-01,02,03,04,06,09,10,11,12,15,16,17)", async () => {
    await boot();

    const emptyStair = await json("/api/v1/stairs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stair_name: "   ", goal_name: "Homework" }),
    });
    expect(emptyStair.status).toBe(400);
    expect(emptyStair.body).toMatchObject({
      code: "open_stair.empty_stair_name",
      message: "The name has to be a completed action.",
    });

    const emptyGoal = await json("/api/v1/stairs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stair_name: "Write the outline", goal_name: " " }),
    });
    expect(emptyGoal.status).toBe(400);
    expect(emptyGoal.body).toMatchObject({
      code: "open_stair.empty_goal_name",
      message: "The goal needs a name.",
    });

    const opened = await json("/api/v1/stairs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stair_name: "Write the outline", goal_name: "Homework" }),
    });
    expect(opened.status).toBe(201);
    const openBody = opened.body as {
      id: string;
      goal_id: string;
      goal_name: string;
      name: string;
      status: string;
    };
    expect(openBody.name).toBe("Write the outline");
    expect(openBody.goal_name).toBe("Homework");
    expect(openBody.status).toBe("open");

    const second = await json("/api/v1/stairs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stair_name: "Another", goal_name: "Other" }),
    });
    expect(second.status).toBe(409);
    expect(second.body).toMatchObject({
      code: "open_stair.already_open",
      message: "Mark the current stair done first.",
    });

    const homeWhileOpen = await json("/api/v1/home");
    expect(homeWhileOpen.status).toBe(200);
    const homeOpen = homeWhileOpen.body as {
      goals: { id: string; name: string }[];
      open_stair: { name: string; goal_name: string } | null;
    };
    expect(homeOpen.goals.map((g) => g.name)).toEqual(["Homework"]);
    expect(homeOpen.open_stair?.name).toBe("Write the outline");

    const homeHtml = await fetch(`${baseUrl}/`);
    expect(await homeHtml.text()).toContain("Write the outline");

    const progressEmpty = await json(`/api/v1/goals/${openBody.goal_id}`);
    expect(progressEmpty.status).toBe(200);
    expect(progressEmpty.body).toMatchObject({
      finished_stairs: [],
      total_elapsed_seconds: 0,
    });

    const finished = await json("/api/v1/stairs/open/finish", { method: "POST" });
    expect(finished.status).toBe(200);
    const finishedBody = finished.body as {
      finished_stairs: { name: string; status: string }[];
      total_elapsed_seconds: number;
    };
    expect(finishedBody.finished_stairs).toHaveLength(1);
    expect(finishedBody.finished_stairs[0]?.name).toBe("Write the outline");
    expect(finishedBody.finished_stairs[0]?.status).toBe("finished");

    // AC-11: trimmed same goal name joins the existing goal (case-sensitive).
    const reopen = await json("/api/v1/stairs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        stair_name: "Write the outline",
        goal_name: "  Homework  ",
      }),
    });
    expect(reopen.status).toBe(201);
    const reopenBody = reopen.body as { goal_id: string };
    expect(reopenBody.goal_id).toBe(openBody.goal_id);

    const goalsList = await json("/api/v1/goals");
    const goalsBody = goalsList.body as { items: { name: string }[] };
    expect(goalsBody.items.filter((g) => g.name === "Homework")).toHaveLength(1);

    await json("/api/v1/stairs/open/finish", { method: "POST" });

    const progress = await json(`/api/v1/goals/${openBody.goal_id}`);
    const progressBody = progress.body as {
      finished_stairs: { name: string; elapsed_seconds: number }[];
      total_elapsed_seconds: number;
    };
    expect(progressBody.finished_stairs).toHaveLength(2);
    expect(progressBody.finished_stairs.every((s) => s.name === "Write the outline")).toBe(true);
    expect(progressBody.total_elapsed_seconds).toBe(
      progressBody.finished_stairs[0]!.elapsed_seconds +
        progressBody.finished_stairs[1]!.elapsed_seconds,
    );

    const goalsPage = await fetch(`${baseUrl}/goals/${openBody.goal_id}`);
    const goalsHtml = await goalsPage.text();
    expect(goalsHtml).toContain("Write the outline");
    expect(goalsHtml).toContain("Correct");
  });

  it("corrects finished stair and refuses invalid name/time (AC-07, AC-13, AC-14)", async () => {
    await boot();
    const opened = await json("/api/v1/stairs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stair_name: "Outline", goal_name: "Homework" }),
    });
    const openBody = opened.body as { id: string; goal_id: string };
    await json("/api/v1/stairs/open/finish", { method: "POST" });

    const progressBefore = await json(`/api/v1/goals/${openBody.goal_id}`);
    const before = progressBefore.body as {
      finished_stairs: { id: string; name: string; elapsed_seconds: number }[];
      total_elapsed_seconds: number;
    };
    const stairId = before.finished_stairs[0]!.id;
    const previousTotal = before.total_elapsed_seconds;
    const previousName = before.finished_stairs[0]!.name;

    const badTime = await json(`/api/v1/stairs/${stairId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ elapsed_seconds: -1 }),
    });
    expect(badTime.status).toBe(400);
    expect(badTime.body).toMatchObject({
      code: "correct.invalid_time",
      message: "The time has to be the time the stair ran.",
    });

    const badName = await json(`/api/v1/stairs/${stairId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "  " }),
    });
    expect(badName.status).toBe(400);
    expect(badName.body).toMatchObject({
      code: "correct.empty_stair_name",
      message: "The name has to be a completed action.",
    });

    const kept = await json(`/api/v1/stairs/${stairId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Revised outline", elapsed_seconds: 42 }),
    });
    expect(kept.status).toBe(200);
    const keptBody = kept.body as {
      finished_stairs: { name: string; elapsed_seconds: number }[];
      total_elapsed_seconds: number;
    };
    expect(keptBody.finished_stairs[0]?.name).toBe("Revised outline");
    expect(keptBody.finished_stairs[0]?.elapsed_seconds).toBe(42);
    expect(keptBody.total_elapsed_seconds).toBe(42);
    expect(keptBody.total_elapsed_seconds).not.toBe(previousTotal);
    expect(previousName).toBe("Outline");
  });

  it("hides visibility so the open stair remains and hide is idempotent (AC-08)", async () => {
    await boot();
    const opened = await json("/api/v1/stairs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stair_name: "Focus", goal_name: "Deep work" }),
    });
    expect(opened.status).toBe(201);

    const hide = await fetch(`${baseUrl}/api/v1/visibility/hide`, { method: "POST" });
    expect(hide.status).toBe(204);
    const hideAgain = await fetch(`${baseUrl}/api/v1/visibility/hide`, { method: "POST" });
    expect(hideAgain.status).toBe(204);

    const home = await json("/api/v1/home");
    const homeBody = home.body as {
      open_stair: { name: string; goal_name: string; display_elapsed_seconds: number } | null;
    };
    expect(homeBody.open_stair?.name).toBe("Focus");
    expect(homeBody.open_stair?.goal_name).toBe("Deep work");
    expect(typeof homeBody.open_stair?.display_elapsed_seconds).toBe("number");

    const homeHtml = await (await fetch(`${baseUrl}/`)).text();
    expect(homeHtml).toContain("Focus");
    expect(homeHtml).toContain("/api/v1/visibility/hide");
  });
});
