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

it("dbmate up creates stairs + indexes and down drops them", () => {
  sqlitePath = path.join(os.tmpdir(), `focus-steps-stairs-mig-${process.pid}-${Date.now()}.sqlite`);

  runDbmate(sqlitePath, "up");

  const afterUp = new DatabaseSync(sqlitePath);
  try {
    expect(tableExists(afterUp, "stairs")).toBe(true);
    expect(indexExists(afterUp, "stairs_goal_id_idx")).toBe(true);
    expect(indexExists(afterUp, "stairs_one_open_uk")).toBe(true);
  } finally {
    afterUp.close();
  }

  runDbmate(sqlitePath, "down");

  const afterDown = new DatabaseSync(sqlitePath);
  try {
    expect(tableExists(afterDown, "stairs")).toBe(false);
    expect(indexExists(afterDown, "stairs_goal_id_idx")).toBe(false);
    expect(indexExists(afterDown, "stairs_one_open_uk")).toBe(false);
    expect(tableExists(afterDown, "goals")).toBe(true);
  } finally {
    afterDown.close();
  }
});
