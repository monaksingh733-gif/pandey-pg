"use client";

import { useState } from "react";
import { Button, Eyebrow, Panel, Pill, useReveal } from "./ui";
import { Icon } from "./Icon";
import { BRAND, FAQS } from "@/lib/data";
import { cn } from "@/lib/cn";

const DISTANCES = [
  { icon: "graduation", place: "Main University Campus", time: "6 min walk", km: "450 m" },
  { icon: "briefcase", place: "Tech Park Gate 3", time: "9 min ride", km: "3.2 km" },
  { icon: "book", place: "Coaching Institute Belt", time: "4 min walk", km: "300 m" },
  { icon: "navigation", place: "Main Road Bus Stop", time: "2 min walk", km: "160 m" },
  { icon: "salad", place: "Supermarket & Pharmacy", time: "3 min walk", km: "220 m" },
  { icon: "car", place: "Metro Station (Green Line)", time: "11 min ride", km: "4.1 km" },
];

export function LocationFaq() {
  const [open, setOpen] = useState<number | null>(0);
  const { setRef, shown } = useReveal<HTMLDivElement>();

  return (
    <section id="faq" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-10 lg:py-28">
      <div className="spotlight pointer-events-none absolute inset-x-0 top-0 h-[420px]" />
      <div ref={setRef} className="relative mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* location */}
          <div
            className={cn(
              "transition-all duration-700 lg:col-span-6",
              shown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
            )}
          >
            <Eyebrow>Prime Location</Eyebrow>
            <h2 className="mt-5 font-serif text-4xl leading-[1.1] text-ivory sm:text-[2.9rem]">
              Two minutes from the main road. <span className="text-gold-shimmer italic">Zero</span>{" "}
              minutes wasted commuting.
            </h2>

            <Panel className="mt-8 overflow-hidden !rounded-2xl">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-coffee">
                <iframe
                  title="PANDEY PG location map"
                  src={BRAND.mapEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full border-0 grayscale-[35%] contrast-[1.05] saturate-[0.85] [color-scheme:dark]"
                  allowFullScreen
                />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/20" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,rgba(37,27,20,0.95),transparent)]" />
                <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="max-w-[70%]">
                    <p className="text-[9.5px] font-bold uppercase tracking-luxe text-gold">
                      PANDEY PG · Gate 2
                    </p>
                    <p className="mt-1 text-[11.5px] leading-snug text-ivory/90">{BRAND.address}</p>
                  </div>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=Vidya+Nagar+Extension+Bengaluru"
                    target="_blank"
                    rel="noreferrer"
                    className="pointer-events-auto inline-flex items-center gap-2 rounded-lg border border-gold/45 bg-espresso/85 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gold backdrop-blur-sm transition-colors hover:bg-gold hover:text-espresso"
                  >
                    <Icon name="navigation" className="h-3.5 w-3.5" />
                    Directions
                  </a>
                </div>
              </div>
            </Panel>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DISTANCES.map((d) => (
                <div
                  key={d.place}
                  className="group flex items-center gap-3.5 rounded-xl border border-gold/12 bg-coffee/45 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/35 hover:bg-gold/6"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold transition-colors group-hover:text-gold-light">
                    <Icon name={d.icon} className="h-4.5 w-4.5" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-ivory">{d.place}</p>
                    <p className="text-[10.5px] text-sand-dim">
                      {d.time} · {d.km}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* faq */}
          <div
            className={cn(
              "transition-all delay-150 duration-700 lg:col-span-6",
              shown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
            )}
          >
            <Eyebrow>Questions Parents Ask Us</Eyebrow>
            <h2 className="mt-5 font-serif text-4xl leading-[1.1] text-ivory sm:text-[2.9rem]">
              Frequently asked, <span className="text-gold-shimmer italic">honestly answered.</span>
            </h2>

            <div className="mt-8 space-y-3">
              {FAQS.map((f, i) => {
                const isOpen = open === i;
                return (
                  <Panel
                    key={f.q}
                    className={cn(
                      "overflow-hidden transition-all duration-400",
                      isOpen ? "border-gold/45 bg-gold/5" : "hover:border-gold/30",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-start gap-4 px-5 py-4 text-left"
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border text-[10px] font-bold transition-colors",
                          isOpen
                            ? "border-gold bg-gold text-espresso"
                            : "border-gold/30 bg-gold/8 text-gold",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-bold leading-snug text-ivory">
                          {f.q}
                        </span>
                      </span>
                      <Icon
                        name={isOpen ? "minus" : "plus"}
                        className="mt-1 h-4 w-4 shrink-0 text-gold"
                        strokeWidth={2.2}
                      />
                    </button>
                    <div
                      className={cn(
                        "grid transition-all duration-500 ease-out",
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 pl-16 text-[13px] leading-relaxed text-sand">{f.a}</p>
                      </div>
                    </div>
                  </Panel>
                );
              })}
            </div>

            <Panel className="mt-6 flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/35 bg-gold/10 text-gold">
                <Icon name="info" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-ivory">
                  Still unsure about something specific?
                </p>
                <p className="mt-1 text-[12px] text-sand-dim">
                  The warden answers WhatsApp within 10 minutes between 8 AM and 11 PM, every day.
                </p>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <Pill tone="green" className="hidden xl:inline-flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Online now
                </Pill>
                <Button size="sm" icon="chat" onClick={() => window.open(`https://wa.me/${BRAND.whatsapp}`, "_blank")}>
                  Ask Now
                </Button>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}
