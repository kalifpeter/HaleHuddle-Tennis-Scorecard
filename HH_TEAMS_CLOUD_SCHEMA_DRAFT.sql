-- HH Teams cloud foundation (additive; not executed automatically)
-- This schema is separate from HaleHuddle Family Sports tables.
create table if not exists public.hh_tennis_organizations (
 id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name))>0), owner_id uuid not null references auth.users(id), created_at timestamptz not null default now());
create table if not exists public.hh_tennis_memberships (
 organization_id uuid not null references public.hh_tennis_organizations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check(role in ('admin','assistant','parent')),
 active boolean not null default true,
 primary key(organization_id,user_id));
create table if not exists public.hh_tennis_divisions (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.hh_tennis_organizations(id) on delete cascade,
 name text not null, unique(organization_id,name));
create table if not exists public.hh_tennis_teams (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.hh_tennis_organizations(id) on delete cascade,
 division_id uuid references public.hh_tennis_divisions(id) on delete set null, name text not null);
create table if not exists public.hh_tennis_team_coaches (
 team_id uuid not null references public.hh_tennis_teams(id) on delete cascade,
 organization_id uuid not null references public.hh_tennis_organizations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 can_edit_lineup boolean not null default false, can_publish_lineup boolean not null default false,
 primary key(team_id,user_id));
create table if not exists public.hh_tennis_athletes (
 id uuid primary key default gen_random_uuid(), team_id uuid not null references public.hh_tennis_teams(id) on delete cascade,
 display_name text not null);
create table if not exists public.hh_tennis_matches (
 id uuid primary key default gen_random_uuid(), team_id uuid not null references public.hh_tennis_teams(id) on delete cascade,
 opponent text not null, format text not null check(format in ('single','two_sets','timed')),
 starts_at timestamptz, location text, snacks_drinks text,
 lineup jsonb not null default '{}'::jsonb, published boolean not null default false,
 updated_at timestamptz not null default now(), updated_by uuid references auth.users(id));
create table if not exists public.hh_tennis_invites (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.hh_tennis_organizations(id) on delete cascade,
 team_id uuid references public.hh_tennis_teams(id) on delete cascade,
 invited_email text not null, role text not null check(role in ('assistant','parent')),
 can_edit_lineup boolean not null default false, can_publish_lineup boolean not null default false,
 status text not null default 'pending' check(status in ('pending','accepted','revoked')),
 created_at timestamptz not null default now());
-- RLS is enabled before any client access. Policies and controlled invite-acceptance RPC
-- must be installed and reviewed before exposing these tables to the app.
alter table public.hh_tennis_organizations enable row level security;
alter table public.hh_tennis_memberships enable row level security;
alter table public.hh_tennis_divisions enable row level security;
alter table public.hh_tennis_teams enable row level security;
alter table public.hh_tennis_team_coaches enable row level security;
alter table public.hh_tennis_athletes enable row level security;
alter table public.hh_tennis_matches enable row level security;
alter table public.hh_tennis_invites enable row level security;
revoke all on public.hh_tennis_organizations,public.hh_tennis_memberships,public.hh_tennis_divisions,public.hh_tennis_teams,public.hh_tennis_team_coaches,public.hh_tennis_athletes,public.hh_tennis_matches,public.hh_tennis_invites from anon,authenticated;
