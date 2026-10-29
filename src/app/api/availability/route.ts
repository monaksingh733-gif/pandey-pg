import { getInventory } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { rows, summary } = await getInventory();
    return Response.json({ ok: true, beds: rows, summary });
  } catch (err) {
    console.error("[availability] failed", err);
    return Response.json({ ok: false, beds: [], summary: null }, { status: 500 });
  }
}
