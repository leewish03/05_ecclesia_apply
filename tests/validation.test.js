import test from "node:test";
import assert from "node:assert/strict";

import {
  validateRegistration,
  toAdminRegistration,
  toPublicRegistration,
  toSupabaseRegistration,
} from "../src/validation.js";

test("validateRegistration accepts complete registration data", () => {
  const result = validateRegistration({
    name: "홍길동",
    church: "서울교회",
    phone: "010-1234-5678",
    gender: "남",
    isSaved: "yes",
    isBaptized: "no",
    paymentConfirmed: true,
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    name: "홍길동",
    church: "서울교회",
    phone: "01012345678",
    gender: "남",
    isSaved: true,
    isBaptized: false,
    paymentConfirmed: true,
  });
});

test("validateRegistration rejects missing required fields", () => {
  const result = validateRegistration({
    name: " ",
    church: "서울교회",
    phone: "",
    gender: "남",
    isSaved: "yes",
    isBaptized: "yes",
    paymentConfirmed: true,
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, {
    name: "이름을 입력해주세요.",
    phone: "전화번호를 입력해주세요.",
  });
});

test("validateRegistration requires payment confirmation", () => {
  const result = validateRegistration({
    name: "홍길동",
    church: "서울교회",
    phone: "01012345678",
    gender: "남",
    isSaved: "no",
    isBaptized: "yes",
    paymentConfirmed: false,
  });

  assert.equal(result.ok, false);
  assert.equal(result.errors.paymentConfirmed, "입금 확인을 선택해주세요.");
});

test("validateRegistration requires gender, salvation, and baptism choices", () => {
  const result = validateRegistration({
    name: "홍길동",
    church: "서울교회",
    phone: "01012345678",
    gender: "기타",
    isSaved: "",
    isBaptized: "",
    paymentConfirmed: true,
  });

  assert.equal(result.ok, false);
  assert.equal(result.errors.gender, "성별을 선택해주세요.");
  assert.equal(result.errors.isSaved, "구원 여부를 선택해주세요.");
  assert.equal(result.errors.isBaptized, "침례 여부를 선택해주세요.");
});

test("toPublicRegistration exposes only name and church", () => {
  const publicRow = toPublicRegistration({
    id: "abc",
    name: "홍길동",
    church: "서울교회",
    phone: "01012345678",
    gender: "남",
    is_saved: true,
    is_baptized: false,
    payment_confirmed: true,
    created_at: "2026-06-21T00:00:00.000Z",
  });

  assert.deepEqual(publicRow, {
    name: "홍길동",
    church: "서울교회",
  });
});

test("toAdminRegistration exposes all admin fields", () => {
  const adminRow = toAdminRegistration({
    id: "abc",
    name: "홍길동",
    church: "서울교회",
    phone: "01012345678",
    gender: "남",
    is_saved: false,
    is_baptized: true,
    payment_confirmed: true,
    admin_payment_status: "paid",
    created_at: "2026-06-21T00:00:00.000Z",
  });

  assert.deepEqual(adminRow, {
    id: "abc",
    name: "홍길동",
    church: "서울교회",
    phone: "01012345678",
    gender: "남",
    isSaved: false,
    isBaptized: true,
    paymentConfirmed: true,
    adminPaymentStatus: "paid",
    createdAt: "2026-06-21T00:00:00.000Z",
  });
});

test("toSupabaseRegistration starts admin payment status as unconfirmed", () => {
  const row = toSupabaseRegistration({
    name: "홍길동",
    church: "서울교회",
    phone: "01012345678",
    gender: "남",
    isSaved: true,
    isBaptized: false,
    paymentConfirmed: true,
  });

  assert.equal(row.admin_payment_status, "unconfirmed");
});
