"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Eyebrow, Panel, Pill, Stars, useReveal } from "./ui";
import { Icon } from "./Icon";
import { REVIEWS } from "@/lib/data";
import { cn } from "@/lib/cn";

export function Reviews() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { setRef, shown } = useReveal<HTMLDivElement>();

  const go = useCallback((dir: number) => {
    setIndex((i) => (i + dir + REVIEWS.length) % REVIEWS.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), 7000);
    return () => clearInterval(t);
  }, [paused, go]);

  const active = REVIEWS[index];

  return (
    <section id="reviews" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-10 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(28,20,15,0.7)_45%,transparent)]" />
      <div className="pointer-events-none absolute left-1/4 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-gold/6 blur-[150px]" />

      <div ref={setRef} className="relative mx-auto max-w-[1400px]">
        <div
          className={cn(
            "flex flex-col items-start justify-between gap-6 transition-all duration-700 lg:flex-row lg:items-end",
            shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <div className="max-w-2xl">
            <Eyebrow>Verified Resident Reviews</Eyebrow>
            <h2 className="mt-5 font-serif text-4xl leading-[1.1] text-ivory sm:text-5xl">
              212 residents. <span className="text-gold-shimmer italic">4.9 average.</span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-sand">
              Every review below is from a resident whose booking ID, room type and stay duration we
              verified before publishing. No paid placements, no deleted negatives.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Panel className="flex items-center gap-4 px-5 py-4">
              <div>
                <p className="font-serif text-3xl leading-none text-gold-light">4.9</p>
                <Stars value={5} className="mt-1.5" />
              </div>
              <span className="h-10 w-px bg-gold/20" />
              <div className="text-[11px] leading-relaxed text-sand">
                <p className="font-bold uppercase tracking-[0.12em] text-ivory">212 reviews</p>
                <p className="text-sand-dim">96% would recommend</p>
              </div>
            </Panel>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Previous review"
                onClick={() => go(-1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-gold/25 text-gold transition-all hover:border-gold hover:bg-gold/10"
              >
                <Icon name="chevronleft" className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                aria-label="Next review"
                onClick={() => go(1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-gold/25 text-gold transition-all hover:border-gold hover:bg-gold/10"
              >
                <Icon name="chevronright" className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* featured carousel */}
        <Panel
          glow
          className="relative mt-10 overflow-hidden p-6 sm:p-9"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          />
          <Icon
            name="quote"
            className="absolute right-6 top-5 h-24 w-24 text-gold/8"
            strokeWidth={1}
          />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center">
            <div className="flex shrink-0 items-center gap-4 lg:flex-col lg:items-start">
              <span className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full border border-gold/40 bg-gradient-to-br from-gold/25 to-transparent font-serif text-2xl text-gold-light">
                {active.initials}
                <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border border-success/50 bg-espresso text-success">
                  <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              </span>
              <div className="lg:mt-2">
                <Stars value={active.rating} />
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-sand-dim">
                  {active.months}
                </p>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p
                key={active.name}
                className="animate-fade-up font-serif text-[19px] leading-[1.6] text-ivory/95 italic sm:text-[22px]"
              >
                “{active.quote}”
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-ivory">
                    {active.name}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-sand-dim">{active.role}</p>
                </div>
                <span className="hidden h-8 w-px bg-gold/20 sm:block" />
                <Pill tone="gold">
                  <Icon name="bed" className="h-3.5 w-3.5" />
                  {active.room}
                </Pill>
                <Pill tone={active.badge === "Working Professional" ? "green" : "amber"}>
                  <Icon
                    name={active.badge === "Working Professional" ? "briefcase" : "graduation"}
                    className="h-3.5 w-3.5"
                  />
                  {active.badge}
                </Pill>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 border-t border-gold/12 pt-5">
            {REVIEWS.map((r, i) => (
              <button
                key={r.name}
                type="button"
                aria-label={`Show review by ${r.name}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-400",
                  i === index ? "w-10 bg-gradient-to-r from-gold to-gold-light" : "w-4 bg-gold/25 hover:bg-gold/50",
                )}
              />
            ))}
            <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.14em] text-sand-dim">
              {paused ? "Paused" : "Auto-rotating"} · {index + 1}/{REVIEWS.length}
            </span>
          </div>
        </Panel>

        {/* grid of all */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <button
              key={r.name}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "text-left transition-all duration-500",
                shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
              )}
              style={{ transitionDelay: `${150 + i * 110}ms` }}
            >
              <Panel
                className={cn(
                  "h-full p-5 transition-all duration-350 hover:-translate-y-1",
                  i === index ? "border-gold/55 bg-gold/6" : "hover:border-gold/35",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-gold/35 bg-gold/10 font-serif text-sm text-gold-light">
                      {r.initials}
                    </span>
                    <div>
                      <p className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-ivory">
                        {r.name}
                      </p>
                      <p className="text-[10.5px] text-sand-dim">{r.badge}</p>
                    </div>
                  </div>
                  <Stars value={r.rating} />
                </div>
                <p className="mt-4 line-clamp-3 text-[12.5px] leading-relaxed text-sand">{r.quote}</p>
                <p className="mt-4 border-t border-gold/10 pt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-gold/80">
                  {r.room}
                </p>
              </Panel>
            </button>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button
            variant="outline"
            icon="chat"
            onClick={() =>
              window.open(
                "https://www.google.com/search?q=PANDEY+PG+reviews",
                "_blank",
              )
            }
          >
            Read all 212 reviews on Google
          </Button>
        </div>
      </div>
    </section>
  );
}
