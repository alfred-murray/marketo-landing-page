/*
 * Zero-dependency Node server. Two responsibilities:
 *   1. Serve the static HTML/CSS/JS in this folder.
 *   2. Proxy three Marketo REST routes — the OAuth client_credentials flow
 *      cannot run in the browser without leaking the secret, so we keep it
 *      on the server. Behaviour mirrors the original Next.js routes:
 *        - GET  /api/marketo/token            (dev sanity, redacted)
 *        - GET  /api/marketo/resolve-visitor  (_mkto_trk → lead)
 *        - POST /api/marketo/submit           (upsert + associate cookie)
 *      Plus GET /config.json which exposes the public Munchkin id only.
 *
 * Env (loaded from .env.local if present):
 *   MUNCHKIN_ID           — public, sent to the browser via /config.json
 *   MARKETO_BASE_URL      — e.g. https://XXX-XXX-XXX.mktorest.com
 *   MARKETO_CLIENT_ID     — server-side
 *   MARKETO_CLIENT_SECRET — server-side
 *   PORT                  — defaults to 3000
 *
 * Run:  npm start
 */

"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

/* ---------------------- Tiny .env.local loader ---------------------- */

function loadEnv() {
  const envPath = path.join(__dirname, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  raw.split(/\r?\n/).forEach(function (line) {
    if (!line || /^\s*#/.test(line)) return;
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) return;
    let value = m[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  });
}
loadEnv();

const PORT = parseInt(process.env.PORT || "3000", 10);
const STATIC_DIR = __dirname;

/* ---------------------------- Marketo ---------------------------- */

let cachedToken = null;

function readMarketoEnv() {
  const baseUrl = process.env.MARKETO_BASE_URL;
  const clientId = process.env.MARKETO_CLIENT_ID;
  const clientSecret = process.env.MARKETO_CLIENT_SECRET;
  if (!baseUrl || !clientId || !clientSecret) {
    throw new Error(
      "Marketo env vars missing. Set MARKETO_BASE_URL, MARKETO_CLIENT_ID, MARKETO_CLIENT_SECRET in .env.local",
    );
  }
  return { baseUrl: baseUrl.replace(/\/$/, ""), clientId, clientSecret };
}

async function getAccessToken(force) {
  const now = Date.now();
  if (
    !force &&
    cachedToken &&
    cachedToken.expiresAt - 60_000 > now &&
    cachedToken.accessToken
  ) {
    return Object.assign({}, cachedToken, { cached: true });
  }
  const { baseUrl, clientId, clientSecret } = readMarketoEnv();
  const url =
    baseUrl +
    "/identity/oauth/token?grant_type=client_credentials&client_id=" +
    encodeURIComponent(clientId) +
    "&client_secret=" +
    encodeURIComponent(clientSecret);
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(function () {
      return "";
    });
    throw new Error("Marketo token request failed: " + res.status + " " + body);
  }
  const data = await res.json();
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return Object.assign({}, cachedToken, { cached: false });
}

async function marketoFetch(reqPath, init) {
  init = init || {};
  const { baseUrl } = readMarketoEnv();
  let { accessToken } = await getAccessToken();
  const doFetch = function (token) {
    return fetch(baseUrl + reqPath, {
      method: init.method || "GET",
      body: init.body,
      headers: Object.assign({}, init.headers || {}, {
        Authorization: "Bearer " + token,
      }),
      cache: "no-store",
    });
  };
  let res = await doFetch(accessToken);
  let json = await res.json();
  const expired =
    json.errors &&
    json.errors.some(function (e) {
      return e.code === "601" || e.code === "602";
    });
  if (expired) {
    cachedToken = null;
    accessToken = (await getAccessToken(true)).accessToken;
    res = await doFetch(accessToken);
    json = await res.json();
  } else if (!res.ok) {
    throw new Error(
      "Marketo " + reqPath + " failed: " + res.status + " " + JSON.stringify(json),
    );
  }
  return json;
}

const DEFAULT_LEAD_FIELDS = [
  "id",
  "email",
  "firstName",
  "lastName",
  "company",
  "createdAt",
  "updatedAt",
].join(",");

async function getLeadByCookie(cookie) {
  if (!cookie) return null;
  const params = new URLSearchParams({
    filterType: "cookie",
    filterValues: cookie,
    fields: DEFAULT_LEAD_FIELDS,
  });
  const json = await marketoFetch("/rest/v1/leads.json?" + params.toString(), {
    method: "GET",
  });
  if (!json.success) {
    throw new Error("Marketo getLeadByCookie failed: " + JSON.stringify(json.errors));
  }
  return (json.result && json.result[0]) || null;
}

async function syncLead(fields) {
  const cleaned = {};
  Object.keys(fields).forEach(function (k) {
    const v = fields[k];
    if (v !== undefined && v !== null && v !== "") cleaned[k] = v;
  });
  if (!cleaned.email) throw new Error("syncLead requires at least an `email` field.");
  const body = { action: "createOrUpdate", lookupField: "email", input: [cleaned] };
  const json = await marketoFetch("/rest/v1/leads.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!json.success) {
    throw new Error("Marketo syncLead failed: " + JSON.stringify(json.errors));
  }
  const first = json.result && json.result[0];
  if (!first || typeof first.id !== "number") {
    throw new Error("Marketo syncLead returned no lead id: " + JSON.stringify(json.result));
  }
  return first;
}

async function associateLeadByCookie(leadId, cookie) {
  if (!cookie) throw new Error("associateLeadByCookie requires a cookie value.");
  const params = new URLSearchParams({ cookie });
  const json = await marketoFetch(
    "/rest/v1/leads/" + leadId + "/associate.json?" + params.toString(),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    },
  );
  if (!json.success) {
    throw new Error("Marketo associate failed: " + JSON.stringify(json.errors));
  }
}

