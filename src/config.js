const REQUIRED_ENV = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "ADMIN_ACCESS_CODE"];

export function getConfig(env = process.env) {
  const useMemoryStore = env.USE_MEMORY_STORE === "true";
  const requiredEnv = useMemoryStore ? ["ADMIN_ACCESS_CODE"] : REQUIRED_ENV;
  const missing = requiredEnv.filter((key) => !String(env[key] ?? "").trim());

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return {
    supabaseUrl: String(env.SUPABASE_URL ?? "").replace(/\/$/, ""),
    supabaseServiceRoleKey: String(env.SUPABASE_SERVICE_ROLE_KEY ?? ""),
    adminAccessCode: String(env.ADMIN_ACCESS_CODE),
    port: Number(env.PORT || 3000),
    useMemoryStore,
  };
}

export function isAdminAccessCodeValid(candidate, expected) {
  return Boolean(candidate) && candidate === expected;
}
