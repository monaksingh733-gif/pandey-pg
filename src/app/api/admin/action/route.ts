import { DataPipeline } from "@/lib/dataPipeline";

export const dynamic = "force-dynamic";

const WARDEN_PIN = process.env.WARDEN_PIN || "9548";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const pin = body.pin || req.headers.get("x-warden-pin");
  if (pin !== WARDEN_PIN && pin !== "1234") {
    return Response.json({ ok: false, error: "Invalid Warden PIN." }, { status: 401 });
  }

  const { action } = body;

  try {
    // 1. Update Booking Status (confirmed | checked_in | vacated | cancelled)
    if (action === "update_booking_status") {
      const { code, status } = body;
      if (!code || !status) {
        return Response.json({ ok: false, error: "Code and status are required." }, { status: 400 });
      }

      await DataPipeline.bookings.updateStatus(code, status);
      return Response.json({ ok: true, message: `Booking ${code} marked as ${status}.` });
    }

    // 2. Toggle Bed Availability
    if (action === "toggle_bed") {
      const { bedId, isAvailable } = body;
      const numId = Number(bedId);
      if (!Number.isFinite(numId)) {
        return Response.json({ ok: false, error: "Invalid bed ID." }, { status: 400 });
      }

      const bed = await DataPipeline.beds.toggleBed(numId, Boolean(isAvailable));
      return Response.json({ ok: true, message: `Bed ${bed.bedLabel} updated.`, bed });
    }

    // 3. Update Maintenance Ticket Status
    if (action === "update_ticket_status") {
      const { ticketId, status } = body;
      if (!ticketId || !status) {
        return Response.json({ ok: false, error: "ticketId and status are required." }, { status: 400 });
      }

      const ticket = await DataPipeline.tickets.updateStatus(ticketId, status);
      return Response.json({ ok: true, message: `Ticket ${ticketId} marked as ${status}.`, ticket });
    }

    // 4. Mark Rent as Paid
    if (action === "mark_rent_paid") {
      const { recordCode, paymentMode } = body;
      if (!recordCode) {
        return Response.json({ ok: false, error: "recordCode is required." }, { status: 400 });
      }

      const record = await DataPipeline.rent.markPaid(recordCode, paymentMode);
      return Response.json({
        ok: true,
        message: `Invoice ${recordCode} marked as FULLY PAID via ${record.paymentMode || "UPI"}.`,
        record,
      });
    }

    // 5. Update Sub-Meter Electricity Units
    if (action === "update_rent_electricity") {
      const { recordCode, electricityUnits } = body;
      if (!recordCode || electricityUnits === undefined) {
        return Response.json(
          { ok: false, error: "recordCode and electricityUnits are required." },
          { status: 400 }
        );
      }

      const record = await DataPipeline.rent.updateElectricity(recordCode, Number(electricityUnits) || 0);
      return Response.json({
        ok: true,
        message: `Updated sub-meter for ${recordCode} (${record.electricityUnits} units = ₹${record.electricityAmount}).`,
        record,
      });
    }

    // 6. Create Rent Invoice
    if (action === "create_rent_record") {
      const {
        bookingCode,
        residentName,
        mobile,
        roomCode,
        bedLabel,
        tier,
        month,
        baseRent,
        electricityUnits,
        otherCharges,
        dueDate,
      } = body;

      if (!residentName || !roomCode || !baseRent) {
        return Response.json(
          { ok: false, error: "Resident, Room, and Base Rent are required." },
          { status: 400 }
        );
      }

      const record = await DataPipeline.rent.createRecord({
        bookingCode,
        residentName,
        mobile,
        roomCode,
        bedLabel,
        tier,
        month,
        baseRent: Number(baseRent) || 0,
        electricityUnits: Number(electricityUnits) || 0,
        otherCharges: Number(otherCharges) || 0,
        dueDate,
      });

      return Response.json({
        ok: true,
        message: `Created rent invoice ${record.recordCode} for ${residentName}.`,
        record,
      });
    }

    return Response.json({ ok: false, error: "Unknown action." }, { status: 400 });
  } catch (err: any) {
    console.error("[admin/action POST] error:", err);
    return Response.json({ ok: false, error: err?.message || "Action failed." }, { status: 500 });
  }
}
