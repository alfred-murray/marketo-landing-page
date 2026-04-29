import { Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    cadence: "for 90 days",
    description:
      "For teams validating a new fintech idea. Sandbox plus production access on a generous free tier.",
    features: [
      "Up to 1,000 transactions",
      "Sandbox + production parity",
      "Email support",
      "Standard webhooks",
    ],
    cta: "Start building",
    highlighted: false,
  },
  {
    name: "Scale",
    price: "$2,500",
    cadence: "/ month + usage",
    description:
      "For teams in market. Includes BIN sponsorship, real-time payments, and a dedicated solutions engineer.",
    features: [
      "Unlimited transactions",
      "BIN sponsorship included",
      "RTP, FedNow, ACH, SWIFT",
      "Dedicated solutions engineer",
      "99.99% uptime SLA",
    ],
    cta: "Talk to sales",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "annual contract",
    description:
      "For regulated entities and platforms above $1B in flow. Co-engineered SLAs and direct access to risk.",
    features: [
      "Custom commercial terms",
      "99.999% uptime SLA",
      "Private cloud / VPC peering",
      "On-call risk & compliance",
      "Quarterly business reviews",
    ],
    cta: "Contact us",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Pricing
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
            Honest, usage-based pricing
          </h2>
          <p className="mt-4 text-base text-ink-muted">
            No interchange clawbacks, no surprise platform fees.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                t.highlighted
                  ? "border-accent/40 bg-gradient-to-b from-accent/[0.06] to-transparent shadow-glow"
                  : "border-border bg-navy-800/40"
              }`}
            >
              {t.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-accent/40 bg-bg px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                  Most popular
                </div>
              )}
              <div className="font-display text-base font-semibold text-ink">
                {t.name}
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl font-semibold text-ink">
                  {t.price}
                </span>
                <span className="text-xs text-ink-muted">{t.cadence}</span>
              </div>
              <p className="mt-3 text-sm text-ink-muted">{t.description}</p>

              <ul className="mt-6 space-y-2.5">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-ink"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`mt-8 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  t.highlighted
                    ? "bg-accent text-navy-900 shadow-glow hover:brightness-110"
                    : "border border-border text-ink hover:border-border-strong hover:bg-navy-700/40"
                }`}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
