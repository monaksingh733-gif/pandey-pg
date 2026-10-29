"use client";

import { useEffect, useState, useMemo } from "react";
import { BRAND, waLink } from "@/lib/data";
import { createWaLink, WhatsAppTemplates } from "@/lib/whatsapp";
import { inr } from "@/lib/pricing";

interface BedItem {
  id: number;
  bedKey: string;
  roomCode: string;
  bedLabel: string;
  tier: string;
  cooling: string;
  floor: string;
  status: "available" | "occupied" | "reserved";
  residentName: string | null;
  residentPhone: string | null;
  bookingCode: string | null;
}

interface BookingItem {
  id: number;
  code: string;
  bedLabel: string | null;
  roomCode: string | null;
  tier: string;
  cooling: string;
  floor: string;
  fullName: string;
  mobile: string;
  email: string;
  emergencyName: string;
  emergencyPhone: string;
  monthlyTotal: number;
  amountPaid: number;
  moveInDate: string;
  status: string;
  createdAt: string;
  notes: string | null;
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

interface EnquiryItem {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  tier: string | null;
  moveIn: string | null;
  message: string;
  createdAt: string;
}

interface RentRecordItem {
  id: number;
  recordCode: string;
  bookingCode: string;
  residentName: string;
  mobile: string;
  roomCode: string;
  bedLabel: string;
  tier: string;
  month: string;
  baseRent: number;
  electricityUnits: number;
  electricityAmount: number;
  otherCharges: number;
  totalDue: number;
  amountPaid: number;
  balanceDue: number;
  dueDate: string;
  daysOverdue: number;
  status: "paid" | "overdue" | "pending";
  paidAt?: string;
  paymentMode?: "UPI" | "Cash" | "Bank Transfer";
}

interface RentSummaryData {
  totalExpected: number;
  totalCollected: number;
  totalOverdue: number;
  collectionRate: number;
  paidCount: number;
  overdueCount: number;
  pendingCount: number;
}

interface SummaryData {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  totalBookings: number;
  totalRevenue: number;
  projectedMonthly: number;
  totalEnquiries: number;
  rentSummary?: RentSummaryData;
}

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [beds, setBeds] = useState<BedItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [gatePasses, setGatePasses] = useState<GatePassItem[]>([]);
  const [mealSkipsCount, setMealSkipsCount] = useState(0);
  const [rentLedger, setRentLedger] = useState<RentRecordItem[]>([]);

  const [activeTab, setActiveTab] = useState<
    "floorplan" | "bookings" | "rent" | "tickets" | "gatepass" | "electricity" | "enquiries"
  >("rent");

  // Rent Ledger Filters & Search
  const [rentFilter, setRentFilter] = useState<"all" | "overdue" | "paid" | "pending">("all");
  const [rentSearch, setRentSearch] = useState("");

  // Sub-Meter Modal for individual rent record
  const [editingMeterRecord, setEditingMeterRecord] = useState<RentRecordItem | null>(null);
  const [editMeterPrev, setEditMeterPrev] = useState<number | "">("");
  const [editMeterCurr, setEditMeterCurr] = useState<number | "">("");
  const [editMeterUnitsManual, setEditMeterUnitsManual] = useState<number | "">("");

  // Defaulter Recovery Modal & Batch Actions
  const [batchReminderModal, setBatchReminderModal] = useState(false);
  const [createInvoiceModal, setCreateInvoiceModal] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New Invoice Form State
  const [newInvResident, setNewInvResident] = useState("");
  const [newInvMobile, setNewInvMobile] = useState("");
  const [newInvRoom, setNewInvRoom] = useState("101A");
  const [newInvBed, setNewInvBed] = useState("Bed A");
  const [newInvTier, setNewInvTier] = useState("Double Sharing");
  const [newInvMonth, setNewInvMonth] = useState("October 2026");
  const [newInvBaseRent, setNewInvBaseRent] = useState<number | "">(12500);
  const [newInvElecUnits, setNewInvElecUnits] = useState<number | "">(50);
  const [newInvDueDate, setNewInvDueDate] = useState("05 Nov 2026");

  // Electricity standalone calculator state
  const [meterRoom, setMeterRoom] = useState("101A");
  const [meterResident, setMeterResident] = useState("");
  const [prevReading, setPrevReading] = useState<number | "">("");
  const [currReading, setCurrReading] = useState<number | "">("");
  const [ratePerUnit] = useState(8.5);

  useEffect(() => {
    const savedPin = localStorage.getItem("pandey_warden_pin");
    if (savedPin) {
      setPin(savedPin);
      fetchData(savedPin);
    }
  }, []);

