"use client";

import { useMemo, useState } from "react";
import { Button, Eyebrow, Panel, Pill, Switch, useReveal } from "./ui";
import { Icon } from "./Icon";
import { ROOMS } from "@/lib/data";
import { cardPrice, inr, TIERS, type CoolingKey, type TierKey } from "@/lib/pricing";
import type { SummaryDTO } from "@/hooks/useAvailability";
import { cn } from "@/lib/cn";

type CategoryFilter = "all" | TierKey;

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All Rooms" },
  { value: "single", label: "Single Private" },
  { value: "double", label: "Double Sharing" },
  { value: "triple", label: "Triple Sharing" },
];

export function Rooms({
  summary,
  loading,
  onBook,
  onView,
}: {
  summary: SummaryDTO | null;
  loading: boolean;
  onBook: (tier: TierKey) => void;
  onView: (tier: TierKey) => void;
}) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [ac, setAc] = useState<CoolingKey>("ac");
  const [meals, setMeals] = useState(true);
  const { setRef, shown } = useReveal<HTMLDivElement>();

  const visible = useMemo(
    () => (category === "all" ? ROOMS : ROOMS.filter((r) => r.tier === category)),
    [category],
  );

  const badgeFor = (tier: TierKey) => {
    if (!summary) return { text: "Checking…", tone: "muted" as const };
    const left = summary.byTier[tier]?.available ?? 0;
    if (left === 0) return { text: "Waitlist Only", tone: "danger" as const };
    if (left <= 3) return { text: `${left} Beds Left`, tone: "amber" as const };
    if (tier === "single") return { text: "Most Popular", tone: "gold" as const };
    return { text: `${left} Available`, tone: "green" as const };
  };

  return (
    <section id="rooms" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="spotlight pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gold/6 blur-[160px]" />

      <div ref={setRef} className="relative mx-auto max-w-[1400px]">
        <div
          className={cn(
            "flex flex-col items-start justify-between gap-6 transition-all duration-700 lg:flex-row lg:items-end",
            shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <div className="max-w-2xl">
            <Eyebrow>Our Accommodations</Eyebrow>
            <h2 className="mt-5 font-serif text-4xl leading-[1.08] text-ivory sm:text-5xl lg:text-[3.6rem]">
              Three room tiers. <span className="text-gold-shimmer italic">Zero</span> compromise.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-sand">
              Every bed at PANDEY PG is furnished, serviced and metered. Toggle the filters below — the
              monthly prices on each card update live so you see exactly what your configuration costs
              before you speak to anyone.
            </p>
          </div>

          <Panel className="w-full max-w-md p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-luxe text-gold">
                <Icon name="percent" className="h-3.5 w-3.5" />
                Live Price Engine
              </span>
              {loading ? (
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-sand-dim">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                  syncing
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  live inventory
                </span>
              )}
            </div>
            <div className="mt-4 space-y-2.5">
              <Switch
                checked={ac === "ac"}
                onChange={(v) => setAc(v ? "ac" : "nonac")}
                labelOn="Air Conditioned"
                labelOff="Non-AC Rooms"
                title={ac === "ac" ? `+ ${inr(1500)} / month approx.` : "Ceiling fan + cross ventilation"}
              />
              <Switch
                checked={meals}
                onChange={setMeals}
                labelOn="With 3-Time Meals"
                labelOff="Room Only (No Mess)"
                title={meals ? "Breakfast · Lunch · Evening tea · Dinner" : "Shared kitchen access retained"}
              />
            </div>
          </Panel>
        </div>

        {/* category pills */}
        <div className="no-scrollbar mt-12 flex gap-2.5 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => {
            const active = c.value === category;
            const count =
              c.value === "all"
                ? (summary?.available ?? null)
                : (summary?.byTier[c.value]?.available ?? null);
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={cn(
                  "group flex shrink-0 items-center gap-2.5 rounded-full border px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-300",
                  active
                    ? "border-gold/70 bg-gradient-to-b from-gold-light to-gold text-espresso shadow-[0_10px_28px_-14px_rgba(200,157,84,0.95)]"
                    : "border-gold/20 bg-coffee/60 text-sand hover:border-gold/45 hover:text-gold-light",
                )}
              >
                {c.label}
                {count !== null ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9.5px]",
                      active ? "bg-espresso/25 text-espresso" : "bg-gold/12 text-gold",
                    )}
                  >
                    {count} free
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* grid */}
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((room, idx) => {
            const price = cardPrice(room.tier, ac, meals);
            const badge = badgeFor(room.tier);
            const left = summary?.byTier[room.tier]?.available ?? 0;
            return (
              <article
                key={room.tier}
                className={cn(
                  "group flex flex-col transition-all duration-700",
                  shown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
                )}
                style={{ transitionDelay: `${120 + idx * 110}ms` }}
              >
                {/* top text block */}
                <div className="mb-5">
                  <p className="text-[9.5px] font-bold uppercase tracking-luxe text-gold/80">
                    {room.eyebrow}
                  </p>
                  <h3 className="mt-2.5 font-serif text-[26px] leading-tight text-ivory transition-colors duration-400 group-hover:text-gold-light">
                    {room.title}
                  </h3>
                  <p className="mt-2.5 line-clamp-3 text-[13px] leading-relaxed text-sand">
                    {room.suitedFor}
                  </p>
                </div>

                {/* card */}
                <Panel className="flex flex-1 flex-col overflow-hidden !rounded-2xl">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={room.image}
                      alt={`${room.title} at PANDEY PG`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.07]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(18,13,10,0.92)_0%,rgba(18,13,10,0.15)_45%,rgba(18,13,10,0.35)_100%)]" />
                    <div className="absolute right-3 top-3">
                      <Pill tone={badge.tone} className="shadow-[0_8px_20px_-10px_rgba(0,0,0,0.9)]">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            badge.tone === "green"
                              ? "bg-success"
                              : badge.tone === "amber"
                                ? "bg-[#e8bd7c]"
                                : badge.tone === "danger"
                                  ? "bg-danger"
                                  : "bg-gold-light",
                          )}
                        />
                        {badge.text}
                      </Pill>
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-gold">
                          {room.seats} · {room.size}
                        </p>
                        <p className="mt-1 font-serif text-xl text-ivory">{room.title}</p>
                      </div>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/40 bg-espresso/70 text-gold backdrop-blur-sm">
                        {room.tier === "single" ? (
                          <Icon name="bed" className="h-4 w-4" />
                        ) : room.tier === "double" ? (
                          <Icon name="beddouble" className="h-4 w-4" />
                        ) : (
                          <Icon name="users" className="h-4 w-4" />
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ivory/90">
                      {room.title} ({room.seats})
                    </p>
                    <p className="mt-2.5 text-[12.5px] leading-relaxed text-sand">{room.blurb}</p>

                    <ul className="mt-4 space-y-2">
                      {room.highlights.slice(0, 3).map((h) => (
                        <li key={h} className="flex items-start gap-2.5 text-[12px] text-sand">
                          <Icon
                            name="check"
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold"
                            strokeWidth={2.6}
                          />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-gold/20 bg-gold/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gold">
                        {ac === "ac" ? "AC" : "Non-AC"}
                      </span>
                      <span className="rounded-md border border-gold/20 bg-gold/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gold">
                        {meals ? "Meals Incl." : "Room Only"}
                      </span>
                      <span className="rounded-md border border-ivory/10 bg-ivory/4 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-sand">
                        {TIERS[room.tier].occupants} {TIERS[room.tier].occupants === 1 ? "bed" : "beds"} / room
                      </span>
                    </div>

                    <div className="mt-auto pt-6">
                      <Button
                        block
                        size="md"
                        disabled={left === 0 && summary !== null}
                        onClick={() => onBook(room.tier)}
                        className="justify-between [&>span]:w-full"
                      >
                        <span className="flex w-full items-center justify-between gap-2">
                          <span>
                            From {inr(price)} <span className="opacity-70">/ month</span>
                          </span>
                          <Icon name="arrow" className="h-4 w-4" />
                        </span>
                      </Button>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => onView(room.tier)}
                          className="group/link inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-gold/85 transition-colors hover:text-gold-light"
                        >
                          View Room &amp; Amenities Details
                          <Icon
                            name="chevronright"
                            className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1"
                          />
                        </button>
                        <span className="text-[10px] uppercase tracking-[0.12em] text-sand-dim">
                          {summary ? `${left} free` : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Panel>
              </article>
            );
          })}
        </div>

        {visible.length === 0 ? (
          <Panel className="mt-10 p-10 text-center">
            <p className="font-serif text-2xl text-ivory">No rooms match this filter.</p>
            <p className="mt-2 text-sm text-sand">Try switching the category back to “All Rooms”.</p>
            <Button className="mt-6" variant="outline" onClick={() => setCategory("all")}>
              Reset Filters
            </Button>
          </Panel>
        ) : null}

        <p className="mt-8 text-center text-[11px] uppercase tracking-[0.16em] text-sand-dim">
          Prices shown are per bed, per month · Electricity billed separately at ₹8.50 / unit ·
          Refundable deposit = 1 month rent
        </p>
      </div>
    </section>
  );
}
