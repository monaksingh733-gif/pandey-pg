"use client";

import { useState } from "react";
import { Button, Eyebrow, Panel, Pill, useReveal } from "./ui";
import { Icon } from "./Icon";
import { HOUSE_RULES, BRAND, waLink } from "@/lib/data";
import { cn } from "@/lib/cn";

const ICONS = ["lock", "bell", "wallet", "users", "alert", "clock"];

const TIMELINE = [
  {
    day: "Day 0",
    step: "01",
    phase: "Instant Lock",
    title: "Token paid",
    body: "₹1,000 locks your bed for 48 hours. Nobody else can reserve it.",
  },
  {
    day: "Day 1–2",
    step: "02",
    phase: "Document Approval",
    title: "Digital KYC",
    body: "Upload Aadhaar / College ID / Passport. Parent consent recorded.",
  },
  {
    day: "Day 2–3",
    step: "03",
    phase: "Welcome Kit",
    title: "Move-in",
    body: "Biometric card issued, room inventory signed, Wi-Fi credentials shared.",
  },
  {
    day: "Day 90",
    step: "04",
    phase: "Flexible Exit",
    title: "Lock-in ends",
    body: "You may now vacate freely with 30 days written notice.",
  },
  {
    day: "Checkout",
    step: "05",
    phase: "Full Refund",
    title: "Deposit refund",
    body: "Joint inspection, then refund to your bank within 15 working days.",
  },
];

