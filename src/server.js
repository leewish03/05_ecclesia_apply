import { createReadStream, existsSync } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { getConfig, isAdminAccessCodeValid } from "./config.js";
import { createMemoryRepository } from "./memoryRepository.js";
import { createSupabaseRepository } from "./supabaseRest.js";
import { validateRegistration } from "./validation.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC_DIR = normalize(join(__dirname, "..", "public"));

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function sendJson(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function readJsonBody(request) {
  let raw = "";

  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 1024 * 64) {
      throw new Error("요청 데이터가 너무 큽니다.");
    }
  }

  return raw ? JSON.parse(raw) : {};
}

function serveStatic(request, response) {
  const requestUrl = new URL(request.url, "http://localhost");
  if (requestUrl.pathname === "/admin.html") {
    response.writeHead(308, { location: "/admin" });
    response.end();
    return;
  }

  const pathname = requestUrl.pathname === "/"
    ? "/index.html"
    : requestUrl.pathname === "/admin"
      ? "/admin.html"
      : requestUrl.pathname;
  const normalizedPath = normalize(join(PUBLIC_DIR, decodeURIComponent(pathname)));

  if (!normalizedPath.startsWith(PUBLIC_DIR) || !existsSync(normalizedPath)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "content-type": MIME_TYPES[extname(normalizedPath)] || "application/octet-stream",
  });
  createReadStream(normalizedPath).pipe(response);
}

export function createServer({ repository, config }) {
  return createHttpServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");

      if (request.method === "GET" && url.pathname === "/api/health") {
        sendJson(response, 200, { ok: true });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/registrations") {
        const body = await readJsonBody(request);
        const result = validateRegistration(body);

        if (!result.ok) {
          sendJson(response, 400, { ok: false, errors: result.errors });
          return;
        }

        const row = await repository.insertRegistration(result.value);
        sendJson(response, 201, { ok: true, registration: row });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/public-registrations") {
        const registrations = await repository.listPublicRegistrations();
        sendJson(response, 200, { ok: true, registrations });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/admin/registrations") {
        const accessCode = request.headers["x-admin-access-code"];

        if (!isAdminAccessCodeValid(accessCode, config.adminAccessCode)) {
          sendJson(response, 401, { ok: false, message: "관리자 코드가 올바르지 않습니다." });
          return;
        }

        const registrations = await repository.listAdminRegistrations();
        sendJson(response, 200, { ok: true, registrations });
        return;
      }

      if (request.method === "GET" || request.method === "HEAD") {
        serveStatic(request, response);
        return;
      }

      sendJson(response, 405, { ok: false, message: "지원하지 않는 요청입니다." });
    } catch (error) {
      const message = error instanceof SyntaxError ? "잘못된 JSON 요청입니다." : error.message;
      sendJson(response, 500, { ok: false, message });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const config = getConfig();
  const repository = config.useMemoryStore
    ? createMemoryRepository()
    : createSupabaseRepository(config);
  const server = createServer({ repository, config });

  server.listen(config.port, () => {
    console.log(`Registration site listening on ${config.port}`);
  });
}
