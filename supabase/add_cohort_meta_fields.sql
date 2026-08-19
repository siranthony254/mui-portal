-- ADD META FIELDS TO COHORTS
ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS objectives JSONB DEFAULT '[]'::jsonb;
ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS pillars_config JSONB;

-- Comment describing the structure of pillars_config
-- [
--   { "number": 1, "name": "...", "subtitle": "...", "goal": "...", "weeks": "...", "description": "...", "objectives": ["...", "..."] },
--   ...
-- ]
