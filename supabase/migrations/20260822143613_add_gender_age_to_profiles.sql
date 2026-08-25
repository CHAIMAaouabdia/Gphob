/*
# Add gender and age_range columns to profiles

1. Modified Tables
- `profiles`: adds `gender` (text, nullable) and `age_range` (text, nullable)
  - gender stores: 'male', 'female', or null
  - age_range stores ranges like 'under_18', '18_25', '26_35', '36_50', 'over_50'
2. Security
- No RLS policy changes — existing policies on profiles already cover SELECT/INSERT/UPDATE for authenticated users on their own row.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender') THEN
    ALTER TABLE profiles ADD COLUMN gender text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'age_range') THEN
    ALTER TABLE profiles ADD COLUMN age_range text;
  END IF;
END $$;
