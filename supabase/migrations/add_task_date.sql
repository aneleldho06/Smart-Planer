-- Run this in the Supabase SQL Editor

-- 1. Add task_date column for reliable daily filtering
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS task_date DATE DEFAULT CURRENT_DATE;

-- 2. Update existing records to have a task_date based on created_at
-- (Assuming created_at might be bigint or timestamp, we try to cast safely)
-- If created_at is bigint (ms):
UPDATE public.tasks 
SET task_date = to_timestamp(created_at / 1000)::date 
WHERE task_date IS NULL AND created_at IS NOT NULL;

-- If created_at is ALREADY timestamptz, use this instead:
-- UPDATE public.tasks SET task_date = created_at::date WHERE task_date IS NULL;

-- 3. (Optional) If you want to switch created_at to proper timestamp if it was bigint:
-- ALTER TABLE public.tasks 
-- ALTER COLUMN created_at TYPE timestamp with time zone 
-- USING to_timestamp(created_at / 1000);

-- 4. Enable RLS on new column (policies usually apply to row, but good to check)
-- Existing policies cover the whole row based on user_id, so no new policy needed for task_date specifically.
