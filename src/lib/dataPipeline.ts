import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { ensureDatabaseTables } from "@/db/initDb";
import {
  beds,
  bookings,
  enquiries,
  gatePasses,
  maintenanceTickets,
  mealSkips,
  rentRecords,
  tourRequests,
  type BedRow,
  type BookingRow,
  type EnquiryRow,
  type GatePassRow,
  type MaintenanceTicketRow,
  type MealSkipRow,
  type RentRecordRow,
  type TourRow,
} from "@/db/schema";
import {
  memoryStore,
  type MemoryBed,
  type MemoryBooking,
  type MemoryEnquiry,
  type MemoryGatePass,
  type MemoryRentRecord,
  type MemoryTicket,
  type MemoryTour,
} from "./memoryStore";
import {
  ADDONS,
  COOLING_LABEL,
  FLOOR_LABEL,
  TIERS,
  TENURES,
  quote,
  type CoolingKey,
  type FloorKey,
  type MealKey,
  type PaymentKey,
  type TenureKey,
  type TierKey,
} from "./pricing";

/** Normalizes booking / pass codes for consistent matching */
export function normalizeCode(raw: string): { withHash: string; clean: string } {
  const trimmed = decodeURIComponent(raw).trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  const clean = trimmed.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return { withHash, clean };
}

/** Central Data Pipeline Engine for Pandey PG */
export class DataPipeline {
  /** Ensure schema and initial seeds are ready */
  static async init(): Promise<void> {
    if (hasDb) {
      await ensureDatabaseTables();
    }
  }

  /* ==========================================================================
   * BEDS & INVENTORY PIPELINE
   * ========================================================================== */
  static beds = {
    async getAll(): Promise<(BedRow | MemoryBed)[]> {
      await DataPipeline.init();
      if (!hasDb || !db) {
        return memoryStore.beds;
      }
      return await db.select().from(beds).orderBy(beds.id);
    },

    async getSummary() {
      const allBeds = await DataPipeline.beds.getAll();
      const summary = {
        totalBeds: allBeds.length,
        available: allBeds.filter((r) => r.status === "available").length,
        reserved: allBeds.filter((r) => r.status === "reserved").length,
        booked: allBeds.filter((r) => r.status === "booked").length,
        byTier: {
          single: { available: 0, total: 0 },
          double: { available: 0, total: 0 },
          triple: { available: 0, total: 0 },
        },
      };

      for (const r of allBeds) {
        const key = r.tier as TierKey;
        if (summary.byTier[key]) {
          summary.byTier[key].total += 1;
          if (r.status === "available") summary.byTier[key].available += 1;
        }
      }
      return { rows: allBeds, summary };
    },

    async toggleBed(bedId: number, isAvailable: boolean) {
      await DataPipeline.init();
      const nextStatus = isAvailable ? "available" : "booked";

      if (!hasDb || !db) {
        const bed = memoryStore.beds.find((b) => b.id === bedId);
        if (!bed) throw new Error("Bed not found.");
        bed.status = nextStatus;
        if (isAvailable) bed.residentHint = null;
        bed.updatedAt = new Date();
        return bed;
      }

      const updated = await db
        .update(beds)
        .set({
          status: nextStatus,
          residentHint: isAvailable ? null : undefined,
          updatedAt: new Date(),
        })
        .where(eq(beds.id, bedId))
        .returning();

      if (updated.length === 0) throw new Error("Bed not found.");
      return updated[0];
    },
  };

