"use client";

import { useMemo, useState } from "react";
import { Button, Modal, ModalShell, Panel, Pill, Switch } from "./ui";
import { Icon } from "./Icon";
import { IMG, ROOMS, waLink } from "@/lib/data";
import { cardPrice, inr, TIERS, type CoolingKey, type TierKey } from "@/lib/pricing";
import type { SummaryDTO } from "@/hooks/useAvailability";
import { cn } from "@/lib/cn";

export function RoomDetailModal({
  open,
  onClose,
  tier,
  summary,
  onBook,
}: {
  open: boolean;
  onClose: () => void;
  tier: TierKey | null;
  summary: SummaryDTO | null;
  onBook: (t: TierKey) => void;
}) {
  const room = useMemo(() => ROOMS.find((r) => r.tier === tier) ?? null, [tier]);
  const [cooling, setCooling] = useState<CoolingKey>("ac");
  const [meals, setMeals] = useState(true);
  const [active, setActive] = useState(0);

  if (!room) return null;

  const gallery = [room.image, IMG.washroom, IMG.dining, IMG.lounge, IMG.study];
  const left = summary?.byTier[room.tier]?.available ?? null;

  return (
    <Modal open={open} onClose={onClose} ariaLabel={`${room.title} details`} className="max-w-4xl">
      <ModalShell
        title={room.title}
        subtitle={`${room.seats} · ${room.size}`}
        onClose={onClose}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-sand-dim">
                From (per bed / month)
              </p>
              <p className="font-serif text-2xl leading-none text-gold-light">
                {inr(cardPrice(room.tier, cooling, meals))}
              </p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Button
                variant="outline"
                icon="chat"
                onClick={() =>
                  window.open(
                    waLink(
                      `Hi PANDEY PG! I am interested in the ${room.title} (${room.seats}). Is a bed available?`,
                    ),
                  )
                }
              >
                Inquire on WhatsApp
              </Button>
              <Button
                icon="bed"
                disabled={left === 0}
                onClick={() => {
                  onClose();
                  onBook(room.tier);
                }}
              >
                {left === 0 ? "Join Waitlist" : "Book This Room"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* gallery */}
          <div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-gold/15">
              <img
                key={active}
                src={gallery[active]}
                alt={`${room.title} — view ${active + 1}`}
                className="h-full w-full animate-fade-up object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(18,13,10,0.7),transparent_45%)]" />
              <div className="absolute right-3 top-3 flex gap-2">
                <Pill tone={room.badgeTone}>{room.badge}</Pill>
                {left !== null ? (
                  <Pill tone={left === 0 ? "danger" : left <= 3 ? "amber" : "green"}>
                    {left === 0 ? "Waitlist" : `${left} free now`}
                  </Pill>
                ) : null}
              </div>
            </div>
            <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {gallery.map((g, i) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-all duration-300",
                    i === active ? "border-gold opacity-100" : "border-gold/15 opacity-55 hover:opacity-90",
                  )}
                >
                  <img src={g} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-luxe text-gold">Who it suits</p>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-sand">{room.suitedFor}</p>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-luxe text-gold">Key features</p>
              <ul className="mt-2.5 space-y-2">
                {room.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-[12.5px] text-sand">
                    <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={2.6} />
                    {h}
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-luxe text-gold">
                Included in rent
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {room.includes.map((x) => (
                  <span
                    key={x}
                    className="rounded-full border border-gold/20 bg-gold/8 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-gold-light"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <Panel className="overflow-hidden">
                <div className="border-b border-gold/12 bg-coffee/60 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-luxe text-gold">
                    Full specifications
                  </p>
                </div>
                <dl className="divide-y divide-gold/8">
                  {room.specs.map((s) => (
                    <div key={s.label} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                      <dt className="text-[11.5px] uppercase tracking-[0.1em] text-sand-dim">{s.label}</dt>
                      <dd className="text-right text-[12.5px] font-semibold text-ivory">{s.value}</dd>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                    <dt className="text-[11.5px] uppercase tracking-[0.1em] text-sand-dim">Occupancy</dt>
                    <dd className="text-right text-[12.5px] font-semibold text-ivory">
                      {TIERS[room.tier].occupants} resident{TIERS[room.tier].occupants > 1 ? "s" : ""} / room
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                    <dt className="text-[11.5px] uppercase tracking-[0.1em] text-sand-dim">Deposit</dt>
                    <dd className="text-right text-[12.5px] font-semibold text-gold-light">
                      1 month rent · refundable
                    </dd>
                  </div>
                </dl>
              </Panel>

              <div className="mt-4 space-y-2.5">
                <Switch
                  checked={cooling === "ac"}
                  onChange={(v) => setCooling(v ? "ac" : "nonac")}
                  labelOn="Air Conditioned"
                  labelOff="Non-AC"
                  title={cooling === "ac" ? `Adds ${inr(TIERS[room.tier].acAddon)} / month` : "Fan-cooled, cross ventilated"}
                />
                <Switch
                  checked={meals}
                  onChange={setMeals}
                  labelOn="With 3-Time Meals"
                  labelOff="Room Only"
                  title={meals ? `Adds ${inr(TIERS[room.tier].messAddon)} / month` : "Shared kitchen access"}
                />
              </div>
            </div>
          </div>
        </div>
      </ModalShell>
    </Modal>
  );
}
