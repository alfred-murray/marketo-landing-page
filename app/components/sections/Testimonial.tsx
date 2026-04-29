import { Quote } from "lucide-react";

export function Testimonial() {
  return (
    <section id="customers" className="py-24 sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-3xl">
          <div className="relative rounded-3xl border border-border bg-navy-800/40 p-8 sm:p-12">
            <Quote className="absolute -top-4 left-8 h-10 w-10 rounded-full border border-border bg-bg p-2 text-accent" />
            <p className="font-display text-2xl leading-relaxed text-ink sm:text-3xl">
              We rebuilt our payments stack on Lattice in six weeks. We launched
              corporate cards in two more, and the ledger gave our finance
              team{" "}
              <span className="text-accent-gradient">close-of-books in a day</span>{" "}
              — down from eleven.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-navy-900 text-sm font-semibold text-accent">
                MK
              </div>
              <div>
                <div className="text-sm font-semibold text-ink">
                  Maya Kapoor
                </div>
                <div className="text-xs text-ink-muted">
                  VP Engineering · Northwind
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
