"use client";

import { useEffect, useState } from "react";
import { Button, Eyebrow, Field, Panel, Pill, SelectInput, TextInput, useReveal } from "./ui";
import { BrandMark } from "./Navbar";
import { Icon } from "./Icon";
import { BRAND, IMG, ROOMS, waLink } from "@/lib/data";
import { cn } from "@/lib/cn";
import { todayISO } from "@/lib/validate";
import { useAuth } from "@/context/AuthContext";

const NAV_COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Home", id: "home" },
      { label: "Rooms & Pricing", id: "rooms" },
      { label: "Amenities & Mess", id: "amenities" },
      { label: "PG Rules", id: "rules" },
      { label: "Reviews", id: "reviews" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Expense Calculator", id: "calculator" },
      { label: "Location & FAQ", id: "faq" },
      { label: "Contact Desk", id: "contact" },
      { label: "Booking Pass Lookup", id: "pass-lookup" },
    ],
  },
];

export function Contact() {
  const { setRef, shown } = useReveal<HTMLDivElement>();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    tier: "",
    moveIn: todayISO(3),
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [ticket, setTicket] = useState<string | null>(null);
  const { user } = useAuth();
  const [prevUser, setPrevUser] = useState(user);

  if (user !== prevUser) {
    setPrevUser(user);
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.name,
        email: f.email || user.email,
      }));
    }
  }

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 3) next.name = "Please enter your name.";
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "").slice(-10)))
      next.phone = "Enter a valid 10-digit mobile number.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(form.email))
      next.email = "Enter a valid email address.";
    if (form.message.trim().length < 10) next.message = "Tell us a little more (min 10 characters).";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setState("sending");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json?.ok) {
        setState("sent");
        setTicket(`ENQ-${String(json.enquiry.id).padStart(4, "0")}`);
      } else {
        setErrors(json.errors ?? {});
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-10 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_0%,rgba(200,157,84,0.1),transparent_70%)]" />
      <div ref={setRef} className="relative mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div
            className={cn(
              "transition-all duration-700 lg:col-span-5",
              shown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
            )}
          >
            <Eyebrow>Contact The Resident Desk</Eyebrow>
            <h2 className="mt-5 font-serif text-4xl leading-[1.1] text-ivory sm:text-[2.9rem]">
              Come see it. <span className="text-gold-shimmer italic">Then decide.</span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-sand">
              Drop your details and the warden calls you back within 30 minutes (8 AM – 11 PM). Prefer
              to skip the form? WhatsApp is faster.
            </p>

            <div className="mt-8 space-y-3">
              {[
                { icon: "phone", label: "Warden Helpline", value: BRAND.phone, href: `tel:${BRAND.phone.replace(/\s/g, "")}` },
                { icon: "mail", label: "Email", value: BRAND.email, href: `mailto:${BRAND.email}` },
                { icon: "chat", label: "WhatsApp", value: "Instant reply · 8 AM – 11 PM", href: waLink("Hi PANDEY PG! I'd like more information about room availability.") },
                { icon: "map", label: "Address", value: BRAND.address },
              ].map((c) => {
                const inner = (
                  <>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                      <Icon name={c.icon} className="h-4.5 w-4.5" strokeWidth={1.5} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[9.5px] font-bold uppercase tracking-luxe text-gold/75">
                        {c.label}
                      </span>
                      <span className="mt-1 block text-[13px] leading-snug text-ivory">{c.value}</span>
                    </span>
                  </>
                );
                return c.href ? (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="flex items-start gap-4 rounded-xl border border-gold/12 bg-coffee/45 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:bg-gold/6"
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    key={c.label}
                    className="flex items-start gap-4 rounded-xl border border-gold/12 bg-coffee/45 p-4"
                  >
                    {inner}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-gold/15">
              <img
                src={IMG.lounge}
                alt="PANDEY PG resident lounge"
                loading="lazy"
                className="h-40 w-full object-cover"
              />
            </div>
          </div>

          <div
            className={cn(
              "transition-all delay-150 duration-700 lg:col-span-7",
              shown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
            )}
          >
            <Panel glow className="p-6 sm:p-8">
              {state === "sent" ? (
                <div className="animate-scale-in py-6 text-center">
                  <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-success/40 bg-success/12 text-success animate-pulse-ring">
                    <Icon name="checkcircle" className="h-9 w-9" strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-6 font-serif text-3xl text-ivory">Enquiry received</h3>
                  <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-sand">
                    Your reference is <strong className="text-gold-light">{ticket}</strong>. The warden
                    will call {form.phone} within 30 minutes between 8 AM and 11 PM.
                  </p>
                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <Button
                      icon="chat"
                      onClick={() =>
                        window.open(
                          waLink(
                            `Hi PANDEY PG! I just submitted enquiry ${ticket} on your website (Name: ${form.name}). Please share availability.`,
                          ),
                        )
                      }
                    >
                      Continue on WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setState("idle");
                        setForm({ name: "", phone: "", email: "", tier: "", moveIn: todayISO(3), message: "" });
                      }}
                    >
                      Send another
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} noValidate>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-serif text-2xl text-ivory sm:text-3xl">Request a callback</h3>
                    <Pill tone="gold">
                      <Icon name="timer" className="h-3.5 w-3.5" />
                      Avg. reply 12 min
                    </Pill>
                  </div>

                  <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Full name" required error={errors.name}>
                      <TextInput
                        value={form.name}
                        invalid={Boolean(errors.name)}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="e.g. Aditi Sharma"
                        autoComplete="name"
                      />
                    </Field>
                    <Field label="Mobile number" required error={errors.phone} hint="10 digits">
                      <TextInput
                        value={form.phone}
                        invalid={Boolean(errors.phone)}
                        onChange={(e) => set("phone", e.target.value.replace(/[^\d+\s-]/g, "").slice(0, 14))}
                        placeholder="98765 43210"
                        inputMode="numeric"
                        autoComplete="tel"
                      />
                    </Field>
                    <Field label="Email" error={errors.email} hint="Optional">
                      <TextInput
                        type="email"
                        value={form.email}
                        invalid={Boolean(errors.email)}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </Field>
                    <Field label="Interested in" hint="Optional">
                      <SelectInput value={form.tier} onChange={(e) => set("tier", e.target.value)}>
                        <option value="">Any room type</option>
                        {ROOMS.map((r) => (
                          <option key={r.tier} value={r.tier}>
                            {r.title} ({r.seats})
                          </option>
                        ))}
                      </SelectInput>
                    </Field>
                    <Field label="Preferred move-in" className="sm:col-span-2">
                      <TextInput
                        type="date"
                        value={form.moveIn}
                        min={todayISO(0)}
                        onChange={(e) => set("moveIn", e.target.value)}
                      />
                    </Field>
                    <Field label="Your message" required error={errors.message} className="sm:col-span-2">
                      <textarea
                        value={form.message}
                        onChange={(e) => set("message", e.target.value.slice(0, 600))}
                        rows={4}
                        placeholder="Tell us about your course / job, budget and any specific requirement (AC, balcony, ground floor…)"
                        className={cn(
                          "w-full resize-none rounded-lg border bg-espresso/70 px-3.5 py-2.5 text-sm text-ivory outline-none transition-all duration-200 placeholder:text-sand-dim/70 focus:border-gold/60 focus:ring-2 focus:ring-gold/20",
                          errors.message ? "border-danger/60" : "border-gold/15",
                        )}
                      />
                    </Field>
                  </div>

                  {state === "error" ? (
                    <p className="mt-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/8 px-4 py-2.5 text-[12px] text-danger">
                      <Icon name="alert" className="h-4 w-4" />
                      Something went wrong. Please try again or WhatsApp us directly.
                    </p>
                  ) : null}

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      type="submit"
                      size="lg"
                      icon="mail"
                      disabled={state === "sending"}
                      className="sm:flex-1"
                    >
                      {state === "sending" ? "Sending…" : "Send Enquiry"}
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      icon="calendar"
                      onClick={() => document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      See Rooms First
                    </Button>
                  </div>
                  <p className="mt-4 text-[11px] leading-relaxed text-sand-dim">
                    By submitting you agree to be contacted about PANDEY PG availability. We never share
                    your number with third parties or brokers.
                  </p>
                </form>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer({
  onBook,
}: {
  onBook: () => void;
}) {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <footer className="relative overflow-hidden border-t border-gold/15 bg-[linear-gradient(180deg,#17100C_0%,#120D0A_100%)] px-4 pb-28 pt-16 sm:px-6 lg:px-10 lg:pb-16">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[260px] w-[700px] -translate-x-1/2 rounded-full bg-gold/6 blur-[130px]" />
      <div className="relative mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <BrandMark />
            <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-sand">
              PANDEY PG is a 42-bed premium paying-guest property built for students and working
              professionals who refuse to choose between affordability and dignity. Direct owner
              booking, zero brokerage, transparent metering.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button size="sm" icon="bed" onClick={onBook}>
                Book Your Stay
              </Button>
              <a
                href="/resident"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gold/30 bg-coffee/60 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-sand hover:border-gold hover:bg-gold/10 hover:text-gold-light"
              >
                <Icon name="home" className="h-3.5 w-3.5" />
                Resident Portal
              </a>
              <a
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gold/30 bg-coffee/60 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-gold hover:border-gold hover:bg-gold/10"
              >
                <Icon name="shield" className="h-3.5 w-3.5" />
                Warden Portal
              </a>
            </div>
          </div>

          {NAV_COLUMNS.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-luxe text-gold">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <button
                      type="button"
                      onClick={() => go(l.id)}
                      className="group inline-flex items-center gap-1.5 text-[12.5px] text-sand transition-colors hover:text-gold-light"
                    >
                      <span className="h-px w-0 bg-gold transition-all duration-300 group-hover:w-3" />
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-4">
            <p className="text-[10px] font-bold uppercase tracking-luxe text-gold">Resident Desk</p>
            <ul className="mt-4 space-y-3 text-[12.5px] text-sand">
              <li className="flex gap-3">
                <Icon name="map" className="mt-0.5 h-4 w-4 shrink-0 text-gold/80" />
                {BRAND.address}
              </li>
              <li className="flex gap-3">
                <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-gold/80" />
                <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} className="hover:text-gold-light">
                  {BRAND.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0 text-gold/80" />
                <a href={`mailto:${BRAND.email}`} className="hover:text-gold-light">
                  {BRAND.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-gold/80" />
                Reception 9:00 AM – 9:00 PM · Warden on-site 24/7
              </li>
            </ul>

            <div id="pass-lookup" className="mt-6 rounded-xl border border-gold/18 bg-coffee/50 p-4">
              <PassLookup />
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-gold/12 pt-6 sm:flex-row">
          <p suppressHydrationWarning className="text-[11px] text-sand-dim">
            © {new Date().getFullYear()} PANDEY PG &amp; Luxury Living. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-sand-dim">
            <span className="flex items-center gap-1.5">
              <Icon name="shield" className="h-3.5 w-3.5 text-gold/70" />
              CCTV monitored
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="lock" className="h-3.5 w-3.5 text-gold/70" />
              KYC verified residents
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="rupee" className="h-3.5 w-3.5 text-gold/70" />
              Zero brokerage
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function PassLookup() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; message: string; href?: string }>(null);
  const [busy, setBusy] = useState(false);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (cleanCode.length < 6) {
      setResult({ ok: false, message: "Enter your full booking ID, e.g. #PANDEY-2026-1234" });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(cleanCode)}`, { cache: "no-store" });
      const json = await res.json();
      if (json?.ok) {
        setResult({
          ok: true,
          message: `Pass found for ${json.booking.fullName} · ${json.booking.bedLabel} (${json.booking.roomCode})`,
          href: `/pass/${encodeURIComponent(json.booking.code)}`,
        });
      } else {
        setResult({ ok: false, message: json?.error ?? "No booking pass found for that reference." });
      }
    } catch {
      setResult({ ok: false, message: "Lookup failed. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <p className="text-[10px] font-bold uppercase tracking-luxe text-gold">Booking Pass Lookup</p>
      <form onSubmit={lookup} className="mt-3 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="#PANDEY-2026-0000"
          className="min-w-0 flex-1 rounded-lg border border-gold/18 bg-espresso/70 px-3 py-2 text-[12px] text-ivory outline-none transition-colors placeholder:text-sand-dim/70 focus:border-gold/55"
          aria-label="Booking ID"
        />
        <Button type="submit" size="sm" disabled={busy} icon="file">
          {busy ? "…" : "Find"}
        </Button>
      </form>
      {result ? (
        <p
          className={cn(
            "mt-2.5 text-[11.5px] leading-snug",
            result.ok ? "text-success" : "text-danger",
          )}
        >
          {result.message}
          {result.href ? (
            <a href={result.href} className="ml-1.5 underline decoration-gold/50 hover:text-gold-light">
              Open pass →
            </a>
          ) : null}
        </p>
      ) : null}
    </>
  );
}
