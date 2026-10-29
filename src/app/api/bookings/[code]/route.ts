import { DataPipeline } from "@/lib/dataPipeline";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await ctx.params;
    const result = await DataPipeline.bookings.getByCode(code);

    if (!result) {
      return Response.json(
        { ok: false, error: "No booking pass found for that reference." },
        { status: 404 }
      );
    }

    return Response.json({ ok: true, booking: result.booking, bed: result.bed });
  } catch (err) {
    console.error("[booking lookup] failed:", err);
    return Response.json({ ok: false, error: "Lookup failed." }, { status: 500 });
  }
}
