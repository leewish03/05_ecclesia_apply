import test from "node:test";
import assert from "node:assert/strict";

import { formatPhoneNumber, normalizePhoneDigits } from "../src/phone.js";

test("normalizePhoneDigits removes every non-digit character", () => {
  assert.equal(normalizePhoneDigits("010-1234 ab 5678"), "01012345678");
});

test("formatPhoneNumber displays mobile numbers with hyphens", () => {
  assert.equal(formatPhoneNumber("01012345678"), "010-1234-5678");
  assert.equal(formatPhoneNumber("0101234567"), "010-123-4567");
});

test("formatPhoneNumber keeps partial typing readable", () => {
  assert.equal(formatPhoneNumber("0101"), "010-1");
  assert.equal(formatPhoneNumber("01012345"), "010-1234-5");
});

