"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  CheckCard,
  Field,
  Modal,
  ModalShell,
  Panel,
  Pill,
  Segmented,
  SelectInput,
  TextInput,
  useCopy,
} from "./ui";
import { Icon } from "./Icon";
import { GoogleIcon } from "./GoogleIcon";
import { PaymentGateway } from "./PaymentGateway";
import { useAuth } from "@/context/AuthContext";
import { ADDONS, FLOOR_LABEL, TENURES, TIERS, quote, inr, type CoolingKey, type FloorKey, type MealKey, type PaymentKey, type TenureKey, type TierKey } from "@/lib/pricing";
import { BRAND, waLink } from "@/lib/data";
import { createWaLink, WhatsAppTemplates } from "@/lib/whatsapp";
import type { BedDTO, SummaryDTO } from "@/hooks/useAvailability";
import { isEmail, isFutureDate, isMobile, todayISO } from "@/lib/validate";
import { cn } from "@/lib/cn";

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const CATEGORIES = ["College Student", "Working Professional"];
const ID_PROOFS = ["Aadhaar Card", "College ID", "Passport", "Driving Licence", "Voter ID"];

export interface ConfirmedBooking {
  code: string;
  bedLabel: string;
  roomCode: string;
  position: string;
  tierLabel: string;
  coolingLabel: string;
  floorLabel: string;
  tenureLabel: string;
  meals: MealKey;
  moveInDate: string;
  fullName: string;
  mobile: string;
  email: string;
  category: string;
  institution: string;
  quote: ReturnType<typeof quote>;
  amountPaid: number;
  balanceDue: number;
  paymentMode: PaymentKey;
}

const STEP_LABELS = ["Room & Bed", "Stay & Meals", "Resident KYC", "Price & Confirm"];

