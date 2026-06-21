import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const indexHtml = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
const appJs = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
const adminHtml = await readFile(new URL("../public/admin.html", import.meta.url), "utf8");
const adminJs = await readFile(new URL("../public/admin.js", import.meta.url), "utf8");

test("public page uses the requested event title", () => {
  assert.match(indexHtml, /제 5회 동기모임/);
  assert.doesNotMatch(indexHtml, /전 도서 동기모임/);
});

test("submit button does not use the broken triangle glyph", () => {
  assert.doesNotMatch(indexHtml, /◁/);
  assert.match(indexHtml, /신청 완료하기/);
});

test("participant dialog open is guarded against duplicate open calls", () => {
  assert.match(appJs, /if \(!participantsDialog\.open\)/);
  assert.match(appJs, /participantCount/);
});

test("admin page uses the cleaner dashboard layout", () => {
  assert.match(adminHtml, /신청 운영 콘솔/);
  assert.match(adminHtml, /admin-table/);
  assert.match(adminHtml, /admin-stats/);
  assert.match(adminHtml, /CSV 내보내기/);
  assert.match(adminHtml, /요약 복사/);
  assert.match(adminHtml, /입금 필터/);
  assert.match(adminHtml, /관리자 입금상태/);
  assert.match(adminHtml, /교회별 신청/);
  assert.doesNotMatch(adminHtml, /admin\.html/);
});

test("admin dashboard renders stats and table rows", () => {
  assert.match(adminJs, /renderAdminStats/);
  assert.match(adminJs, /renderSummaryBars/);
  assert.match(adminJs, /renderChurchBreakdown/);
  assert.match(adminJs, /exportVisibleCsv/);
  assert.match(adminJs, /copySummary/);
  assert.match(adminJs, /updateAdminPaymentStatus/);
  assert.match(adminJs, /admin-payment-select/);
  assert.match(adminJs, /getFilteredRegistrations/);
  assert.match(adminJs, /adminTableBody/);
  assert.match(adminJs, /x-admin-access-code/);
});
