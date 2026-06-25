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
      return rows.filter((row) => !row.deleted_at).map(toPublicRegistration);
    },

    async listAdminRegistrations() {
      return rows.filter((row) => !row.deleted_at).map(toAdminRegistration);
    },

    async listTrashedRegistrations() {
      return rows.filter((row) => row.deleted_at).map(toAdminRegistration);
    },

    async updateAdminPaymentStatus(id, status) {
      const row = rows.find((item) => item.id === id);

      if (!row) {
        throw new Error("응답을 찾을 수 없습니다.");
      }

      row.admin_payment_status = status;
      return toAdminRegistration(row);
    },

    async deleteRegistration(id) {
      const row = rows.find((item) => item.id === id);

      if (!row) {
        throw new Error("응답을 찾을 수 없습니다.");
      }

      row.deleted_at = new Date().toISOString();
      return toAdminRegistration(row);
    },

    async restoreRegistration(id) {
      const row = rows.find((item) => item.id === id);

      if (!row) {
        throw new Error("응답을 찾을 수 없습니다.");
      }

      row.deleted_at = null;
      return toAdminRegistration(row);
    },

    async permanentlyDeleteRegistration(id) {
      const index = rows.findIndex((item) => item.id === id);

      if (index === -1) {
        throw new Error("응답을 찾을 수 없습니다.");
      }

      const [row] = rows.splice(index, 1);
      return toAdminRegistration(row);
    },
  };
}
