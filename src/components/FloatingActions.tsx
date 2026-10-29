"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { Button, useUi } from "./ui";
import { BRAND, waLink } from "@/lib/data";
import { inr, TIERS } from "@/lib/pricing";
import { cn } from "@/lib/cn";

const QUICK = [
  {
    label: "Bed availability today",
    msg: "Hi PANDEY PG! How many beds are available right now, and in which room type?",
  },
  {
    label: "Share weekly mess menu",
    msg: "Hi PANDEY PG! Please share this week's full mess menu.",
  },
  {
    label: "Talk to the warden",
    msg: "Hi! I'd like to speak to the PANDEY PG warden about a room.",
  },
];

export function FloatingActions() {
  const { openBooking } = useUi();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cheapest = Math.min(...Object.values(TIERS).map((t) => t.baseRent + t.messAddon + t.acAddon));

  return (
    <>
      {/* WhatsApp cluster */}
      <div
        className={cn(
          "no-print fixed bottom-24 right-4 z-[95] flex flex-col items-end gap-3 transition-all duration-500 lg:bottom-7 lg:right-7",
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
        )}
      >
        <div
          className={cn(
            "glass-panel w-[262px] origin-bottom-right overflow-hidden rounded-2xl p-3 transition-all duration-350",
            open ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0",
          )}
        >
          <p className="px-1 text-[9.5px] font-bold uppercase tracking-luxe text-gold">
            Quick WhatsApp
          </p>
          <div className="mt-2 space-y-1.5">
            {QUICK.map((q) => (
              <a
                key={q.label}
                href={waLink(q.msg)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] text-sand transition-colors hover:bg-gold/10 hover:text-gold-light"
              >
                <Icon name="chat" className="h-3.5 w-3.5 shrink-0 text-gold" />
                <span className="truncate">{q.label}</span>
              </a>
            ))}
          </div>
          <a
            href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-gold/25 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold/10"
          >
            <Icon name="phone" className="h-3.5 w-3.5" />
            {BRAND.phone}
          </a>
        </div>

        <div className="flex flex-col items-end gap-2.5">
          <button
            type="button"
            aria-label="Toggle quick WhatsApp actions"
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "group relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_14px_36px_-10px_rgba(37,211,102,0.85)] transition-all duration-350 hover:scale-105",
              !open && "animate-pulse-ring",
            )}
          >
            <Icon name={open ? "x" : "chat"} className="h-6 w-6" strokeWidth={2} />
            {!open ? (
              <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-espresso bg-danger" />
            ) : null}
          </button>
          <button
            type="button"
            aria-label="Scroll back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="grid h-10 w-10 place-items-center rounded-full border border-gold/30 bg-espresso/85 text-gold backdrop-blur-md transition-all hover:border-gold hover:bg-gold hover:text-espresso"
          >
            <Icon name="chevronup" className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* mobile sticky bottom bar */}
      <div
        className={cn(
          "no-print fixed inset-x-0 bottom-0 z-[96] border-t border-gold/20 bg-espresso/95 px-3 py-2.5 backdrop-blur-xl transition-transform duration-500 lg:hidden",
          visible ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[9px] font-bold uppercase tracking-luxe text-gold">
              All-inclusive from
            </p>
            <p className="truncate font-serif text-[17px] leading-tight text-ivory">
              {inr(cheapest)}
              <span className="ml-1 font-sans text-[10px] font-bold uppercase tracking-[0.12em] text-sand-dim">
                / month
              </span>
            </p>
          </div>
          <a
            href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-gold/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-gold hover:bg-gold/10"
          >
            <Icon name="phone" className="h-3.5 w-3.5" />
            Call
          </a>
          <Button size="sm" icon="bed" onClick={() => openBooking()} className="shrink-0">
            Book Now
          </Button>
        </div>
      </div>
    </>
  );
}
