import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";

const testDir = join(".test-runs", `${Date.now()}-${process.pid}`);
const testDbPath = join(testDir, "test.db");
const testDatabaseUrl = `file:./${testDbPath.replaceAll("\\", "/")}`;

const testEnv = Object.fromEntries(
  Object.entries({
    ...process.env,
    NODE_ENV: "test",
    DATABASE_URL: testDatabaseUrl,
  }).filter(([, value]) => value !== undefined),
);

const run = (command) => {
  const result = spawnSync(command, {
    env: testEnv,
    shell: true,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(result.error);
    return 1;
  }

  return result.status ?? 1;
};

let exitCode = 1;

try {
  mkdirSync(testDir, { recursive: true });

  const db = new Database(testDbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS "Gym" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL,
      "location" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Review" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "rating" INTEGER NOT NULL,
      "comment" TEXT NOT NULL,
      "gymId" INTEGER NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Review_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
  db.close();

  exitCode = run("npm exec -- vitest run");
} finally {
  rmSync(testDir, { recursive: true, force: true });
}

process.exit(exitCode);
