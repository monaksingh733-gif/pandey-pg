import { DataPipeline } from "@/lib/dataPipeline";
import {
  ADDONS,
  type CoolingKey,
  type FloorKey,
  type MealKey,
  type PaymentKey,
  type TenureKey,
  type TierKey,
} from "@/lib/pricing";
import { clean, isEmail, isFutureDate, isMobile } from "@/lib/validate";

export const dynamic = "force-dynamic";

const TIERS_OK: TierKey[] = ["single", "double", "triple"];
const COOLING_OK: CoolingKey[] = ["ac", "nonac"];
const FLOOR_OK: FloorKey[] = ["1st", "2nd", "3rd"];
const TENURE_OK: TenureKey[] = ["flex", "six", "eleven"];
const MEAL_OK: MealKey[] = ["full", "none"];
const PAY_OK: PaymentKey[] = ["token", "full"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const CATEGORIES = ["College Student", "Working Professional"];
const ID_PROOFS = ["Aadhaar Card", "College ID", "Passport", "Driving Licence", "Voter ID"];

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const errors: Record<string, string> = {};

  const tier = clean(body.tier) as TierKey;
  const cooling = clean(body.cooling) as CoolingKey;
  const floor = clean(body.floor) as FloorKey;
  const tenure = clean(body.tenure) as TenureKey;
  const meals = clean(body.meals) as MealKey;
  const paymentMode = (clean(body.paymentMode) || "token") as PaymentKey;

  if (!TIERS_OK.includes(tier)) errors.tier = "Select a valid room tier.";
  if (!COOLING_OK.includes(cooling)) errors.cooling = "Select AC or Non-AC.";
  if (!FLOOR_OK.includes(floor)) errors.floor = "Select a floor.";
  if (!TENURE_OK.includes(tenure)) errors.tenure = "Select a tenure plan.";
  if (!MEAL_OK.includes(meals)) errors.meals = "Select a meal plan.";
  if (!PAY_OK.includes(paymentMode)) errors.paymentMode = "Select a payment option.";

  const fullName = clean(body.fullName, 80);
  const mobile = clean(body.mobile, 20).replace(/\D/g, "").slice(-10);
  const email = clean(body.email, 120).toLowerCase();
  const gender = clean(body.gender, 30);
  const category = clean(body.category, 40);
  const institution = clean(body.institution, 120);
  const emergencyName = clean(body.emergencyName, 80);
  const emergencyPhone = clean(body.emergencyPhone, 20).replace(/\D/g, "").slice(-10);
  const idProofType = clean(body.idProofType, 40);
  const idProofNumber = clean(body.idProofNumber, 40);
  const moveInDate = clean(body.moveInDate, 12);
  const notes = clean(body.notes, 400);

  if (fullName.length < 3) errors.fullName = "Enter your full name (min 3 characters).";
  if (!isMobile(mobile)) errors.mobile = "Enter a valid 10-digit Indian mobile number.";
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  if (!GENDERS.includes(gender)) errors.gender = "Select your gender.";
  if (!CATEGORIES.includes(category)) errors.category = "Select student or professional.";
  if (category === "College Student" && !institution)
    errors.institution = "College / university name is required.";
  if (category === "Working Professional" && !institution)
    errors.institution = "Company name is required.";
  if (emergencyName.length < 3) errors.emergencyName = "Enter emergency contact name.";
  if (!isMobile(emergencyPhone)) errors.emergencyPhone = "Enter a valid 10-digit contact number.";
  if (!ID_PROOFS.includes(idProofType)) errors.idProofType = "Select a valid ID proof.";
  if (!isFutureDate(moveInDate))
    errors.moveInDate = "Pick a move-in date between today and the next 6 months.";

  const requestedAddons: string[] = Array.isArray(body.addons)
    ? body.addons.filter((a: unknown) => ADDONS.some((x) => x.key === clean(a, 40)))
    : [];

  const bedId = Number(body.bedId);
  if (!Number.isFinite(bedId) || bedId <= 0) {
    errors.bedId = "Please select an available bed in Step 1.";
  }

  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, errors }, { status: 422 });
  }

  try {
    const booking = await DataPipeline.bookings.create({
      tier,
      cooling,
      floor,
      tenure,
      meals,
      paymentMode,
      bedId,
      moveInDate,
      fullName,
      mobile,
      email,
      gender,
      category,
      institution,
      emergencyName,
      emergencyPhone,
      idProofType,
      idProofNumber,
      addons: requestedAddons,
      notes,
    });

    return Response.json({ ok: true, booking });
  } catch (err: any) {
    const msg = String(err?.message ?? "");
    if (msg === "BED_UNAVAILABLE") {
      return Response.json(
        {
          ok: false,
          errors: { bedId: "That bed was just booked by another resident. Please pick another bed." },
        },
        { status: 409 },
      );
    }
    if (msg === "BED_MISMATCH") {
      return Response.json(
        { ok: false, errors: { bedId: "The selected bed does not match your room configuration." } },
        { status: 422 },
      );
    }
    console.error("[bookings POST] failed:", err);
    return Response.json(
      { ok: false, error: "Could not complete the booking. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const { recent, totals } = await DataPipeline.bookings.getRecent(6);
    return Response.json({ ok: true, recent, totals });
  } catch (err) {
    console.error("[bookings GET] failed:", err);
    return Response.json({ ok: false, recent: [], totals: null }, { status: 500 });
  }
}
