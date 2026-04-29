import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/marketo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Dev-only sanity endpoint. Returns a redacted token + expiry so you can
 * confirm OAuth credentials are wired up correctly without exposing the
 * real bearer token to the client.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "disabled in production" }, { status: 404 });
  }

  try {
    const token = await getAccessToken();
    return NextResponse.json({
      ok: true,
      cached: token.cached,
      expiresAt: new Date(token.expiresAt).toISOString(),
      tokenPreview: `${token.accessToken.slice(0, 6)}…${token.accessToken.slice(-4)}`,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
