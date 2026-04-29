import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { upsertAndAssociate, type LeadFields } from "@/lib/marketo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_FIELDS = new Set([
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

type SubmitPayload = Partial<Record<string, unknown>>;

function pickFields(payload: SubmitPayload): LeadFields {
  const out: LeadFields = {};
  for (const [k, v] of Object.entries(payload)) {
    if (!ALLOWED_FIELDS.has(k)) continue;
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Accepts the on-page lead form. Uses the REST API exclusively (clientId +
 * clientSecret) to:
 *   1. Upsert a lead by email via POST /rest/v1/leads.json (syncLead).
 *   2. Associate the visitor's `_mkto_trk` cookie to that lead via
 *      POST /rest/v1/leads/{id}/associate.json.
 *
 * No Marketo Form ID required. No Munchkin API private key required.
 */
export async function POST(req: Request) {
  let payload: SubmitPayload;
  try {
    payload = (await req.json()) as SubmitPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const fields = pickFields(payload);
  if (!fields.email || typeof fields.email !== "string") {
    return NextResponse.json(
      { ok: false, error: "email_required" },
      { status: 400 },
    );
  }

  const mktoTrk = cookies().get("_mkto_trk")?.value;

  try {
    const result = await upsertAndAssociate(fields, mktoTrk);
    return NextResponse.json({
      ok: true,
      status: result.status,
      leadId: result.id,
      cookieAttached: result.cookieAttached,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }
}
