import test from "node:test";
import assert from "node:assert/strict";

import { createServer } from "../src/server.js";

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });
}

async function withServer(repository, fn) {
  const server = createServer({
    repository,
    config: {
      adminAccessCode: "demo-code",
      supabaseUrl: "https://example.supabase.co",
      supabaseServiceRoleKey: "key",
      port: 0,
    },
  });
  const origin = await listen(server);

  try {
    await fn(origin);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("POST /api/registrations inserts a valid registration", async () => {
  const inserted = [];

  await withServer(
    {
      insertRegistration: async (value) => {
        inserted.push(value);
        return { id: "abc", ...value, created_at: "2026-06-21T00:00:00.000Z" };
      },
      listPublicRegistrations: async () => [],
      listAdminRegistrations: async () => [],
    },
    async (origin) => {
      const response = await fetch(`${origin}/api/registrations`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "홍길동",
          church: "서울교회",
          phone: "01012345678",
          gender: "남",
          isSaved: "yes",
          isBaptized: "yes",
          paymentConfirmed: true,
        }),
      });

      assert.equal(response.status, 201);
      assert.deepEqual(inserted, [
        {
          name: "홍길동",
          church: "서울교회",
          phone: "01012345678",
          gender: "남",
          isSaved: true,
          isBaptized: true,
          paymentConfirmed: true,
        },
      ]);
    },
  );
});

test("POST /api/registrations rejects invalid registration", async () => {
  await withServer(
    {
      insertRegistration: async () => {
        throw new Error("must not insert");
      },
      listPublicRegistrations: async () => [],
      listAdminRegistrations: async () => [],
    },
    async (origin) => {
      const response = await fetch(`${origin}/api/registrations`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "", paymentConfirmed: false }),
      });
      const body = await response.json();

      assert.equal(response.status, 400);
      assert.equal(body.ok, false);
      assert.equal(body.errors.name, "이름을 입력해주세요.");
      assert.equal(body.errors.paymentConfirmed, "입금 확인을 선택해주세요.");
    },
  );
});

test("GET /api/public-registrations exposes only name and church", async () => {
  await withServer(
    {
      insertRegistration: async () => null,
      listPublicRegistrations: async () => [
        { name: "홍길동", church: "서울교회" },
      ],
      listAdminRegistrations: async () => [],
    },
    async (origin) => {
      const response = await fetch(`${origin}/api/public-registrations`);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.deepEqual(body.registrations, [
        { name: "홍길동", church: "서울교회" },
      ]);
    },
  );
});

test("GET /api/admin/registrations requires the admin access code", async () => {
  await withServer(
    {
      insertRegistration: async () => null,
      listPublicRegistrations: async () => [],
      listAdminRegistrations: async () => [],
    },
    async (origin) => {
      const response = await fetch(`${origin}/api/admin/registrations`, {
        headers: { "x-admin-access-code": "wrong" },
      });

      assert.equal(response.status, 401);
    },
  );
});

test("PATCH /api/admin/registrations/:id/payment-status updates admin payment status", async () => {
  let updated = null;

  await withServer(
    {
      insertRegistration: async () => null,
      listPublicRegistrations: async () => [],
      listAdminRegistrations: async () => [],
      updateAdminPaymentStatus: async (id, status) => {
        updated = { id, status };
        return {
          id,
          name: "홍길동",
          church: "서울교회",
          phone: "01012345678",
          gender: "남",
          isSaved: true,
          isBaptized: false,
          paymentConfirmed: true,
          adminPaymentStatus: status,
          createdAt: "2026-06-21T00:00:00.000Z",
        };
      },
    },
    async (origin) => {
      const response = await fetch(`${origin}/api/admin/registrations/abc/payment-status`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-admin-access-code": "demo-code",
        },
        body: JSON.stringify({ status: "paid" }),
      });
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.deepEqual(updated, { id: "abc", status: "paid" });
      assert.equal(body.registration.adminPaymentStatus, "paid");
    },
  );
});

test("PATCH /api/admin/registrations/:id/payment-status rejects invalid status", async () => {
  await withServer(
    {
      insertRegistration: async () => null,
      listPublicRegistrations: async () => [],
      listAdminRegistrations: async () => [],
      updateAdminPaymentStatus: async () => {
        throw new Error("must not update");
      },
    },
    async (origin) => {
      const response = await fetch(`${origin}/api/admin/registrations/abc/payment-status`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-admin-access-code": "demo-code",
        },
        body: JSON.stringify({ status: "done" }),
      });
      const body = await response.json();

      assert.equal(response.status, 400);
      assert.equal(body.ok, false);
    },
  );
});

test("DELETE /api/admin/registrations/:id deletes an admin registration", async () => {
  let deletedId = null;

  await withServer(
    {
      insertRegistration: async () => null,
      listPublicRegistrations: async () => [],
      listAdminRegistrations: async () => [],
      deleteRegistration: async (id) => {
        deletedId = id;
        return {
          id,
          name: "홍길동",
          church: "서울교회",
          phone: "01012345678",
          gender: "남",
          isSaved: true,
          isBaptized: false,
          paymentConfirmed: true,
          adminPaymentStatus: "unconfirmed",
          createdAt: "2026-06-21T00:00:00.000Z",
        };
      },
    },
    async (origin) => {
      const response = await fetch(`${origin}/api/admin/registrations/abc`, {
        method: "DELETE",
        headers: { "x-admin-access-code": "demo-code" },
      });
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(deletedId, "abc");
      assert.equal(body.registration.name, "홍길동");
    },
  );
});

test("DELETE /api/admin/registrations/:id requires the admin access code", async () => {
  await withServer(
    {
      insertRegistration: async () => null,
      listPublicRegistrations: async () => [],
      listAdminRegistrations: async () => [],
      deleteRegistration: async () => {
        throw new Error("must not delete");
      },
    },
    async (origin) => {
      const response = await fetch(`${origin}/api/admin/registrations/abc`, {
        method: "DELETE",
        headers: { "x-admin-access-code": "wrong" },
      });

      assert.equal(response.status, 401);
    },
  );
});

test("GET /admin serves the admin page without the html suffix", async () => {
  await withServer(
    {
      insertRegistration: async () => null,
      listPublicRegistrations: async () => [],
      listAdminRegistrations: async () => [],
    },
    async (origin) => {
      const response = await fetch(`${origin}/admin`);
      const html = await response.text();

      assert.equal(response.status, 200);
      assert.match(html, /신청 운영 콘솔/);
      assert.match(html, /전체 응답/);
    },
  );
});

test("GET /admin.html redirects to the clean admin path", async () => {
  await withServer(
    {
      insertRegistration: async () => null,
      listPublicRegistrations: async () => [],
      listAdminRegistrations: async () => [],
    },
    async (origin) => {
      const response = await fetch(`${origin}/admin.html`, { redirect: "manual" });

      assert.equal(response.status, 308);
      assert.equal(response.headers.get("location"), "/admin");
    },
  );
});
