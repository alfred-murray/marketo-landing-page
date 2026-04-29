const logos = [
  "Northwind",
  "Helix Bank",
  "Cobalt",
  "Parallel",
  "Meridian",
  "Foundry",
];

export function LogoCloud() {
  return (
    <section className="border-y border-border/60 bg-bg-subtle/40">
      <div className="container-page py-12">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-ink-dim">
          Trusted by treasury & risk teams at
        </p>
        <div className="mt-6 grid grid-cols-2 items-center gap-x-10 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {logos.map((name) => (
            <div
              key={name}
              className="text-center font-display text-lg font-semibold tracking-tight text-ink-muted/70 transition hover:text-ink"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
