"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Stat = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  decimals?: number;
};

const stats: Stat[] = [
  { value: 184, prefix: "$", suffix: "B", label: "Processed annually" },
  { value: 99.999, suffix: "%", label: "Uptime SLA", decimals: 3 },
  { value: 42, suffix: "ms", label: "p99 authorisation" },
  { value: 38, suffix: "+", label: "Currencies supported" },
];

export function Stats() {
  return (
    <section className="relative py-20">
      <div className="container-page">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-navy-800/60 to-navy-900/40 p-8 sm:p-12">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((s) => (
              <Counter key={s.label} {...s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Counter({ value, suffix, prefix, label, decimals = 0 }: Stat) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <div ref={ref}>
      <div className="font-display text-4xl font-semibold text-accent-gradient sm:text-5xl">
        {prefix}
        {display.toFixed(decimals)}
        {suffix}
      </div>
      <div className="mt-2 text-xs uppercase tracking-[0.18em] text-ink-dim">
        {label}
      </div>
    </div>
  );
}
