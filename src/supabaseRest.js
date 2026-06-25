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
      const url = `${baseUrl}?select=name,church&deleted_at=is.null&order=created_at.desc`;
      const response = await fetch(url, { headers: baseHeaders });
      const rows = await parseSupabaseResponse(response);
      return rows.map(toPublicRegistration);
    },

    async listAdminRegistrations() {
      const url = `${baseUrl}?select=id,name,church,phone,gender,is_saved,is_baptized,payment_confirmed,admin_payment_status,created_at,deleted_at&deleted_at=is.null&order=created_at.desc`;
      const response = await fetch(url, { headers: baseHeaders });
      const rows = await parseSupabaseResponse(response);
      return rows.map(toAdminRegistration);
    },

    async listTrashedRegistrations() {
      const url = `${baseUrl}?select=id,name,church,phone,gender,is_saved,is_baptized,payment_confirmed,admin_payment_status,created_at,deleted_at&deleted_at=not.is.null&order=deleted_at.desc`;
      const response = await fetch(url, { headers: baseHeaders });
      const rows = await parseSupabaseResponse(response);
      return rows.map(toAdminRegistration);
    },

    async updateAdminPaymentStatus(id, status) {
      const url = `${baseUrl}?id=eq.${encodeURIComponent(id)}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          ...baseHeaders,
          "content-type": "application/json",
          prefer: "return=representation",
        },
        body: JSON.stringify({ admin_payment_status: status }),
      });
      const rows = await parseSupabaseResponse(response);

      if (!rows[0]) {
        throw new Error("응답을 찾을 수 없습니다.");
      }

      return toAdminRegistration(rows[0]);
    },

    async deleteRegistration(id) {
      const url = `${baseUrl}?id=eq.${encodeURIComponent(id)}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          ...baseHeaders,
          "content-type": "application/json",
          prefer: "return=representation",
        },
        body: JSON.stringify({ deleted_at: new Date().toISOString() }),
      });
      const rows = await parseSupabaseResponse(response);

      if (!rows[0]) {
        throw new Error("응답을 찾을 수 없습니다.");
      }

      return toAdminRegistration(rows[0]);
    },

    async restoreRegistration(id) {
      const url = `${baseUrl}?id=eq.${encodeURIComponent(id)}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          ...baseHeaders,
          "content-type": "application/json",
          prefer: "return=representation",
        },
        body: JSON.stringify({ deleted_at: null }),
      });
      const rows = await parseSupabaseResponse(response);

      if (!rows[0]) {
        throw new Error("응답을 찾을 수 없습니다.");
      }

      return toAdminRegistration(rows[0]);
    },

    async permanentlyDeleteRegistration(id) {
      const url = `${baseUrl}?id=eq.${encodeURIComponent(id)}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          ...baseHeaders,
          prefer: "return=representation",
        },
      });
      const rows = await parseSupabaseResponse(response);

      if (!rows[0]) {
        throw new Error("응답을 찾을 수 없습니다.");
      }

      return toAdminRegistration(rows[0]);
    },
  };
}