  const fetchData = async (enteredPin: string) => {
    setLoading(true);
    setPinError("");
    try {
      const res = await fetch(`/api/admin/overview?pin=${encodeURIComponent(enteredPin)}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setPinError(data.error || "Incorrect Warden PIN.");
        setAuthenticated(false);
        localStorage.removeItem("pandey_warden_pin");
      } else {
        setSummary(data.summary);
        setBeds(data.beds);
        setBookings(data.bookings);
        setEnquiries(data.enquiries);
        setTickets(data.tickets || []);
        setGatePasses(data.gatePasses || []);
        setMealSkipsCount(data.mealSkipsCount || 0);
        setRentLedger(data.rentLedger || []);
        setAuthenticated(true);
        localStorage.setItem("pandey_warden_pin", enteredPin);
      }
    } catch {
      setPinError("Connection failed. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    fetchData(pin.trim());
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPin("");
    localStorage.removeItem("pandey_warden_pin");
  };

  const handleStatusChange = async (code: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, action: "update_booking_status", code, status: newStatus }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchData(pin);
      } else {
        alert(data.error || "Action failed");
      }
    } catch {
      alert("Failed to update status");
    }
  };

  const handleTicketStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, action: "update_ticket_status", ticketId, status: newStatus }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchData(pin);
      } else {
        alert(data.error || "Action failed");
      }
    } catch {
      alert("Failed to update ticket status");
    }
  };

  const handleBedToggle = async (bedId: number, currentStatus: string) => {
    const isAvail = currentStatus !== "available";
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, action: "toggle_bed", bedId, isAvailable: isAvail }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchData(pin);
      } else {
        alert(data.error || "Action failed");
      }
    } catch {
      alert("Failed to toggle bed");
    }
  };

  // Mark Rent as Paid via UPI, Cash, or Bank Transfer
  const handleMarkRentPaid = async (recordCode: string, mode: "UPI" | "Cash" | "Bank Transfer") => {
    setActionLoading(recordCode);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, action: "mark_rent_paid", recordCode, paymentMode: mode }),
      });
      const data = await res.json();
      if (data.ok) {
        setActionSuccessMsg(`✓ ${recordCode} marked as FULLY PAID via ${mode}!`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
        fetchData(pin);
      } else {
        alert(data.error || "Failed to mark rent as paid.");
      }
    } catch {
      alert("Connection error while updating payment status.");
    } finally {
      setActionLoading(null);
    }
  };

  // Update Sub-Meter Units for a specific Rent Record
  const handleSaveMeterUnits = async () => {
    if (!editingMeterRecord) return;
    const computedUnits =
      typeof editMeterPrev === "number" && typeof editMeterCurr === "number" && editMeterCurr >= editMeterPrev
        ? editMeterCurr - editMeterPrev
        : typeof editMeterUnitsManual === "number"
        ? editMeterUnitsManual
        : 0;

    setActionLoading(editingMeterRecord.recordCode);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin,
          action: "update_rent_electricity",
          recordCode: editingMeterRecord.recordCode,
          electricityUnits: computedUnits,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setActionSuccessMsg(`⚡ Sub-meter updated: ${computedUnits} units (₹${Math.round(computedUnits * 8.5)})`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
        setEditingMeterRecord(null);
        fetchData(pin);
      } else {
        alert(data.error || "Failed to update electricity.");
      }
    } catch {
      alert("Connection error while updating electricity units.");
    } finally {
      setActionLoading(null);
    }
  };

  // Create a Fresh Monthly Rent Invoice
  const handleCreateNewInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvResident || !newInvRoom || !newInvBaseRent) {
      alert("Please provide resident name, room, and base rent.");
      return;
    }
    setActionLoading("create_invoice");
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin,
          action: "create_rent_record",
          residentName: newInvResident,
          mobile: newInvMobile || "9876543210",
          roomCode: newInvRoom,
          bedLabel: newInvBed,
          tier: newInvTier,
          month: newInvMonth,
          baseRent: Number(newInvBaseRent),
          electricityUnits: Number(newInvElecUnits) || 0,
          otherCharges: 0,
          dueDate: newInvDueDate,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setActionSuccessMsg(`Created monthly rent invoice for ${newInvResident}!`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
        setCreateInvoiceModal(false);
        setNewInvResident("");
        fetchData(pin);
      } else {
        alert(data.error || "Failed to generate invoice.");
      }
    } catch {
      alert("Connection error while creating invoice.");
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered & Searched Rent Records
  const filteredRentLedger = useMemo(() => {
    return rentLedger.filter((item) => {
      if (rentFilter === "overdue" && item.status !== "overdue") return false;
      if (rentFilter === "paid" && item.status !== "paid") return false;
      if (rentFilter === "pending" && item.status !== "pending") return false;

      if (rentSearch.trim()) {
        const q = rentSearch.toLowerCase().trim();
        const matchName = item.residentName.toLowerCase().includes(q);
        const matchRoom = item.roomCode.toLowerCase().includes(q);
        const matchCode = item.recordCode.toLowerCase().includes(q);
        const matchPhone = item.mobile.includes(q);
        if (!matchName && !matchRoom && !matchCode && !matchPhone) return false;
      }

      return true;
    });
  }, [rentLedger, rentFilter, rentSearch]);

  const overdueDefaulters = useMemo(() => {
    return rentLedger.filter((item) => item.status === "overdue");
  }, [rentLedger]);

  // Group beds by floor
  const floorGroups = useMemo(() => {
    const floors: Record<string, BedItem[]> = { "1st": [], "2nd": [], "3rd": [] };
    beds.forEach((b) => {
      const f = b.floor || "1st";
      if (!floors[f]) floors[f] = [];
      floors[f].push(b);
    });
    return floors;
  }, [beds]);

  // Standalone electricity calculator
  const unitsConsumed =
    typeof prevReading === "number" && typeof currReading === "number" && currReading >= prevReading
      ? currReading - prevReading
      : 0;
  const electricityAmount = Math.round(unitsConsumed * ratePerUnit);

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#120D0A] px-4 font-sans text-ivory">
        <div className="w-full max-w-md rounded-2xl border border-gold/30 bg-[#1C140F] p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center">
            <span className="inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              Warden &amp; Management Portal
            </span>
            <h1 className="mt-4 font-serif text-3xl font-normal text-ivory">
              PANDEY <span className="text-gold-light italic">PG</span>
            </h1>
            <p className="mt-2 text-xs text-sand-dim">
              Enter your 4-digit Warden Security PIN to manage resident bookings, monthly rent, and operations.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-sand">
                Warden PIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN (Default: 9548)"
                className="mt-2 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-4 py-3 text-center text-xl tracking-[0.3em] text-gold placeholder:tracking-normal placeholder:text-sand-dim/50 focus:border-gold focus:outline-none"
                autoFocus
              />
            </div>

            {pinError ? (
              <p className="text-center text-xs font-medium text-danger">{pinError}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-gold to-gold-light py-3 text-xs font-bold uppercase tracking-[0.16em] text-espresso transition-all hover:opacity-95 active:scale-98 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Unlock Console"}
            </button>
          </form>

          <div className="mt-6 border-t border-gold/15 pt-4 text-center">
            <a
              href="/"
              className="text-[11px] font-bold uppercase tracking-[0.12em] text-gold/70 hover:text-gold"
            >
              ← Back to Main Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#120D0A] text-ivory">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-success/40 bg-[#1C140F] px-4 py-3 text-xs font-bold text-success shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4">
          <span className="h-2 w-2 rounded-full bg-success animate-ping" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[#17100C]/95 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="font-serif text-xl font-bold tracking-tight text-ivory">
              PANDEY <span className="text-gold-light">PG</span>
            </a>
            <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
              Warden Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
              className="hidden items-center gap-1.5 rounded-lg border border-gold/25 bg-coffee/40 px-3 py-1.5 text-xs text-sand sm:inline-flex"
            >
              <span>Warden Phone:</span>
              <span className="font-bold text-gold-light">{BRAND.phone}</span>
            </a>
            <button
              onClick={() => fetchData(pin)}
              className="rounded-lg border border-gold/30 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gold hover:bg-gold/10"
              title="Refresh Data"
            >
              ↻ Refresh
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-danger hover:bg-danger/20"
            >
              Lock
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        {/* Summary Stats Cards */}
        {summary && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            <div className="rounded-xl border border-gold/25 bg-[#1C140F] p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sand-dim">Total Beds</span>
              <p className="mt-1 font-serif text-2xl text-ivory">{summary.totalBeds}</p>
            </div>
            <div className="rounded-xl border border-success/30 bg-success/5 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-success">Available Beds</span>
              <p className="mt-1 font-serif text-2xl text-success">{summary.availableBeds}</p>
            </div>
            <div className="rounded-xl border border-gold/30 bg-[#1C140F] p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sand-dim">Occupied / Reserved</span>
              <p className="mt-1 font-serif text-2xl text-gold-light">{summary.occupiedBeds}</p>
            </div>
            <div className="rounded-xl border border-gold/25 bg-[#1C140F] p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sand-dim">Occupancy Rate</span>
              <p className="mt-1 font-serif text-2xl text-ivory">{summary.occupancyRate}%</p>
            </div>
            <div className="rounded-xl border border-gold/25 bg-[#1C140F] p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sand-dim">Total Bookings</span>
              <p className="mt-1 font-serif text-2xl text-gold-light">{summary.totalBookings}</p>
            </div>
            <div className="rounded-xl border border-gold/25 bg-[#1C140F] p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sand-dim">Monthly Target</span>
              <p className="mt-1 font-serif text-xl text-gold-light">
                {summary.rentSummary ? inr(summary.rentSummary.totalExpected) : inr(summary.projectedMonthly)}
              </p>
            </div>
            {summary.rentSummary && (
              <div className="rounded-xl border border-danger/40 bg-danger/10 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-danger">Rent Overdue</span>
                <p className="mt-1 font-serif text-xl font-bold text-danger">{inr(summary.rentSummary.totalOverdue)}</p>
                <span className="text-[10px] text-danger/90">{summary.rentSummary.overdueCount} defaulters</span>
              </div>
            )}
            <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-danger">Dinner Skips</span>
              <p className="mt-1 font-serif text-2xl text-danger">{mealSkipsCount}</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-gold/20 pb-4">
          <button
            onClick={() => setActiveTab("rent")}
            className={`relative rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "rent"
                ? "bg-gold text-espresso shadow-lg font-extrabold"
                : "border border-gold/25 text-sand hover:bg-gold/10"
            }`}
          >
            <span>💰 Rent Ledger &amp; Overdue Tracker ({rentLedger.length})</span>
            {summary?.rentSummary && summary.rentSummary.overdueCount > 0 && (
              <span className="ml-2 rounded-full bg-danger px-1.5 py-0.5 text-[9px] font-black text-white">
                {summary.rentSummary.overdueCount} Overdue
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("floorplan")}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "floorplan"
                ? "bg-gold text-espresso"
                : "border border-gold/25 text-sand hover:bg-gold/10"
            }`}
          >
            🏢 Live Bed &amp; Floor Map ({beds.length})
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "bookings"
                ? "bg-gold text-espresso"
                : "border border-gold/25 text-sand hover:bg-gold/10"
            }`}
          >
            📋 Resident Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "tickets"
                ? "bg-gold text-espresso"
                : "border border-gold/25 text-sand hover:bg-gold/10"
            }`}
          >
            🔧 Complaints ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab("gatepass")}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "gatepass"
                ? "bg-gold text-espresso"
                : "border border-gold/25 text-sand hover:bg-gold/10"
            }`}
          >
            🚪 Gate Passes ({gatePasses.length})
          </button>
          <button
            onClick={() => setActiveTab("electricity")}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "electricity"
                ? "bg-gold text-espresso"
                : "border border-gold/25 text-sand hover:bg-gold/10"
            }`}
          >
            ⚡ Sub-Meter Calculator
          </button>
          <button
            onClick={() => setActiveTab("enquiries")}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "enquiries"
                ? "bg-gold text-espresso"
                : "border border-gold/25 text-sand hover:bg-gold/10"
            }`}
          >
            📩 Contact Enquiries ({enquiries.length})
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB: MONTHLY RENT LEDGER & OVERDUE RECOVERY TRACKER           */}
        {/* ============================================================== */}
        {activeTab === "rent" && (
          <div className="mt-6 space-y-6">
            {/* KPI Overview Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Expected Rent */}
              <div className="rounded-2xl border border-gold/30 bg-[#17100C] p-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sand-dim">
                  October 2026 Target Rent
                </span>
                <p className="mt-2 font-serif text-3xl font-normal text-ivory">
                  {summary?.rentSummary ? inr(summary.rentSummary.totalExpected) : inr(0)}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-sand-dim">
                  <span>Across {rentLedger.length} Resident Invoices</span>
                  <span className="text-gold-light">₹8.50/unit submeter</span>
                </div>
              </div>

              {/* Total Collected with Progress Bar */}
              <div className="rounded-2xl border border-success/30 bg-success/5 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-success">
                    Collected Revenue
                  </span>
                  <span className="rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-bold text-success">
                    {summary?.rentSummary?.collectionRate || 0}% Realized
                  </span>
                </div>
                <p className="mt-2 font-serif text-3xl font-bold text-success">
                  {summary?.rentSummary ? inr(summary.rentSummary.totalCollected) : inr(0)}
                </p>
                {/* Progress bar */}
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-success/15">
                  <div
                    style={{ width: `${summary?.rentSummary?.collectionRate || 0}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-success to-emerald-400 transition-all duration-500"
                  />
                </div>
              </div>

              {/* Outstanding Overdue */}
              <div className="rounded-2xl border border-danger/40 bg-danger/10 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-danger">
                    Pending / Overdue Deficit
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-danger/25 px-2 py-0.5 text-[10px] font-bold text-danger">
                    <span className="h-1.5 w-1.5 rounded-full bg-danger animate-ping" />
                    {summary?.rentSummary?.overdueCount || 0} Defaulters
                  </span>
                </div>
                <p className="mt-2 font-serif text-3xl font-bold text-danger">
                  {summary?.rentSummary ? inr(summary.rentSummary.totalOverdue) : inr(0)}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-danger/80">
                  <span>Due on 5th of Month</span>
                  <span>Avg Overdue: 24 Days</span>
                </div>
              </div>

              {/* Quick Warden Action Center */}
              <div className="flex flex-col justify-between rounded-2xl border border-gold/30 bg-[#1C140F] p-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                    Warden Rapid Actions
                  </span>
                  <p className="mt-1 text-xs text-sand-dim">
                    Chase defaulters with personalized WhatsApp notices or generate fresh rent bills.
                  </p>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => setBatchReminderModal(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-[#20ba59]"
                  >
                    <span>📢 WhatsApp Defaulters Desk ({overdueDefaulters.length})</span>
                  </button>
                  <button
                    onClick={() => setCreateInvoiceModal(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold/30 bg-coffee/50 px-3 py-2 text-xs font-bold text-gold hover:bg-gold/15"
                  >
                    <span>+ Generate New Rent Bill</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-4 rounded-2xl border border-gold/20 bg-[#17100C] p-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Filter Pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setRentFilter("all")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    rentFilter === "all"
                      ? "bg-gold text-espresso shadow"
                      : "border border-gold/20 text-sand hover:bg-gold/10"
                  }`}
                >
                  All Invoices ({rentLedger.length})
                </button>
                <button
                  onClick={() => setRentFilter("overdue")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    rentFilter === "overdue"
                      ? "bg-danger text-white shadow"
                      : "border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-danger animate-pulse" />
                  Overdue Defaulters ({summary?.rentSummary?.overdueCount || 0})
                </button>
                <button
                  onClick={() => setRentFilter("paid")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    rentFilter === "paid"
                      ? "bg-success text-white shadow"
                      : "border border-success/30 bg-success/10 text-success hover:bg-success/20"
                  }`}
                >
                  Fully Paid ({summary?.rentSummary?.paidCount || 0})
                </button>
              </div>

              {/* Search Box */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={rentSearch}
                  onChange={(e) => setRentSearch(e.target.value)}
                  placeholder="Search resident, room, invoice..."
                  className="w-full sm:w-64 rounded-xl border border-gold/30 bg-[#120D0A] px-3.5 py-1.5 text-xs text-ivory placeholder:text-sand-dim/50 focus:border-gold focus:outline-none"
                />
                {rentSearch && (
                  <button
                    onClick={() => setRentSearch("")}
                    className="text-xs text-sand-dim hover:text-ivory"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Rent Records Table */}
            <div className="overflow-hidden rounded-2xl border border-gold/20 bg-[#17100C]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-gold/20 bg-coffee/50 text-[10px] font-bold uppercase tracking-wider text-sand-dim">
                    <tr>
                      <th className="px-4 py-3.5">Invoice &amp; Due Date</th>
                      <th className="px-4 py-3.5">Resident &amp; Room</th>
                      <th className="px-4 py-3.5">Base Rent</th>
                      <th className="px-4 py-3.5">Sub-Meter Units (₹8.50)</th>
                      <th className="px-4 py-3.5">Total Bill</th>
                      <th className="px-4 py-3.5">Paid / Outstanding</th>
                      <th className="px-4 py-3.5">Status &amp; Age</th>
                      <th className="px-4 py-3.5 text-right">1-Click Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/10">
                    {filteredRentLedger.map((r) => {
                      const isOverdue = r.status === "overdue";
                      const isPaid = r.status === "paid";
                      const isUpdating = actionLoading === r.recordCode;

                      return (
                        <tr
                          key={r.id}
                          className={`transition-colors hover:bg-gold/5 ${
                            isOverdue ? "bg-danger/5" : ""
                          }`}
                        >
                          {/* Invoice ID & Due Date */}
                          <td className="px-4 py-4">
                            <p className="font-mono font-bold text-gold-light">{r.recordCode}</p>
                            <p className="text-[11px] text-sand-dim">Due: {r.dueDate}</p>
                            <span className="inline-block text-[10px] text-sand/60">{r.month}</span>
                          </td>

                          {/* Resident & Room */}
                          <td className="px-4 py-4">
                            <p className="font-bold text-ivory text-sm">{r.residentName}</p>
                            <p className="text-sand-dim">
                              Room {r.roomCode} · {r.bedLabel}
                            </p>
                            <a
                              href={`tel:${r.mobile}`}
                              className="text-[11px] text-gold/80 hover:text-gold hover:underline"
                            >
                              📞 +91 {r.mobile}
                            </a>
                          </td>

                          {/* Base Rent */}
                          <td className="px-4 py-4 text-ivory font-medium">
                            <p>{inr(r.baseRent)}</p>
                            <p className="text-[10px] text-sand-dim">Meals + Wi-Fi inc.</p>
                          </td>

                          {/* Sub-Meter Electricity */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="font-bold text-gold-light">{inr(r.electricityAmount)}</p>
                                <p className="text-[10px] text-sand-dim">{r.electricityUnits} units</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMeterRecord(r);
                                  setEditMeterUnitsManual(r.electricityUnits);
                                  setEditMeterPrev("");
                                  setEditMeterCurr("");
                                }}
                                className="rounded border border-gold/30 bg-coffee/40 px-1.5 py-0.5 text-[9px] font-bold text-gold hover:bg-gold/20"
                                title="Edit Sub-Meter Electricity Units"
                              >
                                ✏️ Meter
                              </button>
                            </div>
                          </td>

                          {/* Total Bill */}
                          <td className="px-4 py-4 font-serif text-sm font-bold text-ivory">
                            {inr(r.totalDue)}
                          </td>

                          {/* Paid / Outstanding */}
                          <td className="px-4 py-4">
                            <p className="text-[11px] text-success">Paid: {inr(r.amountPaid)}</p>
                            {r.balanceDue > 0 ? (
                              <p className="font-bold text-danger text-sm">
                                Due: {inr(r.balanceDue)}
                              </p>
                            ) : (
                              <p className="font-bold text-success text-[11px]">✓ Nil (Settled)</p>
                            )}
                          </td>

                          {/* Status & Overdue Age */}
                          <td className="px-4 py-4">
                            {isOverdue && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-danger">
                                <span className="h-1.5 w-1.5 rounded-full bg-danger animate-ping" />
                                {r.daysOverdue} Days Overdue
                              </span>
                            )}
                            {isPaid && (
                              <div className="space-y-0.5">
                                <span className="inline-block rounded-full border border-success/40 bg-success/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success">
                                  ✓ Paid ({r.paymentMode || "UPI"})
                                </span>
                                {r.paidAt && (
                                  <p className="text-[10px] text-sand-dim">On {r.paidAt}</p>
                                )}
                              </div>
                            )}
                            {r.status === "pending" && (
                              <span className="inline-block rounded-full border border-gold/40 bg-gold/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold">
                                Due on {r.dueDate}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4 text-right">
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              {/* 1-Click WhatsApp Reminder */}
                              <button
                                type="button"
                                onClick={() => {
                                  const text = WhatsAppTemplates.overdueRentReminderToResident({
                                    residentName: r.residentName,
                                    roomCode: r.roomCode,
                                    month: r.month,
                                    baseRent: r.baseRent,
                                    electricityUnits: r.electricityUnits,
                                    electricityAmount: r.electricityAmount,
                                    otherCharges: r.otherCharges,
                                    totalDue: r.totalDue,
                                    amountPaid: r.amountPaid,
                                    balanceDue: r.balanceDue,
                                    daysOverdue: r.daysOverdue || 0,
                                    dueDate: r.dueDate,
                                  });
                                  window.open(createWaLink(r.mobile, text), "_blank");
                                }}
                                className="flex items-center gap-1 rounded-md border border-[#25D366]/40 bg-[#25D366]/15 px-2.5 py-1 text-[10px] font-bold text-[#25D366] hover:bg-[#25D366]/30 transition-all"
                                title="Send Detailed Overdue Bill Notice on WhatsApp"
                              >
                                <span>📲 Remind WA</span>
                              </button>

                              {/* Mark Paid Options */}
                              {!isPaid && (
                                <>
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => handleMarkRentPaid(r.recordCode, "UPI")}
                                    className="rounded-md border border-success/40 bg-success/15 px-2 py-1 text-[10px] font-bold text-success hover:bg-success/30 transition-all disabled:opacity-50"
                                    title="Mark full payment received via UPI"
                                  >
                                    + UPI Paid
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => handleMarkRentPaid(r.recordCode, "Cash")}
                                    className="rounded-md border border-gold/40 bg-gold/15 px-2 py-1 text-[10px] font-bold text-gold hover:bg-gold/30 transition-all disabled:opacity-50"
                                    title="Mark full payment received via Cash"
                                  >
                                    + Cash Paid
                                  </button>
                                </>
                              )}

                              {isPaid && (
                                <a
                                  href={`/resident?code=${encodeURIComponent(r.bookingCode)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-md border border-sand/40 bg-sand/10 px-2 py-1 text-[10px] font-bold text-sand hover:bg-sand/20"
                                  title="View Official Digital Rent Receipt"
                                >
                                  Receipt ↗
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredRentLedger.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-sand-dim">
                          No rent records found matching your filter or search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 1: SUB-METER READING UPDATER                            */}
        {/* ============================================================== */}
        {editingMeterRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-gold/30 bg-[#1C140F] p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gold/15 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                    Sub-Meter Billing
                  </span>
                  <h3 className="font-serif text-xl text-ivory">
                    Update Meter: {editingMeterRecord.residentName} (Room {editingMeterRecord.roomCode})
                  </h3>
                </div>
                <button
                  onClick={() => setEditingMeterRecord(null)}
                  className="rounded-lg p-1 text-sand-dim hover:text-ivory"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-gold/15 bg-[#120D0A] p-3 text-xs text-sand-dim">
                  <p>
                    <strong className="text-ivory">Tariff:</strong> ₹8.50 per electricity unit.
                    Base Rent: <strong className="text-ivory">{inr(editingMeterRecord.baseRent)}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">
                      Previous Reading
                    </label>
                    <input
                      type="number"
                      value={editMeterPrev}
                      onChange={(e) =>
                        setEditMeterPrev(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="e.g. 1400"
                      className="mt-1 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-3 py-2 text-sm text-ivory focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">
                      Current Reading
                    </label>
                    <input
                      type="number"
                      value={editMeterCurr}
                      onChange={(e) =>
                        setEditMeterCurr(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="e.g. 1465"
                      className="mt-1 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-3 py-2 text-sm text-ivory focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">
                    Or Enter Units Consumed Directly
                  </label>
                  <input
                    type="number"
                    value={editMeterUnitsManual}
                    onChange={(e) =>
                      setEditMeterUnitsManual(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder={`Currently: ${editingMeterRecord.electricityUnits} units`}
                    className="mt-1 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-3 py-2 text-sm text-ivory focus:border-gold focus:outline-none"
                  />
                </div>

                {/* Live Preview Calculation */}
                {(() => {
                  const units =
                    typeof editMeterPrev === "number" &&
                    typeof editMeterCurr === "number" &&
                    editMeterCurr >= editMeterPrev
                      ? editMeterCurr - editMeterPrev
                      : typeof editMeterUnitsManual === "number"
                      ? editMeterUnitsManual
                      : editingMeterRecord.electricityUnits;
                  const amt = Math.round(units * 8.5);
                  const newTotal = editingMeterRecord.baseRent + amt + editingMeterRecord.otherCharges;
                  return (
                    <div className="rounded-xl border border-gold/25 bg-[#120D0A] p-4 text-xs space-y-2">
                      <div className="flex justify-between text-sand">
                        <span>Calculated Units:</span>
                        <span className="font-bold text-gold-light">{units} units</span>
                      </div>
                      <div className="flex justify-between text-sand">
                        <span>Electricity Bill (@ ₹8.50):</span>
                        <span className="font-bold text-gold-light">{inr(amt)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gold/10 pt-2 font-bold text-ivory text-sm">
                        <span>New Total Bill:</span>
                        <span className="font-serif text-gold-light text-base">{inr(newTotal)}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingMeterRecord(null)}
                    className="rounded-xl border border-gold/20 px-4 py-2 text-xs font-bold text-sand hover:bg-gold/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading !== null}
                    onClick={handleSaveMeterUnits}
                    className="rounded-xl bg-gradient-to-r from-gold to-gold-light px-5 py-2 text-xs font-bold uppercase tracking-wider text-espresso shadow hover:opacity-95 disabled:opacity-50"
                  >
                    {actionLoading ? "Saving..." : "Save to Rent Invoice"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 2: BATCH OVERDUE WHATSAPP DESK                           */}
        {/* ============================================================== */}
        {batchReminderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl border border-danger/40 bg-[#1C140F] p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gold/15 pb-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-danger">
                    <span className="h-2 w-2 rounded-full bg-danger animate-ping" />
                    Warden Defaulters Recovery Desk
                  </span>
                  <h3 className="font-serif text-2xl text-ivory">
                    Overdue Residents ({overdueDefaulters.length})
                  </h3>
                </div>
                <button
                  onClick={() => setBatchReminderModal(false)}
                  className="rounded-lg p-1 text-sand-dim hover:text-ivory"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4">
                <p className="text-xs text-sand-dim">
                  Total outstanding rent overdue:{" "}
                  <strong className="text-danger font-bold">
                    {inr(overdueDefaulters.reduce((s, r) => s + r.balanceDue, 0))}
                  </strong>
                  . Click each resident to launch their personalized itemized notice on WhatsApp with UPI ID:{" "}
                  <span className="font-mono text-gold-light">{BRAND.upi}</span>.
                </p>

                <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
                  {overdueDefaulters.map((d) => (
                    <div
                      key={d.id}
                      className="flex flex-col gap-3 rounded-xl border border-danger/30 bg-[#120D0A] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-ivory text-sm">{d.residentName}</p>
                          <span className="rounded-full bg-danger/20 border border-danger/40 px-2 py-0.5 text-[9px] font-bold text-danger">
                            {d.daysOverdue} Days Late
                          </span>
                        </div>
                        <p className="text-xs text-sand-dim">
                          Room {d.roomCode} · {d.bedLabel} · Mobile: +91 {d.mobile}
                        </p>
                        <p className="mt-1 text-xs text-sand">
                          Base Rent: {inr(d.baseRent)} + Electricity: {inr(d.electricityAmount)} ={" "}
                          <strong className="text-danger">{inr(d.balanceDue)} due</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const text = WhatsAppTemplates.overdueRentReminderToResident({
                              residentName: d.residentName,
                              roomCode: d.roomCode,
                              month: d.month,
                              baseRent: d.baseRent,
                              electricityUnits: d.electricityUnits,
                              electricityAmount: d.electricityAmount,
                              otherCharges: d.otherCharges,
                              totalDue: d.totalDue,
                              amountPaid: d.amountPaid,
                              balanceDue: d.balanceDue,
                              daysOverdue: d.daysOverdue,
                              dueDate: d.dueDate,
                            });
                            window.open(createWaLink(d.mobile, text), "_blank");
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-[#20ba59]"
                        >
                          <span>💬 Send WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkRentPaid(d.recordCode, "UPI")}
                          className="rounded-xl border border-success/40 bg-success/15 px-3 py-2 text-xs font-bold text-success hover:bg-success/30"
                          title="Quick Mark as Paid"
                        >
                          ✓ Mark Paid
                        </button>
                      </div>
                    </div>
                  ))}
                  {overdueDefaulters.length === 0 && (
                    <div className="rounded-xl border border-success/30 bg-success/10 p-8 text-center text-success">
                      🎉 No overdue defaulters! All active residents have cleared their monthly PG dues.
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-gold/15 pt-4">
                  <button
                    onClick={() => {
                      const allNumbers = overdueDefaulters.map((d) => d.mobile).join(", ");
                      navigator.clipboard?.writeText(allNumbers);
                      alert(`Copied ${overdueDefaulters.length} phone numbers to clipboard!`);
                    }}
                    className="rounded-xl border border-gold/30 bg-coffee/40 px-3.5 py-2 text-xs font-bold text-gold hover:bg-gold/20"
                  >
                    📋 Copy All Defaulter Numbers
                  </button>
                  <button
                    onClick={() => setBatchReminderModal(false)}
                    className="rounded-xl bg-gold px-5 py-2 text-xs font-bold uppercase tracking-wider text-espresso hover:opacity-95"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 3: GENERATE NEW RENT INVOICE                            */}
        {/* ============================================================== */}
        {createInvoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-gold/30 bg-[#1C140F] p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gold/15 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                    Billing Desk
                  </span>
                  <h3 className="font-serif text-xl text-ivory">Create Monthly Rent Bill</h3>
                </div>
                <button
                  onClick={() => setCreateInvoiceModal(false)}
                  className="rounded-lg p-1 text-sand-dim hover:text-ivory"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateNewInvoice} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">
                    Resident Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newInvResident}
                    onChange={(e) => setNewInvResident(e.target.value)}
                    placeholder="e.g. Vikas Pandey"
                    className="mt-1 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-3 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={newInvMobile}
                      onChange={(e) => setNewInvMobile(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="mt-1 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-3 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">
                      Billing Month
                    </label>
                    <input
                      type="text"
                      value={newInvMonth}
                      onChange={(e) => setNewInvMonth(e.target.value)}
                      placeholder="e.g. November 2026"
                      className="mt-1 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-3 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={newInvRoom}
                      onChange={(e) => setNewInvRoom(e.target.value)}
                      placeholder="e.g. 101A"
                      className="mt-1 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-3 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">
                      Bed Label
                    </label>
                    <input
                      type="text"
                      value={newInvBed}
                      onChange={(e) => setNewInvBed(e.target.value)}
                      placeholder="e.g. Bed A"
                      className="mt-1 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-3 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">
                      Base Rent (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newInvBaseRent}
                      onChange={(e) =>
                        setNewInvBaseRent(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className="mt-1 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-3 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">
                      Electricity Units (@ ₹8.50)
                    </label>
                    <input
                      type="number"
                      value={newInvElecUnits}
                      onChange={(e) =>
                        setNewInvElecUnits(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className="mt-1 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-3 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">
                    Due Date
                  </label>
                  <input
                    type="text"
                    value={newInvDueDate}
                    onChange={(e) => setNewInvDueDate(e.target.value)}
                    placeholder="e.g. 05 Nov 2026"
                    className="mt-1 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-3 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gold/15">
                  <button
                    type="button"
                    onClick={() => setCreateInvoiceModal(false)}
                    className="rounded-xl border border-gold/20 px-4 py-2 text-xs font-bold text-sand hover:bg-gold/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading !== null}
                    className="rounded-xl bg-gold px-5 py-2 text-xs font-bold uppercase tracking-wider text-espresso shadow hover:opacity-95 disabled:opacity-50"
                  >
                    {actionLoading === "create_invoice" ? "Generating..." : "Generate Rent Bill"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 1: FLOOR & BED MAP */}
        {activeTab === "floorplan" && (
          <div className="mt-6 space-y-8">
            {(["1st", "2nd", "3rd"] as const).map((floorKey) => {
              const floorBeds = floorGroups[floorKey] || [];
              const floorTitle =
                floorKey === "1st" ? "Ground / 1st Floor" : floorKey === "2nd" ? "2nd Floor" : "3rd Floor";

              return (
                <div key={floorKey} className="rounded-2xl border border-gold/20 bg-[#17100C] p-6">
                  <div className="flex items-center justify-between border-b border-gold/15 pb-4">
                    <div>
                      <h2 className="font-serif text-xl text-ivory">{floorTitle}</h2>
                      <p className="text-xs text-sand-dim">
                        {floorBeds.filter((b) => b.status === "available").length} beds available out of{" "}
                        {floorBeds.length}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1.5 text-success">
                        <span className="h-2 w-2 rounded-full bg-success" /> Available
                      </span>
                      <span className="flex items-center gap-1.5 text-danger">
                        <span className="h-2 w-2 rounded-full bg-danger" /> Occupied
                      </span>
                      <span className="flex items-center gap-1.5 text-gold-light">
                        <span className="h-2 w-2 rounded-full bg-gold" /> Reserved
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {floorBeds.map((bed) => {
                      const isAvail = bed.status === "available";
                      const isOcc = bed.status === "occupied";

                      return (
                        <div
                          key={bed.id}
                          className={`relative rounded-xl border p-3 transition-all ${
                            isAvail
                              ? "border-success/30 bg-success/5 hover:border-success/60"
                              : isOcc
                              ? "border-danger/30 bg-danger/5 hover:border-danger/60"
                              : "border-gold/30 bg-gold/5"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-ivory">
                              {bed.roomCode}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                isAvail
                                  ? "bg-success/20 text-success"
                                  : isOcc
                                  ? "bg-danger/20 text-danger"
                                  : "bg-gold/20 text-gold-light"
                              }`}
                            >
                              {bed.bedLabel}
                            </span>
                          </div>

                          <div className="mt-2 text-[11px] text-sand-dim">
                            <p className="capitalize text-ivory">
                              {bed.tier} · {bed.cooling.toUpperCase()}
                            </p>
                            {bed.residentName ? (
                              <p className="mt-1 truncate font-medium text-gold-light">
                                👤 {bed.residentName}
                              </p>
                            ) : (
                              <p className="mt-1 text-success">Vacant &amp; Sanitized</p>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-gold/10 pt-2">
                            <button
                              onClick={() => handleBedToggle(bed.id, bed.status)}
                              className="text-[10px] font-bold uppercase tracking-wider text-sand hover:text-gold"
                            >
                              {isAvail ? "Mark Booked" : "Free Up Bed"}
                            </button>
                            {bed.residentPhone && (
                              <a
                                href={`tel:${bed.residentPhone}`}
                                className="text-[10px] text-gold-light hover:underline"
                                title="Call Resident"
                              >
                                📞 Call
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: RESIDENT BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-gold/20 bg-[#17100C]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gold/20 bg-coffee/50 text-[10px] font-bold uppercase tracking-wider text-sand-dim">
                  <tr>
                    <th className="px-4 py-3.5">Booking Code</th>
                    <th className="px-4 py-3.5">Resident Details</th>
                    <th className="px-4 py-3.5">Room &amp; Bed</th>
                    <th className="px-4 py-3.5">Move-In</th>
                    <th className="px-4 py-3.5">Paid / Total</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gold/5">
                      <td className="px-4 py-4 font-mono font-bold text-gold-light">{b.code}</td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-ivory">{b.fullName}</p>
                        <p className="text-sand-dim">{b.mobile}</p>
                        <p className="text-[10px] text-sand-dim/80">{b.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="capitalize text-ivory">
                          {b.tier} ({b.cooling.toUpperCase()})
                        </p>
                        <p className="text-sand-dim">
                          Room {b.roomCode || "TBD"} · {b.bedLabel || "Bed A"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sand">{b.moveInDate}</td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-success">{inr(b.amountPaid)}</p>
                        <p className="text-[10px] text-sand-dim">of {inr(b.monthlyTotal)}/mo</p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            b.status === "confirmed" || b.status === "checked_in"
                              ? "bg-success/20 text-success"
                              : b.status === "cancelled" || b.status === "vacated"
                              ? "bg-danger/20 text-danger"
                              : "bg-gold/20 text-gold-light"
                          }`}
                        >
                          {b.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const text = WhatsAppTemplates.bookingWelcomeToResident({
                                code: b.code,
                                fullName: b.fullName,
                                roomCode: b.roomCode,
                                bedLabel: b.bedLabel,
                                tier: b.tier,
                                cooling: b.cooling,
                                moveInDate: b.moveInDate,
                                amountPaid: b.amountPaid,
                                balanceDue: Math.max(0, b.monthlyTotal - b.amountPaid),
                              });
                              window.open(createWaLink(b.mobile, text), "_blank");
                            }}
                            className="rounded-md border border-[#25D366]/40 bg-[#25D366]/10 px-2 py-1 text-[10px] font-bold text-[#25D366] hover:bg-[#25D366]/20"
                            title="Send WhatsApp Welcome Kit & Directions"
                          >
                            Welcome WA
                          </button>
                          {b.status !== "checked_in" && (
                            <button
                              onClick={() => handleStatusChange(b.code, "checked_in")}
                              className="rounded-md border border-success/40 bg-success/10 px-2 py-1 text-[10px] font-bold text-success hover:bg-success/20"
                            >
                              Check-In
                            </button>
                          )}
                          {b.status === "checked_in" && (
                            <button
                              onClick={() => handleStatusChange(b.code, "vacated")}
                              className="rounded-md border border-sand/40 bg-sand/10 px-2 py-1 text-[10px] font-bold text-sand hover:bg-sand/20"
                            >
                              Vacate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sand-dim">
                        No bookings recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: RESIDENT COMPLAINTS */}
        {activeTab === "tickets" && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-gold/20 bg-[#17100C]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gold/20 bg-coffee/50 text-[10px] font-bold uppercase tracking-wider text-sand-dim">
                  <tr>
                    <th className="px-4 py-3.5">Ticket ID</th>
                    <th className="px-4 py-3.5">Resident &amp; Room</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Issue Description</th>
                    <th className="px-4 py-3.5">Urgency</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-gold/5">
                      <td className="px-4 py-4 font-mono font-bold text-gold-light">{t.ticketId}</td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-ivory">{t.residentName}</p>
                        <p className="text-sand-dim">Room {t.roomCode}</p>
                      </td>
                      <td className="px-4 py-4 text-ivory">{t.category}</td>
                      <td className="max-w-xs px-4 py-4 text-sand">{t.description}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${
                            t.urgency === "urgent" ? "bg-danger/20 text-danger" : "bg-sand/10 text-sand"
                          }`}
                        >
                          {t.urgency}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            t.status === "resolved"
                              ? "bg-success/20 text-success"
                              : t.status === "in_progress"
                              ? "bg-gold/20 text-gold-light"
                              : "bg-danger/20 text-danger"
                          }`}
                        >
                          {t.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={waLink(
                              `Hi ${t.residentName}! Warden here regarding your maintenance ticket ${t.ticketId} (${t.category}) in Room ${t.roomCode}:`
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md border border-[#25D366]/40 bg-[#25D366]/10 px-2 py-1 text-[10px] font-bold text-[#25D366] hover:bg-[#25D366]/20"
                          >
                            WhatsApp
                          </a>
                          {t.status !== "in_progress" && t.status !== "resolved" && (
                            <button
                              onClick={() => handleTicketStatusChange(t.ticketId, "in_progress")}
                              className="rounded-md border border-gold/40 bg-gold/10 px-2 py-1 text-[10px] font-bold text-gold hover:bg-gold/20"
                            >
                              Assign
                            </button>
                          )}
                          {t.status !== "resolved" && (
                            <button
                              onClick={() => handleTicketStatusChange(t.ticketId, "resolved")}
                              className="rounded-md border border-success/40 bg-success/10 px-2 py-1 text-[10px] font-bold text-success hover:bg-success/20"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sand-dim">
                        No maintenance tickets currently open.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: GATE PASSES */}
        {activeTab === "gatepass" && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-gold/20 bg-[#17100C]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gold/20 bg-coffee/50 text-[10px] font-bold uppercase tracking-wider text-sand-dim">
                  <tr>
                    <th className="px-4 py-3.5">Pass Code</th>
                    <th className="px-4 py-3.5">Resident &amp; Room</th>
                    <th className="px-4 py-3.5">Type</th>
                    <th className="px-4 py-3.5">Reason</th>
                    <th className="px-4 py-3.5">Departure &amp; Return</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {gatePasses.map((p) => (
                    <tr key={p.id} className="hover:bg-gold/5">
                      <td className="px-4 py-4 font-mono font-bold text-gold-light">{p.passCode}</td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-ivory">{p.residentName}</p>
                        <p className="text-sand-dim">Room {p.roomCode}</p>
                        <p className="text-[10px] text-sand-dim">{p.mobile}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${
                            p.passType === "late_entry"
                              ? "bg-gold/20 text-gold-light"
                              : "bg-danger/20 text-danger"
                          }`}
                        >
                          {p.passType === "late_entry" ? "Late Entry (>11 PM)" : "Night Out"}
                        </span>
                      </td>
                      <td className="max-w-xs px-4 py-4 text-sand">{p.reason}</td>
                      <td className="px-4 py-4">
                        <p className="text-ivory">Dep: {p.departureTime}</p>
                        <p className="text-sand-dim">Ret: {p.expectedReturn}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            p.status === "approved"
                              ? "bg-success/20 text-success"
                              : p.status === "used"
                              ? "bg-sand/20 text-sand"
                              : "bg-gold/20 text-gold-light"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <a
                          href={waLink(`Hi ${p.residentName}, regarding your gate pass ${p.passCode}:`)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md border border-[#25D366]/40 bg-[#25D366]/10 px-2 py-1 text-[10px] font-bold text-[#25D366] hover:bg-[#25D366]/20"
                        >
                          WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                  {gatePasses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sand-dim">
                        No gate passes registered today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: STANDALONE SUB-METER CALCULATOR */}
        {activeTab === "electricity" && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gold/20 bg-[#17100C] p-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                Electricity Sub-Meter Calculator
              </span>
              <h2 className="mt-2 font-serif text-2xl text-ivory">Generate Quick Room Power Slip</h2>
              <p className="mt-1 text-xs text-sand-dim">
                Each room at Pandey PG has an independent digital sub-meter. Rate: ₹{ratePerUnit} / unit.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">
                    Select Room
                  </label>
                  <select
                    value={meterRoom}
                    onChange={(e) => setMeterRoom(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-4 py-2.5 text-sm text-ivory focus:border-gold focus:outline-none"
                  >
                    <option value="101A">Room 101A (Single AC)</option>
                    <option value="102A">Room 102A (Double Non-AC)</option>
                    <option value="201A">Room 201A (Double AC)</option>
                    <option value="202A">Room 202A (Single AC)</option>
                    <option value="301A">Room 301A (Triple AC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">
                    Resident Name
                  </label>
                  <input
                    type="text"
                    value={meterResident}
                    onChange={(e) => setMeterResident(e.target.value)}
                    placeholder="e.g. Rohit Sharma"
                    className="mt-1.5 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-4 py-2.5 text-sm text-ivory focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">
                      Previous Reading
                    </label>
                    <input
                      type="number"
                      value={prevReading}
                      onChange={(e) =>
                        setPrevReading(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="e.g. 1420"
                      className="mt-1.5 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-4 py-2.5 text-sm text-ivory focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-sand">
                      Current Reading
                    </label>
                    <input
                      type="number"
                      value={currReading}
                      onChange={(e) =>
                        setCurrReading(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="e.g. 1545"
                      className="mt-1.5 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-4 py-2.5 text-sm text-ivory focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Preview & Dispatch Card */}
            <div className="rounded-2xl border border-gold/30 bg-[#1C140F] p-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                Bill Preview
              </span>
              <h3 className="mt-2 font-serif text-2xl text-ivory">Monthly Electricity Due</h3>

              <div className="mt-6 space-y-3 rounded-xl border border-gold/15 bg-[#120D0A] p-4 text-xs">
                <div className="flex justify-between border-b border-gold/10 pb-2">
                  <span className="text-sand-dim">Room:</span>
                  <span className="font-bold text-ivory">{meterRoom}</span>
                </div>
                <div className="flex justify-between border-b border-gold/10 pb-2">
                  <span className="text-sand-dim">Resident:</span>
                  <span className="font-bold text-ivory">{meterResident || "Resident"}</span>
                </div>
                <div className="flex justify-between border-b border-gold/10 pb-2">
                  <span className="text-sand-dim">Units Consumed:</span>
                  <span className="font-bold text-gold-light">{unitsConsumed} units</span>
                </div>
                <div className="flex justify-between border-b border-gold/10 pb-2">
                  <span className="text-sand-dim">Tariff Rate:</span>
                  <span className="text-sand">₹{ratePerUnit} / unit</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-sm">
                  <span className="font-bold text-ivory">Total Due:</span>
                  <span className="font-serif text-xl font-bold text-gold-light">
                    {inr(electricityAmount)}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href={waLink(
                    `*PANDEY PG - Electricity Sub-Meter Bill*\n\nRoom: ${meterRoom}\nResident: ${
                      meterResident || "Resident"
                    }\nPrevious Reading: ${prevReading || 0}\nCurrent Reading: ${
                      currReading || 0
                    }\nUnits Consumed: ${unitsConsumed} units\nRate: ₹${ratePerUnit}/unit\n*Total Electricity Bill: ${inr(
                      electricityAmount
                    )}*\n\nPlease pay to UPI: ${BRAND.upi} and share the screenshot. Thank you!`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[#20ba59]"
                >
                  <span>Send Bill on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CONTACT ENQUIRIES */}
        {activeTab === "enquiries" && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-gold/20 bg-[#17100C]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gold/20 bg-coffee/50 text-[10px] font-bold uppercase tracking-wider text-sand-dim">
                  <tr>
                    <th className="px-4 py-3.5">Name</th>
                    <th className="px-4 py-3.5">Phone Number</th>
                    <th className="px-4 py-3.5">Interested Tier</th>
                    <th className="px-4 py-3.5">Message / Inquiry</th>
                    <th className="px-4 py-3.5 text-right">Quick Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {enquiries.map((e) => (
                    <tr key={e.id} className="hover:bg-gold/5">
                      <td className="px-4 py-4 font-bold text-ivory">{e.name}</td>
                      <td className="px-4 py-4 text-gold">
                        <a href={`tel:${e.phone}`} className="hover:text-gold-light">
                          {e.phone}
                        </a>
                      </td>
                      <td className="px-4 py-4 capitalize text-sand">{e.tier || "General"}</td>
                      <td className="max-w-md px-4 py-4 text-sand-dim">{e.message}</td>
                      <td className="px-4 py-4 text-right">
                        <a
                          href={waLink(
                            `Hi ${e.name}! Thanks for contacting PANDEY PG. Regarding your query: "${e.message}":`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md border border-[#25D366]/40 bg-[#25D366]/10 px-3 py-1.5 text-[10px] font-bold text-[#25D366] hover:bg-[#25D366]/20"
                        >
                          WhatsApp Reply
                        </a>
                      </td>
                    </tr>
                  ))}
                  {enquiries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sand-dim">
                        No contact inquiries yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}