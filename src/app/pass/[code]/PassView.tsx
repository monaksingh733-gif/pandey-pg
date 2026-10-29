"use client";

import { Button, Panel, Pill } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { BrandMark } from "@/components/Navbar";
import { ADDONS, COOLING_LABEL, FLOOR_LABEL, TENURES, TIERS, inr } from "@/lib/pricing";
import type { CoolingKey, FloorKey, MealKey, TenureKey, TierKey } from "@/lib/pricing";
import { BRAND, waLink } from "@/lib/data";

export interface PassBooking {
  code: string;
  bedLabel: string | null;
  roomCode: string | null;
  position?: string | null;
  tier: string;
  cooling: string;
  floor: string;
  tenure: string;
  meals: string;
  addons: string[];
  moveInDate: string;
  fullName: string;
  mobile: string;
  email: string;
  gender: string;
  category: string;
  institution: string | null;
  emergencyName: string;
  emergencyPhone: string;
  idProofType: string;
  idProofNumber: string | null;
  baseRent: number;
  acCharge: number;
  floorPremium: number;
  rentDiscount: number;
  netRent: number;
  messCharges: number;
  addonCharges: number;
  monthlyTotal: number;
  deposit: number;
  moveInTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentMode: string;
  status: string;
  notes: string | null;
  createdAt: string | null;
}

function Barcode({ value }: { value: string }) {
  const bars = Array.from(value.replace(/\s/g, "")).flatMap((ch, i) => {
    const c = ch.charCodeAt(0);
    return [
      { w: (c % 3) + 1, on: (c + i) % 2 === 0 },
      { w: ((c >> 2) % 2) + 1, on: (c + i) % 3 !== 0 },
    ];
  });
  return (
    <div className="flex h-14 items-end gap-[2px]" aria-hidden>
      {bars.map((b, i) => (
        <span
          key={i}
          className={b.on ? "bg-ivory" : "bg-transparent"}
          style={{ width: b.w * 2, height: `${58 + ((i * 7) % 40)}%` }}
        />
      ))}
    </div>
  );
}

