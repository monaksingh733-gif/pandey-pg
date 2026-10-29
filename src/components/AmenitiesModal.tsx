"use client";

import { useState } from "react";
import { Button, Modal, ModalShell, Panel, Pill } from "./ui";
import { Icon } from "./Icon";
import { AMENITIES, MESS_DAYS, MESS_MENU, MESS_TIMINGS, HOUSE_RULES, IMG } from "@/lib/data";
import { cn } from "@/lib/cn";

export function AmenitiesModal({
  open,
  onClose,
  onBook,
}: {
  open: boolean;
  onClose: () => void;
  onBook: () => void;
}) {
  const [view, setView] = useState<"amenities" | "menu" | "rules">("amenities");

  return (
    <Modal open={open} onClose={onClose} ariaLabel="All amenities and mess menu" className="max-w-5xl">
      <ModalShell
        title="All Amenities, Full Mess Menu & Policies"
        subtitle="Everything included in your monthly PANDEY PG invoice."
        onClose={onClose}
        footer={
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11.5px] text-sand-dim">
              Wi-Fi · housekeeping · laundry · power backup · mess — all included. Only electricity is
              metered.
            </p>
            <Button icon="bed" onClick={() => { onClose(); onBook(); }}>
              Book With All This Included
            </Button>
          </div>
        }
      >
        <div className="mb-6 flex flex-wrap gap-2">
          {(
            [
              { k: "amenities", label: "Core Amenities", icon: "sparkles" },
              { k: "menu", label: "Full Weekly Menu", icon: "utensils" },
              { k: "rules", label: "House Rules", icon: "clipboard" },
            ] as const
          ).map((t) => (
            <button
              key={t.k}
              type="button"
              onClick={() => setView(t.k)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-4 py-2 text-[10.5px] font-bold uppercase tracking-[0.14em] transition-all duration-300",
                view === t.k
                  ? "border-gold bg-gold/12 text-gold-light"
                  : "border-gold/12 text-sand hover:border-gold/35 hover:text-ivory",
              )}
            >
              <Icon name={t.icon} className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {view === "amenities" ? (
          <div className="animate-fade-up space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {AMENITIES.map((a) => (
                <div
                  key={a.title}
                  className="group rounded-xl border border-gold/12 bg-coffee/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:bg-gold/8"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/35 bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-110">
                    <Icon name={a.icon} className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.1em] text-ivory">
                    {a.title}
                  </p>
                  <p className="mt-1.5 text-[11.5px] leading-snug text-sand-dim">{a.note}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Panel className="overflow-hidden">
                <img src={IMG.study} alt="PANDEY PG study lounge" className="h-40 w-full object-cover" loading="lazy" />
                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-luxe text-gold">
                    Study Lounge · 2nd Floor
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-snug text-sand">
                    24 silent seats, individual reading lamps, whiteboards and a printer. Open 24×7 with
                    biometric access during exam season.
                  </p>
                </div>
              </Panel>
              <Panel className="overflow-hidden">
                <img src={IMG.dining} alt="PANDEY PG dining lounge" className="h-40 w-full object-cover" loading="lazy" />
                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-luxe text-gold">
                    Dining Lounge · Ground Floor
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-snug text-sand">
                    Seats 40 residents, stainless-steel serving counters, RO water dispenser and a daily
                    sanitised salad bar.
                  </p>
                </div>
              </Panel>
            </div>

            <div className="flex flex-wrap gap-2">
              {MESS_TIMINGS.map((t) => (
                <Pill key={t.slot} tone="gold">
                  <Icon name="clock" className="h-3.5 w-3.5" />
                  {t.slot} · {t.time}
                </Pill>
              ))}
            </div>
          </div>
        ) : null}

        {view === "menu" ? (
          <div className="animate-fade-up">
            <div className="overflow-x-auto rounded-xl border border-gold/12">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="bg-coffee/70">
                    <th className="px-4 py-3 text-[9.5px] font-bold uppercase tracking-luxe text-gold">Day</th>
                    {["Breakfast", "Lunch", "Evening Tea", "Dinner"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[9.5px] font-bold uppercase tracking-luxe text-gold"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MESS_DAYS.map((d, i) => (
                    <tr
                      key={d.key}
                      className={cn(
                        "border-t border-gold/8 transition-colors hover:bg-gold/6",
                        i % 2 === 1 && "bg-espresso/40",
                      )}
                    >
                      <td className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-[0.12em] text-ivory">
                        {d.label}
                      </td>
                      <td className="px-4 py-3 text-[11.5px] text-sand">{MESS_MENU[d.key].breakfast}</td>
                      <td className="px-4 py-3 text-[11.5px] text-sand">{MESS_MENU[d.key].lunch}</td>
                      <td className="px-4 py-3 text-[11.5px] text-sand">{MESS_MENU[d.key].evening}</td>
                      <td className="px-4 py-3 text-[11.5px] text-sand">{MESS_MENU[d.key].dinner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[11.5px] leading-relaxed text-sand-dim">
              Menu rotates every 4 weeks and a sweet dish appears at least twice a week. Festival specials
              (Diwali, Pongal, Eid, Onam) are cooked to regional recipes. Pure vegetarian kitchen; Jain
              meals available on request at no extra cost.
            </p>
          </div>
        ) : null}

        {view === "rules" ? (
          <div className="animate-fade-up space-y-3">
            {HOUSE_RULES.map((r, i) => (
              <div key={r.title} className="flex gap-4 rounded-xl border border-gold/12 bg-coffee/45 p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-gold/30 bg-gold/10 text-[10px] font-bold text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-ivory">{r.title}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-sand">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </ModalShell>
    </Modal>
  );
}
