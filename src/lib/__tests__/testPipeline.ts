import { DataPipeline, normalizeCode } from "../dataPipeline";
import { memoryStore } from "../memoryStore";

async function runTests() {
  console.log("=== STARTING DATA PIPELINE INTEGRATION TEST SUITE ===");

  // 1. Test Code Normalization
  console.log("\n[Test 1] Testing Code Normalization...");
  const c1 = normalizeCode("PANDEY-2026-1042");
  if (c1.withHash !== "#PANDEY-2026-1042" || c1.clean !== "pandey20261042") {
    throw new Error(`Normalization failed for c1: ${JSON.stringify(c1)}`);
  }
  const c2 = normalizeCode("#PANDEY-2026-1042");
  if (c2.withHash !== "#PANDEY-2026-1042" || c2.clean !== "pandey20261042") {
    throw new Error(`Normalization failed for c2: ${JSON.stringify(c2)}`);
  }
  console.log("✓ Code Normalization passed.");

  // 2. Test Beds & Inventory Pipeline
  console.log("\n[Test 2] Testing Inventory Pipeline...");
  const { rows: initialBeds, summary: initialSummary } = await DataPipeline.beds.getSummary();
  console.log(`- Total Beds: ${initialSummary.totalBeds}`);
  console.log(`- Available: ${initialSummary.available}`);
  console.log(`- Booked: ${initialSummary.booked}`);
  console.log(`- Reserved: ${initialSummary.reserved}`);

  if (initialSummary.totalBeds <= 0) {
    throw new Error("Inventory should have beds populated.");
  }
  console.log("✓ Inventory Pipeline passed.");

  // 3. Test Booking Creation Pipeline
  console.log("\n[Test 3] Testing Booking Creation Pipeline...");
  const availableBed = initialBeds.find(
    (b) => b.status === "available" && b.tier === "single" && b.cooling === "ac" && b.floor === "1st"
  );

  if (!availableBed) {
    throw new Error("Could not find available Single AC 1st floor bed for test.");
  }

  const initialRentCount = memoryStore.rentLedger.length;

  const testBooking = await DataPipeline.bookings.create({
    tier: "single",
    cooling: "ac",
    floor: "1st",
    tenure: "six",
    meals: "full",
    paymentMode: "token",
    bedId: availableBed.id,
    moveInDate: new Date(Date.now() + 86400000 * 10).toISOString().slice(0, 10),
    fullName: "Pipeline Verification Tester",
    mobile: "9988776655",
    email: "tester@pandeypg.in",
    gender: "Male",
    category: "Working Professional",
    institution: "Google DeepMind",
    emergencyName: "Tester Parent",
    emergencyPhone: "9988776650",
    idProofType: "Aadhaar Card",
    idProofNumber: "XXXX-YYYY-1234",
    addons: ["laundry"],
    notes: "Automated test booking.",
  });

  console.log(`- Created booking code: ${testBooking.code}`);
  console.log(`- Amount paid: ₹${testBooking.amountPaid}`);
  console.log(`- Balance due: ₹${testBooking.balanceDue}`);

  if (!testBooking.code.startsWith("#PANDEY-")) {
    throw new Error(`Invalid booking code format: ${testBooking.code}`);
  }
  if (testBooking.amountPaid !== 1000) {
    throw new Error(`Expected token payable ₹1000, got ${testBooking.amountPaid}`);
  }

  // Verify that the bed status changed to booked
  const { rows: updatedBeds } = await DataPipeline.beds.getSummary();
  const checkedBed = updatedBeds.find((b) => b.id === availableBed.id);
  if (checkedBed?.status !== "booked") {
    throw new Error(`Bed status should be 'booked', but was: ${checkedBed?.status}`);
  }

  // Verify rent ledger auto-created the move-in invoice
  if (memoryStore.rentLedger.length !== initialRentCount + 1) {
    throw new Error("Move-in rent record was not auto-created in rent ledger!");
  }
  console.log("✓ Booking Creation & Bed Lock passed.");

  // 4. Test Booking Lookup by Code
  console.log("\n[Test 4] Testing Booking Lookup...");
  const lookupWithHash = await DataPipeline.bookings.getByCode(testBooking.code);
  if (!lookupWithHash || lookupWithHash.booking.fullName !== "Pipeline Verification Tester") {
    throw new Error("Failed to lookup booking with hash.");
  }
  const lookupWithoutHash = await DataPipeline.bookings.getByCode(testBooking.code.replace("#", ""));
  if (!lookupWithoutHash || lookupWithoutHash.booking.fullName !== "Pipeline Verification Tester") {
    throw new Error("Failed to lookup booking without hash.");
  }
  console.log("✓ Booking Lookup by code passed.");

  // 5. Test Payment Verification Pipeline
  console.log("\n[Test 5] Testing Payment Verification Pipeline...");
  const paymentRes = await DataPipeline.bookings.recordPayment(
    testBooking.code,
    5000,
    "UPI (GPay)",
    "UPI_TXN_TEST_999"
  );
  if (!paymentRes.ok) throw new Error("Payment recording failed.");

  const afterPaymentLookup = await DataPipeline.bookings.getByCode(testBooking.code);
  if (afterPaymentLookup?.booking.amountPaid !== 6000) {
    throw new Error(
      `Expected total amount paid ₹6000, got ${afterPaymentLookup?.booking.amountPaid}`
    );
  }
  console.log("✓ Payment Verification & Ledger Sync passed.");

  // 6. Test Resident Portal Pipeline
  console.log("\n[Test 6] Testing Resident Portal Pipeline...");
  // Lookup by mobile
  const residentDataByMobile = await DataPipeline.resident.lookup("9988776655");
  if (!residentDataByMobile || residentDataByMobile.booking.code !== testBooking.code) {
    throw new Error("Resident lookup by mobile number failed.");
  }
  // Lookup by code
  const residentDataByCode = await DataPipeline.resident.lookup(testBooking.code);
  if (!residentDataByCode || residentDataByCode.booking.fullName !== "Pipeline Verification Tester") {
    throw new Error("Resident lookup by booking code failed.");
  }

  // Test dinner skip toggle
  const skip1 = await DataPipeline.resident.toggleDinnerSkip(testBooking.code);
  if (!skip1.skipped) throw new Error("Expected dinner to be skipped on first toggle.");

  const checkSkip = await DataPipeline.resident.lookup(testBooking.code);
  if (!checkSkip?.hasSkippedDinner) throw new Error("hasSkippedDinner should be true.");

  const skip2 = await DataPipeline.resident.toggleDinnerSkip(testBooking.code);
  if (skip2.skipped) throw new Error("Expected dinner to be restored on second toggle.");

  // Test ticket creation
  const ticket = await DataPipeline.resident.createTicket({
    residentCode: testBooking.code,
    category: "Wi-Fi & Network",
    description: "Signal speed test in suite A.",
    urgency: "urgent",
  });
  console.log(`- Created ticket: ${ticket.ticketId} (urgency: ${ticket.urgency})`);
  if (!ticket.ticketId.startsWith("TKT-")) throw new Error("Invalid ticket ID.");

  // Test gate pass creation
  const gatePass = await DataPipeline.resident.createGatePass({
    residentCode: testBooking.code,
    passType: "late_entry",
    reason: "Late project submission at college lab",
    expectedReturn: "1:00 AM",
  });
  console.log(`- Created gate pass: ${gatePass.passCode}`);
  if (!gatePass.passCode.startsWith("GP-")) throw new Error("Invalid gate pass code.");

  console.log("✓ Resident Portal Pipeline passed.");

  // 7. Test Rent Ledger Pipeline (Sub-meter, Overdue, Mark Paid)
  console.log("\n[Test 7] Testing Rent Ledger Pipeline...");
  const rentSummary = await DataPipeline.rent.getSummary();
  console.log(`- Total Expected Rent: ₹${rentSummary.totalExpected}`);
  console.log(`- Total Collected Rent: ₹${rentSummary.totalCollected}`);
  console.log(`- Overdue Rent: ₹${rentSummary.totalOverdue}`);
  console.log(`- Collection Rate: ${rentSummary.collectionRate}%`);

  // Sub-meter reading update
  const sampleInv = memoryStore.rentLedger[0];
  const updatedInv = await DataPipeline.rent.updateElectricity(sampleInv.recordCode, 100);
  console.log(
    `- Updated electricity for ${updatedInv.recordCode}: 100 units = ₹${updatedInv.electricityAmount}, Total Due: ₹${updatedInv.totalDue}`
  );
  if (updatedInv.electricityAmount !== 850) {
    throw new Error(`Expected 100 units * 8.5 = ₹850, got ${updatedInv.electricityAmount}`);
  }

  // Mark invoice paid
  const paidInv = await DataPipeline.rent.markPaid(sampleInv.recordCode, "Bank Transfer");
  if (paidInv.status !== "paid" || paidInv.balanceDue !== 0) {
    throw new Error(`Invoice should be paid with 0 balance, got status=${paidInv.status}, balance=${paidInv.balanceDue}`);
  }
  console.log("✓ Rent Ledger Pipeline passed.");

  // 8. Test Admin Overview Pipeline
  console.log("\n[Test 8] Testing Admin Overview Pipeline...");
  const adminOverview = await DataPipeline.admin.getOverview();
  console.log(`- Admin Occupancy Rate: ${adminOverview.summary.occupancyRate}%`);
  console.log(`- Total Bookings: ${adminOverview.summary.totalBookings}`);
  console.log(`- Total Beds: ${adminOverview.summary.totalBeds}`);
  if (adminOverview.summary.totalBeds !== initialSummary.totalBeds) {
    throw new Error("Admin overview total beds mismatch.");
  }
  console.log("✓ Admin Overview Pipeline passed.");

  // 9. Test Booking Status Vacate & Automatic Bed Release
  console.log("\n[Test 9] Testing Vacate Booking & Auto Bed Release...");
  await DataPipeline.bookings.updateStatus(testBooking.code, "vacated");
  const bedsAfterVacate = await DataPipeline.beds.getAll();
  const freedBed = bedsAfterVacate.find((b) => b.id === availableBed.id);
  if (freedBed?.status !== "available") {
    throw new Error(`Vacating booking should release bed to 'available', but got '${freedBed?.status}'`);
  }
  console.log("✓ Automatic Bed Release on Vacate passed.");

  console.log("\n=======================================================");
  console.log("🎉 ALL DATA PIPELINE TESTS PASSED SUCCESSFULLY! (9/9)");
  console.log("=======================================================\n");
}

runTests().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
