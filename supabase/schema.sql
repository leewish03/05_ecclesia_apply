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
  admin_payment_status text not null default 'unconfirmed'
    check (admin_payment_status in ('unconfirmed', 'unpaid', 'paid')),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.registrations
  add column if not exists is_baptized boolean not null default false;

alter table public.registrations
  add column if not exists admin_payment_status text not null default 'unconfirmed';

alter table public.registrations
  add column if not exists deleted_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'registrations_admin_payment_status_check'
  ) then
    alter table public.registrations
      add constraint registrations_admin_payment_status_check
      check (admin_payment_status in ('unconfirmed', 'unpaid', 'paid'));
  end if;
end $$;

alter table public.registrations enable row level security;

create index if not exists registrations_created_at_idx
  on public.registrations (created_at desc);

create index if not exists registrations_deleted_at_idx
  on public.registrations (deleted_at desc);

create index if not exists registrations_church_idx
  on public.registrations (church);