async function upsertAndAssociate(fields, cookie) {
  const synced = await syncLead(fields);
  let cookieAttached = false;
  if (cookie) {
    await associateLeadByCookie(synced.id, cookie);
    cookieAttached = true;
  }
  return { id: synced.id, status: synced.status, cookieAttached };
}

/* ---------------------------- HTTP utils ---------------------------- */

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({ "Cache-Control": "no-store" }, headers || {}));
  res.end(body);
}

function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj), {
    "Content-Type": "application/json; charset=utf-8",
  });
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(/;\s*/).forEach(function (kv) {
    const eq = kv.indexOf("=");
    if (eq < 0) return;
    out[kv.slice(0, eq).trim()] = decodeURIComponent(kv.slice(eq + 1).trim());
  });
  return out;
}

function readBody(req) {
  return new Promise(function (resolve, reject) {
    const chunks = [];
    req.on("data", function (c) {
      chunks.push(c);
    });
    req.on("end", function () {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}

function safeStaticPath(reqPath) {
  if (reqPath === "/" || reqPath === "") reqPath = "/index.html";
  const resolved = path.normalize(path.join(STATIC_DIR, reqPath));
  if (!resolved.startsWith(STATIC_DIR)) return null;
  return resolved;
}

/* ----------------------------- Routes ----------------------------- */

const ALLOWED_FORM_FIELDS = new Set([
  "email",
  "firstName",
  "lastName",
  "company",
  "phone",
  "title",
  "message",
  "leadSource",
  "industry",
]);

async function handleApi(req, res, parsed) {
  const cookies = parseCookies(req.headers.cookie || "");
  const mktoTrk = cookies._mkto_trk;

  if (parsed.pathname === "/config.json" && req.method === "GET") {
    return sendJson(res, 200, { munchkinId: process.env.MUNCHKIN_ID || "" });
  }

  if (parsed.pathname === "/api/marketo/token" && req.method === "GET") {
    if (process.env.NODE_ENV === "production") {
      return sendJson(res, 404, { error: "disabled in production" });
    }
    try {
      const t = await getAccessToken();
      return sendJson(res, 200, {
        ok: true,
        cached: t.cached,
        expiresAt: new Date(t.expiresAt).toISOString(),
        tokenPreview: t.accessToken.slice(0, 6) + "…" + t.accessToken.slice(-4),
      });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: err.message || String(err) });
    }
  }

  if (parsed.pathname === "/api/marketo/resolve-visitor" && req.method === "GET") {
    if (!mktoTrk) {
      return sendJson(res, 200, { anonymous: true, reason: "no_cookie" });
    }
    try {
      const lead = await getLeadByCookie(mktoTrk);
      if (!lead) {
        return sendJson(res, 200, {
          anonymous: true,
          reason: "no_match",
          cookie: mktoTrk,
        });
      }
      return sendJson(res, 200, { anonymous: false, cookie: mktoTrk, lead });
    } catch (err) {
      return sendJson(res, 500, {
        anonymous: true,
        reason: "error",
        error: err.message || String(err),
      });
    }
  }

  if (parsed.pathname === "/api/marketo/submit" && req.method === "POST") {
    let payload;
    try {
      payload = JSON.parse((await readBody(req)) || "{}");
    } catch {
      return sendJson(res, 400, { ok: false, error: "invalid_json" });
    }
    const fields = {};
    Object.keys(payload).forEach(function (k) {
      if (!ALLOWED_FORM_FIELDS.has(k)) return;
      const v = payload[k];
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        fields[k] = v;
      }
    });
    if (!fields.email || typeof fields.email !== "string") {
      return sendJson(res, 400, { ok: false, error: "email_required" });
    }
    try {
      const result = await upsertAndAssociate(fields, mktoTrk);
      return sendJson(res, 200, {
        ok: true,
        status: result.status,
        leadId: result.id,
        cookieAttached: result.cookieAttached,
      });
    } catch (err) {
      return sendJson(res, 502, { ok: false, error: err.message || String(err) });
    }
  }

  return sendJson(res, 404, { error: "not_found" });
}

function serveStatic(req, res, parsed) {
  const filePath = safeStaticPath(parsed.pathname);
  if (!filePath) return send(res, 400, "bad request");

  fs.stat(filePath, function (err, stat) {
    if (err || !stat.isFile()) return send(res, 404, "not found");
    const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
    fs.createReadStream(filePath).pipe(res);
  });
}

/* ------------------------------ Boot ------------------------------ */

const server = http.createServer(function (req, res) {
  const parsed = new URL(req.url, "http://" + (req.headers.host || "localhost"));
  if (
    parsed.pathname === "/config.json" ||
    parsed.pathname.startsWith("/api/")
  ) {
    handleApi(req, res, parsed).catch(function (err) {
      console.error(err);
      sendJson(res, 500, { ok: false, error: "internal_error" });
    });
    return;
  }
  serveStatic(req, res, parsed);
});

server.listen(PORT, function () {
  console.log("Lattice landing page listening on http://localhost:" + PORT);
  if (!process.env.MARKETO_BASE_URL) {
    console.warn(
      "[warn] MARKETO_* env vars not set — /api/marketo/* will return errors until you create .env.local",
    );
  }
});
