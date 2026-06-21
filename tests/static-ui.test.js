import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const indexHtml = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
const appJs = await readFile(new URL("../public/app.js", import.meta.url), "utf8");

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

