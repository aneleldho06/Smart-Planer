-- Enable Row Level Security (RLS) is mandated for all tables to ensure data privacy.

-- 1. Create 'tasks' table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  completed boolean default false,
  created_at bigint not null, -- Storing as timestamp (ms) to match existing frontend logic
  scheduled_time text,        -- 'HH:mm' format
  is_priority boolean default false
);

-- Enable RLS on tasks
alter table public.tasks enable row level security;

-- Policies for 'tasks'
create policy "Users can create their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);


-- 2. Create 'monthly_goals' table
create table public.monthly_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  month text not null,       -- Format 'YYYY-MM'
  goal_text text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on monthly_goals
alter table public.monthly_goals enable row level security;

-- Policies for 'monthly_goals'
create policy "Users can create their own goals"
  on public.monthly_goals for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own goals"
  on public.monthly_goals for select
  using (auth.uid() = user_id);

create policy "Users can update their own goals"
  on public.monthly_goals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own goals"
  on public.monthly_goals for delete
  using (auth.uid() = user_id);


-- 3. Enable Realtime
-- We want to listen to changes on 'tasks' and 'monthly_goals'
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.monthly_goals;
