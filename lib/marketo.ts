/**
 * Marketo REST client.
 *
 * Handles OAuth2 client_credentials auth with an in-memory token cache, and
 * exposes typed helpers for the two flows we need:
 *   1. Resolving an anonymous visitor by their `_mkto_trk` cookie.
 *   2. Submitting a form on behalf of the visitor (lead is associated to the
 *      Munchkin cookie automatically when we forward it).
 *
 * Docs: https://developers.marketo.com/rest-api/
 */

type TokenCache = {
  accessToken: string;
  /** epoch ms when the cached token should be considered expired */
  expiresAt: number;
};

let cachedToken: TokenCache | null = null;

function readEnv() {
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

export type MarketoTokenInfo = {
  accessToken: string;
  expiresAt: number;
  cached: boolean;
};

/**
 * Returns a valid OAuth2 access token, refreshing it lazily when the cached
 * one is within 60s of expiring. Refreshes are de-duplicated implicitly
 * because Next.js route handlers run in a single Node process per region.
 */
export async function getAccessToken(force = false): Promise<MarketoTokenInfo> {
  const now = Date.now();
  if (
    !force &&
    cachedToken &&
    cachedToken.expiresAt - 60_000 > now &&
    cachedToken.accessToken
  ) {
    return { ...cachedToken, cached: true };
  }

  const { baseUrl, clientId, clientSecret } = readEnv();
  const url = `${baseUrl}/identity/oauth/token?grant_type=client_credentials&client_id=${encodeURIComponent(
    clientId,
  )}&client_secret=${encodeURIComponent(clientSecret)}`;

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Marketo token request failed: ${res.status} ${body}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope?: string;
  };

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return { ...cachedToken, cached: false };
}

type MarketoEnvelope<T> = {
  requestId?: string;
  success: boolean;
  result?: T[];
  errors?: { code: string; message: string }[];
};

/**
 * Generic Marketo REST fetch with bearer auth and one transparent retry on
 * 601 (token expired) — Marketo can invalidate tokens early so we always
 * keep a single retry path.
 */
async function marketoFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<MarketoEnvelope<T>> {
  const { baseUrl } = readEnv();
  const doFetch = async (token: string) => {
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        ...(init.headers as Record<string, string> | undefined),
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    return res;
  };

  let { accessToken } = await getAccessToken();
  let res = await doFetch(accessToken);
  let json = (await res.json()) as MarketoEnvelope<T>;

  const tokenExpired = json.errors?.some((e) => e.code === "601" || e.code === "602");
  if (!res.ok || tokenExpired) {
    if (tokenExpired) {
      cachedToken = null;
      ({ accessToken } = await getAccessToken(true));
      res = await doFetch(accessToken);
      json = (await res.json()) as MarketoEnvelope<T>;
    } else if (!res.ok) {
      throw new Error(
        `Marketo ${path} failed: ${res.status} ${JSON.stringify(json)}`,
      );
    }
  }

  return json;
}

export type MarketoLead = {
  id: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

const DEFAULT_LEAD_FIELDS = [
  "id",
  "email",
  "firstName",
  "lastName",
  "company",
  "createdAt",
  "updatedAt",
].join(",");

/**
 * Resolves a Marketo lead from a `_mkto_trk` cookie value.
 * Returns `null` when the cookie is anonymous (no matching lead in Marketo).
 */
export async function getLeadByCookie(
  cookie: string,
  fields: string = DEFAULT_LEAD_FIELDS,
): Promise<MarketoLead | null> {
  if (!cookie) return null;

  const params = new URLSearchParams({
    filterType: "cookie",
    filterValues: cookie,
    fields,
  });

  const json = await marketoFetch<MarketoLead>(
    `/rest/v1/leads.json?${params.toString()}`,
    { method: "GET" },
  );

  if (!json.success) {
    throw new Error(`Marketo getLeadByCookie failed: ${JSON.stringify(json.errors)}`);
  }

  return json.result?.[0] ?? null;
}

export type LeadFields = Record<string, string | number | boolean | undefined>;

export type SyncLeadResult = {
  status: "created" | "updated" | "skipped";
  id: number;
  reasons?: { code: string; message: string }[];
};

/**
 * Create-or-update a lead by email. Uses the REST lead sync endpoint, which
 * authenticates with OAuth client credentials — no Marketo Form ID required.
 *
 * - Email match → existing lead is updated with any new field values.
 * - No match   → a new lead is created.
 *
 * Docs: https://developers.marketo.com/rest-api/lead-database/leads/#create_and_update
 */
export async function syncLead(fields: LeadFields): Promise<SyncLeadResult> {
  const cleaned: LeadFields = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined && v !== null && v !== "") cleaned[k] = v;
  }
  if (!cleaned.email) {
    throw new Error("syncLead requires at least an `email` field.");
  }

  const body = {
    action: "createOrUpdate",
    lookupField: "email",
    input: [cleaned],
  };

  const json = await marketoFetch<SyncLeadResult>("/rest/v1/leads.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!json.success) {
    throw new Error(`Marketo syncLead failed: ${JSON.stringify(json.errors)}`);
  }

  const first = json.result?.[0];
  if (!first || typeof first.id !== "number") {
    throw new Error(
      `Marketo syncLead returned no lead id: ${JSON.stringify(json.result)}`,
    );
  }
  return first;
}

/**
 * Associates a known lead with a `_mkto_trk` cookie value. This is the REST
 * equivalent of Munchkin's browser-side `associateLead` call, but it auths
 * with OAuth so we don't need the Munchkin API private key.
 *
 * Docs: https://developers.marketo.com/rest-api/lead-database/leads/#associate_lead
 */
export async function associateLeadByCookie(
  leadId: number,
  cookie: string,
): Promise<void> {
  if (!cookie) throw new Error("associateLeadByCookie requires a cookie value.");
  const params = new URLSearchParams({ cookie });
  const json = await marketoFetch<unknown>(
    `/rest/v1/leads/${leadId}/associate.json?${params.toString()}`,
    {
      method: "POST",
      // Marketo rejects POSTs without a Content-Type (error 612) even when
      // the body is empty, because the endpoint expects the cookie in the
      // query string and nothing in the body.
      headers: { "Content-Type": "application/json" },
      body: "{}",
    },
  );
  if (!json.success) {
    throw new Error(
      `Marketo associate failed: ${JSON.stringify(json.errors)}`,
    );
  }
}

/**
 * One-shot: upsert by email, then attach the Munchkin cookie. Returns the
 * resulting lead id and whether it was a brand-new record.
 */
export async function upsertAndAssociate(
  fields: LeadFields,
  cookie?: string,
): Promise<{ id: number; status: SyncLeadResult["status"]; cookieAttached: boolean }> {
  const synced = await syncLead(fields);
  let cookieAttached = false;
  if (cookie) {
    await associateLeadByCookie(synced.id, cookie);
    cookieAttached = true;
  }
  return { id: synced.id, status: synced.status, cookieAttached };
}
