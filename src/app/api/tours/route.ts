import { DataPipeline } from "@/lib/dataPipeline";
import { TIERS, type TierKey } from "@/lib/pricing";
import { clean, isEmail, isFutureDate, isMobile } from "@/lib/validate";

export const dynamic = "force-dynamic";

const SLOTS = ["10 AM – 12 PM", "12 PM – 3 PM", "4 PM – 7 PM"];
const TYPES = ["in-person", "video"];

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const errors: Record<string, string> = {};
  const tourType = clean(body.tourType, 20) as "in-person" | "video";
  const date = clean(body.date, 12);
  const slot = clean(body.slot, 30);
  const name = clean(body.name, 80);
  const phone = clean(body.phone, 20).replace(/\D/g, "").slice(-10);
  const email = clean(body.email, 120).toLowerCase();
  const notes = clean(body.notes, 400);
  const visitors = Math.min(4, Math.max(1, Number(body.visitors) || 1));
  const interestedTier = clean(body.interestedTier, 20);

  if (!TYPES.includes(tourType)) errors.tourType = "Select a tour type.";
  if (!isFutureDate(date)) errors.date = "Pick a tour date between today and the next 6 months.";
  if (!SLOTS.includes(slot)) errors.slot = "Select a preferred time slot.";
  if (name.length < 3) errors.name = "Enter your full name.";
  if (!isMobile(phone)) errors.phone = "Enter a valid 10-digit mobile number.";
  if (email && !isEmail(email)) errors.email = "Enter a valid email address.";
  if (interestedTier && !(TIERS as any)[interestedTier]) errors.interestedTier = "Invalid room tier.";

  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, errors }, { status: 422 });
  }

  try {
    const tour = await DataPipeline.tours.create({
      tourType,
      date,
      slot,
      name,
      phone,
      email: email || null,
      visitors,
      interestedTier: (interestedTier as TierKey) || null,
      notes: notes || null,
    });

    return Response.json({ ok: true, tour });
  } catch (err) {
    console.error("[tours POST] failed:", err);
    return Response.json({ ok: false, error: "Could not save the tour request." }, { status: 500 });
  }
}
