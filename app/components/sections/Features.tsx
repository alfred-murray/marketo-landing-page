import {
  CreditCard,
  Landmark,
  ShieldCheck,
  LineChart,
  Globe2,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "Issue cards in minutes",
    body: "Virtual and physical cards with programmable controls — spend limits, MCC blocks, and 3DS, all behind a single endpoint.",
  },
  {
    icon: Landmark,
    title: "Move money on real rails",
    body: "ACH, RTP, FedNow, SWIFT, and SEPA from day one. Settlement and reconciliation are baked into the ledger.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance, automated",
    body: "KYC, KYB, sanctions, and ongoing monitoring with full audit trails — no spreadsheets, no homemade workflows.",
  },
  {
    icon: LineChart,
    title: "Observability you'll trust",
    body: "Millisecond-resolution metrics, structured event logs, and replayable webhooks across every transaction.",
  },
  {
    icon: Globe2,
    title: "Global by default",
    body: "Issue and accept in 38 currencies. Localized risk models per market with no extra plumbing.",
  },
  {
    icon: Zap,
    title: "Built to be fast",
    body: "p99 authorisation under 60ms. The Lattice ledger is event-sourced and horizontally sharded by tenant.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            The platform
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
            Everything a fintech needs.
            <br />
            Nothing it doesn't.
          </h2>
          <p className="mt-4 text-base text-ink-muted">
            Six primitives that compose into nearly any product — from neobanks
            and B2B spend platforms to embedded payouts.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-navy-800/40 p-6 transition hover:border-border-strong hover:bg-navy-700/40"
            >
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-navy-900/70 text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
