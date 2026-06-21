import { toAdminRegistration, toPublicRegistration, toSupabaseRegistration } from "./validation.js";

export function createMemoryRepository(seed = []) {
  const rows = [...seed];

  return {
    async insertRegistration(value) {
      const row = {
        id: crypto.randomUUID(),
        ...toSupabaseRegistration(value),
        created_at: new Date().toISOString(),
      };
      rows.unshift(row);
      return row;
    },

    async listPublicRegistrations() {
      return rows.map(toPublicRegistration);
    },

    async listAdminRegistrations() {
      return rows.map(toAdminRegistration);
    },
  };
}

