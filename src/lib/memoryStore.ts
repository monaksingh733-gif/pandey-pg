import { BED_PLAN, type BedSeed } from "./inventoryPlan";
import type { CoolingKey, FloorKey, TierKey } from "./pricing";

export interface MemoryBed extends BedSeed {
  id: number;
  updatedAt: Date;
}

export interface MemoryBooking {
  id: number;
  code: string;
  bedId: number | null;
  bedKey: string | null;
  bedLabel: string | null;
  roomCode: string | null;
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
  createdAt: Date;
}

export interface MemoryTour {
  id: number;
  reference: string;
  tourType: string;
  date: string;
  slot: string;
  name: string;
  phone: string;
  email: string | null;
  visitors: number;
  interestedTier: string | null;
  notes: string | null;
  status: string;
  createdAt: Date;
}

export interface MemoryEnquiry {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  tier: string | null;
  moveIn: string | null;
  message: string;
  createdAt: Date;
}

export interface MemoryTicket {
  id: number;
  ticketId: string;
  residentCode: string;
  residentName: string;
  roomCode: string;
  category: string;
  description: string;
  urgency: "normal" | "urgent";
  status: "open" | "in_progress" | "resolved";
  createdAt: Date;
}

export interface MemoryGatePass {
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
  createdAt: Date;
}

