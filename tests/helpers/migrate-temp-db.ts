import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const migrationsDir = path.join(repoRoot, "migrations");

export function createTempSqlitePath(label: string): string {
  return path.join(
    os.tmpdir(),
    `focus-steps-${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}.sqlite`,
  );
}

export function runDbmate(sqliteFile: string, command: "up" | "down"): void {
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

export function migrateTempDb(label: string): { path: string; db: DatabaseSync } {
  const sqlitePath = createTempSqlitePath(label);
  runDbmate(sqlitePath, "up");
  return { path: sqlitePath, db: new DatabaseSync(sqlitePath) };
}

export function cleanupTempDb(sqlitePath: string, db?: DatabaseSync): void {
  try {
    db?.close();
  } catch {
    // already closed
  }
  for (const candidate of [sqlitePath, `${sqlitePath}-journal`, `${sqlitePath}-wal`, `${sqlitePath}-shm`]) {
    try {
      fs.unlinkSync(candidate);
    } catch {
      // ignore missing throwaway files
    }
  }
}
