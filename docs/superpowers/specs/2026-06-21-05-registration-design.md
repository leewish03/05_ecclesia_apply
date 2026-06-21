# 05 Registration Site Design

## Goal

Build a production-ready registration website for "제 5회 05년생 동기모임 신청" that matches the supplied mobile reference design, collects attendee answers, shows public attendee names/churches, and lets an administrator review full responses.

## Architecture

The app will run as one Node web service on Render. The browser receives static HTML/CSS/JS and talks only to same-origin API routes. The server owns all Supabase access using server-side environment variables, so the Supabase service role key is never exposed in the browser.

## Features

- Public form fields:
  - 이름
  - 소속교회
  - 전화번호
  - 성별
  - 구원 여부: 예 / 아니오
  - 입금 확인: only "예! 입금을 완료했습니다"
- Payment section:
  - Shows "카카오뱅크 3333-33-4743437"
  - Includes copy-to-clipboard behavior for the account number
  - Avoids unreliable deep links to banking apps unless a confirmed URL is provided later
- Public attendee check:
  - Respondents can open a list of existing 응답자의 이름 and 소속교회 only
- Admin check:
  - `/admin.html` prompts for an admin password
  - Admin can fetch all fields and submitted timestamps through the server

## Data Model

Table: `public.registrations`

- `id uuid primary key`
- `name text not null`
- `church text not null`
- `phone text not null`
- `gender text not null`
- `is_saved boolean not null`
- `payment_confirmed boolean not null`
- `created_at timestamptz not null default now()`

RLS stays enabled. No public table policies are required because all reads and writes go through the Render server with the Supabase service role key.

## UX Direction

Match the provided screenshot: narrow mobile-first layout, soft light-gray page background, green gradient header, white rounded cards, numbered green badges, warm payment card, large green submit button, and compact Korean copy.

## Error Handling

- Client validates required fields before submit.
- Server validates every request again.
- API returns clear Korean error messages.
- Public list and admin list show loading, empty, and error states.

## Deployment

Render runs `npm start`.

Required environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`

