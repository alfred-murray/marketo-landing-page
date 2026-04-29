import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getLeadByCookie } from "@/lib/marketo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Resolves the current visitor by looking up the `_mkto_trk` cookie value
 * against Marketo's lead database. Returns:
 *   - { anonymous: true, reason: "no_cookie" } when Munchkin hasn't set a cookie yet
 *   - { anonymous: true, reason: "no_match" } when the cookie exists but doesn't map to a lead
 *   - { anonymous: false, lead } when a known lead is found
 */
export async function GET() {
  const cookieStore = cookies();
  const mktoTrk = cookieStore.get("_mkto_trk")?.value;

  if (!mktoTrk) {
    return NextResponse.json({ anonymous: true, reason: "no_cookie" });
  }

  try {
    const lead = await getLeadByCookie(mktoTrk);
    if (!lead) {
      return NextResponse.json({
        anonymous: true,
        reason: "no_match",
        cookie: mktoTrk,
      });
    }
    return NextResponse.json({ anonymous: false, cookie: mktoTrk, lead });
  } catch (err) {
    return NextResponse.json(
      {
        anonymous: true,
        reason: "error",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
