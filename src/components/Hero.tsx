"use client";

import { useEffect, useState } from "react";
import { Button, Pill } from "./ui";
import { Icon } from "./Icon";
import { BRAND, IMG, STATS, waLink } from "@/lib/data";
import { cn } from "@/lib/cn";

export function Hero({
  bedsLeft,
  onBook,
}: {
  bedsLeft: number | null;
  onBook: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="home" className="relative isolate min-h-[100svh] overflow-hidden pt-[74px]">
      {/* photographic layer */}
      <div className="absolute inset-0 -z-30">
        <img
          src={IMG.hero}
          alt="Warm tungsten-lit luxury bedroom interior at PANDEY PG"
          className={cn(
            "h-full w-full object-cover object-center transition-all duration-[1600ms] ease-out",
            loaded ? "scale-100 opacity-100" : "scale-105 opacity-0",
          )}
          loading="eager"
          decoding="async"
        />
      </div>

      {/* cinematic gradients — solid espresso left, clear room right */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(100deg,#120D0A_0%,rgba(18,13,10,0.97)_26%,rgba(28,20,15,0.82)_48%,rgba(28,20,15,0.28)_72%,rgba(18,13,10,0.55)_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_top,#120D0A_2%,rgba(18,13,10,0.15)_38%,rgba(18,13,10,0.72)_100%)]" />
      <div className="spotlight absolute inset-0 -z-10" />
      <div className="animate-float-slow absolute -left-24 top-24 -z-10 h-[420px] w-[420px] rounded-full bg-gold/10 blur-[130px]" />
      <div className="animate-float-slow absolute right-[-10%] bottom-[-12%] -z-10 h-[380px] w-[380px] rounded-full bg-[#7a4a1e]/25 blur-[140px] [animation-delay:2.5s]" />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-24 lg:pt-20">
        <div className="lg:col-span-7 xl:col-span-6">
          <div
            className={cn(
              "transition-all duration-700",
              loaded ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}
          >
            <Pill tone="gold" className="px-4 py-1.5 text-[10px]">
              <Icon name="star" className="h-3 w-3 fill-gold text-gold" strokeWidth={1.5} />
              Premium Student &amp; Professional Living
            </Pill>
          </div>

          <h1
            className={cn(
              "mt-6 font-serif text-[2.6rem] leading-[1.04] tracking-tight text-ivory transition-all delay-100 duration-700 sm:text-6xl lg:text-[4.4rem] xl:text-[4.9rem]",
              loaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
          >
            Experience
            <br />
            <span className="text-gold-shimmer italic">Five-Star</span> PG Living
          </h1>

          <p
            className={cn(
              "mt-6 max-w-xl text-[15px] leading-relaxed text-sand transition-all delay-200 duration-700 sm:text-base",
              loaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
          >
            Unmatched comfort, hygienic homely meals, and 24/7 security tailored to perfection for
            students and working professionals.
          </p>

          <div
            className={cn(
              "mt-9 flex flex-col gap-3 transition-all delay-300 duration-700 sm:flex-row sm:items-center",
              loaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
          >
            <Button size="lg" icon="bed" onClick={onBook}>
              Book Your Bed
            </Button>
            <Button
              size="lg"
              variant="outline"
              icon="chat"
              onClick={() =>
                window.open(
                  waLink(
                    "Hi PANDEY PG! I am interested in booking a room and would like to know the current availability.",
                  ),
                )
              }
            >
              Inquire on WhatsApp
            </Button>
          </div>

          <div
            className={cn(
              "mt-8 inline-flex flex-wrap items-center gap-3 rounded-full border border-success/25 bg-success/8 px-4 py-2.5 backdrop-blur-md transition-all delay-500 duration-700",
              loaded ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ivory/90">
              Admissions Open for Current Session
            </span>
            <span className="h-3 w-px bg-success/35" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-success">
              {bedsLeft === null
                ? "Loading live beds…"
                : bedsLeft <= 12
                  ? `Only ${bedsLeft} Beds Left`
                  : `${bedsLeft} Beds Available Now`}
            </span>
          </div>

          {/* micro stats */}
          <dl
            className={cn(
              "mt-12 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-6 border-t border-gold/15 pt-8 transition-all delay-[600ms] duration-700 sm:grid-cols-4",
              loaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
          >
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="font-serif text-2xl text-gold-light sm:text-3xl">{s.value}</dt>
                <dd className="mt-1">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-ivory/85">
                    {s.label}
                  </span>
                  <span className="mt-0.5 block text-[10.5px] leading-snug text-sand-dim">{s.sub}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* right side floating glass card */}
        <div className="hidden lg:col-span-5 lg:block xl:col-span-6">
          <div
            className={cn(
              "relative ml-auto w-full max-w-sm transition-all delay-500 duration-1000 xl:max-w-md",
              loaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
            )}
          >
            <div className="glass-panel relative overflow-hidden rounded-[26px] p-6">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/12 blur-3xl" />
              <p className="text-[10px] font-bold uppercase tracking-luxe text-gold">
                Resident Concierge
              </p>
              <h2 className="mt-3 font-serif text-2xl leading-snug text-ivory">
                Move in within <span className="text-gold-light">48 hours</span> of your token.
              </h2>
              <ul className="mt-5 space-y-3">
                {[
                  { icon: "rupee", t: "₹0 brokerage, ₹0 hidden charges", s: "You pay only what the invoice shows" },
                  { icon: "lock", t: "₹1,000 token locks your bed", s: "Held exclusively for you for 48 hours" },
                  { icon: "clipboard", t: "Digital KYC, no paperwork runaround", s: "Aadhaar / College ID / Passport" },
                  { icon: "handshake", t: "24/7 Dedicated Warden & Care", s: "Instant support & safety guaranteed" },
                ].map((r) => (
                  <li key={r.t} className="flex gap-3">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/35 bg-gold/10 text-gold">
                      <Icon name={r.icon} className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-[12.5px] font-semibold text-ivory">{r.t}</span>
                      <span className="block text-[11px] leading-snug text-sand-dim">{r.s}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-2.5">
                <Button
                  size="sm"
                  className="flex-1"
                  icon="phone"
                  onClick={() => window.open(`tel:${BRAND.phone.replace(/\s/g, "")}`)}
                >
                  Call Warden
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  icon="chat"
                  onClick={() =>
                    window.open(
                      waLink(
                        "Hi PANDEY PG! I saw your website and would like to know about current bed availability.",
                      ),
                    )
                  }
                >
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <button
        type="button"
        onClick={() => document.getElementById("quick-info")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-gold/70 transition-colors hover:text-gold lg:flex"
        aria-label="Scroll to quick information"
      >
        <span className="text-[9px] font-bold uppercase tracking-luxe">Scroll</span>
        <span className="flex h-9 w-5 items-start justify-center rounded-full border border-gold/40 p-1">
          <span className="h-2 w-1 animate-bounce rounded-full bg-gold" />
        </span>
      </button>
    </section>
  );
}
