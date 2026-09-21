"use client";

import { FormEvent, useState } from "react";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus({ kind: "sending" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          company: data.get("company"),
          message: data.get("message"),
          website: data.get("website"),
        }),
      });

      const json = (await response.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || json.success === false) {
        setStatus({
          kind: "error",
          message: json.error || "Could not send your details.",
        });
        return;
      }

      form.reset();
      setStatus({
        kind: "success",
        message: json.message || "Sent. We will reply from our business email.",
      });
    } catch {
      setStatus({
        kind: "error",
        message: "Network error. Check your connection and try again.",
      });
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span>Name</span>
          <input
            required
            name="name"
            autoComplete="name"
            className="h-11 rounded-lg border border-white/15 bg-black/30 px-3 outline-none ring-amber-400/70 focus:ring-2"
            placeholder="Your name"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span>Email</span>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            className="h-11 rounded-lg border border-white/15 bg-black/30 px-3 outline-none ring-amber-400/70 focus:ring-2"
            placeholder="you@company.com"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span>Phone (optional)</span>
          <input
            name="phone"
            autoComplete="tel"
            className="h-11 rounded-lg border border-white/15 bg-black/30 px-3 outline-none ring-amber-400/70 focus:ring-2"
            placeholder="+1 555 000 0000"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span>Company (optional)</span>
          <input
            name="company"
            autoComplete="organization"
            className="h-11 rounded-lg border border-white/15 bg-black/30 px-3 outline-none ring-amber-400/70 focus:ring-2"
            placeholder="Business name"
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm">
        <span>How can we help?</span>
        <textarea
          required
          name="message"
          rows={6}
          className="rounded-lg border border-white/15 bg-black/30 px-3 py-3 outline-none ring-amber-400/70 focus:ring-2"
          placeholder="Tell us what you need."
        />
      </label>
      <div aria-hidden="true" className="hidden">
        <input tabIndex={-1} autoComplete="off" name="website" />
      </div>
      <button
        type="submit"
        disabled={status.kind === "sending"}
        className="h-12 rounded-lg bg-amber-400 font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status.kind === "sending" ? "Sending…" : "Send to our business email"}
      </button>
      {status.kind === "success" ? (
        <p role="status" className="rounded-lg bg-emerald-500/15 px-3 py-2 text-sm text-emerald-200">
          {status.message}
        </p>
      ) : null}
      {status.kind === "error" ? (
        <p role="alert" className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
