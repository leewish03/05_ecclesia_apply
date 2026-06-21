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

    async updateAdminPaymentStatus(id, status) {
      const row = rows.find((item) => item.id === id);

      if (!row) {
        throw new Error("응답을 찾을 수 없습니다.");
      }

      row.admin_payment_status = status;
      return toAdminRegistration(row);
    },
  };
}
