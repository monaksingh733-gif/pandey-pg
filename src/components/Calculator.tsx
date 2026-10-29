"use client";

import { useMemo, useState } from "react";
import { Button, Eyebrow, Panel, Pill, Segmented, Switch, useReveal } from "./ui";
import { Icon } from "./Icon";
import { cardPrice, inr, quote, TIERS, type CoolingKey, type MealKey, type TenureKey, type TierKey } from "@/lib/pricing";
import { cn } from "@/lib/cn";

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-gold/85">{label}</span>
        <span className="font-sans text-[13px] font-bold text-ivory">{inr(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2.5 w-full"
        style={{
          background: `linear-gradient(90deg, rgba(200,157,84,0.85) ${pct}%, rgba(200,157,84,0.16) ${pct}%)`,
          borderRadius: 999,
          height: 4,
        }}
      />
      {hint ? <p className="mt-1.5 text-[10.5px] text-sand-dim">{hint}</p> : null}
    </div>
  );
}

export function Calculator({ onBook }: { onBook: (tier: TierKey) => void }) {
  const [tier, setTier] = useState<TierKey>("double");
  const [cooling, setCooling] = useState<CoolingKey>("ac");
  const [meals, setMeals] = useState<MealKey>("full");
  const [tenure, setTenure] = useState<TenureKey>("eleven");

  const [flatRent, setFlatRent] = useState(14000);
  const [wifi, setWifi] = useState(900);
  const [maintenance, setMaintenance] = useState(1500);
  const [cook, setCook] = useState(5500);

  const { setRef, shown } = useReveal<HTMLDivElement>();

  const pg = useMemo(
    () => quote({ tier, cooling, floor: "2nd", tenure, meals, addons: [] }),
    [tier, cooling, tenure, meals],
  );

  const flat = useMemo(() => {
    const brokerage = Math.round(flatRent / 11); // one-month brokerage amortised over 11 months
    const housekeeping = 1800;
    const powerSurge = 900;
    const backup = 700;
    const furnitureCapex = 1400;
    const total =
      flatRent + brokerage + wifi + maintenance + cook + housekeeping + powerSurge + backup + furnitureCapex;
    return {
      total,
      rows: [
        { label: "Monthly rent (1 BHK / shared flat)", value: flatRent },
        { label: "Brokerage — amortised monthly", value: brokerage, zero: false },
        { label: "Wi-Fi + router bill", value: wifi },
        { label: "Society maintenance", value: maintenance },
        { label: "Cook / tiffin service (3 meals)", value: cook },
        { label: "Housekeeping & laundry", value: housekeeping },
        { label: "Cylinder / electricity surge", value: powerSurge },
        { label: "Power backup / inverter", value: backup },
        { label: "Furniture & appliance CAPEX", value: furnitureCapex },
      ],
    };
  }, [flatRent, wifi, maintenance, cook]);

  const saving = Math.max(0, flat.total - pg.monthlyTotal);
  const savingPct = flat.total > 0 ? Math.round((saving / flat.total) * 100) : 0;
  const pgBarPct = flat.total > 0 ? Math.min(100, Math.round((pg.monthlyTotal / flat.total) * 100)) : 0;

  return (
    <section id="calculator" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-10 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(28,20,15,0.65)_35%,transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-gold/7 blur-[150px]" />

      <div ref={setRef} className="relative mx-auto max-w-[1400px]">
        <div
          className={cn(
            "mx-auto max-w-3xl text-center transition-all duration-700",
            shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <div className="flex justify-center">
            <Eyebrow>Monthly Expense Calculator</Eyebrow>
          </div>
          <h2 className="mt-5 font-serif text-4xl leading-[1.1] text-ivory sm:text-5xl">
            Do the maths. <span className="text-gold-shimmer italic">PANDEY wins.</span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-sand">
            Drag the sliders to model what an independent flat really costs you — brokerage, Wi-Fi,
            maintenance, a cook, housekeeping, backup and furniture. Then compare it against your
            all-inclusive PANDEY PG bed.
          </p>
        </div>

        <div
          className={cn(
            "mt-14 grid grid-cols-1 gap-6 transition-all delay-150 duration-700 lg:grid-cols-12",
            shown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
          )}
        >
          {/* controls */}
          <Panel className="p-6 lg:col-span-5">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-luxe text-gold">
              <Icon name="calculator" className="h-4 w-4" />
              Step 1 · Your PANDEY configuration
            </p>

            <div className="mt-4 space-y-4">
              <Segmented<TierKey>
                size="sm"
                value={tier}
                onChange={setTier}
                options={(Object.keys(TIERS) as TierKey[]).map((k) => ({
                  value: k,
                  label: TIERS[k].short,
                }))}
              />
              <Segmented<TenureKey>
                size="sm"
                value={tenure}
                onChange={setTenure}
                options={[
                  { value: "flex", label: "Monthly Flex" },
                  { value: "six", label: "6 Months · 5% off" },
                  { value: "eleven", label: "11 Months · 10% off" },
                ]}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Switch
                  checked={cooling === "ac"}
                  onChange={(v) => setCooling(v ? "ac" : "nonac")}
                  labelOn="AC Room"
                  labelOff="Non-AC Room"
                />
                <Switch
                  checked={meals === "full"}
                  onChange={(v) => setMeals(v ? "full" : "none")}
                  labelOn="Full Mess"
                  labelOff="Room Only"
                />
              </div>
            </div>

            <div className="mt-7 border-t border-gold/12 pt-6">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-luxe text-gold">
                <Icon name="building" className="h-4 w-4" />
                Step 2 · Your independent flat estimate
              </p>
              <div className="mt-5 space-y-5">
                <Slider
                  label="Flat / PG rent outside"
                  value={flatRent}
                  min={7000}
                  max={28000}
                  step={500}
                  onChange={setFlatRent}
                  hint="Typical 1 BHK or private-room rent in this locality"
                />
                <Slider
                  label="Wi-Fi + router"
                  value={wifi}
                  min={0}
                  max={2000}
                  step={50}
                  onChange={setWifi}
                />
                <Slider
                  label="Society maintenance"
                  value={maintenance}
                  min={0}
                  max={4000}
                  step={100}
                  onChange={setMaintenance}
                />
                <Slider
                  label="Cook / tiffin (3 meals)"
                  value={cook}
                  min={0}
                  max={9000}
                  step={100}
                  onChange={setCook}
                  hint="₹0 at PANDEY PG — homely mess is included in your plan"
                />
              </div>
            </div>
          </Panel>

          {/* comparison */}
          <div className="space-y-6 lg:col-span-7">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* flat card */}
              <Panel className="relative overflow-hidden p-6">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-danger/8 blur-3xl" />
                <Pill tone="danger">
                  <Icon name="building" className="h-3.5 w-3.5" />
                  Independent Flat
                </Pill>
                <p className="mt-5 font-serif text-[2.6rem] leading-none text-ivory/70 line-through decoration-danger/50">
                  {inr(flat.total)}
                </p>
                <p className="mt-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-sand-dim">
                  All-in monthly outflow
                </p>
                <ul className="mt-5 space-y-1.5 border-t border-ivory/8 pt-4">
                  {flat.rows.map((r) => (
                    <li key={r.label} className="flex items-baseline justify-between gap-3 text-[11.5px]">
                      <span className="truncate text-sand-dim">{r.label}</span>
                      <span className="shrink-0 font-semibold text-sand">{inr(r.value)}</span>
                    </li>
                  ))}
                </ul>
              </Panel>

              {/* pg card */}
              <Panel glow className="relative overflow-hidden p-6">
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gold/16 blur-3xl" />
                <Pill tone="gold">
                  <Icon name="gem" className="h-3.5 w-3.5" />
                  PANDEY PG · All Inclusive
                </Pill>
                <p className="mt-5 font-serif text-[2.9rem] leading-none text-gold-light">
                  {inr(pg.monthlyTotal)}
                </p>
                <p className="mt-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-sand-dim">
                  One single monthly invoice
                </p>
                <ul className="mt-5 space-y-1.5 border-t border-gold/12 pt-4">
                  {[
                    { label: "Room rent (after discount)", value: pg.netRent },
                    { label: "AC / cooling", value: pg.acCharge, incl: cooling === "ac" },
                    { label: "Floor premium (2nd floor)", value: pg.floorPremium },
                    { label: "3-time homely mess", value: pg.messCharges, incl: meals === "full" },
                    { label: "Brokerage", value: 0, free: true },
                    { label: "Wi-Fi 300 Mbps", value: 0, free: true },
                    { label: "Maintenance & housekeeping", value: 0, free: true },
                    { label: "Power backup + laundry", value: 0, free: true },
                  ].map((r) => (
                    <li key={r.label} className="flex items-baseline justify-between gap-3 text-[11.5px]">
                      <span className="truncate text-sand">{r.label}</span>
                      <span
                        className={cn(
                          "shrink-0 font-semibold",
                          "free" in r && r.free ? "text-success" : "text-gold-light",
                        )}
                      >
                        {"free" in r && r.free ? "INCLUDED" : inr(r.value)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>

            {/* savings band */}
            <Panel className="overflow-hidden">
              <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-[1.3fr_1fr]">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-luxe text-gold">
                    You save every month
                  </p>
                  <p className="mt-2 font-serif text-[2.8rem] leading-none text-ivory">
                    {inr(saving)}
                    <span className="ml-3 align-middle text-sm font-sans font-bold uppercase tracking-[0.14em] text-success">
                      {savingPct}% cheaper
                    </span>
                  </p>
                  <p className="mt-2 text-[12.5px] text-sand">
                    That is <strong className="text-gold-light">{inr(saving * 12)}</strong> back in your
                    pocket over a year — roughly {Math.max(1, Math.round((saving * 12) / 45000))} return
                    flights home or a full certification course.
                  </p>

                  <div className="mt-5 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-sand-dim">
                        <span>Independent flat</span>
                        <span>{inr(flat.total)}</span>
                      </div>
                      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-espresso">
                        <div className="h-full w-full rounded-full bg-gradient-to-r from-danger/70 to-danger/40" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-sand-dim">
                        <span>PANDEY PG</span>
                        <span>{inr(pg.monthlyTotal)}</span>
                      </div>
                      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-espresso">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-light transition-all duration-700 ease-out"
                          style={{ width: `${Math.max(6, pgBarPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-xl border border-gold/18 bg-espresso/50 p-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-luxe text-gold">
                      Lock this price
                    </p>
                    <p className="mt-2 text-[13px] leading-snug text-ivory">
                      {TIERS[tier].label} · {cooling === "ac" ? "AC" : "Non-AC"} ·{" "}
                      {meals === "full" ? "Full mess" : "Room only"} from{" "}
                      <strong className="text-gold-light">{inr(cardPrice(tier, cooling, meals === "full"))}</strong>{" "}
                      / month.
                    </p>
                    <p className="mt-2 text-[11.5px] leading-snug text-sand-dim">
                      Refundable deposit {inr(pg.deposit)} · Token to reserve just ₹1,000 · Rent frozen
                      for your {pg.tenureMonths}-month tenure.
                    </p>
                  </div>
                  <Button block icon="bed" onClick={() => onBook(tier)}>
                    Book This Configuration
                  </Button>
                  <p className="text-center text-[10px] uppercase tracking-[0.14em] text-sand-dim">
                    No payment needed to reserve for 48 hrs
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}
