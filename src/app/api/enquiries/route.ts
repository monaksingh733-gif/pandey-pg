import { DataPipeline } from "@/lib/dataPipeline";
import { clean, isEmail, isMobile } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const errors: Record<string, string> = {};
  const name = clean(body.name, 80);
  const phone = clean(body.phone, 20).replace(/\D/g, "").slice(-10);
  const email = clean(body.email, 120).toLowerCase();
  const tier = clean(body.tier, 20);
  const moveIn = clean(body.moveIn, 12);
  const message = clean(body.message, 600);

  if (name.length < 3) errors.name = "Please enter your name.";
  if (!isMobile(phone)) errors.phone = "Enter a valid 10-digit mobile number.";
  if (email && !isEmail(email)) errors.email = "Enter a valid email address.";
  if (message.length < 10) errors.message = "Tell us a little more (min 10 characters).";

  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, errors }, { status: 422 });
  }

  try {
    const enquiry = await DataPipeline.enquiries.create({
      name,
      phone,
      email: email || null,
      tier: tier || null,
      moveIn: moveIn || null,
      message,
    });

    return Response.json({ ok: true, enquiry });
  } catch (err) {
    console.error("[enquiries POST] failed:", err);
    return Response.json({ ok: false, error: "Could not save your enquiry." }, { status: 500 });
  }
}