export function BookingModal({
  open,
  onClose,
  initialTier,
  beds,
  summary,
  loading,
  reload,
}: {
  open: boolean;
  onClose: () => void;
  initialTier: TierKey;
  beds: BedDTO[];
  summary: SummaryDTO | null;
  loading: boolean;
  reload: () => void;
}) {
  const [step, setStep] = useState(1);
  const [tier, setTier] = useState<TierKey>(initialTier);
  const [cooling, setCooling] = useState<CoolingKey>("ac");
  const [floor, setFloor] = useState<FloorKey>("2nd");
  const [bedId, setBedId] = useState<number | null>(null);
  const [showBooked, setShowBooked] = useState(true);

  const [moveInDate, setMoveInDate] = useState(todayISO(3));
  const [tenure, setTenure] = useState<TenureKey>("eleven");
  const [meals, setMeals] = useState<MealKey>("full");
  const [addons, setAddons] = useState<string[]>([]);

  const [details, setDetails] = useState({
    fullName: "",
    mobile: "",
    email: "",
    gender: "",
    category: "College Student",
    institution: "",
    emergencyName: "",
    emergencyPhone: "",
    idProofType: "Aadhaar Card",
    idProofNumber: "",
    notes: "",
  });

  const [paymentMode, setPaymentMode] = useState<PaymentKey>("token");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<ConfirmedBooking | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<ConfirmedBooking | null>(null);
  const [paymentTxn, setPaymentTxn] = useState<{ id: string; method: string } | null>(null);
  const [prevOpen, setPrevOpen] = useState(open);
  const { copied, copy } = useCopy();
  const { user, openAuthModal } = useAuth();

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTier(initialTier);
      setStep(1);
      setBedId(null);
      setErrors({});
      setConfirmed(null);
      setSubmitting(false);
      if (user) {
        setDetails((d) => ({
          ...d,
          fullName: d.fullName || user.name,
          email: d.email || user.email,
        }));
      }
    }
  }

  const pool = useMemo(
    () => beds.filter((b) => b.tier === tier && b.cooling === cooling && b.floor === floor),
    [beds, tier, cooling, floor],
  );

  const rooms = useMemo(() => {
    const map = new Map<string, BedDTO[]>();
    for (const b of pool) {
      const arr = map.get(b.roomCode) ?? [];
      arr.push(b);
      map.set(b.roomCode, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [pool]);

  const q = useMemo(
    () => quote({ tier, cooling, floor, tenure, meals, addons }),
    [tier, cooling, floor, tenure, meals, addons],
  );

  const selectedBed = useMemo(() => pool.find((b) => b.id === bedId) ?? null, [pool, bedId]);
  const availableCount = pool.filter((b) => b.status === "available").length;

  const setDetail = (k: keyof typeof details, v: string) => {
    setDetails((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!bedId) e.bedId = "Tap an available bed in the layout above to continue.";
      if (selectedBed && selectedBed.status !== "available")
        e.bedId = "That bed is no longer available — please pick another.";
    }
    if (s === 2) {
      if (!isFutureDate(moveInDate)) e.moveInDate = "Choose a move-in date between today and 6 months ahead.";
    }
    if (s === 3) {
      if (details.fullName.trim().length < 3) e.fullName = "Enter your full name (min 3 characters).";
      if (!isMobile(details.mobile)) e.mobile = "Enter a valid 10-digit Indian mobile number.";
      if (!isEmail(details.email)) e.email = "Enter a valid email address.";
      if (!details.gender) e.gender = "Select your gender.";
      if (!details.category) e.category = "Select student or professional.";
      if (!details.institution.trim())
        e.institution =
          details.category === "College Student" ? "College / university name is required." : "Company name is required.";
      if (details.emergencyName.trim().length < 3) e.emergencyName = "Enter emergency contact name.";
      if (!isMobile(details.emergencyPhone)) e.emergencyPhone = "Enter a valid 10-digit contact number.";
      if (!details.idProofType) e.idProofType = "Select an ID proof.";
      if (details.idProofNumber && details.idProofNumber.trim().length < 4)
        e.idProofNumber = "Enter the full ID number or leave it blank.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(4, s + 1));
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && step < 4) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const submit = async () => {
    const firstBad = [1, 2, 3].find((s) => !validateStep(s));
    if (firstBad) {
      setStep(firstBad);
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          cooling,
          floor,
          bedId,
          moveInDate,
          tenure,
          meals,
          addons,
          paymentMode,
          ...details,
        }),
      });
      const json = await res.json();
      if (json?.ok) {
        setPendingBooking(json.booking as ConfirmedBooking);
        setShowPayment(true);
      } else {
        setErrors(json?.errors ?? { form: json?.error ?? "Booking failed. Please try again." });
        if (json?.errors?.bedId) {
          setStep(1);
          setBedId(null);
          reload();
        } else if (json?.errors?.moveInDate) {
          setStep(2);
        } else {
          setStep(3);
        }
      }
    } catch {
      setErrors({ form: "Network error. Please check your connection and try again." });
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------- confirmation */
  if (confirmed) {
    const waMessage = [
      `*PANDEY PG — Booking Confirmed*`,
      `Booking ID: ${confirmed.code}`,
      `Resident: ${confirmed.fullName} (${confirmed.mobile})`,
      `Room: ${confirmed.tierLabel} · ${confirmed.coolingLabel} · ${confirmed.floorLabel}`,
      `Bed: ${confirmed.bedLabel} (${confirmed.position}) · Room ${confirmed.roomCode}`,
      `Move-in: ${confirmed.moveInDate} · Tenure: ${confirmed.tenureLabel}`,
      `Meals: ${confirmed.meals === "full" ? "Full mess (3 meals)" : "Room only"}`,
      `Monthly total: ${inr(confirmed.quote.monthlyTotal)}`,
      `Deposit (refundable): ${inr(confirmed.quote.deposit)}`,
      `Paid now: ${inr(confirmed.amountPaid)} · Balance on move-in: ${inr(confirmed.balanceDue)}`,
      ``,
      `Please confirm my bed is locked. Thank you!`,
    ].join("\n");

    return (
      <Modal open={open} onClose={onClose} ariaLabel="Booking confirmed" className="max-w-2xl">
        <ModalShell
          title="Bed Confirmed 🎉"
          subtitle="Your reservation is live in the PANDEY PG inventory."
          onClose={onClose}
          footer={
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Button
                className="flex-1"
                icon="printer"
                onClick={() => window.open(`/pass/${encodeURIComponent(confirmed.code)}`, "_blank")}
              >
                Print / View Pass
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                icon="chat"
                onClick={() => {
                  const text = WhatsAppTemplates.bookingWelcomeToResident(confirmed);
                  window.open(createWaLink(confirmed.mobile, text), "_blank");
                }}
              >
                Get Pass on WhatsApp
              </Button>
              <Button
                className="flex-1"
                variant="ghost"
                icon="shield"
                onClick={() => {
                  const text = WhatsAppTemplates.bookingAlertToWarden(confirmed);
                  window.open(createWaLink(BRAND.phoneRaw, text), "_blank");
                }}
              >
                Notify Warden
              </Button>
            </div>
          }
        >
          <div className="animate-scale-in text-center">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-success/40 bg-success/12 text-success animate-pulse-ring">
              <Icon name="checkcircle" className="h-10 w-10" strokeWidth={1.5} />
            </span>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-luxe text-gold">
              Booking ID
            </p>
            <button
              type="button"
              onClick={() => copy(confirmed.code, "code")}
              className="mx-auto mt-1.5 flex items-center gap-2.5 rounded-xl border border-gold/35 bg-gold/8 px-5 py-2.5 transition-colors hover:bg-gold/15"
              title="Copy booking ID"
            >
              <span className="font-serif text-2xl tracking-wide text-gold-light">{confirmed.code}</span>
              <Icon name={copied === "code" ? "check" : "clipboard"} className="h-4 w-4 text-gold" />
            </button>
            <p className="mt-3 text-[13px] text-sand">
              {confirmed.paymentMode === "token"
                ? `₹${confirmed.amountPaid.toLocaleString("en-IN")} token received. Your bed is held exclusively for 48 hours.`
                : `Full move-in amount of ₹${confirmed.amountPaid.toLocaleString("en-IN")} recorded. You can move in on ${confirmed.moveInDate}.`}
            </p>
            {paymentTxn ? (
              <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-success/35 bg-success/15 px-3.5 py-1 text-xs text-success">
                <span>✅ Payment Verified via {paymentTxn.method}</span>
                <span className="font-mono text-[11px] text-ivory">({paymentTxn.id})</span>
              </div>
            ) : null}
          </div>

          <Panel className="mt-6 overflow-hidden !rounded-xl">
            <div className="border-b border-gold/12 bg-coffee/60 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-luxe text-gold">Bed Summary</p>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-4 sm:grid-cols-3">
              {[
                { k: "Room Type", v: confirmed.tierLabel },
                { k: "Cooling", v: confirmed.coolingLabel },
                { k: "Floor", v: confirmed.floorLabel },
                { k: "Room No.", v: confirmed.roomCode },
                { k: "Bed", v: `${confirmed.bedLabel} · ${confirmed.position}` },
                { k: "Move-in", v: confirmed.moveInDate },
                { k: "Tenure", v: confirmed.tenureLabel },
                { k: "Meal Plan", v: confirmed.meals === "full" ? "Full Mess" : "Room Only" },
                { k: "Resident", v: confirmed.fullName },
              ].map((row) => (
                <div key={row.k} className="min-w-0">
                  <dt className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-sand-dim">
                    {row.k}
                  </dt>
                  <dd className="mt-1 truncate text-[12.5px] font-semibold text-ivory">{row.v}</dd>
                </div>
              ))}
            </dl>
            <div className="grid grid-cols-3 divide-x divide-gold/12 border-t border-gold/12 bg-espresso/50">
              {[
                { k: "Monthly", v: inr(confirmed.quote.monthlyTotal) },
                { k: "Deposit", v: inr(confirmed.quote.deposit) },
                { k: "Balance due", v: inr(confirmed.balanceDue) },
              ].map((x) => (
                <div key={x.k} className="px-4 py-3 text-center">
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-sand-dim">{x.k}</p>
                  <p className="mt-1 font-serif text-lg text-gold-light">{x.v}</p>
                </div>
              ))}
            </div>
          </Panel>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: "clock", t: "Within 48 hrs", s: "Complete KYC upload & pay balance" },
              { icon: "key", t: "Move-in day", s: "Biometric card + room inventory sign-off" },
              { icon: "shield", t: "Ongoing", s: "Warden on call 24/7 at " + BRAND.phone },
            ].map((n) => (
              <div key={n.t} className="rounded-xl border border-gold/12 bg-coffee/45 p-3.5">
                <Icon name={n.icon} className="h-4.5 w-4.5 text-gold" />
                <p className="mt-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-ivory">{n.t}</p>
                <p className="mt-1 text-[11px] leading-snug text-sand-dim">{n.s}</p>
              </div>
            ))}
          </div>
        </ModalShell>
      </Modal>
    );
  }

  /* ------------------------------------------------------------------ form */
  return (
    <>
      <Modal open={open} onClose={onClose} ariaLabel="Book your stay at PANDEY PG" className="max-w-4xl">
      <ModalShell
        title={step === 5 ? "Confirmed" : `Book Your Stay — Step ${step} of 4`}
        subtitle={STEP_LABELS[step - 1]}
        onClose={onClose}
        step={step}
        steps={4}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {step > 1 ? (
                <Button variant="ghost" size="sm" icon="chevronleft" onClick={back}>
                  Back
                </Button>
              ) : (
                <span className="text-[10.5px] uppercase tracking-[0.14em] text-sand-dim">
                  No payment to browse beds
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-sand-dim">
                  Monthly total
                </p>
                <p className="font-serif text-xl leading-none text-gold-light">{inr(q.monthlyTotal)}</p>
              </div>
              {step < 4 ? (
                <Button size="md" iconRight="arrow" onClick={next}>
                  Continue
                </Button>
              ) : (
                <Button size="md" icon="checkcircle" disabled={submitting} onClick={submit}>
                  {submitting ? "Reserving…" : "Confirm & Generate Pass"}
                </Button>
              )}
            </div>
          </div>
        }
      >
        {/* step rail */}
        <div className="no-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto px-1">
          {STEP_LABELS.map((l, i) => {
            const n = i + 1;
            const state = n < step ? "done" : n === step ? "active" : "todo";
            return (
              <button
                key={l}
                type="button"
                onClick={() => {
                  if (n < step) setStep(n);
                  else if (n === step + 1 && validateStep(step)) setStep(n);
                }}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-300",
                  state === "active"
                    ? "border-gold bg-gold/12 text-gold-light"
                    : state === "done"
                      ? "border-success/35 bg-success/8 text-success"
                      : "border-gold/12 text-sand-dim",
                )}
              >
                <span className="grid h-4.5 w-4.5 place-items-center rounded-full border border-current text-[9px]">
                  {state === "done" ? <Icon name="check" className="h-3 w-3" strokeWidth={3} /> : n}
                </span>
                {l}
              </button>
            );
          })}
        </div>

        {errors.form ? (
          <p className="mb-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/8 px-4 py-2.5 text-[12px] text-danger">
            <Icon name="alert" className="h-4 w-4" />
            {errors.form}
          </p>
        ) : null}

        {/* ------------------------------------------------------- STEP 1 */}
        {step === 1 ? (
          <div className="animate-fade-up space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-luxe text-gold">Room Tier</p>
                <Segmented<TierKey>
                  size="sm"
                  value={tier}
                  onChange={(v) => {
                    setTier(v);
                    setBedId(null);
                  }}
                  options={(Object.keys(TIERS) as TierKey[]).map((k) => ({
                    value: k,
                    label: TIERS[k].short.split(" ")[0],
                  }))}
                />
                <p className="mt-2 text-[11px] text-sand-dim">
                  {TIERS[tier].label} · {TIERS[tier].occupants} per room
                </p>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-luxe text-gold">Cooling</p>
                <Segmented<CoolingKey>
                  size="sm"
                  value={cooling}
                  onChange={(v) => {
                    setCooling(v);
                    setBedId(null);
                  }}
                  options={[
                    { value: "ac", label: "AC", icon: "snowflake" },
                    { value: "nonac", label: "Non-AC", icon: "wind" },
                  ]}
                />
                <p className="mt-2 text-[11px] text-sand-dim">
                  {cooling === "ac" ? `+ ${inr(TIERS[tier].acAddon)} / month` : "Ceiling fan included"}
                </p>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-luxe text-gold">Floor</p>
                <Segmented<FloorKey>
                  size="sm"
                  value={floor}
                  onChange={(v) => {
                    setFloor(v);
                    setBedId(null);
                  }}
                  options={(Object.keys(FLOOR_LABEL) as FloorKey[]).map((k) => ({
                    value: k,
                    label: FLOOR_LABEL[k],
                  }))}
                />
                <p className="mt-2 text-[11px] text-sand-dim">
                  Floor premium {inr(quote({ tier, cooling, floor, tenure, meals, addons: [] }).floorPremium)}
                </p>
              </div>
            </div>

            {/* visual bed picker */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-luxe text-gold">
                  <Icon name="grid" className="h-4 w-4" />
                  Interactive Bed Picker — {FLOOR_LABEL[floor]} ·{" "}
                  {cooling === "ac" ? "AC" : "Non-AC"} · {TIERS[tier].short}
                </p>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 text-[10.5px] uppercase tracking-[0.12em] text-sand-dim">
                    <input
                      type="checkbox"
                      checked={showBooked}
                      onChange={(e) => setShowBooked(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#C89D54]"
                    />
                    Show occupied
                  </label>
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-success">
                    {availableCount} available
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {loading ? (
                  <Panel className="p-8 text-center">
                    <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-gold/25 border-t-gold" />
                    <p className="mt-4 text-[12px] uppercase tracking-[0.14em] text-sand-dim">
                      Loading live floor plan…
                    </p>
                  </Panel>
                ) : rooms.length === 0 ? (
                  <Panel className="p-8 text-center">
                    <p className="font-serif text-xl text-ivory">No rooms on this configuration</p>
                    <p className="mt-2 text-[12.5px] text-sand">Try another floor or cooling option.</p>
                  </Panel>
                ) : (
                  rooms.map(([roomCode, roomBeds]) => (
                    <div
                      key={roomCode}
                      className={cn(
                        "relative overflow-hidden rounded-2xl border p-4 transition-all duration-350",
                        roomBeds.some((b) => b.id === bedId)
                          ? "border-gold/60 bg-gold/8 shadow-[inset_0_0_40px_rgba(200,157,84,0.12)]"
                          : "border-gold/12 bg-espresso/45",
                      )}
                    >
                      {/* room outline chrome */}
                      <div className="absolute left-4 top-0 h-1.5 w-16 rounded-b bg-gold/25" />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ivory">
                          <Icon name="door" className="h-4 w-4 text-gold" />
                          Room {roomCode}
                        </p>
                        <span className="text-[10px] uppercase tracking-[0.12em] text-sand-dim">
                          {roomBeds.filter((b) => b.status === "available").length}/{roomBeds.length} free
                        </span>
                      </div>

                      <div
                        className={cn(
                          "mt-3.5 grid gap-3",
                          roomBeds.length === 1 ? "grid-cols-1 sm:grid-cols-2" : roomBeds.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3",
                        )}
                      >
                        {roomBeds
                          .filter((b) => showBooked || b.status === "available")
                          .map((b) => {
                            const isSel = b.id === bedId;
                            const disabled = b.status !== "available";
                            return (
                              <button
                                key={b.id}
                                type="button"
                                disabled={disabled}
                                onClick={() => {
                                  setBedId(b.id);
                                  setErrors((e) => ({ ...e, bedId: "" }));
                                }}
                                className={cn(
                                  "group relative flex items-start gap-3 rounded-xl border p-3 text-left transition-all duration-300",
                                  isSel
                                    ? "border-gold bg-gradient-to-br from-gold/22 to-gold/6 shadow-[0_12px_30px_-16px_rgba(200,157,84,0.95)]"
                                    : disabled
                                      ? "cursor-not-allowed border-ivory/8 bg-espresso/60 opacity-55"
                                      : "border-gold/20 bg-coffee/50 hover:-translate-y-0.5 hover:border-gold/55 hover:bg-gold/8",
                                )}
                              >
                                <span
                                  className={cn(
                                    "grid h-11 w-11 shrink-0 place-items-center rounded-lg border transition-colors",
                                    isSel
                                      ? "border-gold bg-gold text-espresso"
                                      : disabled
                                        ? "border-ivory/10 bg-espresso text-sand-dim"
                                        : "border-gold/30 bg-gold/10 text-gold",
                                  )}
                                >
                                  <Icon
                                    name={tier === "single" ? "bed" : "beddouble"}
                                    className="h-5 w-5"
                                    strokeWidth={1.6}
                                  />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-center justify-between gap-2">
                                    <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-ivory">
                                      {b.bedLabel}
                                    </span>
                                    {isSel ? (
                                      <Icon name="checkcircle" className="h-4 w-4 text-gold-light" />
                                    ) : null}
                                  </span>
                                  <span className="mt-0.5 block text-[11px] text-sand-dim">
                                    {b.position}
                                  </span>
                                  <span className="mt-1.5 block">
                                    {disabled ? (
                                      <Pill tone={b.status === "reserved" ? "amber" : "muted"} className="px-2 py-0.5 text-[9px]">
                                        {b.status === "reserved" ? "Reserved" : "Booked"}
                                      </Pill>
                                    ) : (
                                      <Pill tone="green" className="px-2 py-0.5 text-[9px]">
                                        Available
                                      </Pill>
                                    )}
                                  </span>
                                  {b.residentHint ? (
                                    <span className="mt-1 block truncate text-[10px] text-sand-dim/80">
                                      {b.residentHint}
                                    </span>
                                  ) : null}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {errors.bedId ? (
                <p className="mt-3 flex items-center gap-2 text-[12px] font-medium text-danger">
                  <Icon name="alert" className="h-4 w-4" strokeWidth={2} />
                  {errors.bedId}
                </p>
              ) : null}

              {selectedBed ? (
                <p className="mt-3 flex items-center gap-2 rounded-lg border border-gold/25 bg-gold/8 px-3.5 py-2.5 text-[12px] text-gold-light">
                  <Icon name="checkcircle" className="h-4 w-4" />
                  Selected: {selectedBed.bedLabel} — {selectedBed.position}, Room {selectedBed.roomCode},{" "}
                  {FLOOR_LABEL[floor]}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* ------------------------------------------------------- STEP 2 */}
        {step === 2 ? (
          <div className="animate-fade-up space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Move-in date" required error={errors.moveInDate} hint="Within 6 months">
                <TextInput
                  type="date"
                  value={moveInDate}
                  min={todayISO(0)}
                  invalid={Boolean(errors.moveInDate)}
                  onChange={(e) => {
                    setMoveInDate(e.target.value);
                    setErrors((x) => ({ ...x, moveInDate: "" }));
                  }}
                />
              </Field>
              <div className="rounded-xl border border-gold/12 bg-espresso/45 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-luxe text-gold">Move-in window</p>
                <p className="mt-1.5 text-[12.5px] leading-snug text-sand">
                  Check-in runs 9:00 AM – 9:00 PM. Arriving late? WhatsApp the warden and we keep the
                  reception open for you.
                </p>
              </div>
            </div>

            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-luxe text-gold">
                Tenure plan — longer stays unlock bigger discounts
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {TENURES.map((t) => {
                  const active = t.key === tenure;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTenure(t.key)}
                      className={cn(
                        "relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300",
                        active
                          ? "border-gold bg-gold/10 shadow-[inset_0_0_30px_rgba(200,157,84,0.14)]"
                          : "border-gold/12 bg-espresso/45 hover:border-gold/40",
                      )}
                    >
                      {t.discountPct > 0 ? (
                        <span className="absolute right-0 top-0 rounded-bl-lg bg-gradient-to-b from-gold-light to-gold px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-espresso">
                          {t.discountPct}% off
                        </span>
                      ) : null}
                      <p className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-ivory">
                        {t.label}
                      </p>
                      <p className="mt-1.5 text-[11px] leading-snug text-sand-dim">{t.note}</p>
                      <p className="mt-3 font-serif text-lg text-gold-light">
                        {inr(
                          quote({ tier, cooling, floor, tenure: t.key, meals, addons }).monthlyTotal,
                        )}
                        <span className="ml-1 font-sans text-[10px] uppercase tracking-[0.12em] text-sand-dim">
                          /mo
                        </span>
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-luxe text-gold">Meal plan</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CheckCard
                  checked={meals === "full"}
                  onChange={() => setMeals("full")}
                  icon="utensils"
                  title="Full Mess (B + L + D)"
                  note="Breakfast, lunch, evening tea & snacks and dinner. Skip-meal credit up to 10 days a month."
                  price={`+ ${inr(TIERS[tier].messAddon)}/mo`}
                />
                <CheckCard
                  checked={meals === "none"}
                  onChange={() => setMeals("none")}
                  icon="door"
                  title="Room Only"
                  note="No mess charges. Shared kitchen and dining lounge access retained for self-cooking."
                  price="₹0"
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-luxe text-gold">
                Optional add-ons
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {ADDONS.map((a) => (
                  <CheckCard
                    key={a.key}
                    checked={addons.includes(a.key)}
                    onChange={(v) =>
                      setAddons((prev) => (v ? [...prev, a.key] : prev.filter((k) => k !== a.key)))
                    }
                    icon={a.key === "fridge" ? "snowflake" : a.key === "parking" ? "car" : "washing"}
                    title={a.label}
                    note={a.note}
                    price={a.monthly === 0 ? "FREE" : `+ ${inr(a.monthly)}/mo`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* ------------------------------------------------------- STEP 3 */}
        {step === 3 ? (
          <div className="animate-fade-up space-y-5">
            {user ? (
              <div className="flex items-center justify-between rounded-xl border border-success/30 bg-success/10 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <GoogleIcon className="h-4 w-4" />
                  <span className="text-[12.5px] text-ivory">
                    Signed in as <strong className="text-success">{user.email}</strong>
                  </span>
                </div>
                <Pill tone="green" className="text-[9.5px]">
                  Google Verified
                </Pill>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/25 bg-espresso/60 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <GoogleIcon className="h-4 w-4" />
                  <span className="text-[12px] text-sand">
                    Want to auto-fill details and link this booking to your account?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-gold transition-colors hover:bg-gold/20"
                >
                  <GoogleIcon className="h-3.5 w-3.5" />
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-xl border border-gold/15 bg-gold/6 px-4 py-3">
              <Icon name="scan" className="h-5 w-5 shrink-0 text-gold" />
              <p className="text-[12px] leading-snug text-sand">
                KYC details are used only for the resident register and police verification. Stored
                encrypted, never shared with brokers or third parties.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" required error={errors.fullName}>
                <TextInput
                  value={details.fullName}
                  invalid={Boolean(errors.fullName)}
                  onChange={(e) => setDetail("fullName", e.target.value)}
                  placeholder="As printed on your ID proof"
                  autoComplete="name"
                />
              </Field>
              <Field label="Mobile number" required error={errors.mobile} hint="10 digits">
                <TextInput
                  value={details.mobile}
                  invalid={Boolean(errors.mobile)}
                  onChange={(e) => setDetail("mobile", e.target.value.replace(/[^\d+\s-]/g, "").slice(0, 14))}
                  placeholder="98765 43210"
                  inputMode="numeric"
                  autoComplete="tel"
                />
              </Field>
              <Field label="Email address" required error={errors.email}>
                <TextInput
                  type="email"
                  value={details.email}
                  invalid={Boolean(errors.email)}
                  onChange={(e) => setDetail("email", e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </Field>
              <Field label="Gender" required error={errors.gender}>
                <SelectInput
                  value={details.gender}
                  invalid={Boolean(errors.gender)}
                  onChange={(e) => setDetail("gender", e.target.value)}
                >
                  <option value="">Select…</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Resident category" required error={errors.category}>
                <SelectInput
                  value={details.category}
                  onChange={(e) => setDetail("category", e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field
                label={details.category === "College Student" ? "College / University" : "Company"}
                required
                error={errors.institution}
              >
                <TextInput
                  value={details.institution}
                  invalid={Boolean(errors.institution)}
                  onChange={(e) => setDetail("institution", e.target.value)}
                  placeholder={
                    details.category === "College Student" ? "Main University" : "Tech Park Pvt. Ltd."
                  }
                />
              </Field>
              <Field label="Parent / emergency contact name" required error={errors.emergencyName}>
                <TextInput
                  value={details.emergencyName}
                  invalid={Boolean(errors.emergencyName)}
                  onChange={(e) => setDetail("emergencyName", e.target.value)}
                  placeholder="Full name"
                />
              </Field>
              <Field label="Emergency contact number" required error={errors.emergencyPhone}>
                <TextInput
                  value={details.emergencyPhone}
                  invalid={Boolean(errors.emergencyPhone)}
                  onChange={(e) => setDetail("emergencyPhone", e.target.value.replace(/[^\d+\s-]/g, "").slice(0, 14))}
                  placeholder="10-digit mobile"
                  inputMode="numeric"
                />
              </Field>
              <Field label="ID proof type" required error={errors.idProofType}>
                <SelectInput
                  value={details.idProofType}
                  onChange={(e) => setDetail("idProofType", e.target.value)}
                >
                  {ID_PROOFS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field
                label="ID proof number"
                hint="Optional now — verified at move-in"
                error={errors.idProofNumber}
              >
                <TextInput
                  value={details.idProofNumber}
                  invalid={Boolean(errors.idProofNumber)}
                  onChange={(e) => setDetail("idProofNumber", e.target.value.toUpperCase().slice(0, 20))}
                  placeholder="XXXX XXXX XXXX"
                />
              </Field>
              <Field label="Anything the warden should know?" className="sm:col-span-2" hint="Optional">
                <textarea
                  value={details.notes}
                  onChange={(e) => setDetail("notes", e.target.value.slice(0, 400))}
                  rows={3}
                  placeholder="Early-morning classes, dietary preference, two-wheeler parking, medical note…"
                  className="w-full resize-none rounded-lg border border-gold/15 bg-espresso/70 px-3.5 py-2.5 text-sm text-ivory outline-none transition-all duration-200 placeholder:text-sand-dim/70 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                />
              </Field>
            </div>
          </div>
        ) : null}

        {/* ------------------------------------------------------- STEP 4 */}
        {step === 4 ? (
          <div className="animate-fade-up space-y-6">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
              {/* invoice */}
              <Panel className="overflow-hidden lg:col-span-3">
                <div className="border-b border-gold/12 bg-coffee/60 px-5 py-3.5">
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-luxe text-gold">
                    <Icon name="file" className="h-4 w-4" />
                    Live transparent price breakdown
                  </p>
                </div>
                <dl className="divide-y divide-gold/8 px-5">
                  {[
                    { k: `Room rent — ${TIERS[tier].label} (${TIERS[tier].occupants === 1 ? "private" : "per bed"})`, v: q.baseRent },
                    { k: `Air conditioning · ${cooling === "ac" ? "Split AC" : "Not selected"}`, v: q.acCharge },
                    { k: `Floor premium · ${FLOOR_LABEL[floor]}`, v: q.floorPremium },
                  ].map((r) => (
                    <div key={r.k} className="flex items-baseline justify-between gap-4 py-3">
                      <dt className="text-[12.5px] text-sand">{r.k}</dt>
                      <dd className="shrink-0 text-[13px] font-semibold text-ivory">{inr(r.v)}</dd>
                    </div>
                  ))}
                  {q.rentDiscount > 0 ? (
                    <div className="flex items-baseline justify-between gap-4 py-3">
                      <dt className="text-[12.5px] text-success">
                        Tenure discount · {q.discountPct}% ({TENURES.find((t) => t.key === tenure)?.label})
                      </dt>
                      <dd className="shrink-0 text-[13px] font-semibold text-success">
                        − {inr(q.rentDiscount)}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-[12.5px] font-semibold text-ivory">Net monthly room rent</dt>
                    <dd className="shrink-0 text-[13px] font-semibold text-gold-light">{inr(q.netRent)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-[12.5px] text-sand">
                      Mess charges · {meals === "full" ? "Full mess (3 meals)" : "Room only"}
                    </dt>
                    <dd className="shrink-0 text-[13px] font-semibold text-ivory">
                      {q.messCharges === 0 ? "₹0" : inr(q.messCharges)}
                    </dd>
                  </div>
                  {addons.length > 0 ? (
                    <div className="flex items-baseline justify-between gap-4 py-3">
                      <dt className="text-[12.5px] text-sand">
                        Add-ons ·{" "}
                        {addons
                          .map((k) => ADDONS.find((a) => a.key === k)?.label)
                          .filter(Boolean)
                          .join(", ")}
                      </dt>
                      <dd className="shrink-0 text-[13px] font-semibold text-ivory">
                        {q.addonCharges === 0 ? "FREE" : inr(q.addonCharges)}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex items-baseline justify-between gap-4 bg-gold/6 px-2 py-3.5">
                    <dt className="text-[12px] font-bold uppercase tracking-[0.12em] text-ivory">
                      Total per month
                    </dt>
                    <dd className="font-serif text-2xl text-gold-light">{inr(q.monthlyTotal)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-[12.5px] text-sand">
                      One-time refundable security deposit (1 month rent)
                    </dt>
                    <dd className="shrink-0 text-[13px] font-semibold text-ivory">{inr(q.deposit)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-[12.5px] text-sand">Brokerage · Wi-Fi · maintenance</dt>
                    <dd className="shrink-0 text-[13px] font-bold text-success">₹0</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-4">
                    <dt className="text-[12px] font-bold uppercase tracking-[0.12em] text-ivory">
                      Move-in payable
                    </dt>
                    <dd className="font-serif text-2xl text-ivory">{inr(q.moveInTotal)}</dd>
                  </div>
                </dl>
                <p className="border-t border-gold/10 px-5 py-3 text-[10.5px] leading-relaxed text-sand-dim">
                  Electricity is billed separately at ₹8.50 per unit on an independent sub-meter (typical
                  ₹900 – ₹1,400 / month). All other services are included.
                </p>
              </Panel>

              {/* payment + summary */}
              <div className="space-y-4 lg:col-span-2">
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-luxe text-gold">
                    Payment option
                  </p>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMode("token")}
                      className={cn(
                        "w-full rounded-xl border p-4 text-left transition-all duration-300",
                        paymentMode === "token"
                          ? "border-gold bg-gold/10 shadow-[inset_0_0_30px_rgba(200,157,84,0.14)]"
                          : "border-gold/12 bg-espresso/45 hover:border-gold/40",
                      )}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-ivory">
                          Pay Token Amount Only
                        </span>
                        <span className="font-serif text-xl text-gold-light">₹1,000</span>
                      </span>
                      <span className="mt-1.5 block text-[11.5px] leading-snug text-sand-dim">
                        Locks your bed for 48 hours. Balance paid at move-in.
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode("full")}
                      className={cn(
                        "w-full rounded-xl border p-4 text-left transition-all duration-300",
                        paymentMode === "full"
                          ? "border-gold bg-gold/10 shadow-[inset_0_0_30px_rgba(200,157,84,0.14)]"
                          : "border-gold/12 bg-espresso/45 hover:border-gold/40",
                      )}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-ivory">
                          Pay Full Move-In Amount
                        </span>
                        <span className="font-serif text-xl text-gold-light">{inr(q.moveInTotal)}</span>
                      </span>
                      <span className="mt-1.5 block text-[11.5px] leading-snug text-sand-dim">
                        First month + refundable deposit. Walk straight in on {moveInDate}.
                      </span>
                    </button>
                  </div>
                </div>

                <Panel className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-luxe text-gold">
                    Your selection
                  </p>
                  <ul className="mt-3 space-y-2 text-[12px]">
                    {[
                      { k: "Room", v: TIERS[tier].label },
                      { k: "Bed", v: selectedBed ? `${selectedBed.bedLabel} · ${selectedBed.position}` : "Not selected" },
                      { k: "Room no.", v: selectedBed?.roomCode ?? "—" },
                      { k: "Floor", v: FLOOR_LABEL[floor] },
                      { k: "Cooling", v: cooling === "ac" ? "Air Conditioned" : "Non-AC" },
                      { k: "Move-in", v: moveInDate },
                      { k: "Tenure", v: TENURES.find((t) => t.key === tenure)?.label ?? "" },
                      { k: "Resident", v: details.fullName || "—" },
                      { k: "Mobile", v: details.mobile || "—" },
                    ].map((r) => (
                      <li key={r.k} className="flex items-baseline justify-between gap-3">
                        <span className="text-sand-dim">{r.k}</span>
                        <span className="truncate text-right font-semibold text-ivory">{r.v}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 border-t border-gold/12 pt-3">
                    <p className="text-[11px] text-sand">
                      Paying now:{" "}
                      <strong className="text-gold-light">
                        {inr(paymentMode === "token" ? q.tokenPayable : q.moveInTotal)}
                      </strong>
                    </p>
                    <p className="mt-1 text-[11px] text-sand-dim">
                      Balance on move-in:{" "}
                      {inr(
                        paymentMode === "token"
                          ? Math.max(0, q.moveInTotal - q.tokenPayable)
                          : 0,
                      )}
                    </p>
                  </div>
                </Panel>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-gold/80 hover:text-gold-light"
                >
                  <Icon name="chevronleft" className="h-3.5 w-3.5" />
                  Change bed or configuration
                </button>
              </div>
            </div>

            {Object.keys(errors).some((k) => k !== "form" && errors[k]) ? (
              <p className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/8 px-4 py-3 text-[12px] text-danger">
                <Icon name="alert" className="h-4 w-4" />
                Some details still need attention — we&apos;ll take you back to the step that needs
                fixing.
              </p>
            ) : null}
          </div>
        ) : null}
      </ModalShell>
    </Modal>

    {showPayment && pendingBooking ? (
      <PaymentGateway
        amount={paymentMode === "token" ? q.tokenPayable : q.moveInTotal}
        bookingCode={pendingBooking.code}
        residentName={details.fullName || "Resident"}
        roomDetails={`${TIERS[tier].label} · Room ${selectedBed?.roomCode || ""}`}
        onSuccess={(txnId, method) => {
          setPaymentTxn({ id: txnId, method });
          const paidAmt = paymentMode === "token" ? q.tokenPayable : q.moveInTotal;
          const conf = {
            ...pendingBooking,
            amountPaid: paidAmt,
            balanceDue: Math.max(0, q.moveInTotal - paidAmt),
          };
          setConfirmed(conf);
          setShowPayment(false);
          setStep(5);
          reload();

          // Background auto notification trigger
          fetch("/api/notifications/whatsapp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "booking_warden", payload: conf }),
          }).catch(() => {});
        }}
        onCancel={() => {
          setShowPayment(false);
        }}
      />
    ) : null}
  </>
  );
}
