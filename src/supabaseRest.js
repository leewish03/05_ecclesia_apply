import {
  toAdminRegistration,
  toPublicRegistration,
  toSupabaseRegistration,
} from "./validation.js";

async function parseSupabaseResponse(response) {
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = body?.message || body?.error || `Supabase request failed: ${response.status}`;
    throw new Error(message);
  }

  return body;
}

export function createSupabaseRepository(config) {
  const baseUrl = `${config.supabaseUrl}/rest/v1/registrations`;
  const baseHeaders = {
    apikey: config.supabaseServiceRoleKey,
    authorization: `Bearer ${config.supabaseServiceRoleKey}`,
  };

  return {
    async insertRegistration(value) {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          ...baseHeaders,
          "content-type": "application/json",
          prefer: "return=representation",
        },
        body: JSON.stringify(toSupabaseRegistration(value)),
      });
      const rows = await parseSupabaseResponse(response);
      return rows[0];
    },

    async listPublicRegistrations() {
      const url = `${baseUrl}?select=name,church&order=created_at.desc`;
      const response = await fetch(url, { headers: baseHeaders });
      const rows = await parseSupabaseResponse(response);
      return rows.map(toPublicRegistration);
    },

    async listAdminRegistrations() {
      const url = `${baseUrl}?select=id,name,church,phone,gender,is_saved,is_baptized,payment_confirmed,created_at&order=created_at.desc`;
      const response = await fetch(url, { headers: baseHeaders });
      const rows = await parseSupabaseResponse(response);
      return rows.map(toAdminRegistration);
    },
  };
}
