import { DataPipeline } from "@/lib/dataPipeline";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const { bookingCode, amount, paymentMethod, transactionRef } = body;
  if (!bookingCode || amount === undefined || amount === null) {
    return Response.json({ ok: false, error: "Missing booking code or amount." }, { status: 400 });
  }

  try {
    const result = await DataPipeline.bookings.recordPayment(
      bookingCode,
      Number(amount) || 0,
      paymentMethod,
      transactionRef
    );

    return Response.json({
      ok: true,
      transactionId: result.transactionId,
      amount: result.amount,
      method: result.method,
      message: "Payment successfully verified and credited.",
    });
  } catch (err) {
    console.error("[payments/verify POST] error:", err);
    return Response.json({ ok: false, error: "Database error during payment recording." }, { status: 500 });
  }
}
