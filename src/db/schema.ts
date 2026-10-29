import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/** Every physical bed / suite that can be reserved through the booking flow. */
export const beds = pgTable(
  "beds",
  {
    id: serial("id").primaryKey(),
    bedKey: text("bed_key").notNull(),
    tier: text("tier").notNull(),
    cooling: text("cooling").notNull(),
    floor: text("floor").notNull(),
    roomCode: text("room_code").notNull(),
    bedLabel: text("bed_label").notNull(),
    position: text("position").notNull(),
    status: text("status").notNull().default("available"),
    residentHint: text("resident_hint"),
    gridSlot: integer("grid_slot").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("beds_key_idx").on(t.bedKey),
    index("beds_status_idx").on(t.status),
    index("beds_tier_idx").on(t.tier),
  ],
);

/** Verified resident bookings and check-in pass records. */
export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull(),
    bedId: integer("bed_id"),
    bedKey: text("bed_key"),
    bedLabel: text("bed_label"),
    roomCode: text("room_code"),

    tier: text("tier").notNull(),
    cooling: text("cooling").notNull(),
    floor: text("floor").notNull(),
    tenure: text("tenure").notNull(),
    meals: text("meals").notNull(),
    addons: jsonb("addons").$type<string[]>().notNull().default([]),
    moveInDate: text("move_in_date").notNull(),

    fullName: text("full_name").notNull(),
    mobile: text("mobile").notNull(),
    email: text("email").notNull(),
    gender: text("gender").notNull(),
    category: text("category").notNull(),
    institution: text("institution"),
    emergencyName: text("emergency_name").notNull(),
    emergencyPhone: text("emergency_phone").notNull(),
    idProofType: text("id_proof_type").notNull(),
    idProofNumber: text("id_proof_number"),

    baseRent: integer("base_rent").notNull(),
    acCharge: integer("ac_charge").notNull(),
    floorPremium: integer("floor_premium").notNull(),
    rentDiscount: integer("rent_discount").notNull(),
    netRent: integer("net_rent").notNull(),
    messCharges: integer("mess_charges").notNull(),
    addonCharges: integer("addon_charges").notNull(),
    monthlyTotal: integer("monthly_total").notNull(),
    deposit: integer("deposit").notNull(),
    moveInTotal: integer("move_in_total").notNull(),
    amountPaid: integer("amount_paid").notNull(),
    balanceDue: integer("balance_due").notNull(),
    paymentMode: text("payment_mode").notNull(),
    status: text("status").notNull().default("confirmed"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("bookings_code_idx").on(t.code),
    index("bookings_mobile_idx").on(t.mobile),
    index("bookings_status_idx").on(t.status),
  ],
);

/** Prospective resident scheduled in-person and video tours. */
export const tourRequests = pgTable(
  "tour_requests",
  {
    id: serial("id").primaryKey(),
    reference: text("reference").notNull(),
    tourType: text("tour_type").notNull(),
    date: text("date").notNull(),
    slot: text("slot").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    visitors: integer("visitors").notNull().default(1),
    interestedTier: text("interested_tier"),
    notes: text("notes"),
    status: text("status").notNull().default("requested"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("tour_requests_ref_idx").on(t.reference)],
);

/** Incoming visitor enquiries and callback requests. */
export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  tier: text("tier"),
  moveIn: text("move_in"),
  message: text("message"),
  handled: boolean("handled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Resident maintenance complaints & facilities service requests. */
export const maintenanceTickets = pgTable(
  "maintenance_tickets",
  {
    id: serial("id").primaryKey(),
    ticketId: text("ticket_id").notNull(),
    residentCode: text("resident_code").notNull(),
    residentName: text("resident_name").notNull(),
    roomCode: text("room_code").notNull(),
    category: text("category").notNull(),
    description: text("description").notNull(),
    urgency: text("urgency").notNull().default("normal"), // normal | urgent
    status: text("status").notNull().default("open"), // open | in_progress | resolved
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("tickets_ticket_id_idx").on(t.ticketId),
    index("tickets_resident_code_idx").on(t.residentCode),
    index("tickets_status_idx").on(t.status),
  ],
);

/** Digital gate passes for night-outs and late entries. */
export const gatePasses = pgTable(
  "gate_passes",
  {
    id: serial("id").primaryKey(),
    passCode: text("pass_code").notNull(),
    residentCode: text("resident_code").notNull(),
    residentName: text("resident_name").notNull(),
    roomCode: text("room_code").notNull(),
    mobile: text("mobile").notNull(),
    passType: text("pass_type").notNull().default("late_entry"), // late_entry | night_out
    reason: text("reason").notNull(),
    departureTime: text("departure_time").notNull(),
    expectedReturn: text("expected_return").notNull(),
    status: text("status").notNull().default("approved"), // approved | pending | used
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("gate_passes_code_idx").on(t.passCode),
    index("gate_passes_resident_code_idx").on(t.residentCode),
  ],
);

/** Resident dinner meal skipping declarations to eliminate food waste. */
export const mealSkips = pgTable(
  "meal_skips",
  {
    id: serial("id").primaryKey(),
    residentCode: text("resident_code").notNull(),
    date: text("date").notNull(), // YYYY-MM-DD
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("meal_skips_res_date_idx").on(t.residentCode, t.date),
    index("meal_skips_date_idx").on(t.date),
  ],
);

/** Monthly rent invoices, sub-meter readings, overdue dues & payment ledger. */
export const rentRecords = pgTable(
  "rent_records",
  {
    id: serial("id").primaryKey(),
    recordCode: text("record_code").notNull(),
    bookingCode: text("booking_code").notNull(),
    residentName: text("resident_name").notNull(),
    mobile: text("mobile").notNull(),
    roomCode: text("room_code").notNull(),
    bedLabel: text("bed_label").notNull(),
    tier: text("tier").notNull(),
    month: text("month").notNull(),
    baseRent: integer("base_rent").notNull(),
    electricityUnits: integer("electricity_units").notNull().default(0),
    electricityAmount: integer("electricity_amount").notNull().default(0),
    otherCharges: integer("other_charges").notNull().default(0),
    totalDue: integer("total_due").notNull(),
    amountPaid: integer("amount_paid").notNull().default(0),
    balanceDue: integer("balance_due").notNull(),
    dueDate: text("due_date").notNull(),
    daysOverdue: integer("days_overdue").notNull().default(0),
    status: text("status").notNull().default("pending"), // paid | overdue | pending
    paidAt: text("paid_at"),
    paymentMode: text("payment_mode"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("rent_records_code_idx").on(t.recordCode),
    index("rent_records_booking_code_idx").on(t.bookingCode),
    index("rent_records_status_idx").on(t.status),
  ],
);

export type BedRow = typeof beds.$inferSelect;
export type BookingRow = typeof bookings.$inferSelect;
export type TourRow = typeof tourRequests.$inferSelect;
export type EnquiryRow = typeof enquiries.$inferSelect;
export type MaintenanceTicketRow = typeof maintenanceTickets.$inferSelect;
export type GatePassRow = typeof gatePasses.$inferSelect;
export type MealSkipRow = typeof mealSkips.$inferSelect;
export type RentRecordRow = typeof rentRecords.$inferSelect;
