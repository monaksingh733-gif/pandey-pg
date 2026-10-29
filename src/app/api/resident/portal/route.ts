import { DataPipeline } from "@/lib/dataPipeline";
import { getTodayMenu, WEEKLY_MESS_MENU } from "@/lib/messMenu";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawQuery = (searchParams.get("query") || "").trim();

  if (!rawQuery) {
    return Response.json(
      { ok: false, error: "Please enter your Booking Code or Mobile Number." },
      { status: 400 }
    );
  }

  try {
    const data = await DataPipeline.resident.lookup(rawQuery);

    if (!data || !data.booking) {
      return Response.json(
        {
          ok: false,
          error: "No active resident booking found with this code or mobile number.",
        },
        { status: 404 }
      );
    }

    const b = data.booking;

    return Response.json({
      ok: true,
      resident: {
        fullName: b.fullName,
        code: b.code,
        mobile: b.mobile,
        email: b.email,
        roomCode: b.roomCode,
        bedLabel: b.bedLabel,
        tier: b.tier,
        cooling: b.cooling,
        floor: b.floor,
        moveInDate: b.moveInDate,
        monthlyTotal: b.monthlyTotal,
        deposit: b.deposit,
        amountPaid: b.amountPaid,
        balanceDue: b.balanceDue,
        emergencyName: b.emergencyName,
        emergencyPhone: b.emergencyPhone,
        category: b.category,
        institution: b.institution,
        status: b.status,
      },
      todayMenu: getTodayMenu(),
      fullWeekMenu: WEEKLY_MESS_MENU,
      hasSkippedDinner: data.hasSkippedDinner,
      tickets: data.tickets.map((t) => ({
        ...t,
        createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
      })),
      gatePasses: data.gatePasses.map((g) => ({
        ...g,
        createdAt: g.createdAt instanceof Date ? g.createdAt.toISOString() : String(g.createdAt),
      })),
    });
  } catch (err) {
    console.error("[resident/portal GET] error:", err);
    return Response.json({ ok: false, error: "Failed to load resident portal data." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const { action, residentCode } = body;
  if (!residentCode) {
    return Response.json({ ok: false, error: "Resident code is required." }, { status: 400 });
  }

  try {
    // 1. Toggle dinner skip
    if (action === "toggle_skip_dinner") {
      const res = await DataPipeline.resident.toggleDinnerSkip(residentCode);
      return Response.json({
        ok: true,
        hasSkippedDinner: res.skipped,
        message: res.message,
      });
    }

    // 2. Create Maintenance Ticket
    if (action === "create_ticket") {
      const { category, description, urgency } = body;
      if (!category || !description) {
        return Response.json(
          { ok: false, error: "Category and description are required." },
          { status: 400 }
        );
      }

      const ticket = await DataPipeline.resident.createTicket({
        residentCode,
        category,
        description,
        urgency: urgency === "urgent" ? "urgent" : "normal",
      });

      return Response.json({
        ok: true,
        ticket: {
          ...ticket,
          createdAt:
            ticket.createdAt instanceof Date ? ticket.createdAt.toISOString() : String(ticket.createdAt),
        },
        message: "Maintenance request logged. Warden notified.",
      });
    }

    // 3. Create Digital Gate Pass
    if (action === "create_gate_pass") {
      const { passType, reason, departureTime, expectedReturn } = body;
      if (!passType || !reason || !expectedReturn) {
        return Response.json(
          { ok: false, error: "Please fill in pass type, reason and expected return time." },
          { status: 400 }
        );
      }

      const gatePass = await DataPipeline.resident.createGatePass({
        residentCode,
        passType: passType === "night_out" ? "night_out" : "late_entry",
        reason,
        departureTime: departureTime || "10:30 PM",
        expectedReturn,
      });

      return Response.json({
        ok: true,
        gatePass: {
          ...gatePass,
          createdAt:
            gatePass.createdAt instanceof Date
              ? gatePass.createdAt.toISOString()
              : String(gatePass.createdAt),
        },
        message: "Digital gate pass generated and logged with the night warden.",
      });
    }

    return Response.json({ ok: false, error: "Unknown action." }, { status: 400 });
  } catch (err: any) {
    console.error("[resident/portal POST] error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Operation failed." },
      { status: 500 }
    );
  }
}
