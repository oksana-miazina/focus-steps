import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "..");
const migrationsDir = path.join(repoRoot, "migrations");

let sqlitePath: string | undefined;

afterEach(() => {
  if (sqlitePath === undefined) {
    return;
  }
  for (const candidate of [sqlitePath, `${sqlitePath}-journal`, `${sqlitePath}-wal`, `${sqlitePath}-shm`]) {
    try {
      fs.unlinkSync(candidate);
    } catch {
      // ignore missing throwaway files
    }
  }
  sqlitePath = undefined;
});

function runDbmate(sqliteFile: string, command: "up" | "down"): void {
  execFileSync(
    "dbmate",
    ["--migrations-dir", migrationsDir, "--no-dump-schema", command],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        DATABASE_URL: `sqlite:${sqliteFile}`,
      },
      encoding: "utf8",
    },
  );
}

function tableExists(db: DatabaseSync, name: string): boolean {
  const row = db
    .prepare(
      `SELECT 1 AS ok FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1`,
    )
    .get(name) as { ok: number } | undefined;
  return row !== undefined;
}

function indexExists(db: DatabaseSync, name: string): boolean {
  const row = db
    .prepare(
      `SELECT 1 AS ok FROM sqlite_master WHERE type = 'index' AND name = ? LIMIT 1`,
    )
    .get(name) as { ok: number } | undefined;
  return row !== undefined;
}

it("dbmate up creates goals + goals_name_uk and down drops them", () => {
  sqlitePath = path.join(os.tmpdir(), `focus-steps-goals-mig-${process.pid}-${Date.now()}.sqlite`);

  runDbmate(sqlitePath, "up");

  const afterUp = new DatabaseSync(sqlitePath);
  try {
    expect(tableExists(afterUp, "goals")).toBe(true);
    expect(indexExists(afterUp, "goals_name_uk")).toBe(true);
  } finally {
    afterUp.close();
  }

  // Roll back until goals is gone (later migrations may sit on top of it).
  for (let i = 0; i < 16; i += 1) {
    const probe = new DatabaseSync(sqlitePath);
    let hasGoals: boolean;
    try {
      hasGoals = tableExists(probe, "goals");
    } finally {
      probe.close();
    }
    if (!hasGoals) {
      break;
    }
    runDbmate(sqlitePath, "down");
  }

  const afterDown = new DatabaseSync(sqlitePath);
  try {
    expect(tableExists(afterDown, "goals")).toBe(false);
    expect(indexExists(afterDown, "goals_name_uk")).toBe(false);
  } finally {
    afterDown.close();
  }
});