export function Rules() {
  const [accepted, setAccepted] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const { setRef, shown } = useReveal<HTMLDivElement>();

  const downloadPolicy = () => {
    const text = [
      `PANDEY PG — HOUSE RULES & RESIDENT POLICY`,
      `Property: ${BRAND.address}`,
      `Warden helpline: ${BRAND.phone}`,
      ``,
      ...HOUSE_RULES.map((r, i) => `${i + 1}. ${r.title}\n   ${r.body}\n`),
      `MESS TIMINGS`,
      `Breakfast 7:30–9:30 AM | Lunch 12:30–3:00 PM | Evening Tea 5:30–6:30 PM | Dinner 8:30–10:30 PM`,
      ``,
      `Deposit refund window: 15 working days after checkout inspection.`,
      `Electricity: ₹8.50 per unit on an independent sub-meter, billed monthly with a photo reading.`,
      ``,
      `Acknowledged by resident on ${new Date().toLocaleString("en-IN")}`,
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Pandey-PG-House-Rules.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setDownloaded(true);
  };

  return (
    <section id="rules" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-10 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_10%,rgba(200,157,84,0.09),transparent_70%)]" />
      <div ref={setRef} className="relative mx-auto max-w-[1400px]">
        <div
          className={cn(
            "max-w-3xl transition-all duration-700",
            shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <Eyebrow>PG Rules &amp; Resident Policy</Eyebrow>
          <h2 className="mt-5 font-serif text-4xl leading-[1.1] text-ivory sm:text-5xl">
            Transparent rules. <span className="text-gold-shimmer italic">No surprises.</span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-sand">
            Everything below is written into your resident agreement on day one. We publish it here so
            parents can read it too — before a single rupee changes hands.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {HOUSE_RULES.map((r, i) => (
            <Panel
              key={r.title}
              className={cn(
                "group relative overflow-hidden p-6 transition-all duration-700 hover:-translate-y-1 hover:border-gold/40",
                shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
              )}
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gold/8 opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold transition-all duration-400 group-hover:border-gold group-hover:text-gold-light">
                  <Icon name={ICONS[i] ?? "info"} className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <div className="min-w-0">
                  <p className="text-[9.5px] font-bold uppercase tracking-luxe text-gold/70">
                    Rule {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1.5 font-serif text-[19px] leading-tight text-ivory">{r.title}</h3>
                </div>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-sand">{r.body}</p>
            </Panel>
          ))}
        </div>

        {/* timeline */}
        <div className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-luxe text-gold/80">
                Admissions &amp; Lifecycle Roadmap
              </p>
              <h3 className="mt-1 font-serif text-2xl text-ivory sm:text-3xl">
                Your first 90 days at PANDEY PG
              </h3>
            </div>
            <Pill tone="gold">
              <Icon name="timer" className="h-3.5 w-3.5" />
              Lock-in 3 months · Notice 30 days
            </Pill>
          </div>

          {/* Responsive 5-Column Grid Timeline without clipping or overflow errors */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {TIMELINE.map((t, i) => (
              <div
                key={t.day}
                className="group relative flex flex-col justify-between rounded-xl border border-gold/15 bg-coffee/40 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:bg-coffee/60 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
              >
                {/* Connector arrow between cards on XL viewports */}
                {i < TIMELINE.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-3.5 top-1/2 z-10 hidden -translate-y-1/2 xl:flex h-6 w-6 items-center justify-center rounded-full border border-gold/25 bg-espresso/95 text-gold/60 shadow-md transition-colors duration-300 group-hover:border-gold group-hover:text-gold"
                  >
                    <Icon name="chevronright" className="h-3 w-3" />
                  </div>
                ) : null}

                <div>
                  {/* Card Header: Day Badge + Step Counter */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-espresso/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gold shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                      {t.day}
                    </span>
                    <span className="font-mono text-[10.5px] font-semibold text-sand/40">
                      Step {t.step}
                    </span>
                  </div>

                  {/* Card Title */}
                  <h4 className="mt-3.5 font-serif text-[18px] font-medium leading-snug text-ivory group-hover:text-gold-light transition-colors">
                    {t.title}
                  </h4>

                  {/* Card Body */}
                  <p className="mt-2 text-[12.5px] leading-relaxed text-sand/80">
                    {t.body}
                  </p>
                </div>

                {/* Card Footer: Phase tag */}
                <div className="mt-4 pt-3 border-t border-gold/10 flex items-center justify-between text-[11px] text-gold/60 font-medium">
                  <span className="truncate">{t.phase}</span>
                  <span className="text-[10px] text-sand/30">Phase {i + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* acknowledgement */}
        <Panel className="mt-12 p-6 sm:p-8">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex max-w-2xl cursor-pointer items-start gap-4">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-all duration-300",
                  accepted
                    ? "border-gold bg-gold text-espresso shadow-[0_0_18px_rgba(200,157,84,0.6)]"
                    : "border-gold/35 bg-espresso/60",
                )}
              >
                {accepted ? <Icon name="check" className="h-4 w-4" strokeWidth={3} /> : null}
              </span>
              <span>
                <span className="block text-[13.5px] font-semibold text-ivory">
                  I have read and accept the PANDEY PG house rules, lock-in and notice-period policy.
                </span>
                <span className="mt-1 block text-[12px] leading-snug text-sand-dim">
                  Tick this to unlock the downloadable policy summary. The same declaration is recorded
                  against your booking ID at checkout.
                </span>
              </span>
            </label>

            <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row">
              <Button variant="outline" icon="download" disabled={!accepted} onClick={downloadPolicy}>
                {downloaded ? "Downloaded ✓" : "Download Policy"}
              </Button>
              <Button
                icon="chat"
                disabled={!accepted}
                onClick={() =>
                  window.open(
                    waLink(
                      "Hi PANDEY PG, I have read and accepted the house rules. I'd like to proceed with a booking.",
                    ),
                  )
                }
              >
                Confirm on WhatsApp
              </Button>
            </div>
          </div>
          {accepted ? (
            <p suppressHydrationWarning className="animate-fade-up mt-5 flex items-center gap-2 rounded-lg border border-success/25 bg-success/8 px-4 py-2.5 text-[12px] text-success">
              <Icon name="checkcircle" className="h-4 w-4" />
              Declaration recorded locally at {new Date().toLocaleString("en-IN")}. Attach it to your
              booking in Step 4.
            </p>
          ) : null}
        </Panel>
      </div>
    </section>
  );
}
