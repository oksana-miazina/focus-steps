-- migrate:down
DROP INDEX IF EXISTS goals_name_uk;
DROP TABLE IF EXISTS goals;
