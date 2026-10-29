/**
 * Shared pricing engine used by BOTH the client booking flow and the server
 * API routes, so an invoice can never be forged from the browser.
 */

export type TierKey = "single" | "double" | "triple";
export type CoolingKey = "ac" | "nonac";
export type FloorKey = "1st" | "2nd" | "3rd";
export type TenureKey = "flex" | "six" | "eleven";
export type MealKey = "full" | "none";
export type PaymentKey = "token" | "full";

export const TOKEN_AMOUNT = 1000;

export interface TierConfig {
  key: TierKey;
  label: string;
  short: string;
  occupants: number;
  /** Base monthly room rent — Non-AC, room only. */
  baseRent: number;
  acAddon: number;
  messAddon: number;
  depositMonths: number;
}

export const TIERS: Record<TierKey, TierConfig> = {
  single: {
    key: "single",
    label: "Superior Single Suite",
    short: "Single Private",
    occupants: 1,
    baseRent: 8000,
    acAddon: 1500,
    messAddon: 3000,
    depositMonths: 1,
  },
  double: {
    key: "double",
    label: "Executive Double Sharing",
    short: "Double Sharing",
    occupants: 2,
    baseRent: 4300,
    acAddon: 1500,
    messAddon: 2700,
    depositMonths: 1,
  },
  triple: {
    key: "triple",
    label: "Grand Triple Sharing",
    short: "Triple Sharing",
    occupants: 3,
    baseRent: 3000,
    acAddon: 1300,
    messAddon: 2200,
    depositMonths: 1,
  },
};

export const FLOOR_PREMIUM: Record<FloorKey, number> = {
  "1st": 0,
  "2nd": 250,
  "3rd": 400,
};

export const FLOOR_LABEL: Record<FloorKey, string> = {
  "1st": "1st Floor",
  "2nd": "2nd Floor",
  "3rd": "3rd Floor",
};

export const COOLING_LABEL: Record<CoolingKey, string> = {
  ac: "Air Conditioned",
  nonac: "Non-AC",
};

export interface TenureConfig {
  key: TenureKey;
  label: string;
  months: number;
  discountPct: number;
  note: string;
}

export const TENURES: TenureConfig[] = [
  {
    key: "flex",
    label: "Monthly Flex",
    months: 1,
    discountPct: 0,
    note: "Pay month-to-month, leave with 30 days notice.",
  },
  {
    key: "six",
    label: "6 Months",
    months: 6,
    discountPct: 5,
    note: "5% off room rent — ideal for semester blocks.",
  },
  {
    key: "eleven",
    label: "11 Months",
    months: 11,
    discountPct: 10,
    note: "10% off room rent — academic / annual plan.",
  },
];

export interface AddonConfig {
  key: string;
  label: string;
  monthly: number;
  note: string;
}

export const ADDONS: AddonConfig[] = [
  {
    key: "fridge",
    label: "Personal Mini-Fridge",
    monthly: 500,
    note: "50L frost-free unit inside your room",
  },
  {
    key: "parking",
    label: "Two-Wheeler Covered Parking",
    monthly: 0,
    note: "Complimentary, CCTV-covered shed",
  },
  {
    key: "laundry-plus",
    label: "Laundry+ (Wash & Iron)",
    monthly: 400,
    note: "8 garments / week, 48-hour turnaround",
  },
];

export interface QuoteInput {
  tier: TierKey;
  cooling: CoolingKey;
  floor: FloorKey;
  tenure: TenureKey;
  meals: MealKey;
  addons: string[];
}

export interface Quote {
  baseRent: number;
  acCharge: number;
  floorPremium: number;
  grossRent: number;
  rentDiscount: number;
  netRent: number;
  messCharges: number;
  addonCharges: number;
  monthlyTotal: number;
  deposit: number;
  moveInTotal: number;
  tokenPayable: number;
  balanceOnMoveIn: number;
  discountPct: number;
  tenureMonths: number;
  yearlySaving: number;
}

const round = (n: number) => Math.round(n);

export function quote(input: QuoteInput): Quote {
  const tier = TIERS[input.tier];
  const tenure = TENURES.find((t) => t.key === input.tenure) ?? TENURES[0];

  const baseRent = tier.baseRent;
  const acCharge = input.cooling === "ac" ? tier.acAddon : 0;
  const floorPremium = FLOOR_PREMIUM[input.floor] ?? 0;
  const grossRent = baseRent + acCharge + floorPremium;

  const rentDiscount = round((grossRent * tenure.discountPct) / 100);
  const netRent = grossRent - rentDiscount;

  const messCharges = input.meals === "full" ? tier.messAddon : 0;
  const addonCharges = ADDONS.filter((a) => input.addons.includes(a.key)).reduce(
    (sum, a) => sum + a.monthly,
    0,
  );

  const monthlyTotal = netRent + messCharges + addonCharges;
  const deposit = round(netRent * tier.depositMonths);
  const moveInTotal = monthlyTotal + deposit;

  const tokenPayable = Math.min(TOKEN_AMOUNT, moveInTotal);
  const balanceOnMoveIn = Math.max(0, moveInTotal - tokenPayable);

  return {
    baseRent,
    acCharge,
    floorPremium,
    grossRent,
    rentDiscount,
    netRent,
    messCharges,
    addonCharges,
    monthlyTotal,
    deposit,
    moveInTotal,
    tokenPayable,
    balanceOnMoveIn,
    discountPct: tenure.discountPct,
    tenureMonths: tenure.months,
    yearlySaving: round(grossRent * (tenure.discountPct / 100) * Math.min(12, tenure.months)),
  };
}

/** Price that the marketing cards advertise for a given filter state. */
export function cardPrice(tier: TierKey, cooling: CoolingKey, meals: boolean): number {
  const t = TIERS[tier];
  return t.baseRent + (cooling === "ac" ? t.acAddon : 0) + (meals ? t.messAddon : 0);
}

export function inr(n: number): string {
  return `₹${round(n).toLocaleString("en-IN")}`;
}

export function bookingCode(seq: number, d: Date = new Date()): string {
  const rand = Math.floor(1000 + Math.random() * 8999);
  return `#PANDEY-${d.getFullYear()}-${String(seq % 10000).padStart(2, "0")}${rand}`;
}
