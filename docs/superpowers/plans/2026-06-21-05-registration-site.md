# 05 Registration Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready registration web app with public submission, public attendee preview, and password-protected admin review.

**Architecture:** One Node service serves static files and JSON API routes. Supabase is accessed only from the server with a service role key stored in Render environment variables. The UI is plain HTML/CSS/JS to avoid package installation and keep deployment simple.

**Tech Stack:** Node.js built-ins, Supabase REST API, Render web service, HTML/CSS/JavaScript, Node test runner.

---

## File Structure

- `package.json`: npm scripts and Node module type.
- `render.yaml`: Render web service configuration.
- `supabase/schema.sql`: Supabase table and RLS setup.
- `src/config.js`: environment loading and admin password checks.
- `src/validation.js`: request validation and response shaping.
- `src/supabaseRest.js`: small Supabase REST client.
- `src/server.js`: HTTP server, static files, and API routes.
- `public/index.html`: public registration form.
- `public/admin.html`: admin response viewer.
- `public/styles.css`: screenshot-matched UI.
- `public/app.js`: public form behavior.
- `public/admin.js`: admin behavior.
- `tests/validation.test.js`: TDD tests for validation behavior.
- `tests/config.test.js`: TDD tests for environment behavior.

## Tasks

### Task 1: Tests First

- [ ] Create tests for required registration fields, public response projection, and admin password checks.
- [ ] Run `npm test` and verify tests fail because implementation modules do not exist yet.

### Task 2: Core Server Modules

- [ ] Implement `src/validation.js` to normalize, validate, and project registration data.
- [ ] Implement `src/config.js` to read required env vars and compare admin password.
- [ ] Run `npm test` and verify tests pass.

### Task 3: API and Persistence

- [ ] Implement Supabase REST insert/select helpers.
- [ ] Implement HTTP API routes:
  - `POST /api/registrations`
  - `GET /api/public-registrations`
  - `GET /api/admin/registrations`
  - `GET /api/health`
- [ ] Add `supabase/schema.sql`.

### Task 4: Public UI

- [ ] Build mobile-first form matching the screenshot.
- [ ] Add account copy button.
- [ ] Add public participant modal/list with name and church only.
- [ ] Add success and error states.

### Task 5: Admin UI

- [ ] Build `/admin.html` password prompt.
- [ ] Render all submitted fields in a dense table/card list.
- [ ] Add refresh and error states.

### Task 6: Verification

- [ ] Run `npm test`.
- [ ] Start the app locally.
- [ ] Use the browser to verify public form, attendee list, and admin flow with mocked or configured Supabase behavior.
- [ ] Verify the UI against the supplied screenshot at mobile width.

