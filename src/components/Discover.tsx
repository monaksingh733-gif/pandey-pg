"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Eyebrow, Panel, Pill, useReveal } from "./ui";
import { Icon } from "./Icon";
import {
  AMENITIES,
  BRAND,
  IMG,
  MESS_DAYS,
  MESS_MENU,
  MESS_TIMINGS,
  HOUSE_RULES,
  waLink,
  type DayKey,
} from "@/lib/data";
import { cn } from "@/lib/cn";

type Tab = "amenities" | "mess" | "rules";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "amenities", label: "Core Amenities", icon: "sparkles" },
  { key: "mess", label: "Weekly Mess Menu", icon: "utensils" },
  { key: "rules", label: "House Rules", icon: "clipboard" },
];

function todayKey(): DayKey {
  const map: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[new Date().getDay()];
}

export function Discover({ onExplore }: { onExplore: () => void }) {
  const [tab, setTab] = useState<Tab>("amenities");
  const [day, setDay] = useState<DayKey>(todayKey());
  const { setRef, shown } = useReveal<HTMLDivElement>();

  const menu = useMemo(() => MESS_MENU[day], [day]);

  const mealRows = [
    { label: "Breakfast", time: MESS_TIMINGS[0].time, value: menu.breakfast, icon: "coffee" },
    { label: "Lunch", time: MESS_TIMINGS[1].time, value: menu.lunch, icon: "salad" },
    { label: "Evening Tea & Snacks", time: MESS_TIMINGS[2].time, value: menu.evening, icon: "utensils" },
    { label: "Dinner", time: MESS_TIMINGS[3].time, value: menu.dinner, icon: "cooking" },
  ];

  return (
    <section id="amenities" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_18%_25%,rgba(200,157,84,0.11),transparent_70%)]" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-[420px] w-[420px] rounded-full bg-[#6b3f18]/20 blur-[150px]" />

      <div ref={setRef} className="relative mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          {/* ---------------- left editorial + tabs ---------------- */}
          <div
            className={cn(
              "transition-all duration-700 lg:col-span-7",
              shown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
            )}
          >
            <Eyebrow>Discover Refined PG Living</Eyebrow>
            <h2 className="mt-5 font-serif text-4xl leading-[1.1] text-ivory sm:text-5xl lg:text-[3.4rem]">
              Discover Refined Comfort
              <br />
              <span className="text-gold-shimmer italic">&amp; Homely Care</span>
            </h2>

            <div className="mt-6 max-w-2xl space-y-4 text-[14.5px] leading-relaxed text-sand">
              <p>
                PANDEY PG runs on a simple promise: <strong className="text-ivory">zero brokerage</strong>,
                zero hidden line-items, and a resident experience that feels closer to a boutique hotel
                than a hostel. You book direct with the owner, pay a ₹1,000 token to lock your bed, and
                move in with your KYC already verified.
              </p>
              <p>
                Daily housekeeping covers every room, RO drinking water is filtered and tested monthly,
                and dual-band fiber Wi-Fi delivers 300 Mbps to each floor through mesh routers — enough
                for simultaneous online classes, interviews and streaming. A silent inverter keeps
                lights, fans, Wi-Fi and ACs running through power cuts, automatic washing machines handle
                your laundry, and 32 CCTV cameras plus biometric entry watch the perimeter around the
                clock.
              </p>
            </div>

            {/* tab switcher */}
            <div className="mt-10">
              <div className="flex flex-wrap gap-2 border-b border-gold/15 pb-3">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setTab(t.key);
                      if (t.key === "mess") setDay(todayKey());
                    }}
                    className={cn(
                      "group relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-300",
                      tab === t.key
                        ? "bg-gradient-to-b from-gold-light to-gold text-espresso shadow-[0_10px_26px_-14px_rgba(200,157,84,0.95)]"
                        : "text-sand hover:bg-gold/8 hover:text-gold-light",
                    )}
                  >
                    <Icon name={t.icon} className="h-4 w-4" />
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 min-h-[340px]">
                {tab === "amenities" ? (
                  <div key="amenities" className="animate-fade-up grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {AMENITIES.map((a) => (
                      <div
                        key={a.title}
                        className="group flex flex-col items-center gap-2.5 rounded-xl border border-gold/12 bg-coffee/55 px-3 py-5 text-center transition-all duration-350 hover:-translate-y-1 hover:border-gold/45 hover:bg-gold/8 hover:shadow-[0_18px_36px_-22px_rgba(200,157,84,0.9)]"
                        title={a.note}
                      >
                        <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/35 bg-gold/10 text-gold transition-all duration-350 group-hover:scale-110 group-hover:border-gold group-hover:text-gold-light">
                          <Icon name={a.icon} className="h-5 w-5" strokeWidth={1.5} />
                        </span>
                        <span className="text-[10.5px] font-bold uppercase leading-tight tracking-[0.1em] text-ivory">
                          {a.title}
                        </span>
                        <span className="text-[10px] leading-snug text-sand-dim">{a.note}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {tab === "mess" ? (
                  <div key="mess" className="animate-fade-up">
                    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                      {MESS_DAYS.map((d) => (
                        <button
                          key={d.key}
                          type="button"
                          onClick={() => setDay(d.key)}
                          className={cn(
                            "shrink-0 rounded-lg border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-300",
                            day === d.key
                              ? "border-gold bg-gold/15 text-gold-light"
                              : "border-gold/15 bg-espresso/50 text-sand hover:border-gold/40 hover:text-ivory",
                          )}
                        >
                          {d.label}
                          {d.key === todayKey() ? (
                            <span className="ml-2 rounded-full bg-success/20 px-1.5 py-0.5 text-[8.5px] text-success">
                              TODAY
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {mealRows.map((m) => (
                        <div
                          key={m.label}
                          className="flex gap-3.5 rounded-xl border border-gold/12 bg-coffee/55 p-4 transition-colors duration-300 hover:border-gold/35"
                        >
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                            <Icon name={m.icon} className="h-4.5 w-4.5" strokeWidth={1.5} />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                                {m.label}
                              </p>
                              <p className="text-[10px] text-sand-dim">{m.time}</p>
                            </div>
                            <p className="mt-1.5 text-[13px] font-medium leading-snug text-ivory">
                              {m.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-gold/12 bg-espresso/45 p-4">
                      <Pill tone="green">
                        <Icon name="checkcircle" className="h-3.5 w-3.5" />
                        Pure veg · chef-cooked
                      </Pill>
                      <Pill tone="gold">
                        <Icon name="timer" className="h-3.5 w-3.5" />
                        Skip-meal credit available
                      </Pill>
                      <Pill tone="muted">
                        <Icon name="droplets" className="h-3.5 w-3.5" />
                        RO water tested monthly
                      </Pill>
                      <a
                        href={waLink("Hi! Could you share this week's full PANDEY PG mess menu?")}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-gold hover:text-gold-light"
                      >
                        <Icon name="chat" className="h-3.5 w-3.5" />
                        Request full menu PDF
                      </a>
                    </div>
                  </div>
                ) : null}

                {tab === "rules" ? (
                  <div key="rules" className="animate-fade-up space-y-3">
                    {HOUSE_RULES.map((r, i) => (
                      <details
                        key={r.title}
                        open={i === 0}
                        className="group rounded-xl border border-gold/12 bg-coffee/55 px-4 py-3 transition-colors duration-300 open:border-gold/35 open:bg-gold/6"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                          <span className="flex items-center gap-3">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-gold/30 bg-gold/10 text-[10px] font-bold text-gold">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-ivory">
                              {r.title}
                            </span>
                          </span>
                          <Icon
                            name="chevrondown"
                            className="h-4 w-4 shrink-0 text-gold transition-transform duration-300 group-open:rotate-180"
                          />
                        </summary>
                        <p className="mt-3 pl-10 text-[13px] leading-relaxed text-sand">{r.body}</p>
                      </details>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      icon="clipboard"
                      onClick={() =>
                        document.getElementById("rules")?.scrollIntoView({ behavior: "smooth", block: "start" })
                      }
                    >
                      Read Full Policy &amp; Acknowledge
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>

            <Button variant="outline" size="lg" className="mt-9" iconRight="arrow" onClick={onExplore}>
              Explore All Amenities &amp; Menu
            </Button>
          </div>

          {/* ---------------- right dual image cards ---------------- */}
          <div
            className={cn(
              "transition-all delay-200 duration-700 lg:col-span-5",
              shown ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
            )}
          >
            <div className="grid grid-cols-2 gap-4 lg:gap-5">
              <figure className="group relative overflow-hidden rounded-2xl border border-gold/18 lg:mt-10">
                <div className="aspect-[3/4.6] overflow-hidden lg:aspect-[3/5]">
                  <img
                    src={IMG.washroom}
                    alt="Modern en-suite washroom and study space at PANDEY PG"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(18,13,10,0.95)_4%,rgba(18,13,10,0.1)_55%)]" />
                <figcaption className="absolute inset-x-0 bottom-0 p-4">
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-espresso/70 text-gold backdrop-blur-sm">
                    <Icon name="bath" className="h-4 w-4" />
                  </span>
                  <p className="mt-3 font-serif text-[17px] leading-tight text-ivory">
                    Modern En-Suite Washroom
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-sand">
                    &amp; dedicated study space, geysers serviced monthly
                  </p>
                </figcaption>
              </figure>

              <figure className="group relative overflow-hidden rounded-2xl border border-gold/18">
                <div className="aspect-[3/4.6] overflow-hidden lg:aspect-[3/5]">
                  <img
                    src={IMG.dining}
                    alt="Hygienic dining lounge and balcony view at PANDEY PG"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(18,13,10,0.95)_4%,rgba(18,13,10,0.1)_55%)]" />
                <figcaption className="absolute inset-x-0 bottom-0 p-4">
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-espresso/70 text-gold backdrop-blur-sm">
                    <Icon name="utensils" className="h-4 w-4" />
                  </span>
                  <p className="mt-3 font-serif text-[17px] leading-tight text-ivory">
                    Hygienic Dining Lounge
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-sand">
                    &amp; balcony view seating for 40 residents
                  </p>
                </figcaption>
              </figure>
            </div>

            <Panel className="mt-5 p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/35 bg-gold/10 text-gold">
                  <Icon name="handshake" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-luxe text-gold">
                    Zero Brokerage Promise
                  </p>
                  <p className="mt-1 text-[12.5px] leading-snug text-ivory">
                    You deal directly with the owner — no agent, no commission, no “viewing fees”.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gold/12 pt-4 text-center">
                {[
                  { k: "₹0", v: "Brokerage" },
                  { k: "₹0", v: "Wi-Fi Bill" },
                  { k: "₹0", v: "Maintenance" },
                ].map((x) => (
                  <div key={x.v}>
                    <p className="font-serif text-xl text-gold-light">{x.k}</p>
                    <p className="mt-0.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-sand-dim">
                      {x.v}
                    </p>
                  </div>
                ))}
              </div>
              <a
                href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-gold/25 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold/10 hover:text-gold-light"
              >
                <Icon name="phone" className="h-3.5 w-3.5" />
                Talk to the owner · {BRAND.phone}
              </a>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}
