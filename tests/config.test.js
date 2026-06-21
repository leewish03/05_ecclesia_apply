import test from "node:test";
import assert from "node:assert/strict";

import { getConfig, isAdminAccessCodeValid } from "../src/config.js";

test("getConfig returns required environment values", () => {
  const config = getConfig({
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    ADMIN_ACCESS_CODE: "demo-code",
    PORT: "5050",
  });

  assert.deepEqual(config, {
    supabaseUrl: "https://example.supabase.co",
    supabaseServiceRoleKey: "service-role-key",
    adminAccessCode: "demo-code",
    port: 5050,
    useMemoryStore: false,
  });
});

test("getConfig reports missing production environment values", () => {
  assert.throws(
    () => getConfig({ PORT: "3000" }),
    /Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_ACCESS_CODE/,
  );
});

test("getConfig allows local memory store for browser preview", () => {
  const config = getConfig({
    USE_MEMORY_STORE: "true",
    ADMIN_ACCESS_CODE: "demo-code",
    PORT: "5050",
  });

  assert.equal(config.useMemoryStore, true);
  assert.equal(config.adminAccessCode, "demo-code");
  assert.equal(config.port, 5050);
});

test("isAdminAccessCodeValid compares exact code values", () => {
  assert.equal(isAdminAccessCodeValid("demo-code", "demo-code"), true);
  assert.equal(isAdminAccessCodeValid("wrong", "demo-code"), false);
  assert.equal(isAdminAccessCodeValid("", "demo-code"), false);
});
