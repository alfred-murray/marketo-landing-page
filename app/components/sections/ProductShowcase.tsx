import { CheckCircle2 } from "lucide-react";

const points = [
  "One ledger across cards, payments, and payouts",
  "Webhooks with at-least-once delivery + DLQ",
  "Full audit trail per transaction, queryable by lead",
  "Sandbox parity with production, including BIN sponsorship",
];

export function ProductShowcase() {
  return (
    <section id="product" className="relative py-24 sm:py-32">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-20">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Built for builders
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
              One API. One ledger.
              <br />
              Zero surprises.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Everything in Lattice posts to a single double-entry ledger,
              so reconciliation and reporting are a query — not a quarterly
              project.
            </p>
            <ul className="mt-8 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span className="text-sm text-ink">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <CodeCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function CodeCard() {
  return (
    <div className="relative">
      <div className="absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-tr from-accent/20 via-sky-400/10 to-purple-500/10 blur-xl" />
      <div className="overflow-hidden rounded-2xl border border-border bg-navy-900/70 shadow-card">
        <div className="flex items-center gap-2 border-b border-border bg-navy-800/60 px-4 py-2.5 text-[11px] text-ink-dim">
          <span className="h-2 w-2 rounded-full bg-red-400/80" />
          <span className="h-2 w-2 rounded-full bg-yellow-400/80" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
          <span className="ml-2 font-mono">issue-card.ts</span>
        </div>
        <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed text-ink-muted">
          <code>
            <span className="text-purple-300">import</span>{" "}
            <span className="text-ink">{"{ Lattice }"}</span>{" "}
            <span className="text-purple-300">from</span>{" "}
            <span className="text-emerald-300">{"\"@lattice/sdk\""}</span>;
            {"\n\n"}
            <span className="text-purple-300">const</span>{" "}
            <span className="text-ink">lattice</span> ={" "}
            <span className="text-purple-300">new</span>{" "}
            <span className="text-sky-300">Lattice</span>(
            <span className="text-ink">{"{ apiKey: process.env.LATTICE_KEY }"}</span>
            );
            {"\n\n"}
            <span className="text-purple-300">const</span>{" "}
            <span className="text-ink">card</span> ={" "}
            <span className="text-purple-300">await</span>{" "}
            <span className="text-ink">lattice.cards</span>.
            <span className="text-sky-300">issue</span>({"{"}
            {"\n  "}holder: <span className="text-ink">customerId</span>,
            {"\n  "}program: <span className="text-emerald-300">{"\"corporate-spend\""}</span>,
            {"\n  "}controls: {"{"}
            {"\n    "}spendLimit: {"{"} amount: <span className="text-amber-300">500_00</span>, period: <span className="text-emerald-300">{"\"monthly\""}</span> {"},"}
            {"\n    "}allowedMcc: [<span className="text-emerald-300">{"\"5812\""}</span>, <span className="text-emerald-300">{"\"5814\""}</span>],
            {"\n  "}{"},"}
            {"\n"}{"}"});
            {"\n\n"}
            <span className="text-ink-dim">{"// → card.id, card.last4, card.network — ready in &lt;200ms"}</span>
          </code>
        </pre>
      </div>
    </div>
  );
}
