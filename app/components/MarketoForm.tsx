"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string; leadId?: number }
  | { status: "error"; message: string };

const fieldClass =
  "w-full rounded-lg border border-border bg-navy-800/60 px-4 py-3 text-sm text-ink placeholder:text-ink-dim focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20";

export function MarketoForm() {
  const [state, setState] = useState<FormState>({ status: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/marketo/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setState({
          status: "error",
          message: data?.error || `Submission failed (${res.status})`,
        });
        return;
      }

      setState({
        status: "success",
        leadId: data.leadId,
        message:
          data.status === "created"
            ? `New lead #${data.leadId} created and stitched to your visitor cookie.`
            : `Lead #${data.leadId} was updated and re-stitched to your visitor cookie.`,
      });
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Network error",
      });
    }
  }

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-accent" />
        <h3 className="font-display text-xl font-semibold text-ink">
          Request received
        </h3>
        <p className="mt-2 text-sm text-ink-muted">{state.message}</p>
        <p className="mt-3 text-[11px] text-ink-dim">
          Call <code className="text-accent">/api/marketo/resolve-visitor</code>{" "}
          to verify the cookie → lead association.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">
            First name
          </label>
          <input
            name="firstName"
            autoComplete="given-name"
            required
            className={fieldClass}
            placeholder="Ada"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">
            Last name
          </label>
          <input
            name="lastName"
            autoComplete="family-name"
            required
            className={fieldClass}
            placeholder="Lovelace"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink-muted">
          Work email
        </label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className={fieldClass}
          placeholder="ada@yourcompany.com"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">
            Company
          </label>
          <input
            name="company"
            autoComplete="organization"
            required
            className={fieldClass}
            placeholder="Acme Financial"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">
            Title
          </label>
          <input
            name="title"
            autoComplete="organization-title"
            className={fieldClass}
            placeholder="Head of Payments"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink-muted">
          What are you trying to build?
        </label>
        <textarea
          name="message"
          rows={3}
          className={fieldClass}
          placeholder="Tell us about the use case…"
        />
      </div>

      <input type="hidden" name="leadSource" value="Website — Landing Page" />

      <button
        type="submit"
        disabled={state.status === "submitting"}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-navy-900 shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state.status === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            Request a demo
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      {state.status === "error" && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <p className="text-center text-[11px] leading-relaxed text-ink-dim">
        By submitting you agree to receive product updates. Visitor activity
        is tracked via Marketo Munchkin on this development site.
      </p>
    </form>
  );
}
