-- migrate:up
CREATE TABLE IF NOT EXISTS stairs (
    id TEXT NOT NULL PRIMARY KEY,
    goal_id TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'finished')),
    elapsed_seconds INTEGER NOT NULL CHECK (elapsed_seconds >= 0),
    visible_started_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (goal_id) REFERENCES goals (id)
);

CREATE INDEX IF NOT EXISTS stairs_goal_id_idx ON stairs (goal_id);

-- At most one open stair (AC-06): every matching row has status = 'open', so UNIQUE allows only one.
CREATE UNIQUE INDEX IF NOT EXISTS stairs_one_open_uk ON stairs (status) WHERE status = 'open';
