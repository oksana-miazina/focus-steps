-- migrate:up
CREATE TABLE IF NOT EXISTS goals (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS goals_name_uk ON goals (name);

-- migrate:down
DROP INDEX IF EXISTS goals_name_uk;
DROP TABLE IF EXISTS goals;
