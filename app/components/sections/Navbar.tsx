"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

const links = [
  { href: "#product", label: "Product" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#customers", label: "Customers" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-bg/70 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-base font-semibold tracking-tight text-ink">
            Lattice
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-ink-muted transition hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#"
            className="hidden rounded-md px-3 py-2 text-sm text-ink-muted transition hover:text-ink md:block"
          >
            Sign in
          </a>
          <a
            href="#contact"
            className="group inline-flex items-center gap-1 rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-navy-900 shadow-glow transition hover:brightness-110"
          >
            Get a demo
            <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </nav>
    </header>
  );
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="navLogo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6ee7a8" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#navLogo)" opacity="0.15" />
      <path d="M16 40 L32 14 L48 40 Z" fill="url(#navLogo)" />
      <path
        d="M22 44 H42"
        stroke="url(#navLogo)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