  /* ==========================================================================
   * BOOKINGS & RESERVATION PIPELINE
   * ========================================================================== */
  static bookings = {
    async create(input: {
      tier: TierKey;
      cooling: CoolingKey;
      floor: FloorKey;
      tenure: TenureKey;
      meals: MealKey;
      paymentMode: PaymentKey;
      bedId: number;
      moveInDate: string;
      fullName: string;
      mobile: string;
      email: string;
      gender: string;
      category: string;
      institution?: string;
      emergencyName: string;
      emergencyPhone: string;
      idProofType: string;
      idProofNumber?: string;
      addons: string[];
      notes?: string;
    }) {
      await DataPipeline.init();

      const q = quote({
        tier: input.tier,
        cooling: input.cooling,
        floor: input.floor,
        tenure: input.tenure,
        meals: input.meals,
        addons: input.addons,
      });

      const amountPaid = input.paymentMode === "token" ? q.tokenPayable : q.moveInTotal;
      const balanceDue = Math.max(0, q.moveInTotal - amountPaid);
      const status = input.paymentMode === "token" ? "token-held" : "confirmed";

      if (!hasDb || !db) {
        const bed = memoryStore.beds.find((b) => b.id === input.bedId);
        if (!bed || bed.status !== "available") {
          throw new Error("BED_UNAVAILABLE");
        }
        if (bed.tier !== input.tier || bed.cooling !== input.cooling || bed.floor !== input.floor) {
          throw new Error("BED_MISMATCH");
        }

        bed.status = "booked";
        bed.residentHint = `Booked · ${input.fullName}`;
        bed.updatedAt = new Date();

        const id = memoryStore.nextBookingId++;
        const year = new Date().getFullYear();
        const serialNo = 1000 + ((id * 7919) % 9000);
        const code = `#PANDEY-${year}-${serialNo}`;

        const newBooking: MemoryBooking = {
          id,
          code,
          bedId: bed.id,
          bedKey: bed.bedKey,
          bedLabel: bed.bedLabel,
          roomCode: bed.roomCode,
          tier: input.tier,
          cooling: input.cooling,
          floor: input.floor,
          tenure: input.tenure,
          meals: input.meals,
          addons: input.addons,
          moveInDate: input.moveInDate,
          fullName: input.fullName,
          mobile: input.mobile,
          email: input.email,
          gender: input.gender,
          category: input.category,
          institution: input.institution || null,
          emergencyName: input.emergencyName,
          emergencyPhone: input.emergencyPhone,
          idProofType: input.idProofType,
          idProofNumber: input.idProofNumber || null,
          baseRent: q.baseRent,
          acCharge: q.acCharge,
          floorPremium: q.floorPremium,
          rentDiscount: q.rentDiscount,
          netRent: q.netRent,
          messCharges: q.messCharges,
          addonCharges: q.addonCharges,
          monthlyTotal: q.monthlyTotal,
          deposit: q.deposit,
          moveInTotal: q.moveInTotal,
          amountPaid,
          balanceDue,
          paymentMode: input.paymentMode,
          status,
          notes: input.notes || null,
          createdAt: new Date(),
        };

        memoryStore.bookings.unshift(newBooking);

        // Auto-create initial Move-In rent record in ledger
        const invId = memoryStore.nextRentRecordId++;
        const rentRecord: MemoryRentRecord = {
          id: invId,
          recordCode: `INV-${year}-${1000 + invId}`,
          bookingCode: code,
          residentName: input.fullName,
          mobile: input.mobile,
          roomCode: bed.roomCode,
          bedLabel: bed.bedLabel,
          tier: TIERS[input.tier].label,
          month: new Date(input.moveInDate).toLocaleString("default", { month: "long", year: "numeric" }),
          baseRent: q.monthlyTotal,
          electricityUnits: 0,
          electricityAmount: 0,
          otherCharges: 0,
          totalDue: q.moveInTotal,
          amountPaid,
          balanceDue,
          dueDate: input.moveInDate,
          daysOverdue: 0,
          status: balanceDue === 0 ? "paid" : "pending",
          paidAt: amountPaid > 0 ? new Date().toLocaleDateString("en-GB") : undefined,
          paymentMode: amountPaid > 0 ? "UPI" : undefined,
        };
        memoryStore.rentLedger.unshift(rentRecord);

        return {
          id,
          code,
          bedLabel: bed.bedLabel,
          roomCode: bed.roomCode,
          position: bed.position,
          tier: input.tier,
          tierLabel: TIERS[input.tier].label,
          coolingLabel: COOLING_LABEL[input.cooling],
          floorLabel: FLOOR_LABEL[input.floor],
          tenureLabel: TENURES.find((t) => t.key === input.tenure)?.label ?? "",
          meals: input.meals,
          addons: input.addons,
          moveInDate: input.moveInDate,
          fullName: input.fullName,
          mobile: input.mobile,
          email: input.email,
          gender: input.gender,
          category: input.category,
          institution: input.institution || null,
          emergencyName: input.emergencyName,
          emergencyPhone: input.emergencyPhone,
          idProofType: input.idProofType,
          idProofNumber: input.idProofNumber || null,
          quote: q,
          amountPaid,
          balanceDue,
          paymentMode: input.paymentMode,
          status,
          createdAt: newBooking.createdAt.toISOString(),
        };
      }

      // PostgreSQL atomic transaction
      const result = await db.transaction(async (tx) => {
        const claimed = await tx
          .update(beds)
          .set({
            status: "booked",
            residentHint: `Booked · ${input.fullName}`,
            updatedAt: new Date(),
          })
          .where(and(eq(beds.id, input.bedId), eq(beds.status, "available")))
          .returning();

        if (claimed.length === 0) {
          throw new Error("BED_UNAVAILABLE");
        }

        const bed = claimed[0];
        if (bed.tier !== input.tier || bed.cooling !== input.cooling || bed.floor !== input.floor) {
          throw new Error("BED_MISMATCH");
        }

        const inserted = await tx
          .insert(bookings)
          .values({
            code: "PENDING",
            bedId: bed.id,
            bedKey: bed.bedKey,
            bedLabel: bed.bedLabel,
            roomCode: bed.roomCode,
            tier: input.tier,
            cooling: input.cooling,
            floor: input.floor,
            tenure: input.tenure,
            meals: input.meals,
            addons: input.addons,
            moveInDate: input.moveInDate,
            fullName: input.fullName,
            mobile: input.mobile,
            email: input.email,
            gender: input.gender,
            category: input.category,
            institution: input.institution || null,
            emergencyName: input.emergencyName,
            emergencyPhone: input.emergencyPhone,
            idProofType: input.idProofType,
            idProofNumber: input.idProofNumber || null,
            baseRent: q.baseRent,
            acCharge: q.acCharge,
            floorPremium: q.floorPremium,
            rentDiscount: q.rentDiscount,
            netRent: q.netRent,
            messCharges: q.messCharges,
            addonCharges: q.addonCharges,
            monthlyTotal: q.monthlyTotal,
            deposit: q.deposit,
            moveInTotal: q.moveInTotal,
            amountPaid,
            balanceDue,
            paymentMode: input.paymentMode,
            status,
            notes: input.notes || null,
          })
          .returning({ id: bookings.id, createdAt: bookings.createdAt });

        const id = inserted[0].id;
        const year = new Date().getFullYear();
        const serialNo = 1000 + ((id * 7919) % 9000);
        const code = `#PANDEY-${year}-${serialNo}`;

        await tx.update(bookings).set({ code }).where(eq(bookings.id, id));

        // Auto-create initial Move-In rent record in ledger
        const invCode = `INV-${year}-${2000 + id}`;
        const moveInMonth = new Date(input.moveInDate).toLocaleString("default", {
          month: "long",
          year: "numeric",
        });

        await tx.insert(rentRecords).values({
          recordCode: invCode,
          bookingCode: code,
          residentName: input.fullName,
          mobile: input.mobile,
          roomCode: bed.roomCode,
          bedLabel: bed.bedLabel,
          tier: TIERS[input.tier].label,
          month: moveInMonth,
          baseRent: q.monthlyTotal,
          electricityUnits: 0,
          electricityAmount: 0,
          otherCharges: 0,
          totalDue: q.moveInTotal,
          amountPaid,
          balanceDue,
          dueDate: input.moveInDate,
          daysOverdue: 0,
          status: balanceDue === 0 ? "paid" : "pending",
          paidAt: amountPaid > 0 ? new Date().toLocaleDateString("en-GB") : null,
          paymentMode: amountPaid > 0 ? "UPI" : null,
        });

        return { id, code, bed, createdAt: inserted[0].createdAt };
      });

      return {
        id: result.id,
        code: result.code,
        bedLabel: result.bed.bedLabel,
        roomCode: result.bed.roomCode,
        position: result.bed.position,
        tier: input.tier,
        tierLabel: TIERS[input.tier].label,
        coolingLabel: COOLING_LABEL[input.cooling],
        floorLabel: FLOOR_LABEL[input.floor],
        tenureLabel: TENURES.find((t) => t.key === input.tenure)?.label ?? "",
        meals: input.meals,
        addons: input.addons,
        moveInDate: input.moveInDate,
        fullName: input.fullName,
        mobile: input.mobile,
        email: input.email,
        gender: input.gender,
        category: input.category,
        institution: input.institution || null,
        emergencyName: input.emergencyName,
        emergencyPhone: input.emergencyPhone,
        idProofType: input.idProofType,
        idProofNumber: input.idProofNumber || null,
        quote: q,
        amountPaid,
        balanceDue,
        paymentMode: input.paymentMode,
        status,
        createdAt: result.createdAt ? new Date(result.createdAt).toISOString() : new Date().toISOString(),
      };
    },

    async getByCode(rawCode: string) {
      await DataPipeline.init();
      const { withHash, clean } = normalizeCode(rawCode);

      if (!hasDb || !db) {
        const booking = memoryStore.bookings.find((b) => {
          const c = b.code.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          return c === clean || c.endsWith(clean) || b.code.toLowerCase() === withHash.toLowerCase();
        });

        if (!booking) return null;
        const bed = booking.bedId ? memoryStore.beds.find((b) => b.id === booking.bedId) ?? null : null;
        return { booking, bed };
      }

      const rows = await db
        .select()
        .from(bookings)
        .where(
          sql`${bookings.code} = ${withHash} OR ${bookings.code} ILIKE ${`%${clean}`}`
        )
        .limit(1);

      const booking = rows[0];
      if (!booking) return null;

      const bedRows = booking.bedId
        ? await db.select().from(beds).where(eq(beds.id, booking.bedId)).limit(1)
        : [];

      return { booking, bed: bedRows[0] ?? null };
    },

    async getRecent(limit = 6) {
      await DataPipeline.init();
      if (!hasDb || !db) {
        const recent = memoryStore.bookings.slice(0, limit).map((b) => ({
          code: b.code,
          fullName: b.fullName,
          tier: b.tier,
          bedLabel: b.bedLabel,
          roomCode: b.roomCode,
          moveInDate: b.moveInDate,
          monthlyTotal: b.monthlyTotal,
          status: b.status,
          createdAt: b.createdAt.toISOString(),
        }));
        const count = memoryStore.bookings.length;
        const revenue = memoryStore.bookings.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
        return { recent, totals: { count, revenue } };
      }

      const rows = await db
        .select({
          code: bookings.code,
          fullName: bookings.fullName,
          tier: bookings.tier,
          bedLabel: bookings.bedLabel,
          roomCode: bookings.roomCode,
          moveInDate: bookings.moveInDate,
          monthlyTotal: bookings.monthlyTotal,
          status: bookings.status,
          createdAt: bookings.createdAt,
        })
        .from(bookings)
        .orderBy(desc(bookings.id))
        .limit(limit);

      const totals = await db
        .select({
          count: sql<number>`count(*)::int`,
          revenue: sql<number>`coalesce(sum(${bookings.amountPaid}), 0)::int`,
        })
        .from(bookings);

      return { recent: rows, totals: totals[0] };
    },

    async updateStatus(code: string, status: string) {
      await DataPipeline.init();
      const { withHash, clean } = normalizeCode(code);

      if (!hasDb || !db) {
        const b = memoryStore.bookings.find((item) => {
          const c = item.code.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          return c === clean || item.code.toLowerCase() === withHash.toLowerCase();
        });
        if (!b) throw new Error("Booking not found.");
        b.status = status;

        if ((status === "vacated" || status === "cancelled") && b.bedId) {
          const bed = memoryStore.beds.find((bd) => bd.id === b.bedId);
          if (bed) {
            bed.status = "available";
            bed.residentHint = null;
          }
        }
        return b;
      }

      const [bk] = await db
        .select()
        .from(bookings)
        .where(sql`${bookings.code} = ${withHash} OR ${bookings.code} ILIKE ${`%${clean}`}`)
        .limit(1);

      if (!bk) throw new Error("Booking not found.");

      await db.update(bookings).set({ status }).where(eq(bookings.id, bk.id));

      if (status === "vacated" || status === "cancelled") {
        if (bk.bedId) {
          await db
            .update(beds)
            .set({ status: "available", residentHint: null })
            .where(eq(beds.id, bk.bedId));
        }
      }
      return { ...bk, status };
    },

    async recordPayment(bookingCode: string, amount: number, paymentMethod?: string, txnRef?: string) {
      await DataPipeline.init();
      const { withHash, clean } = normalizeCode(bookingCode);
      const cleanAmount = Number(amount) || 0;
      const txnId = txnRef || `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      if (!hasDb || !db) {
        const booking = memoryStore.bookings.find((b) => {
          const c = b.code.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          return c === clean || b.code.toLowerCase() === withHash.toLowerCase();
        });

        if (booking) {
          booking.amountPaid = (booking.amountPaid || 0) + cleanAmount;
          booking.balanceDue = Math.max(0, booking.moveInTotal - booking.amountPaid);
          booking.status = "confirmed";

          // Sync matching rent record
          const rentRec = memoryStore.rentLedger.find((r) => r.bookingCode === booking.code);
          if (rentRec) {
            rentRec.amountPaid = (rentRec.amountPaid || 0) + cleanAmount;
            rentRec.balanceDue = Math.max(0, rentRec.totalDue - rentRec.amountPaid);
            if (rentRec.balanceDue === 0) {
              rentRec.status = "paid";
              rentRec.paidAt = new Date().toLocaleDateString("en-GB");
              rentRec.paymentMode = (paymentMethod as any) || "UPI";
            }
          }
        }

        return { ok: true, transactionId: txnId, amount: cleanAmount, method: paymentMethod || "UPI" };
      }

      const [existing] = await db
        .select()
        .from(bookings)
        .where(sql`${bookings.code} = ${withHash} OR ${bookings.code} ILIKE ${`%${clean}`}`)
        .limit(1);

      if (existing) {
        const newPaid = (existing.amountPaid || 0) + cleanAmount;
        const newBalance = Math.max(0, (existing.moveInTotal || 0) - newPaid);

        await db
          .update(bookings)
          .set({
            amountPaid: newPaid,
            balanceDue: newBalance,
            status: "confirmed",
          })
          .where(eq(bookings.id, existing.id));

        // Sync rent records
        const [matchingRent] = await db
          .select()
          .from(rentRecords)
          .where(eq(rentRecords.bookingCode, existing.code))
          .limit(1);

        if (matchingRent) {
          const rentPaid = (matchingRent.amountPaid || 0) + cleanAmount;
          const rentBal = Math.max(0, (matchingRent.totalDue || 0) - rentPaid);
          await db
            .update(rentRecords)
            .set({
              amountPaid: rentPaid,
              balanceDue: rentBal,
              status: rentBal === 0 ? "paid" : "pending",
              paidAt: rentBal === 0 ? new Date().toLocaleDateString("en-GB") : undefined,
              paymentMode: rentBal === 0 ? (paymentMethod || "UPI") : undefined,
            })
            .where(eq(rentRecords.id, matchingRent.id));
        }
      }

      return { ok: true, transactionId: txnId, amount: cleanAmount, method: paymentMethod || "UPI" };
    },
  };

  /* ==========================================================================
   * RESIDENT PORTAL PIPELINE (Profile, Dinner Skips, Tickets, Gate Passes)
   * ========================================================================== */
  static resident = {
    async lookup(query: string) {
      await DataPipeline.init();
      const cleanQuery = query.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const todayISO = new Date().toISOString().slice(0, 10);

      let booking: BookingRow | MemoryBooking | null = null;

      if (!hasDb || !db) {
        booking =
          memoryStore.bookings.find((b) => {
            const c = b.code.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            const m = b.mobile.replace(/\D/g, "");
            return c === cleanQuery || c.endsWith(cleanQuery) || m === cleanQuery || m.endsWith(cleanQuery);
          }) ?? null;
      } else {
        const rows = await db
          .select()
          .from(bookings)
          .where(
            sql`replace(lower(${bookings.code}), '#', '') ILIKE ${`%${cleanQuery}%`} OR regexp_replace(${bookings.mobile}, '\\D', '', 'g') ILIKE ${`%${cleanQuery}%`}`
          )
          .limit(1);
        booking = rows[0] ?? null;
      }

      if (!booking) return null;

      // Tickets for this resident
      let tickets: (MaintenanceTicketRow | MemoryTicket)[] = [];
      // Gate passes for this resident
      let passes: (GatePassRow | MemoryGatePass)[] = [];
      // Has skipped dinner today
      let hasSkippedDinner = false;

      if (!hasDb || !db) {
        tickets = memoryStore.tickets
          .filter((t) => t.residentCode === booking!.code)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        passes = memoryStore.gatePasses
          .filter((g) => g.residentCode === booking!.code)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        hasSkippedDinner = memoryStore.mealSkips.some(
          (s) => s.residentCode === booking!.code && s.date === todayISO
        );
      } else {
        tickets = await db
          .select()
          .from(maintenanceTickets)
          .where(eq(maintenanceTickets.residentCode, booking.code))
          .orderBy(desc(maintenanceTickets.id));

        passes = await db
          .select()
          .from(gatePasses)
          .where(eq(gatePasses.residentCode, booking.code))
          .orderBy(desc(gatePasses.id));

        const skipRows = await db
          .select()
          .from(mealSkips)
          .where(and(eq(mealSkips.residentCode, booking.code), eq(mealSkips.date, todayISO)))
          .limit(1);

        hasSkippedDinner = skipRows.length > 0;
      }

      return {
        booking,
        tickets,
        gatePasses: passes,
        hasSkippedDinner,
      };
    },

    async toggleDinnerSkip(residentCode: string) {
      await DataPipeline.init();
      const { withHash, clean } = normalizeCode(residentCode);
      const todayISO = new Date().toISOString().slice(0, 10);

      // Verify resident exists
      let code = residentCode;
      if (!hasDb || !db) {
        const b = memoryStore.bookings.find((item) => {
          const c = item.code.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          return c === clean || item.code.toLowerCase() === withHash.toLowerCase();
        });
        if (!b) throw new Error("Resident not found.");
        code = b.code;

        const idx = memoryStore.mealSkips.findIndex(
          (s) => s.residentCode === code && s.date === todayISO
        );

        let skipped = false;
        if (idx >= 0) {
          memoryStore.mealSkips.splice(idx, 1);
          skipped = false;
        } else {
          memoryStore.mealSkips.push({ residentCode: code, date: todayISO });
          skipped = true;
        }

        return {
          skipped,
          message: skipped
            ? "Kitchen alerted: You are marked as skipping tonight's dinner."
            : "Dinner attendance restored: Dinner will be prepared for you tonight.",
        };
      }

      const [b] = await db
        .select()
        .from(bookings)
        .where(sql`${bookings.code} = ${withHash} OR ${bookings.code} ILIKE ${`%${clean}`}`)
        .limit(1);

      if (!b) throw new Error("Resident not found.");
      code = b.code;

      const existing = await db
        .select()
        .from(mealSkips)
        .where(and(eq(mealSkips.residentCode, code), eq(mealSkips.date, todayISO)))
        .limit(1);

      let skipped = false;
      if (existing.length > 0) {
        await db.delete(mealSkips).where(eq(mealSkips.id, existing[0].id));
        skipped = false;
      } else {
        await db.insert(mealSkips).values({ residentCode: code, date: todayISO });
        skipped = true;
      }

      return {
        skipped,
        message: skipped
          ? "Kitchen alerted: You are marked as skipping tonight's dinner."
          : "Dinner attendance restored: Dinner will be prepared for you tonight.",
      };
    },

    async createTicket(input: {
      residentCode: string;
      category: string;
      description: string;
      urgency?: "normal" | "urgent";
    }) {
      await DataPipeline.init();
      const { withHash, clean } = normalizeCode(input.residentCode);

      if (!hasDb || !db) {
        const booking = memoryStore.bookings.find((b) => {
          const c = b.code.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          return c === clean || b.code.toLowerCase() === withHash.toLowerCase();
        });
        if (!booking) throw new Error("Resident not found.");

        const ticket: MemoryTicket = {
          id: memoryStore.nextTicketId++,
          ticketId: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
          residentCode: booking.code,
          residentName: booking.fullName,
          roomCode: booking.roomCode || "Assigned Room",
          category: input.category,
          description: input.description,
          urgency: input.urgency === "urgent" ? "urgent" : "normal",
          status: "open",
          createdAt: new Date(),
        };

        memoryStore.tickets.unshift(ticket);
        return ticket;
      }

      const [booking] = await db
        .select()
        .from(bookings)
        .where(sql`${bookings.code} = ${withHash} OR ${bookings.code} ILIKE ${`%${clean}`}`)
        .limit(1);

      if (!booking) throw new Error("Resident not found.");

      const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      const inserted = await db
        .insert(maintenanceTickets)
        .values({
          ticketId,
          residentCode: booking.code,
          residentName: booking.fullName,
          roomCode: booking.roomCode || "Assigned Room",
          category: input.category,
          description: input.description,
          urgency: input.urgency === "urgent" ? "urgent" : "normal",
          status: "open",
        })
        .returning();

      return inserted[0];
    },

    async createGatePass(input: {
      residentCode: string;
      passType: "late_entry" | "night_out";
      reason: string;
      departureTime?: string;
      expectedReturn: string;
    }) {
      await DataPipeline.init();
      const { withHash, clean } = normalizeCode(input.residentCode);

      if (!hasDb || !db) {
        const booking = memoryStore.bookings.find((b) => {
          const c = b.code.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          return c === clean || b.code.toLowerCase() === withHash.toLowerCase();
        });
        if (!booking) throw new Error("Resident not found.");

        const pass: MemoryGatePass = {
          id: memoryStore.nextGatePassId++,
          passCode: `GP-${Math.floor(1000 + Math.random() * 9000)}`,
          residentCode: booking.code,
          residentName: booking.fullName,
          roomCode: booking.roomCode || "Assigned Room",
          mobile: booking.mobile,
          passType: input.passType,
          reason: input.reason,
          departureTime: input.departureTime || "10:30 PM",
          expectedReturn: input.expectedReturn,
          status: "approved",
          createdAt: new Date(),
        };

        memoryStore.gatePasses.unshift(pass);
        return pass;
      }

      const [booking] = await db
        .select()
        .from(bookings)
        .where(sql`${bookings.code} = ${withHash} OR ${bookings.code} ILIKE ${`%${clean}`}`)
        .limit(1);

      if (!booking) throw new Error("Resident not found.");

      const passCode = `GP-${Math.floor(1000 + Math.random() * 9000)}`;
      const inserted = await db
        .insert(gatePasses)
        .values({
          passCode,
          residentCode: booking.code,
          residentName: booking.fullName,
          roomCode: booking.roomCode || "Assigned Room",
          mobile: booking.mobile,
          passType: input.passType,
          reason: input.reason,
          departureTime: input.departureTime || "10:30 PM",
          expectedReturn: input.expectedReturn,
          status: "approved",
        })
        .returning();

      return inserted[0];
    },
  };

  /* ==========================================================================
   * RENT LEDGER PIPELINE
   * ========================================================================== */
  static rent = {
    async getAll(): Promise<(RentRecordRow | MemoryRentRecord)[]> {
      await DataPipeline.init();
      if (!hasDb || !db) {
        return memoryStore.rentLedger;
      }
      return await db.select().from(rentRecords).orderBy(desc(rentRecords.id));
    },

    async getSummary() {
      const ledger = await DataPipeline.rent.getAll();
      const totalExpected = ledger.reduce((sum, r) => sum + (r.totalDue || 0), 0);
      const totalCollected = ledger.reduce((sum, r) => sum + (r.amountPaid || 0), 0);
      const totalOverdue = ledger
        .filter((r) => r.status === "overdue")
        .reduce((sum, r) => sum + (r.balanceDue || 0), 0);
      const collectionRate =
        totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

      return {
        totalExpected,
        totalCollected,
        totalOverdue,
        collectionRate,
        paidCount: ledger.filter((r) => r.status === "paid").length,
        overdueCount: ledger.filter((r) => r.status === "overdue").length,
        pendingCount: ledger.filter((r) => r.status === "pending").length,
      };
    },

    async markPaid(recordCode: string, paymentMode?: string) {
      await DataPipeline.init();
      const todayStr = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      if (!hasDb || !db) {
        const record = memoryStore.rentLedger.find((r) => r.recordCode === recordCode);
        if (!record) throw new Error("Rent record not found.");
        record.amountPaid = record.totalDue;
        record.balanceDue = 0;
        record.daysOverdue = 0;
        record.status = "paid";
        record.paidAt = todayStr;
        record.paymentMode = (paymentMode as any) || "UPI";
        return record;
      }

      const [record] = await db
        .select()
        .from(rentRecords)
        .where(eq(rentRecords.recordCode, recordCode))
        .limit(1);

      if (!record) throw new Error("Rent record not found.");

      const updated = await db
        .update(rentRecords)
        .set({
          amountPaid: record.totalDue,
          balanceDue: 0,
          daysOverdue: 0,
          status: "paid",
          paidAt: todayStr,
          paymentMode: paymentMode || "UPI",
        })
        .where(eq(rentRecords.id, record.id))
        .returning();

      return updated[0];
    },

    async updateElectricity(recordCode: string, electricityUnits: number) {
      await DataPipeline.init();
      const units = Math.max(0, Number(electricityUnits) || 0);
      const elecAmount = Math.round(units * 8.5);

      if (!hasDb || !db) {
        const record = memoryStore.rentLedger.find((r) => r.recordCode === recordCode);
        if (!record) throw new Error("Rent record not found.");

        record.electricityUnits = units;
        record.electricityAmount = elecAmount;
        record.totalDue = record.baseRent + elecAmount + (record.otherCharges || 0);
        record.balanceDue = Math.max(0, record.totalDue - record.amountPaid);

        if (record.balanceDue === 0) {
          record.status = "paid";
        } else if (record.daysOverdue > 0) {
          record.status = "overdue";
        } else {
          record.status = "pending";
        }

        return record;
      }

      const [record] = await db
        .select()
        .from(rentRecords)
        .where(eq(rentRecords.recordCode, recordCode))
        .limit(1);

      if (!record) throw new Error("Rent record not found.");

      const totalDue = record.baseRent + elecAmount + (record.otherCharges || 0);
      const balanceDue = Math.max(0, totalDue - record.amountPaid);
      let status: "paid" | "overdue" | "pending" = "pending";
      if (balanceDue === 0) status = "paid";
      else if (record.daysOverdue > 0) status = "overdue";

      const updated = await db
        .update(rentRecords)
        .set({
          electricityUnits: units,
          electricityAmount: elecAmount,
          totalDue,
          balanceDue,
          status,
        })
        .where(eq(rentRecords.id, record.id))
        .returning();

      return updated[0];
    },

    async createRecord(input: {
      bookingCode?: string;
      residentName: string;
      mobile?: string;
      roomCode: string;
      bedLabel?: string;
      tier?: string;
      month?: string;
      baseRent: number;
      electricityUnits?: number;
      otherCharges?: number;
      dueDate?: string;
    }) {
      await DataPipeline.init();
      const units = Math.max(0, Number(input.electricityUnits) || 0);
      const elecAmount = Math.round(units * 8.5);
      const base = Number(input.baseRent) || 0;
      const other = Number(input.otherCharges) || 0;
      const total = base + elecAmount + other;

      if (!hasDb || !db) {
        const newId = memoryStore.nextRentRecordId++;
        const recordCode = `INV-${new Date().getFullYear()}-${1000 + newId}`;
        const newRecord: MemoryRentRecord = {
          id: newId,
          recordCode,
          bookingCode: input.bookingCode || `RES-${input.roomCode}`,
          residentName: input.residentName,
          mobile: input.mobile || "9876543210",
          roomCode: input.roomCode,
          bedLabel: input.bedLabel || "Bed A",
          tier: input.tier || "Double Sharing",
          month: input.month || "October 2026",
          baseRent: base,
          electricityUnits: units,
          electricityAmount: elecAmount,
          otherCharges: other,
          totalDue: total,
          amountPaid: 0,
          balanceDue: total,
          dueDate: input.dueDate || "05 Nov 2026",
          daysOverdue: 0,
          status: "pending",
        };
        memoryStore.rentLedger.unshift(newRecord);
        return newRecord;
      }

      const year = new Date().getFullYear();
      const countRes = await db.select({ count: sql<number>`count(*)::int` }).from(rentRecords);
      const serial = 1000 + (countRes[0]?.count ?? 0) + 1;
      const recordCode = `INV-${year}-${serial}`;

      const inserted = await db
        .insert(rentRecords)
        .values({
          recordCode,
          bookingCode: input.bookingCode || `RES-${input.roomCode}`,
          residentName: input.residentName,
          mobile: input.mobile || "9876543210",
          roomCode: input.roomCode,
          bedLabel: input.bedLabel || "Bed A",
          tier: input.tier || "Double Sharing",
          month: input.month || "October 2026",
          baseRent: base,
          electricityUnits: units,
          electricityAmount: elecAmount,
          otherCharges: other,
          totalDue: total,
          amountPaid: 0,
          balanceDue: total,
          dueDate: input.dueDate || "05 Nov 2026",
          daysOverdue: 0,
          status: "pending",
        })
        .returning();

      return inserted[0];
    },
  };

  /* ==========================================================================
   * TICKETS PIPELINE
   * ========================================================================== */
  static tickets = {
    async getAll(): Promise<(MaintenanceTicketRow | MemoryTicket)[]> {
      await DataPipeline.init();
      if (!hasDb || !db) {
        return memoryStore.tickets;
      }
      return await db.select().from(maintenanceTickets).orderBy(desc(maintenanceTickets.id));
    },

    async updateStatus(ticketId: string, status: "open" | "in_progress" | "resolved") {
      await DataPipeline.init();
      if (!hasDb || !db) {
        const ticket = memoryStore.tickets.find((t) => t.ticketId === ticketId);
        if (!ticket) throw new Error("Ticket not found.");
        ticket.status = status;
        return ticket;
      }

      const updated = await db
        .update(maintenanceTickets)
        .set({ status, updatedAt: new Date() })
        .where(eq(maintenanceTickets.ticketId, ticketId))
        .returning();

      if (updated.length === 0) throw new Error("Ticket not found.");
      return updated[0];
    },
  };

  /* ==========================================================================
   * GATE PASSES PIPELINE
   * ========================================================================== */
  static gatePasses = {
    async getAll(): Promise<(GatePassRow | MemoryGatePass)[]> {
      await DataPipeline.init();
      if (!hasDb || !db) {
        return memoryStore.gatePasses;
      }
      return await db.select().from(gatePasses).orderBy(desc(gatePasses.id));
    },
  };

  /* ==========================================================================
   * TOURS & ENQUIRIES PIPELINE
   * ========================================================================== */
  static tours = {
    async create(input: {
      tourType: string;
      date: string;
      slot: string;
      name: string;
      phone: string;
      email?: string | null;
      visitors: number;
      interestedTier?: string | null;
      notes?: string | null;
    }) {
      await DataPipeline.init();
      const reference = `TOUR-${Date.now().toString(36).toUpperCase().slice(-5)}`;

      if (!hasDb || !db) {
        const newTour: MemoryTour = {
          id: memoryStore.nextTourId++,
          reference,
          tourType: input.tourType,
          date: input.date,
          slot: input.slot,
          name: input.name,
          phone: input.phone,
          email: input.email || null,
          visitors: input.visitors,
          interestedTier: (input.interestedTier as TierKey) || null,
          notes: input.notes || null,
          status: "requested",
          createdAt: new Date(),
        };
        memoryStore.tours.unshift(newTour);
        return newTour;
      }

      const inserted = await db
        .insert(tourRequests)
        .values({
          reference,
          tourType: input.tourType,
          date: input.date,
          slot: input.slot,
          name: input.name,
          phone: input.phone,
          email: input.email || null,
          visitors: input.visitors,
          interestedTier: (input.interestedTier as TierKey) || null,
          notes: input.notes || null,
          status: "requested",
        })
        .returning();

      return inserted[0];
    },
  };

  static enquiries = {
    async create(input: {
      name: string;
      phone: string;
      email?: string | null;
      tier?: string | null;
      moveIn?: string | null;
      message: string;
    }) {
      await DataPipeline.init();

      if (!hasDb || !db) {
        const row: MemoryEnquiry = {
          id: memoryStore.nextEnquiryId++,
          name: input.name,
          phone: input.phone,
          email: input.email || null,
          tier: input.tier || null,
          moveIn: input.moveIn || null,
          message: input.message,
          createdAt: new Date(),
        };
        memoryStore.enquiries.unshift(row);
        return row;
      }

      const row = await db
        .insert(enquiries)
        .values({
          name: input.name,
          phone: input.phone,
          email: input.email || null,
          tier: input.tier || null,
          moveIn: input.moveIn || null,
          message: input.message,
        })
        .returning();

      return row[0];
    },

    async getAll(): Promise<(EnquiryRow | MemoryEnquiry)[]> {
      await DataPipeline.init();
      if (!hasDb || !db) {
        return memoryStore.enquiries;
      }
      return await db.select().from(enquiries).orderBy(desc(enquiries.id));
    },
  };

  /* ==========================================================================
   * ADMIN AGGREGATED PIPELINE
   * ========================================================================== */
  static admin = {
    async getOverview() {
      await DataPipeline.init();
      const todayISO = new Date().toISOString().slice(0, 10);

      const [allBeds, allBookings, allEnquiries, tickets, passes, rentLedger, rentSummary] =
        await Promise.all([
          DataPipeline.beds.getAll(),
          hasDb && db
            ? db.select().from(bookings).orderBy(desc(bookings.id))
            : Promise.resolve(memoryStore.bookings),
          DataPipeline.enquiries.getAll(),
          DataPipeline.tickets.getAll(),
          DataPipeline.gatePasses.getAll(),
          DataPipeline.rent.getAll(),
          DataPipeline.rent.getSummary(),
        ]);

      // Count dinner skips today
      let mealSkipsCount = 0;
      if (!hasDb || !db) {
        mealSkipsCount = memoryStore.mealSkips.filter((s) => s.date === todayISO).length;
      } else {
        const countRes = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(mealSkips)
          .where(eq(mealSkips.date, todayISO));
        mealSkipsCount = countRes[0]?.count ?? 0;
      }

      // Map beds with live occupancy details
      const bedsWithOccupant = allBeds.map((b) => {
        const activeBooking = allBookings.find(
          (bk) => bk.bedId === b.id && bk.status !== "cancelled" && bk.status !== "vacated"
        );
        return {
          id: b.id,
          bedKey: b.bedKey,
          roomCode: b.roomCode,
          bedLabel: b.bedLabel,
          tier: b.tier,
          cooling: b.cooling,
          floor: b.floor,
          status: activeBooking
            ? activeBooking.status === "checked_in"
              ? "occupied"
              : "reserved"
            : b.status === "booked"
              ? "occupied"
              : "available",
          residentName: activeBooking ? activeBooking.fullName : null,
          residentPhone: activeBooking ? activeBooking.mobile : null,
          bookingCode: activeBooking ? activeBooking.code : null,
        };
      });

      const totalBeds = bedsWithOccupant.length;
      const occupiedBeds = bedsWithOccupant.filter(
        (b) => b.status === "occupied" || b.status === "reserved"
      ).length;
      const availableBeds = totalBeds - occupiedBeds;
      const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      const totalRevenue = allBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
      const projectedMonthly = allBookings.reduce((sum, b) => sum + (b.monthlyTotal || 0), 0);

      return {
        summary: {
          totalBeds,
          occupiedBeds,
          availableBeds,
          occupancyRate,
          totalBookings: allBookings.length,
          totalRevenue,
          projectedMonthly,
          totalEnquiries: allEnquiries.length,
          rentSummary,
        },
        beds: bedsWithOccupant,
        bookings: allBookings,
        enquiries: allEnquiries,
        tickets,
        gatePasses: passes,
        mealSkipsCount,
        rentLedger,
      };
    },
  };
}
