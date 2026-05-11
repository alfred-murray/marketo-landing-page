"use client";

import Script from "next/script";

declare global {
  interface Window {
    Munchkin?: {
      init: (id: string, config?: Record<string, unknown>) => void;
      munchkinFunction: (
        name: "associateLead" | "visitWebPage" | "clickLink" | string,
        attrs?: Record<string, unknown>,
        hash?: string,
      ) => void;
    };
    MunchkinTracker?: unknown;
  }
}

const PUBLIC_SUFFIX_HOSTS = [
  "vercel.app",
  "netlify.app",
  "github.io",
  "pages.dev",
];

function getMunchkinDomainLevel(hostname: string): number {
  const parts = hostname.split(".").filter(Boolean);
  if (parts.length <= 1) return parts.length || 1;
  const isPublicSuffix = PUBLIC_SUFFIX_HOSTS.some((suffix) =>
    hostname.endsWith(`.${suffix}`),
  );
  return isPublicSuffix ? parts.length : 2;
}

/**
 * Loads Marketo's Munchkin tracker and initializes it with `cookieAnon: true`
 * so anonymous visitors are tracked immediately on first page load. This is
 * intentional for the dev site — there is no consent gate.
 *
 * The munchkin ID is read from NEXT_PUBLIC_MUNCHKIN_ID at build time so it
 * is safely exposed to the browser.
 */
export function MunchkinScript() {
  const munchkinId = process.env.NEXT_PUBLIC_MUNCHKIN_ID;

  if (!munchkinId) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[Munchkin] NEXT_PUBLIC_MUNCHKIN_ID is not set; tracking is disabled.",
      );
    }
    return null;
  }

  return (
    <Script
      id="marketo-munchkin"
      strategy="afterInteractive"
      src="https://munchkin.marketo.net/munchkin.js"
      onLoad={() => {
        if (typeof window === "undefined" || !window.Munchkin) return;
        window.Munchkin.init(munchkinId, {
          cookieAnon: true,
          // domainLevel = number of trailing hostname labels Munchkin uses
          // for the cookie's Domain attribute. The default of 2 sets the
          // cookie on `.vercel.app`, which browsers reject because vercel.app
          // is on the Public Suffix List. Use the full hostname on PSL-listed
          // hosts (vercel.app, netlify.app, github.io, localhost) so the
          // cookie actually gets stored.
          domainLevel: getMunchkinDomainLevel(window.location.hostname),
          clickTime: 0,
          asyncOnly: true,
        });
      }}
    />
  );
}
