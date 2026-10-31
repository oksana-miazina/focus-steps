-- migrate:down
DROP INDEX IF EXISTS stairs_one_open_uk;
DROP INDEX IF EXISTS stairs_goal_id_idx;
DROP TABLE IF EXISTS stairs;