export function PassView({
  booking,
  searchedFor,
}: {
  booking: PassBooking | null;
  searchedFor: string;
}) {
  if (!booking) {
    return (
      <Shell>
        <Panel className="mx-auto max-w-xl p-10 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-danger/35 bg-danger/10 text-danger">
            <Icon name="alert" className="h-7 w-7" />
          </span>
          <h1 className="mt-6 font-serif text-3xl text-ivory">Booking pass not found</h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-sand">
            We could not find a reservation under <strong className="text-gold-light">{searchedFor}</strong>.
            Check the ID from your confirmation screen, or use the lookup box in the website footer.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/" icon="home">
              Back to PANDEY PG
            </Button>
            <Button
              variant="outline"
              icon="chat"
              onClick={() =>
                window.open(
                  waLink(`Hi PANDEY PG, I cannot find my booking pass for ${searchedFor}. Please help.`),
                )
              }
            >
              Ask the Warden
            </Button>
          </div>
        </Panel>
      </Shell>
    );
  }

  const tier = TIERS[booking.tier as TierKey];
  const tenure = TENURES.find((t) => t.key === (booking.tenure as TenureKey));
  const addonNames = booking.addons
    .map((k) => ADDONS.find((a) => a.key === k)?.label)
    .filter(Boolean) as string[];

  const waMessage = [
    `*PANDEY PG — Booking Pass ${booking.code}*`,
    `Resident: ${booking.fullName} (${booking.mobile})`,
    `Room: ${tier?.label ?? booking.tier} · ${COOLING_LABEL[booking.cooling as CoolingKey]} · ${FLOOR_LABEL[booking.floor as FloorKey]}`,
    `Bed: ${booking.bedLabel} · Room ${booking.roomCode}`,
    `Move-in: ${booking.moveInDate} · Tenure: ${tenure?.label ?? booking.tenure}`,
    `Meals: ${booking.meals === "full" ? "Full mess" : "Room only"}`,
    `Monthly: ${inr(booking.monthlyTotal)} · Deposit: ${inr(booking.deposit)}`,
    `Paid: ${inr(booking.amountPaid)} · Balance: ${inr(booking.balanceDue)}`,
  ].join("\n");

  return (
    <Shell>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BrandMark compact href="/" />
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button href="/" size="sm" variant="ghost" icon="home">
            Website
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon="chat"
            onClick={() => window.open(waLink(waMessage), "_blank")}
          >
            Send to WhatsApp
          </Button>
          <Button size="sm" icon="printer" onClick={() => window.print()}>
            Print / Save PDF
          </Button>
        </div>
      </div>

      <div className="print-sheet mx-auto max-w-3xl overflow-hidden rounded-2xl border border-gold/25 bg-[linear-gradient(160deg,#251B14,#1C140F_55%,#17100C)] shadow-[0_40px_120px_-50px_rgba(0,0,0,1)]">
        {/* header */}
        <div className="relative border-b border-gold/20 bg-[radial-gradient(ellipse_70%_120%_at_50%_-20%,rgba(200,157,84,0.25),transparent)] px-6 py-7 sm:px-9">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="print-gold text-[9.5px] font-bold uppercase tracking-luxe text-gold">
                Official Booking Pass · Resident Copy
              </p>
              <h1 className="print-ink mt-2 font-serif text-3xl text-ivory sm:text-4xl">
                PANDEY <span className="text-gold-light">PG</span>
              </h1>
              <p className="print-muted mt-1.5 text-[11.5px] text-sand">{BRAND.address}</p>
            </div>
            <div className="text-right">
              <p className="print-muted text-[9.5px] font-bold uppercase tracking-luxe text-gold/80">
                Booking ID
              </p>
              <p className="print-ink mt-1 font-serif text-2xl text-gold-light">{booking.code}</p>
              <div className="mt-2">
                <Pill tone={booking.status === "confirmed" ? "green" : "amber"}>
                  <Icon name="checkcircle" className="h-3.5 w-3.5" />
                  {booking.status === "confirmed" ? "Confirmed" : "Token Held · 48 hrs"}
                </Pill>
              </div>
            </div>
          </div>
        </div>

        {/* body */}
        <div className="space-y-7 px-6 py-7 sm:px-9">
          <section>
            <SectionTitle icon="bed">Bed &amp; Room Allocation</SectionTitle>
            <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">
              <Row k="Room type" v={tier?.label ?? booking.tier} />
              <Row k="Occupancy" v={`${tier?.occupants ?? "—"} per room`} />
              <Row k="Cooling" v={COOLING_LABEL[booking.cooling as CoolingKey] ?? booking.cooling} />
              <Row k="Floor" v={FLOOR_LABEL[booking.floor as FloorKey] ?? booking.floor} />
              <Row k="Room no." v={booking.roomCode ?? "—"} />
              <Row k="Bed" v={booking.bedLabel ?? "—"} highlight />
              <Row k="Move-in date" v={booking.moveInDate} />
              <Row k="Tenure" v={tenure?.label ?? booking.tenure} />
              <Row k="Meal plan" v={booking.meals === "full" ? "Full Mess (3 meals)" : "Room Only"} />
            </div>
            {addonNames.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {addonNames.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-gold/25 bg-gold/8 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-gold-light"
                  >
                    + {a}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          <section>
            <SectionTitle icon="users">Resident &amp; KYC</SectionTitle>
            <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">
              <Row k="Full name" v={booking.fullName} />
              <Row k="Mobile" v={booking.mobile} />
              <Row k="Email" v={booking.email} />
              <Row k="Gender" v={booking.gender} />
              <Row k="Category" v={booking.category} />
              <Row k={booking.category === "College Student" ? "Institution" : "Company"} v={booking.institution ?? "—"} />
              <Row k="Emergency contact" v={booking.emergencyName} />
              <Row k="Emergency phone" v={booking.emergencyPhone} />
              <Row k="ID proof" v={`${booking.idProofType}${booking.idProofNumber ? ` · ${booking.idProofNumber}` : ""}`} />
            </div>
            {booking.notes ? (
              <p className="print-muted mt-3 rounded-lg border border-gold/12 bg-espresso/40 px-3.5 py-2.5 text-[12px] text-sand">
                <strong className="print-gold text-gold">Resident note: </strong>
                {booking.notes}
              </p>
            ) : null}
          </section>

          <section>
            <SectionTitle icon="rupee">Transparent Price Breakdown</SectionTitle>
            <dl className="mt-3 divide-y divide-gold/10 rounded-xl border border-gold/15 bg-espresso/40 px-4">
              <Line k="Room rent (per bed)" v={inr(booking.baseRent)} />
              <Line k={booking.cooling === "ac" ? "Air conditioning" : "Cooling (non-AC)"} v={inr(booking.acCharge)} />
              <Line k={`Floor premium · ${FLOOR_LABEL[booking.floor as FloorKey] ?? booking.floor}`} v={inr(booking.floorPremium)} />
              {booking.rentDiscount > 0 ? (
                <Line
                  k={`Tenure discount · ${booking.tenure === "six" ? "5%" : "10%"}`}
                  v={`− ${inr(booking.rentDiscount)}`}
                  positive
                />
              ) : null}
              <Line k="Net monthly room rent" v={inr(booking.netRent)} strong />
              <Line k="Mess charges" v={booking.messCharges === 0 ? "₹0" : inr(booking.messCharges)} />
              <Line
                k="Add-ons"
                v={booking.addonCharges === 0 ? "₹0" : inr(booking.addonCharges)}
              />
              <Line k="Brokerage / Wi-Fi / maintenance" v="₹0" positive />
              <Line k="Total per month" v={inr(booking.monthlyTotal)} strong large />
              <Line k="Refundable security deposit (1 month rent)" v={inr(booking.deposit)} />
              <Line k="Move-in payable" v={inr(booking.moveInTotal)} strong />
              <Line
                k={booking.paymentMode === "token" ? "Token paid (bed locked 48 hrs)" : "Paid in full"}
                v={inr(booking.amountPaid)}
                positive
              />
              <Line k="Balance due at move-in" v={inr(booking.balanceDue)} strong large />
            </dl>
            <p className="print-muted mt-2.5 text-[10.5px] leading-relaxed text-sand-dim">
              Electricity billed separately at ₹8.50 / unit on an independent sub-meter. Deposit refunded
              within 15 working days of checkout after joint inspection. Lock-in 3 months · notice period
              30 days.
            </p>
          </section>

          <section className="rounded-xl border border-gold/18 bg-coffee/45 p-5">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="print-gold text-[9.5px] font-bold uppercase tracking-luxe text-gold">
                  Gate verification
                </p>
                <p className="print-muted mt-2 max-w-md text-[11.5px] leading-relaxed text-sand">
                  Show this pass (printed or on your phone) at reception on move-in day. The warden will
                  issue your biometric card, Wi-Fi credentials and the room inventory checklist.
                </p>
                <p suppressHydrationWarning className="print-muted mt-3 text-[11px] text-sand-dim">
                  Issued {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"} ·
                  Warden helpline {BRAND.phone}
                </p>
              </div>
              <div className="shrink-0">
                <Barcode value={booking.code} />
                <p className="print-muted mt-2 text-center font-mono text-[10px] tracking-[0.22em] text-sand">
                  {booking.code.replace("#", "")}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-gold/20 bg-espresso/50 px-6 py-4 text-center sm:px-9">
          <p className="print-muted text-[10.5px] uppercase tracking-[0.18em] text-sand-dim">
            PANDEY Luxury PG &amp; Living · Zero brokerage · This pass is non-transferable
          </p>
        </div>
      </div>

      <div className="no-print mx-auto mt-6 flex max-w-3xl justify-center gap-3">
        <Button href="/" variant="outline" icon="chevronleft">
          Back to website
        </Button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-espresso px-4 py-8 sm:px-6 lg:px-10">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,rgba(200,157,84,0.1),transparent_70%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <h2 className="print-gold flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-luxe text-gold">
      <Icon name={icon} className="h-4 w-4" />
      {children}
    </h2>
  );
}

function Row({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="print-muted text-[9.5px] font-bold uppercase tracking-[0.14em] text-sand-dim">{k}</p>
      <p
        className={
          highlight
            ? "print-ink mt-1 truncate text-[14px] font-bold text-gold-light"
            : "print-ink mt-1 truncate text-[13px] font-semibold text-ivory"
        }
      >
        {v}
      </p>
    </div>
  );
}

function Line({
  k,
  v,
  strong,
  large,
  positive,
}: {
  k: string;
  v: string;
  strong?: boolean;
  large?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt
        className={
          strong
            ? "print-ink text-[12px] font-bold uppercase tracking-[0.1em] text-ivory"
            : "print-muted text-[12px] text-sand"
        }
      >
        {k}
      </dt>
      <dd
        className={
          large
            ? "print-ink shrink-0 font-serif text-xl text-gold-light"
            : positive
              ? "shrink-0 text-[12.5px] font-semibold text-success"
              : strong
                ? "print-ink shrink-0 text-[13px] font-bold text-ivory"
                : "print-ink shrink-0 text-[12.5px] font-semibold text-ivory"
        }
      >
        {v}
      </dd>
    </div>
  );
}
