import { MarketoForm } from "../MarketoForm";

export function CTA() {
  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-grid-fade opacity-90" />
      <div className="container-page">
        <div className="grid gap-12 rounded-3xl border border-border bg-navy-800/40 p-8 lg:grid-cols-12 lg:gap-16 lg:p-14">
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Get a demo
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
              See Lattice in your own sandbox.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Tell us a bit about what you're building. We'll spin up a
              sandbox, walk you through a flow that maps to your product, and
              share commercial terms before you leave the call.
            </p>

            <ul className="mt-8 space-y-2 text-sm text-ink-muted">
              <li>· 30-minute working session with a solutions engineer</li>
              <li>· Live sandbox seeded with sample programs</li>
              <li>· Indicative pricing within the same call</li>
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-border bg-bg/60 p-6 sm:p-8">
              <MarketoForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
