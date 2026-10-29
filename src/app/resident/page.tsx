"use client";

import { useEffect, useState } from "react";
import { BRAND, waLink } from "@/lib/data";
import { inr } from "@/lib/pricing";
import type { DayMenu } from "@/lib/messMenu";

interface ResidentProfile {
  fullName: string;
  code: string;
  mobile: string;
  email: string;
  roomCode: string | null;
  bedLabel: string | null;
  tier: string;
  cooling: string;
  floor: string;
  moveInDate: string;
  monthlyTotal: number;
  deposit: number;
  amountPaid: number;
  balanceDue: number;
  emergencyName: string;
  emergencyPhone: string;
  category: string;
  institution: string | null;
  status: string;
}

interface TicketItem {
  id: number;
  ticketId: string;
  residentCode: string;
  residentName: string;
  roomCode: string;
  category: string;
  description: string;
  urgency: "normal" | "urgent";
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}

interface GatePassItem {
  id: number;
  passCode: string;
  residentCode: string;
  residentName: string;
  roomCode: string;
  mobile: string;
  passType: "late_entry" | "night_out";
  reason: string;
  departureTime: string;
  expectedReturn: string;
  status: "approved" | "pending" | "used";
  createdAt: string;
}

export default function ResidentPortalPage() {
  const [query, setQuery] = useState("");
  const [resident, setResident] = useState<ResidentProfile | null>(null);
  const [todayMenu, setTodayMenu] = useState<DayMenu | null>(null);
  const [fullWeekMenu, setFullWeekMenu] = useState<Record<number, DayMenu>>({});
  const [hasSkippedDinner, setHasSkippedDinner] = useState(false);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [gatePasses, setGatePasses] = useState<GatePassItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"mess" | "complaints" | "gatepass" | "receipt">("mess");

  // Complaint form state
  const [ticketCategory, setTicketCategory] = useState("AC & Cooling");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketUrgency, setTicketUrgency] = useState<"normal" | "urgent">("normal");
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState("");

  // Gate pass form state
  const [passType, setPassType] = useState<"late_entry" | "night_out">("late_entry");
  const [passReason, setPassReason] = useState("");
  const [passDeparture, setPassDeparture] = useState("10:00 PM");
  const [passReturn, setPassReturn] = useState("12:30 AM");
  const [passSubmitting, setPassSubmitting] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");

  const [showFullMenu, setShowFullMenu] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pandey_resident_query");
    if (saved) {
      setQuery(saved);
      loadResident(saved);
    }
  }, []);

  const loadResident = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/resident/portal?query=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Resident not found.");
        setResident(null);
      } else {
        setResident(data.resident);
        setTodayMenu(data.todayMenu);
        setFullWeekMenu(data.fullWeekMenu);
        setHasSkippedDinner(data.hasSkippedDinner);
        setTickets(data.tickets);
        setGatePasses(data.gatePasses);
        localStorage.setItem("pandey_resident_query", q.trim());
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadResident(query);
  };

  const handleLogout = () => {
    localStorage.removeItem("pandey_resident_query");
    setResident(null);
    setQuery("");
  };

  const handleToggleDinner = async () => {
    if (!resident) return;
    try {
      const res = await fetch("/api/resident/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_skip_dinner", residentCode: resident.code }),
      });
      const data = await res.json();
      if (data.ok) {
        setHasSkippedDinner(data.hasSkippedDinner);
        alert(data.message);
      }
    } catch {
      alert("Failed to toggle dinner attendance.");
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resident || !ticketDesc.trim()) return;
    setTicketSubmitting(true);
    setTicketSuccess("");
    try {
      const res = await fetch("/api/resident/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_ticket",
          residentCode: resident.code,
          category: ticketCategory,
          description: ticketDesc.trim(),
          urgency: ticketUrgency,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setTickets([data.ticket, ...tickets]);
        setTicketDesc("");
        setTicketSuccess("Complaint submitted! The warden and maintenance team have been alerted.");
        setTimeout(() => setTicketSuccess(""), 4000);
      } else {
        alert(data.error || "Failed to submit ticket.");
      }
    } catch {
      alert("Submission error.");
    } finally {
      setTicketSubmitting(false);
    }
  };

  const handleCreateGatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resident || !passReason.trim()) return;
    setPassSubmitting(true);
    setPassSuccess("");
    try {
      const res = await fetch("/api/resident/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_gate_pass",
          residentCode: resident.code,
          passType,
          reason: passReason.trim(),
          departureTime: passDeparture,
          expectedReturn: passReturn,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setGatePasses([data.gatePass, ...gatePasses]);
        setPassReason("");
        setPassSuccess(`Digital Gate Pass (${data.gatePass.passCode}) generated successfully!`);
        setTimeout(() => setPassSuccess(""), 4000);
      } else {
        alert(data.error || "Failed to generate pass.");
      }
    } catch {
      alert("Submission error.");
    } finally {
      setPassSubmitting(false);
    }
  };

  // Login view if not authenticated
  if (!resident) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#120D0A] px-4 font-sans text-ivory">
        <div className="w-full max-w-md rounded-2xl border border-gold/30 bg-[#1C140F] p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center">
            <span className="inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              Resident Self-Service
            </span>
            <h1 className="mt-4 font-serif text-3xl font-normal text-ivory">
              PANDEY <span className="text-gold-light italic">PG</span>
            </h1>
            <p className="mt-2 text-xs text-sand-dim">
              View today&apos;s mess menu, raise room maintenance tickets, and generate digital late entry gate passes.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-sand">
                Booking Code or Registered Mobile
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. #PANDEY-2026-1042 or 9876543210"
                className="mt-2 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-4 py-3 text-sm text-ivory placeholder:text-sand-dim/50 focus:border-gold focus:outline-none"
                autoFocus
              />
            </div>

            {error ? <p className="text-center text-xs font-medium text-danger">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-gold to-gold-light py-3 text-xs font-bold uppercase tracking-[0.16em] text-espresso transition-all hover:opacity-95 active:scale-98 disabled:opacity-50"
            >
              {loading ? "Finding Resident..." : "Open Resident Portal"}
            </button>
          </form>

          {/* Demo quick access */}
          <div className="mt-5 border-t border-gold/15 pt-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-sand-dim">Quick Testing:</p>
            <button
              type="button"
              onClick={() => {
                setQuery("9876543210");
                loadResident("9876543210");
              }}
              className="mt-2 rounded-lg border border-gold/25 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold/20"
            >
              👤 Login as Demo Resident (Aarav Sharma)
            </button>
          </div>

          <div className="mt-6 text-center">
            <a href="/" className="text-[11px] font-bold uppercase tracking-[0.12em] text-gold/70 hover:text-gold">
              ← Back to Main Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#120D0A] text-ivory">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[#17100C]/95 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="font-serif text-xl font-bold tracking-tight text-ivory">
              PANDEY <span className="text-gold-light">PG</span>
            </a>
            <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
              Resident Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
              className="hidden items-center gap-1.5 rounded-lg border border-gold/25 bg-coffee/40 px-3 py-1.5 text-xs text-sand sm:inline-flex"
            >
              <span>Emergency Warden:</span>
              <span className="font-bold text-gold-light">{BRAND.phone}</span>
            </a>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-gold/30 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gold hover:bg-gold/10"
            >
              Exit Portal
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        {/* Resident Summary Banner */}
        <div className="rounded-2xl border border-gold/25 bg-gradient-to-r from-[#1C140F] to-[#251A14] p-6 shadow-xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-sand-dim">Active Resident</span>
              </div>
              <h1 className="mt-1 font-serif text-2xl text-ivory sm:text-3xl">{resident.fullName}</h1>
              <p className="mt-1 text-xs text-sand">
                <strong className="text-gold-light">{resident.roomCode ? `Room ${resident.roomCode}` : "Room Assigned"}</strong> ({resident.bedLabel}) · <span className="capitalize">{resident.tier} Sharing</span> · {resident.cooling.toUpperCase()}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <div className="rounded-xl border border-gold/20 bg-[#120D0A]/70 px-4 py-2.5">
                <span className="block text-[9.5px] uppercase tracking-wider text-sand-dim">Pass Code</span>
                <span className="font-mono font-bold text-gold">{resident.code}</span>
              </div>
              <div className="rounded-xl border border-gold/20 bg-[#120D0A]/70 px-4 py-2.5">
                <span className="block text-[9.5px] uppercase tracking-wider text-sand-dim">Monthly Rent</span>
                <span className="font-bold text-gold-light">{inr(resident.monthlyTotal)}</span>
              </div>
              <div className="rounded-xl border border-gold/20 bg-[#120D0A]/70 px-4 py-2.5">
                <span className="block text-[9.5px] uppercase tracking-wider text-sand-dim">Wi-Fi Network</span>
                <span className="font-bold text-ivory">PANDEY-PG-5G</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-gold/20 pb-4">
          <button
            onClick={() => setActiveTab("mess")}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "mess" ? "bg-gold text-espresso" : "border border-gold/25 text-sand hover:bg-gold/10"
            }`}
          >
            🍲 Daily Mess Menu &amp; Attendance
          </button>
          <button
            onClick={() => setActiveTab("complaints")}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "complaints" ? "bg-gold text-espresso" : "border border-gold/25 text-sand hover:bg-gold/10"
            }`}
          >
            🔧 Maintenance &amp; Complaints ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab("gatepass")}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "gatepass" ? "bg-gold text-espresso" : "border border-gold/25 text-sand hover:bg-gold/10"
            }`}
          >
            🚪 Digital Gate Pass ({gatePasses.length})
          </button>
          <button
            onClick={() => setActiveTab("receipt")}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "receipt" ? "bg-gold text-espresso" : "border border-gold/25 text-sand hover:bg-gold/10"
            }`}
          >
            📄 Rent Receipt &amp; Room Info
          </button>
        </div>

        {/* TAB 1: DAILY MESS MENU */}
        {activeTab === "mess" && todayMenu && (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-gold/25 bg-[#17100C] p-6">
              <div className="flex flex-col justify-between gap-4 border-b border-gold/15 pb-4 sm:flex-row sm:items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Chef&apos;s Homely Kitchen</span>
                  <h2 className="mt-1 font-serif text-2xl text-ivory">Today&apos;s Menu ({todayMenu.day})</h2>
                  <p className="mt-0.5 text-xs text-sand-dim">Special: {todayMenu.special}</p>
                </div>

                {/* Dinner attendance toggle */}
                <div className="rounded-xl border border-gold/30 bg-[#1C140F] p-3 text-center sm:text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-sand-dim">
                    Dinner Attendance
                  </span>
                  <button
                    onClick={handleToggleDinner}
                    className={`mt-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                      hasSkippedDinner
                        ? "border border-danger/40 bg-danger/20 text-danger"
                        : "border border-success/40 bg-success/20 text-success"
                    }`}
                  >
                    {hasSkippedDinner ? "❌ Marked as Skipping Dinner" : "✅ Eating Dinner Tonight"}
                  </button>
                  <p className="mt-1 text-[9px] text-sand-dim">Tap to toggle (informs kitchen before 7 PM)</p>
                </div>
              </div>

              {/* Meal Courses Grid */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gold/20 bg-[#1C140F] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-light">🍳 Breakfast (8:00 – 10:00 AM)</span>
                  <p className="mt-2 text-xs leading-relaxed text-sand">{todayMenu.breakfast}</p>
                </div>

                <div className="rounded-xl border border-gold/20 bg-[#1C140F] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-light">🍛 Lunch (1:00 – 3:00 PM)</span>
                  <p className="mt-2 text-xs leading-relaxed text-sand">{todayMenu.lunch}</p>
                </div>

                <div className="rounded-xl border border-gold/20 bg-[#1C140F] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-light">☕ Evening Snacks (5:30 – 6:30 PM)</span>
                  <p className="mt-2 text-xs leading-relaxed text-sand">{todayMenu.snacks}</p>
                </div>

                <div className={`rounded-xl border p-4 ${hasSkippedDinner ? "border-danger/30 bg-danger/5" : "border-gold/20 bg-[#1C140F]"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold-light">🍲 Dinner (8:00 – 10:30 PM)</span>
                    {hasSkippedDinner && <span className="text-[9px] font-bold text-danger">SKIPPED</span>}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-sand">{todayMenu.dinner}</p>
                </div>
              </div>

              <div className="mt-6 border-t border-gold/10 pt-4 text-center">
                <button
                  onClick={() => setShowFullMenu(!showFullMenu)}
                  className="text-xs font-bold uppercase tracking-wider text-gold hover:text-gold-light"
                >
                  {showFullMenu ? "▲ Hide Weekly 7-Day Menu" : "▼ View Full Weekly 7-Day Schedule"}
                </button>
              </div>
            </div>

            {/* Weekly Menu Accordion */}
            {showFullMenu && (
              <div className="space-y-4">
                {Object.values(fullWeekMenu).map((m) => (
                  <div key={m.day} className="rounded-xl border border-gold/15 bg-[#17100C] p-4">
                    <h3 className="font-serif text-lg font-bold text-gold-light">{m.day} — {m.special}</h3>
                    <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-sand sm:grid-cols-4">
                      <p><strong className="text-ivory">Breakfast:</strong> {m.breakfast}</p>
                      <p><strong className="text-ivory">Lunch:</strong> {m.lunch}</p>
                      <p><strong className="text-ivory">Snacks:</strong> {m.snacks}</p>
                      <p><strong className="text-ivory">Dinner:</strong> {m.dinner}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MAINTENANCE & COMPLAINTS */}
        {activeTab === "complaints" && (
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Raise complaint form */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-gold/25 bg-[#17100C] p-6">
                <h2 className="font-serif text-2xl text-ivory">Raise Maintenance Request</h2>
                <p className="mt-1 text-xs text-sand-dim">
                  Our on-site warden and technicians resolve issues within 2 to 4 hours.
                </p>

                <form onSubmit={handleCreateTicket} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                    >
                      <option value="AC & Cooling">❄️ AC &amp; Cooling</option>
                      <option value="High-Speed Wi-Fi">📶 High-Speed Wi-Fi &amp; Network</option>
                      <option value="Plumbing & Geyser">🚿 Plumbing, Tap &amp; Geyser</option>
                      <option value="Electricity & Lighting">💡 Electricity &amp; Switches</option>
                      <option value="Daily Housekeeping">🧹 Daily Room Housekeeping</option>
                      <option value="Laundry & Washing">🧺 Automatic Laundry Service</option>
                      <option value="Other / Quiet Hours">🔊 Other / Noise Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">Urgency Level</label>
                    <div className="mt-1.5 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setTicketUrgency("normal")}
                        className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                          ticketUrgency === "normal"
                            ? "border border-gold bg-gold/15 text-gold"
                            : "border border-gold/20 text-sand-dim hover:bg-gold/5"
                        }`}
                      >
                        Normal (Today)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTicketUrgency("urgent")}
                        className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                          ticketUrgency === "urgent"
                            ? "border border-danger bg-danger/20 text-danger"
                            : "border border-gold/20 text-sand-dim hover:bg-gold/5"
                        }`}
                      >
                        Urgent (Within 2 Hrs)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">Describe the Issue</label>
                    <textarea
                      rows={3}
                      value={ticketDesc}
                      onChange={(e) => setTicketDesc(e.target.value)}
                      placeholder="e.g. Geyser switch in washroom not turning on, or AC water leakage..."
                      className="mt-1.5 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-4 py-2.5 text-xs text-ivory placeholder:text-sand-dim/50 focus:border-gold focus:outline-none"
                      required
                    />
                  </div>

                  {ticketSuccess && <p className="text-xs font-bold text-success">{ticketSuccess}</p>}

                  <button
                    type="submit"
                    disabled={ticketSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-gold to-gold-light py-2.5 text-xs font-bold uppercase tracking-wider text-espresso transition-all hover:opacity-95 disabled:opacity-50"
                  >
                    {ticketSubmitting ? "Submitting..." : "Submit Maintenance Ticket"}
                  </button>
                </form>
              </div>
            </div>

            {/* Tickets List */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-gold/25 bg-[#17100C] p-6">
                <div className="flex items-center justify-between border-b border-gold/15 pb-4">
                  <h3 className="font-serif text-xl text-ivory">Your Maintenance History</h3>
                  <span className="text-xs text-sand-dim">{tickets.length} total tickets</span>
                </div>

                <div className="mt-4 space-y-3">
                  {tickets.map((t) => (
                    <div key={t.id} className="rounded-xl border border-gold/15 bg-[#1C140F] p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-gold-light">{t.ticketId}</span>
                            <span className="text-[10px] text-sand-dim">· {t.category}</span>
                            {t.urgency === "urgent" && (
                              <span className="rounded bg-danger/20 px-1.5 py-0.5 text-[9px] font-bold text-danger">
                                URGENT
                              </span>
                            )}
                          </div>
                          <p className="mt-1.5 text-xs text-ivory">{t.description}</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${
                            t.status === "resolved"
                              ? "bg-success/20 text-success"
                              : t.status === "in_progress"
                              ? "bg-gold/20 text-gold-light"
                              : "bg-sand-dim/20 text-sand"
                          }`}
                        >
                          {t.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-gold/10 pt-2 text-[10px] text-sand-dim">
                        <span>Room {t.roomCode}</span>
                        <a
                          href={waLink(
                            `Hi Warden! Inquiring about maintenance ticket ${t.ticketId} (${t.category}) in Room ${t.roomCode}: "${t.description}". Could you please check?`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-gold hover:text-gold-light"
                        >
                          Escalate on WhatsApp →
                        </a>
                      </div>
                    </div>
                  ))}

                  {tickets.length === 0 && (
                    <p className="py-8 text-center text-xs text-sand-dim">No maintenance complaints raised yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DIGITAL GATE PASS */}
        {activeTab === "gatepass" && (
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-gold/25 bg-[#17100C] p-6">
                <h2 className="font-serif text-2xl text-ivory">Request Digital Gate Pass</h2>
                <p className="mt-1 text-xs text-sand-dim">
                  Main gate curfew is 11:00 PM. Generate a digital pass for late entry or weekend night-outs.
                </p>

                <form onSubmit={handleCreateGatePass} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">Pass Type</label>
                    <div className="mt-1.5 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setPassType("late_entry")}
                        className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                          passType === "late_entry"
                            ? "border border-gold bg-gold/15 text-gold"
                            : "border border-gold/20 text-sand-dim hover:bg-gold/5"
                        }`}
                      >
                        Late Entry (Up to 1:00 AM)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPassType("night_out")}
                        className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                          passType === "night_out"
                            ? "border border-gold bg-gold/15 text-gold"
                            : "border border-gold/20 text-sand-dim hover:bg-gold/5"
                        }`}
                      >
                        Night Out / Weekend Trip
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">Reason</label>
                    <input
                      type="text"
                      value={passReason}
                      onChange={(e) => setPassReason(e.target.value)}
                      placeholder="e.g. Library exam study, Office shift, Home visit..."
                      className="mt-1.5 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">Departure Time</label>
                      <input
                        type="text"
                        value={passDeparture}
                        onChange={(e) => setPassDeparture(e.target.value)}
                        placeholder="e.g. 9:30 PM"
                        className="mt-1.5 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">Expected Return</label>
                      <input
                        type="text"
                        value={passReturn}
                        onChange={(e) => setPassReturn(e.target.value)}
                        placeholder="e.g. 12:45 AM / Monday 9 AM"
                        className="mt-1.5 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-gold/15 bg-[#120D0A] p-3 text-[10px] text-sand-dim">
                    <p>
                      <strong>Parent Alert:</strong> An automated SMS alert is logged with emergency contact:{" "}
                      <span className="text-gold">{resident.emergencyName} ({resident.emergencyPhone})</span>.
                    </p>
                  </div>

                  {passSuccess && <p className="text-xs font-bold text-success">{passSuccess}</p>}

                  <button
                    type="submit"
                    disabled={passSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-gold to-gold-light py-2.5 text-xs font-bold uppercase tracking-wider text-espresso transition-all hover:opacity-95 disabled:opacity-50"
                  >
                    {passSubmitting ? "Generating..." : "Generate Digital Gate Pass"}
                  </button>
                </form>
              </div>
            </div>

            {/* Passes List */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-gold/25 bg-[#17100C] p-6">
                <div className="flex items-center justify-between border-b border-gold/15 pb-4">
                  <h3 className="font-serif text-xl text-ivory">Your Digital Gate Passes</h3>
                  <span className="text-xs text-sand-dim">{gatePasses.length} passes logged</span>
                </div>

                <div className="mt-4 space-y-4">
                  {gatePasses.map((p) => (
                    <div key={p.id} className="relative overflow-hidden rounded-2xl border border-gold/30 bg-[#1C140F] p-5 shadow-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-bold text-gold-light">{p.passCode}</span>
                            <span className="rounded bg-success/20 px-2 py-0.5 text-[10px] font-bold text-success uppercase">
                              {p.status}
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-sand">
                            {p.passType === "late_entry" ? "Late Entry Permission" : "Night Out / Travel Pass"}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="rounded-lg border border-gold/30 bg-[#120D0A] px-2.5 py-1 font-mono text-[11px] font-bold text-gold">
                            Room {p.roomCode}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-1.5 border-t border-gold/10 pt-3 text-xs text-sand">
                        <p><strong className="text-ivory">Reason:</strong> {p.reason}</p>
                        <p><strong className="text-ivory">Departure:</strong> {p.departureTime} · <strong className="text-ivory">Return:</strong> {p.expectedReturn}</p>
                        <p><strong className="text-ivory">Resident:</strong> {p.residentName} (+91 {p.mobile})</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-gold/10 pt-3">
                        <span className="text-[10px] text-sand-dim">Show this screen to security / night warden</span>
                        <a
                          href={waLink(
                            `*PANDEY PG DIGITAL GATE PASS*\nPass: ${p.passCode}\nResident: ${p.residentName}\nRoom: ${p.roomCode}\nType: ${p.passType === "late_entry" ? "Late Entry" : "Night Out"}\nReason: ${p.reason}\nExpected Return: ${p.expectedReturn}`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-[#25D366]/40 bg-[#25D366]/10 px-2.5 py-1 text-[10px] font-bold text-[#25D366] hover:bg-[#25D366]/20"
                        >
                          Send to Warden WA
                        </a>
                      </div>
                    </div>
                  ))}

                  {gatePasses.length === 0 && (
                    <p className="py-8 text-center text-xs text-sand-dim">No gate passes issued yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RENT RECEIPT & ROOM INFO */}
        {activeTab === "receipt" && (
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Printable Digital Receipt Card */}
            <div className="rounded-2xl border border-gold/30 bg-[#17100C] p-6 shadow-2xl">
              <div className="flex items-start justify-between border-b border-gold/20 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Official Digital Receipt</span>
                  <h3 className="font-serif text-2xl text-ivory">PANDEY PG &amp; LIVING</h3>
                  <p className="text-[11px] text-sand-dim">{BRAND.address}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-gold-light">{resident.code}</span>
                  <p className="text-[10px] text-sand-dim">Move-in: {resident.moveInDate}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-xs">
                <div className="flex justify-between border-b border-gold/10 pb-2">
                  <span className="text-sand-dim">Resident Name:</span>
                  <strong className="text-ivory">{resident.fullName}</strong>
                </div>
                <div className="flex justify-between border-b border-gold/10 pb-2">
                  <span className="text-sand-dim">Mobile Number:</span>
                  <span className="text-sand">+91 {resident.mobile}</span>
                </div>
                <div className="flex justify-between border-b border-gold/10 pb-2">
                  <span className="text-sand-dim">Allocated Room &amp; Bed:</span>
                  <strong className="text-gold-light">{resident.roomCode ? `Room ${resident.roomCode}` : "Room Assigned"} ({resident.bedLabel})</strong>
                </div>
                <div className="flex justify-between border-b border-gold/10 pb-2">
                  <span className="text-sand-dim">Room Category:</span>
                  <span className="capitalize text-sand">{resident.tier} Sharing · {resident.cooling.toUpperCase()}</span>
                </div>
                <div className="flex justify-between border-b border-gold/10 pb-2">
                  <span className="text-sand-dim">Emergency Contact:</span>
                  <span className="text-sand">{resident.emergencyName} (+91 {resident.emergencyPhone})</span>
                </div>
                <div className="flex justify-between border-b border-gold/10 pb-2">
                  <span className="text-sand-dim">Monthly Rent Total:</span>
                  <strong className="text-ivory">{inr(resident.monthlyTotal)} / month</strong>
                </div>
                <div className="flex justify-between border-b border-gold/10 pb-2">
                  <span className="text-sand-dim">Security Deposit:</span>
                  <span className="text-sand">{inr(resident.deposit)} (Refundable)</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-bold text-success">Advance Paid:</span>
                  <strong className="font-serif text-lg text-success">{inr(resident.amountPaid)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sand-dim">Balance Due at Check-in:</span>
                  <strong className="font-serif text-lg text-gold-light">{inr(resident.balanceDue)}</strong>
                </div>
              </div>

              <div className="mt-6 flex gap-3 border-t border-gold/15 pt-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 rounded-xl border border-gold/30 bg-gold/10 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-gold hover:bg-gold/20"
                >
                  🖨️ Print Receipt
                </button>
                <a
                  href={`/pass/${resident.code.replace("#", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-xl bg-gradient-to-r from-gold to-gold-light py-2.5 text-center text-xs font-bold uppercase tracking-wider text-espresso"
                >
                  View Digital Pass →
                </a>
              </div>
            </div>

            {/* Room Wi-Fi & Property Details */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-gold/25 bg-[#17100C] p-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold">High-Speed Wi-Fi</span>
                <h3 className="mt-1 font-serif text-xl text-ivory">Floor Network Credentials</h3>
                <div className="mt-4 space-y-3 rounded-xl border border-gold/15 bg-[#120D0A] p-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-sand-dim">Network SSID (5GHz / 2.4GHz):</span>
                    <strong className="font-mono text-gold-light">PANDEY-PG-5G</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand-dim">Wi-Fi Password:</span>
                    <strong className="font-mono text-ivory">pandey@luxury2026</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand-dim">Speed:</span>
                    <span className="text-success font-medium">300 Mbps Dual-Band Fiber</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gold/25 bg-[#17100C] p-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold">House Rules &amp; Guidelines</span>
                <h3 className="mt-1 font-serif text-xl text-ivory">Important Resident Timings</h3>
                <ul className="mt-4 space-y-2 text-xs text-sand">
                  <li>• <strong>Main Gate Curfew:</strong> Closes at 11:00 PM. Late entry permitted up to 1:00 AM with digital gate pass.</li>
                  <li>• <strong>Mess Timings:</strong> Breakfast (8–10 AM), Lunch (1–3 PM), Snacks (5:30–6:30 PM), Dinner (8–10:30 PM).</li>
                  <li>• <strong>Electricity Sub-Meter:</strong> Readings taken on 1st of every month at ₹8.50/unit.</li>
                  <li>• <strong>Visitor Policy:</strong> Outside guests permitted in reception lounge; rooms are strictly for registered residents.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
