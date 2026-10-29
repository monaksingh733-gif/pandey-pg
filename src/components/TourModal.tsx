"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Field, Modal, ModalShell, Panel, Pill, SelectInput, TextInput, useCopy } from "./ui";
import { Icon } from "./Icon";
import { useAuth } from "@/context/AuthContext";
import { BRAND, ROOMS, waLink } from "@/lib/data";
import { TIERS, type TierKey } from "@/lib/pricing";
import { isEmail, isFutureDate, isMobile, todayISO } from "@/lib/validate";
import { cn } from "@/lib/cn";

const SLOTS = ["10 AM – 12 PM", "12 PM – 3 PM", "4 PM – 7 PM"];

const TYPES = [
  {
    key: "in-person",
    title: "In-Person PG Visit",
    icon: "building",
    note: "Walk the property with the warden, open every room type, taste the mess food.",
  },
  {
    key: "video",
    title: "Live WhatsApp Video Tour",
    icon: "chat",
    note: "Perfect for parents out of town. Live 20-minute walkthrough, ask anything.",
  },
] as const;

export function TourModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tourType, setTourType] = useState<"in-person" | "video">("in-person");
  const [date, setDate] = useState(todayISO(1));
  const [slot, setSlot] = useState(SLOTS[0]);
  const [visitors, setVisitors] = useState(2);
  const [tier, setTier] = useState<TierKey | "">("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [ticket, setTicket] = useState<{ reference: string } | null>(null);
  const [prevOpen, setPrevOpen] = useState(open);
  const { copied, copy } = useCopy();
  const { user } = useAuth();

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setState("idle");
      setTicket(null);
      setErrors({});
      if (user) {
        setForm((f) => ({
          ...f,
          name: f.name || user.name,
          email: f.email || user.email,
        }));
      }
    }
  }

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const prettyDate = useMemo(() => {
    const d = new Date(`${date}T00:00:00`);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }, [date]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 3) next.name = "Enter your full name.";
    if (!isMobile(form.phone)) next.phone = "Enter a valid 10-digit mobile number.";
    if (form.email && !isEmail(form.email)) next.email = "Enter a valid email address.";
    if (!isFutureDate(date)) next.date = "Pick a date between today and the next 6 months.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setState("sending");
    try {
      const res = await fetch("/api/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourType, date, slot, visitors, interestedTier: tier, ...form }),
      });
      const json = await res.json();
      if (json?.ok) {
        setTicket({ reference: json.tour.reference });
        setState("done");
      } else {
        setErrors(json?.errors ?? {});
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  if (state === "done" && ticket) {
    const msg = [
      `*PANDEY PG — Tour Request*`,
      `Reference: ${ticket.reference}`,
      `Type: ${tourType === "in-person" ? "In-Person PG Visit" : "Live WhatsApp Video Tour"}`,
      `Date: ${prettyDate}`,
      `Slot: ${slot}`,
      `Visitors: ${visitors}`,
      `Name: ${form.name} · ${form.phone}`,
      tier ? `Interested in: ${TIERS[tier].label}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return (
      <Modal open={open} onClose={onClose} ariaLabel="Tour confirmed" className="max-w-xl">
        <ModalShell
          title="Tour Slot Reserved"
          subtitle="The warden will confirm on WhatsApp within 30 minutes."
          onClose={onClose}
          footer={
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Button
                className="flex-1"
                icon="chat"
                onClick={() => window.open(waLink(msg), "_blank")}
              >
                Confirm on WhatsApp
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                icon="calendar"
                onClick={() => {
                  const ics = [
                    "BEGIN:VCALENDAR",
                    "VERSION:2.0",
                    "BEGIN:VEVENT",
                    `UID:${ticket.reference}@pandeypg`,
                    `SUMMARY:PANDEY PG ${tourType === "in-person" ? "Visit" : "Video Tour"}`,
                    `DESCRIPTION:Reference ${ticket.reference}. Slot ${slot}.`,
                    `LOCATION:${BRAND.address}`,
                    `DTSTART:${date.replace(/-/g, "")}T043000Z`,
                    "DURATION:PT1H",
                    "END:VEVENT",
                    "END:VCALENDAR",
                  ].join("\r\n");
                  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${ticket.reference}.ics`;
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1500);
                }}
              >
                Add to Calendar
              </Button>
            </div>
          }
        >
          <div className="animate-scale-in text-center">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-success/40 bg-success/12 text-success animate-pulse-ring">
              <Icon name="calendar" className="h-9 w-9" strokeWidth={1.5} />
            </span>
            <h3 className="mt-5 font-serif text-3xl text-ivory">
              {tourType === "in-person" ? "See you at PANDEY PG" : "Video tour locked in"}
            </h3>
            <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-sand">
              {prettyDate} · {slot} · {visitors} visitor{visitors > 1 ? "s" : ""}. Show this reference at
              the gate.
            </p>
            <button
              type="button"
              onClick={() => copy(ticket.reference, "ref")}
              className="mx-auto mt-5 flex items-center gap-2.5 rounded-xl border border-gold/35 bg-gold/8 px-5 py-2.5 transition-colors hover:bg-gold/15"
            >
              <span className="font-serif text-xl text-gold-light">{ticket.reference}</span>
              <Icon name={copied === "ref" ? "check" : "clipboard"} className="h-4 w-4 text-gold" />
            </button>
            {tourType === "video" ? (
              <p className="mx-auto mt-4 max-w-sm text-[12px] text-sand-dim">
                We will WhatsApp you a join link 15 minutes before the slot on {form.phone}.
              </p>
            ) : (
              <p className="mx-auto mt-4 max-w-sm text-[12px] text-sand-dim">
                Gate opens 9:00 AM. Parking available for two-wheelers; ask for the warden at reception.
              </p>
            )}
          </div>
        </ModalShell>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Schedule a tour" className="max-w-3xl">
      <ModalShell
        title="Schedule a Physical or Video Tour"
        subtitle="Free, no obligation, no payment required."
        onClose={onClose}
      >
        <form onSubmit={submit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTourType(t.key)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all duration-300",
                  tourType === t.key
                    ? "border-gold bg-gold/10 shadow-[inset_0_0_30px_rgba(200,157,84,0.14)]"
                    : "border-gold/12 bg-espresso/45 hover:border-gold/40",
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors",
                      tourType === t.key ? "border-gold bg-gold text-espresso" : "border-gold/30 text-gold",
                    )}
                  >
                    <Icon name={t.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-ivory">
                    {t.title}
                  </span>
                </span>
                <span className="mt-3 block text-[11.5px] leading-snug text-sand-dim">{t.note}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Tour date" required error={errors.date}>
              <TextInput
                type="date"
                value={date}
                min={todayISO(0)}
                invalid={Boolean(errors.date)}
                onChange={(e) => {
                  setDate(e.target.value);
                  setErrors((x) => ({ ...x, date: "" }));
                }}
              />
            </Field>
            <Field label="Number of visitors" hint="Max 4">
              <div className="flex items-center gap-3 rounded-lg border border-gold/15 bg-espresso/70 px-3 py-1.5">
                <button
                  type="button"
                  aria-label="Fewer visitors"
                  onClick={() => setVisitors((v) => Math.max(1, v - 1))}
                  className="grid h-8 w-8 place-items-center rounded-md border border-gold/25 text-gold transition-colors hover:bg-gold/10"
                >
                  <Icon name="minus" className="h-4 w-4" strokeWidth={2.4} />
                </button>
                <span className="flex-1 text-center font-serif text-lg text-ivory">{visitors}</span>
                <button
                  type="button"
                  aria-label="More visitors"
                  onClick={() => setVisitors((v) => Math.min(4, v + 1))}
                  className="grid h-8 w-8 place-items-center rounded-md border border-gold/25 text-gold transition-colors hover:bg-gold/10"
                >
                  <Icon name="plus" className="h-4 w-4" strokeWidth={2.4} />
                </button>
              </div>
            </Field>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-luxe text-gold">
              Preferred time slot
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlot(s)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-[11.5px] font-bold uppercase tracking-[0.1em] transition-all duration-300",
                    slot === s
                      ? "border-gold bg-gold/12 text-gold-light"
                      : "border-gold/12 bg-espresso/45 text-sand hover:border-gold/40 hover:text-ivory",
                  )}
                >
                  <Icon name="clock" className="h-4 w-4" />
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Visitor name" required error={errors.name}>
              <TextInput
                value={form.name}
                invalid={Boolean(errors.name)}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
              />
            </Field>
            <Field label="Phone number" required error={errors.phone} hint="WhatsApp preferred">
              <TextInput
                value={form.phone}
                invalid={Boolean(errors.phone)}
                onChange={(e) => set("phone", e.target.value.replace(/[^\d+\s-]/g, "").slice(0, 14))}
                placeholder="98765 43210"
                inputMode="numeric"
                autoComplete="tel"
              />
            </Field>
            <Field label="Email" hint="Optional" error={errors.email}>
              <TextInput
                type="email"
                value={form.email}
                invalid={Boolean(errors.email)}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Room type you want to see" hint="Optional">
              <SelectInput value={tier} onChange={(e) => setTier(e.target.value as TierKey | "")}>
                <option value="">All room types</option>
                {ROOMS.map((r) => (
                  <option key={r.tier} value={r.tier}>
                    {r.title} ({r.seats})
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Anything we should prepare?" className="sm:col-span-2" hint="Optional">
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value.slice(0, 300))}
                placeholder="e.g. Need to see a ground-floor AC double room, arriving with my father."
                className="w-full resize-none rounded-lg border border-gold/15 bg-espresso/70 px-3.5 py-2.5 text-sm text-ivory outline-none transition-all placeholder:text-sand-dim/70 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
              />
            </Field>
          </div>

          {state === "error" ? (
            <p className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/8 px-4 py-2.5 text-[12px] text-danger">
              <Icon name="alert" className="h-4 w-4" />
              Could not save the tour request. Please try again or call {BRAND.phone}.
            </p>
          ) : null}

          <Panel className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/35 bg-gold/10 text-gold">
              <Icon name="shield" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-ivory">
                Tours are free and never require a payment.
              </p>
              <p className="mt-1 text-[11.5px] leading-snug text-sand-dim">
                Warden-led, 30–45 minutes. Parents welcome — we happily show the mess kitchen, CCTV room
                and fire exits.
              </p>
            </div>
            <Pill tone="gold">
              <Icon name="timer" className="h-3.5 w-3.5" />
              {prettyDate}
            </Pill>
          </Panel>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" size="lg" className="flex-1" icon="calendar" disabled={state === "sending"}>
              {state === "sending" ? "Reserving slot…" : "Confirm Tour Slot"}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              icon="chat"
              onClick={() =>
                window.open(
                  waLink(
                    `Hi PANDEY PG! I'd like to book a ${tourType === "in-person" ? "physical visit" : "WhatsApp video tour"} on ${prettyDate}, ${slot}.`,
                  ),
                )
              }
            >
              Book via WhatsApp
            </Button>
          </div>
        </form>
      </ModalShell>
    </Modal>
  );
}