export interface MemoryRentRecord {
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

interface MemoryStoreState {
  beds: MemoryBed[];
  bookings: MemoryBooking[];
  tours: MemoryTour[];
  enquiries: MemoryEnquiry[];
  tickets: MemoryTicket[];
  gatePasses: MemoryGatePass[];
  mealSkips: { residentCode: string; date: string }[];
  rentLedger: MemoryRentRecord[];
  nextBookingId: number;
  nextTourId: number;
  nextEnquiryId: number;
  nextTicketId: number;
  nextGatePassId: number;
  nextRentRecordId: number;
}

const globalForStore = globalThis as typeof globalThis & {
  __pandeyPgMemoryStore?: MemoryStoreState;
};

function initStore(): MemoryStoreState {
  const initialBeds: MemoryBed[] = BED_PLAN.map((seed, idx) => ({
    ...seed,
    id: idx + 1,
    updatedAt: new Date(),
  }));

  // Initial seed sample bookings for realism
  const now = new Date();
  const initialBookings: MemoryBooking[] = [
    {
      id: 1,
      code: `#PANDEY-${now.getFullYear()}-1042`,
      bedId: 1,
      bedKey: initialBeds[0]?.bedKey ?? "single-ac-1st-101a-suite a",
      bedLabel: "Suite A",
      roomCode: "101A",
      tier: "single",
      cooling: "ac",
      floor: "1st",
      tenure: "six",
      meals: "full",
      addons: ["laundry"],
      moveInDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      fullName: "Aarav Sharma",
      mobile: "9876543210",
      email: "aarav.sharma@example.com",
      gender: "Male",
      category: "Working Professional",
      institution: "Tech Park Bengaluru",
      emergencyName: "Rakesh Sharma",
      emergencyPhone: "9876543211",
      idProofType: "Aadhaar Card",
      idProofNumber: "XXXX-XXXX-1234",
      baseRent: 13500,
      acCharge: 1500,
      floorPremium: 0,
      rentDiscount: 500,
      netRent: 14500,
      messCharges: 3500,
      addonCharges: 400,
      monthlyTotal: 18400,
      deposit: 15000,
      moveInTotal: 33400,
      amountPaid: 1000,
      balanceDue: 32400,
      paymentMode: "token",
      status: "confirmed",
      notes: "Preferred move-in time after 11 AM.",
      createdAt: new Date(Date.now() - 3600000 * 4),
    },
    {
      id: 2,
      code: `#PANDEY-${now.getFullYear()}-2158`,
      bedId: 12,
      bedKey: initialBeds[11]?.bedKey ?? "double-ac-2nd-201a-bed a",
      bedLabel: "Bed A",
      roomCode: "201A",
      tier: "double",
      cooling: "ac",
      floor: "2nd",
      tenure: "eleven",
      meals: "full",
      addons: [],
      moveInDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
      fullName: "Pooja Verma",
      mobile: "9123456789",
      email: "pooja.v@example.com",
      gender: "Female",
      category: "College Student",
      institution: "Main University",
      emergencyName: "Sanjay Verma",
      emergencyPhone: "9123456780",
      idProofType: "College ID",
      idProofNumber: "MU-2024-884",
      baseRent: 8500,
      acCharge: 1000,
      floorPremium: 0,
      rentDiscount: 500,
      netRent: 9000,
      messCharges: 3500,
      addonCharges: 0,
      monthlyTotal: 12500,
      deposit: 10000,
      moveInTotal: 22500,
      amountPaid: 22500,
      balanceDue: 0,
      paymentMode: "full",
      status: "confirmed",
      notes: "Moving with classmate.",
      createdAt: new Date(Date.now() - 3600000 * 18),
    },
  ];

  return {
    beds: initialBeds,
    bookings: initialBookings,
    tours: [],
    enquiries: [],
    tickets: [
      {
        id: 1,
        ticketId: "TKT-1082",
        residentCode: "#PANDEY-2026-1042",
        residentName: "Aarav Sharma",
        roomCode: "101A",
        category: "AC & Cooling",
        description: "AC remote battery replaced, but cooling is slightly low at night.",
        urgency: "normal",
        status: "in_progress",
        createdAt: new Date(Date.now() - 3600000 * 5),
      },
      {
        id: 2,
        ticketId: "TKT-1083",
        residentCode: "#PANDEY-2026-2158",
        residentName: "Pooja Verma",
        roomCode: "201A",
        category: "Wi-Fi & Network",
        description: "Mesh router rebooted, signal strong now. Thanks!",
        urgency: "normal",
        status: "resolved",
        createdAt: new Date(Date.now() - 3600000 * 24),
      },
    ],
    gatePasses: [
      {
        id: 1,
        passCode: "GP-9841",
        residentCode: "#PANDEY-2026-1042",
        residentName: "Aarav Sharma",
        roomCode: "101A",
        mobile: "9876543210",
        passType: "late_entry",
        reason: "Exam preparation at university central library till 12:30 AM",
        departureTime: "9:30 PM",
        expectedReturn: "12:30 AM",
        status: "approved",
        createdAt: new Date(Date.now() - 3600000 * 3),
      },
    ],
    mealSkips: [],
    rentLedger: [
      {
        id: 1,
        recordCode: "INV-2026-1001",
        bookingCode: "#PANDEY-2026-1042",
        residentName: "Aarav Sharma",
        mobile: "9876543210",
        roomCode: "101A",
        bedLabel: "Suite A",
        tier: "Single Suite",
        month: "October 2026",
        baseRent: 18400,
        electricityUnits: 85,
        electricityAmount: 723,
        otherCharges: 0,
        totalDue: 19123,
        amountPaid: 19123,
        balanceDue: 0,
        dueDate: "05 Oct 2026",
        daysOverdue: 0,
        status: "paid",
        paidAt: "03 Oct 2026",
        paymentMode: "UPI",
      },
      {
        id: 2,
        recordCode: "INV-2026-1002",
        bookingCode: "#PANDEY-2026-2158",
        residentName: "Pooja Verma",
        mobile: "9123456789",
        roomCode: "201A",
        bedLabel: "Bed A",
        tier: "Double Sharing",
        month: "October 2026",
        baseRent: 12500,
        electricityUnits: 62,
        electricityAmount: 527,
        otherCharges: 0,
        totalDue: 13027,
        amountPaid: 0,
        balanceDue: 13027,
        dueDate: "05 Oct 2026",
        daysOverdue: 24,
        status: "overdue",
      },
      {
        id: 3,
        recordCode: "INV-2026-1003",
        bookingCode: "#PANDEY-2026-3091",
        residentName: "Rahul Mishra",
        mobile: "9781234560",
        roomCode: "102B",
        bedLabel: "Bed B",
        tier: "Double Sharing",
        month: "October 2026",
        baseRent: 11500,
        electricityUnits: 40,
        electricityAmount: 340,
        otherCharges: 0,
        totalDue: 11840,
        amountPaid: 5000,
        balanceDue: 6840,
        dueDate: "05 Oct 2026",
        daysOverdue: 24,
        status: "overdue",
      },
      {
        id: 4,
        recordCode: "INV-2026-1004",
        bookingCode: "#PANDEY-2026-4402",
        residentName: "Sneha Gupta",
        mobile: "9912345671",
        roomCode: "202A",
        bedLabel: "Suite A",
        tier: "Single Suite",
        month: "October 2026",
        baseRent: 17500,
        electricityUnits: 94,
        electricityAmount: 799,
        otherCharges: 0,
        totalDue: 18299,
        amountPaid: 18299,
        balanceDue: 0,
        dueDate: "05 Oct 2026",
        daysOverdue: 0,
        status: "paid",
        paidAt: "02 Oct 2026",
        paymentMode: "Bank Transfer",
      },
    ],
    nextBookingId: 3,
    nextTourId: 1,
    nextEnquiryId: 1,
    nextTicketId: 3,
    nextGatePassId: 2,
    nextRentRecordId: 5,
  };
}

export const memoryStore =
  globalForStore.__pandeyPgMemoryStore ?? (globalForStore.__pandeyPgMemoryStore = initStore());
