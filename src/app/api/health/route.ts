import { db, hasDb } from "@/db";
import { DataPipeline } from "@/lib/dataPipeline";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDb) {
    return Response.json({ ok: true, mode: "memory", status: "healthy" });
  }
  try {
    await DataPipeline.init();
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, mode: "postgres", status: "healthy" });
  } catch (err: any) {
    console.error("[health GET] error:", err);
    return Response.json({ ok: false, error: err?.message || "Database unreachable." }, { status: 500 });
  }
}
