import { db, hasDb, pool } from "./index";
import { BED_PLAN } from "@/lib/inventoryPlan";
import {
  beds,
  bookings,
  maintenanceTickets,
  gatePasses,
  rentRecords,
} from "./schema";
import { sql } from "drizzle-orm";

let initialized = false;
let initPromise: Promise<void> | null = null;

export async function ensureDatabaseTables(): Promise<void> {
  if (initialized) return;
  if (!hasDb || !pool) {
    initialized = true;
    return;
  }

  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // 1. Create tables with idempotency
      await pool.query(`
        CREATE TABLE IF NOT EXISTS beds (
          id SERIAL PRIMARY KEY,
          bed_key TEXT NOT NULL UNIQUE,
          tier TEXT NOT NULL,
          cooling TEXT NOT NULL,
          floor TEXT NOT NULL,
          room_code TEXT NOT NULL,
          bed_label TEXT NOT NULL,
          position TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'available',
          resident_hint TEXT,
          grid_slot INTEGER NOT NULL DEFAULT 0,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS bookings (
          id SERIAL PRIMARY KEY,
          code TEXT NOT NULL UNIQUE,
          bed_id INTEGER,
          bed_key TEXT,
          bed_label TEXT,
          room_code TEXT,
          tier TEXT NOT NULL,
          cooling TEXT NOT NULL,
          floor TEXT NOT NULL,
          tenure TEXT NOT NULL,
          meals TEXT NOT NULL,
          addons JSONB NOT NULL DEFAULT '[]'::jsonb,
          move_in_date TEXT NOT NULL,
          full_name TEXT NOT NULL,
          mobile TEXT NOT NULL,
          email TEXT NOT NULL,
          gender TEXT NOT NULL,
          category TEXT NOT NULL,
          institution TEXT,
          emergency_name TEXT NOT NULL,
          emergency_phone TEXT NOT NULL,
          id_proof_type TEXT NOT NULL,
          id_proof_number TEXT,
          base_rent INTEGER NOT NULL,
          ac_charge INTEGER NOT NULL,
          floor_premium INTEGER NOT NULL,
          rent_discount INTEGER NOT NULL,
          net_rent INTEGER NOT NULL,
          mess_charges INTEGER NOT NULL,
          addon_charges INTEGER NOT NULL,
          monthly_total INTEGER NOT NULL,
          deposit INTEGER NOT NULL,
          move_in_total INTEGER NOT NULL,
          amount_paid INTEGER NOT NULL,
          balance_due INTEGER NOT NULL,
          payment_mode TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'confirmed',
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS tour_requests (
          id SERIAL PRIMARY KEY,
          reference TEXT NOT NULL UNIQUE,
          tour_type TEXT NOT NULL,
          date TEXT NOT NULL,
          slot TEXT NOT NULL,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT,
          visitors INTEGER NOT NULL DEFAULT 1,
          interested_tier TEXT,
          notes TEXT,
          status TEXT NOT NULL DEFAULT 'requested',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS enquiries (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT,
          tier TEXT,
          move_in TEXT,
          message TEXT,
          handled BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS maintenance_tickets (
          id SERIAL PRIMARY KEY,
          ticket_id TEXT NOT NULL UNIQUE,
          resident_code TEXT NOT NULL,
          resident_name TEXT NOT NULL,
          room_code TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT NOT NULL,
          urgency TEXT NOT NULL DEFAULT 'normal',
          status TEXT NOT NULL DEFAULT 'open',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS gate_passes (
          id SERIAL PRIMARY KEY,
          pass_code TEXT NOT NULL UNIQUE,
          resident_code TEXT NOT NULL,
          resident_name TEXT NOT NULL,
          room_code TEXT NOT NULL,
          mobile TEXT NOT NULL,
          pass_type TEXT NOT NULL DEFAULT 'late_entry',
          reason TEXT NOT NULL,
          departure_time TEXT NOT NULL,
          expected_return TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'approved',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS meal_skips (
          id SERIAL PRIMARY KEY,
          resident_code TEXT NOT NULL,
          date TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT meal_skips_res_date_unique UNIQUE (resident_code, date)
        );

        CREATE TABLE IF NOT EXISTS rent_records (
          id SERIAL PRIMARY KEY,
          record_code TEXT NOT NULL UNIQUE,
          booking_code TEXT NOT NULL,
          resident_name TEXT NOT NULL,
          mobile TEXT NOT NULL,
          room_code TEXT NOT NULL,
          bed_label TEXT NOT NULL,
          tier TEXT NOT NULL,
          month TEXT NOT NULL,
          base_rent INTEGER NOT NULL,
          electricity_units INTEGER NOT NULL DEFAULT 0,
          electricity_amount INTEGER NOT NULL DEFAULT 0,
          other_charges INTEGER NOT NULL DEFAULT 0,
          total_due INTEGER NOT NULL,
          amount_paid INTEGER NOT NULL DEFAULT 0,
          balance_due INTEGER NOT NULL,
          due_date TEXT NOT NULL,
          days_overdue INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'pending',
          paid_at TEXT,
          payment_mode TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Performance Indexes
        CREATE INDEX IF NOT EXISTS beds_status_idx ON beds(status);
        CREATE INDEX IF NOT EXISTS beds_tier_idx ON beds(tier);
        CREATE INDEX IF NOT EXISTS bookings_mobile_idx ON bookings(mobile);
        CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);
        CREATE INDEX IF NOT EXISTS tickets_resident_code_idx ON maintenance_tickets(resident_code);
        CREATE INDEX IF NOT EXISTS tickets_status_idx ON maintenance_tickets(status);
        CREATE INDEX IF NOT EXISTS gate_passes_res_idx ON gate_passes(resident_code);
        CREATE INDEX IF NOT EXISTS meal_skips_date_idx ON meal_skips(date);
        CREATE INDEX IF NOT EXISTS rent_records_bk_idx ON rent_records(booking_code);
        CREATE INDEX IF NOT EXISTS rent_records_status_idx ON rent_records(status);
      `);

      // 2. Ensure initial seed data if fresh database
      const bedCountRes = await db.select({ count: sql<number>`count(*)::int` }).from(beds);
      if ((bedCountRes[0]?.count ?? 0) === 0) {
        // Chunk bed insertions to avoid param limits
        const chunkSize = 20;
        for (let i = 0; i < BED_PLAN.length; i += chunkSize) {
          await db.insert(beds).values(BED_PLAN.slice(i, i + chunkSize));
        }
      }

      // Check if bookings have initial seed
      const bookingCountRes = await db.select({ count: sql<number>`count(*)::int` }).from(bookings);
      if ((bookingCountRes[0]?.count ?? 0) === 0) {
        const now = new Date();
        const year = now.getFullYear();

        await db.insert(bookings).values([
          {
            code: `#PANDEY-${year}-1042`,
            bedId: 1,
            bedKey: "single-ac-1st-101a-suite a",
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
          },
          {
            code: `#PANDEY-${year}-2158`,
            bedId: 12,
            bedKey: "double-ac-2nd-201a-bed a",
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
          },
        ]);

        // Seed initial tickets
        await db.insert(maintenanceTickets).values([
          {
            ticketId: "TKT-1082",
            residentCode: `#PANDEY-${year}-1042`,
            residentName: "Aarav Sharma",
            roomCode: "101A",
            category: "AC & Cooling",
            description: "AC remote battery replaced, but cooling is slightly low at night.",
            urgency: "normal",
            status: "in_progress",
          },
          {
            ticketId: "TKT-1083",
            residentCode: `#PANDEY-${year}-2158`,
            residentName: "Pooja Verma",
            roomCode: "201A",
            category: "Wi-Fi & Network",
            description: "Mesh router rebooted, signal strong now. Thanks!",
            urgency: "normal",
            status: "resolved",
          },
        ]);

        // Seed initial gate pass
        await db.insert(gatePasses).values([
          {
            passCode: "GP-9841",
            residentCode: `#PANDEY-${year}-1042`,
            residentName: "Aarav Sharma",
            roomCode: "101A",
            mobile: "9876543210",
            passType: "late_entry",
            reason: "Exam preparation at university central library till 12:30 AM",
            departureTime: "9:30 PM",
            expectedReturn: "12:30 AM",
            status: "approved",
          },
        ]);

        // Seed initial rent records
        await db.insert(rentRecords).values([
          {
            recordCode: `INV-${year}-1001`,
            bookingCode: `#PANDEY-${year}-1042`,
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
            recordCode: `INV-${year}-1002`,
            bookingCode: `#PANDEY-${year}-2158`,
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
            recordCode: `INV-${year}-1003`,
            bookingCode: `#PANDEY-${year}-3091`,
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
            recordCode: `INV-${year}-1004`,
            bookingCode: `#PANDEY-${year}-4402`,
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
        ]);
      }

      initialized = true;
    } catch (err) {
      console.error("[initDb] Failed to ensure database tables:", err);
      throw err;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}
