const cols = [
  {
    title: "Product",
    items: ["Cards", "Payments", "Ledger", "Compliance", "Webhooks"],
  },
  {
    title: "Developers",
    items: ["Documentation", "API reference", "Status", "Changelog"],
  },
  {
    title: "Company",
    items: ["About", "Customers", "Careers", "Press"],
  },
  {
    title: "Legal",
    items: ["Terms", "Privacy", "Security", "DPA"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">
                <defs>
                  <linearGradient id="footerLogo" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6ee7a8" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
                <path d="M16 40 L32 14 L48 40 Z" fill="url(#footerLogo)" />
                <path
                  d="M22 44 H42"
                  stroke="url(#footerLogo)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-display text-base font-semibold tracking-tight text-ink">
                Lattice
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-ink-muted">
              Banking-grade infrastructure for modern fintechs. Built in San
              Francisco and London.
            </p>
            <p className="mt-6 text-xs text-ink-dim">
              © {new Date().getFullYear()} Lattice Financial Technologies, Inc.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-8 lg:grid-cols-4">
            {cols.map((c) => (
              <div key={c.title}>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-dim">
                  {c.title}
                </div>
                <ul className="mt-4 space-y-2.5">
                  {c.items.map((it) => (
                    <li key={it}>
                      <a
                        href="#"
                        className="text-sm text-ink-muted transition hover:text-ink"
                      >
                        {it}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
