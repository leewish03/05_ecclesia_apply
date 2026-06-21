import { normalizePhoneDigits } from "./phone.js";

const REQUIRED_MESSAGES = {
  name: "이름을 입력해주세요.",
  church: "소속 교회를 입력해주세요.",
  phone: "전화번호를 입력해주세요.",
};

function cleanText(value) {
  return String(value ?? "").trim();
}

function parseYesNo(value) {
  if (value === true || value === "yes" || value === "true" || value === "예") {
    return true;
  }

  if (value === false || value === "no" || value === "false" || value === "아니오") {
    return false;
  }

  return null;
}

function parseGender(value) {
  const cleaned = cleanText(value);
  return ["남", "여"].includes(cleaned) ? cleaned : null;
}

export function validateRegistration(input) {
  const value = {
    name: cleanText(input?.name),
    church: cleanText(input?.church),
    phone: normalizePhoneDigits(input?.phone),
    gender: parseGender(input?.gender),
    isSaved: parseYesNo(input?.isSaved),
    isBaptized: parseYesNo(input?.isBaptized),
    paymentConfirmed: input?.paymentConfirmed === true || input?.paymentConfirmed === "true",
  };

  const errors = {};

  for (const field of ["name", "church", "phone"]) {
    if (!value[field]) {
      errors[field] = REQUIRED_MESSAGES[field];
    }
  }

  if (value.gender === null) {
    errors.gender = "성별을 선택해주세요.";
  }

  if (value.isSaved === null) {
    errors.isSaved = "구원 여부를 선택해주세요.";
  }

  if (value.isBaptized === null) {
    errors.isBaptized = "침례 여부를 선택해주세요.";
  }

  if (!value.paymentConfirmed) {
    errors.paymentConfirmed = "입금 확인을 선택해주세요.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value };
}

export function toSupabaseRegistration(value) {
  return {
    name: value.name,
    church: value.church,
    phone: value.phone,
    gender: value.gender,
    is_saved: value.isSaved,
    is_baptized: value.isBaptized,
    payment_confirmed: value.paymentConfirmed,
  };
}

export function toPublicRegistration(row) {
  return {
    name: row.name,
    church: row.church,
  };
}

export function toAdminRegistration(row) {
  return {
    id: row.id,
    name: row.name,
    church: row.church,
    phone: row.phone,
    gender: row.gender,
    isSaved: row.is_saved,
    isBaptized: row.is_baptized,
    paymentConfirmed: row.payment_confirmed,
    createdAt: row.created_at,
  };
}
