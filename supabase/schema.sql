create extension if not exists "pgcrypto";

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  church text not null,
  phone text not null,
  gender text not null,
  is_saved boolean not null,
  is_baptized boolean not null default false,
  payment_confirmed boolean not null,
  created_at timestamptz not null default now()
);

alter table public.registrations
  add column if not exists is_baptized boolean not null default false;

alter table public.registrations enable row level security;

create index if not exists registrations_created_at_idx
  on public.registrations (created_at desc);

create index if not exists registrations_church_idx
  on public.registrations (church);
