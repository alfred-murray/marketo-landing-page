"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-40 sm:pb-32 sm:pt-44">
      <div className="absolute inset-0 -z-10 bg-mesh opacity-90" />
      <div className="absolute inset-0 -z-10 grid-bg opacity-[0.35] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />

      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-navy-800/50 px-3 py-1 text-xs text-ink-muted backdrop-blur"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_2px_rgba(110,231,168,0.7)]" />
            New: Real-time card issuance API in private beta
            <ArrowRight className="h-3 w-3" />
          </a>

          <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-gradient">Banking-grade</span>
            <br />
            <span className="text-accent-gradient">infrastructure</span>{" "}
            <span className="text-gradient">for modern fintechs.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Lattice is a single API for issuing cards, moving money, and
            staying compliant. Ship products in days, not quarters — on rails
            built by people who actually ran a bank.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-navy-900 shadow-glow transition hover:brightness-110"
            >
              Request a demo
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="#product"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-navy-800/40 px-5 py-3 text-sm font-medium text-ink transition hover:border-border-strong hover:bg-navy-700/60"
            >
              See the platform
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-dim">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              SOC 2 Type II
            </span>
            <span>PCI-DSS Level 1</span>
            <span>ISO 27001</span>
            <span>99.999% uptime SLA</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="mx-auto mt-16 max-w-5xl"
        >
          <DashboardPreview />
        </motion.div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-accent/30 via-sky-400/20 to-purple-500/20 blur-2xl" />
      <div className="rounded-2xl border border-border bg-navy-800/80 p-2 shadow-card backdrop-blur">
        <div className="flex items-center gap-1.5 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <div className="ml-3 flex-1 truncate rounded-md border border-border bg-navy-900/60 px-3 py-1 text-[10px] text-ink-dim">
            console.lattice.dev/payments
          </div>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-12">
          <Sidebar />
          <Main />
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  const items = [
    "Overview",
    "Payments",
    "Cards",
    "Ledger",
    "Compliance",
    "Webhooks",
    "Settings",
  ];
  return (
    <div className="sm:col-span-3">
      <div className="space-y-1 rounded-xl border border-border bg-navy-900/60 p-3">
        {items.map((it, i) => (
          <div
            key={it}
            className={`rounded-md px-3 py-2 text-xs ${
              i === 1
                ? "bg-accent/10 text-accent"
                : "text-ink-muted hover:bg-white/5"
            }`}
          >
            {it}
          </div>
        ))}
      </div>
    </div>
  );
}

function Main() {
  return (
    <div className="sm:col-span-9 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Volume / 24h" value="$8.42M" delta="+12.4%" positive />
        <Stat label="Auth rate" value="98.7%" delta="+0.6%" positive />
        <Stat label="Avg latency" value="42ms" delta="-8ms" positive />
      </div>

      <div className="rounded-xl border border-border bg-navy-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-medium text-ink">Settlement throughput</div>
          <div className="text-[10px] text-ink-dim">Last 24 hours</div>
        </div>
        <Sparkline />
      </div>

      <div className="rounded-xl border border-border bg-navy-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-medium text-ink">Recent transactions</div>
          <div className="text-[10px] text-accent">Live</div>
        </div>
        <div className="divide-y divide-border text-xs">
          {[
            { id: "txn_91f", who: "Stripe Connect → Acme", amt: "+$24,500.00", ms: "38ms" },
            { id: "txn_88a", who: "Card auth · Visa ••4421", amt: "+$129.99", ms: "31ms" },
            { id: "txn_77c", who: "ACH credit · payroll", amt: "+$58,210.00", ms: "44ms" },
            { id: "txn_71e", who: "Refund · order #2293", amt: "-$74.10", ms: "29ms" },
          ].map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
                  {t.id}
                </span>
                <span className="text-ink-muted">{t.who}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-ink-dim">{t.ms}</span>
                <span
                  className={
                    t.amt.startsWith("-") ? "text-red-300" : "text-accent"
                  }
                >
                  {t.amt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-navy-900/60 p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-dim">
        {label}
      </div>
      <div className="mt-1 font-display text-lg font-semibold text-ink">
        {value}
      </div>
      <div
        className={`text-[10px] ${
          positive ? "text-accent" : "text-red-300"
        }`}
      >
        {delta}
      </div>
    </div>
  );
}

function Sparkline() {
  const points = [4, 8, 6, 12, 10, 16, 14, 22, 18, 28, 24, 34, 30, 42, 38, 50];
  const max = Math.max(...points);
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 100 - (p / max) * 90;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  const area = `${path} L 100 100 L 0 100 Z`;
  return (
    <svg viewBox="0 0 100 100" className="h-32 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ee7a8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#6ee7a8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkFill)" />
      <path d={path} fill="none" stroke="#6ee7a8" strokeWidth="1.2" />
    </svg>
  );
}
