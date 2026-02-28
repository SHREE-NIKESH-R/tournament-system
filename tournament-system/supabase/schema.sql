-- ============================================================
-- NammaLeague — Supabase SQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- TABLES
-- ──────────────────────────────────────────────────────────────

-- Players
create table if not exists players (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now()
);

-- Tournaments
create table if not exists tournaments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('league', 'knockout')),
  allow_draw boolean default false,
  win_points integer default 3,
  draw_points integer default 1,
  loss_points integer default 0,
  status text not null default 'live' check (status in ('live', 'finished', 'upcoming')),
  created_at timestamptz default now()
);

-- Matches
create table if not exists matches (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid references tournaments(id) on delete cascade not null,
  round_number integer not null default 1,
  round_name text,
  player1_id uuid references players(id) not null,
  player2_id uuid references players(id),
  winner_id uuid references players(id),
  is_draw boolean default false,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Standings (league only)
create table if not exists standings (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid references tournaments(id) on delete cascade not null,
  player_id uuid references players(id) not null,
  played integer default 0,
  wins integer default 0,
  draws integer default 0,
  losses integer default 0,
  points integer default 0,
  unique(tournament_id, player_id)
);

-- ──────────────────────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────────────────────

create index if not exists idx_matches_tournament on matches(tournament_id);
create index if not exists idx_matches_round on matches(tournament_id, round_number);
create index if not exists idx_standings_tournament on standings(tournament_id);
create index if not exists idx_standings_points on standings(tournament_id, points desc);

-- ──────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────────

-- Enable RLS on all tables
alter table players enable row level security;
alter table tournaments enable row level security;
alter table matches enable row level security;
alter table standings enable row level security;

-- Public read access (anyone can view)
create policy "Public read players" on players
  for select using (true);

create policy "Public read tournaments" on tournaments
  for select using (true);

create policy "Public read matches" on matches
  for select using (true);

create policy "Public read standings" on standings
  for select using (true);

-- Admin write access
-- Note: Set role = 'admin' in user_metadata when creating admin users
-- You can do this via Supabase Dashboard > Authentication > Users

create policy "Admin insert players" on players
  for insert
  with check (
    auth.jwt() ->> 'role' = 'admin'
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admin update players" on players
  for update
  using (
    auth.jwt() ->> 'role' = 'admin'
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admin insert tournaments" on tournaments
  for insert
  with check (
    auth.jwt() ->> 'role' = 'admin'
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admin update tournaments" on tournaments
  for update
  using (
    auth.jwt() ->> 'role' = 'admin'
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admin insert matches" on matches
  for insert
  with check (
    auth.jwt() ->> 'role' = 'admin'
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admin update matches" on matches
  for update
  using (
    auth.jwt() ->> 'role' = 'admin'
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admin insert standings" on standings
  for insert
  with check (
    auth.jwt() ->> 'role' = 'admin'
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admin update standings" on standings
  for update
  using (
    auth.jwt() ->> 'role' = 'admin'
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ──────────────────────────────────────────────────────────────
-- SAMPLE DATA (optional — remove in production)
-- ──────────────────────────────────────────────────────────────

-- Sample players
-- insert into players (name) values
--   ('Magnus'), ('Hikaru'), ('Fabiano'), ('Alireza');

-- ──────────────────────────────────────────────────────────────
-- HOW TO MAKE A USER ADMIN
-- ──────────────────────────────────────────────────────────────
-- Option A: Via Supabase Dashboard
--   Authentication > Users > Select user > Edit > user_metadata
--   Set: { "role": "admin" }
--
-- Option B: Via SQL (replace USER_ID with actual UUID)
-- update auth.users
-- set raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
-- where id = 'USER_ID_HERE';
