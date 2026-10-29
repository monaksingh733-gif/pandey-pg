import type { CoolingKey, FloorKey, TierKey } from "./pricing";

export interface BedSeed {
  bedKey: string;
  tier: TierKey;
  cooling: CoolingKey;
  floor: FloorKey;
  roomCode: string;
  bedLabel: string;
  position: string;
  status: "available" | "booked" | "reserved";
  residentHint: string | null;
  gridSlot: number;
}

export const FLOORS: FloorKey[] = ["1st", "2nd", "3rd"];
export const COOLINGS: CoolingKey[] = ["ac", "nonac"];

const LETTERS = ["A", "B", "C", "D", "E", "F"];

const POSITIONS: Record<TierKey, string[]> = {
  single: ["Window Side", "Study Wall", "Balcony Side", "Garden View"],
  double: ["Window Side", "Study Wall", "Balcony Side", "Door Side"],
  triple: ["Window Side", "Study Wall", "Balcony Side", "Centre Bay", "Door Side", "Corner Nook"],
};

const ROOM_PLAN: Record<TierKey, { rooms: number; bedsPerRoom: number; prefix: string }> = {
  single: { rooms: 4, bedsPerRoom: 1, prefix: "0" },
  double: { rooms: 2, bedsPerRoom: 2, prefix: "0" },
  triple: { rooms: 2, bedsPerRoom: 3, prefix: "1" },
};

const RESIDENTS = [
  "Aarav M.",
  "Divya R.",
  "Karthik S.",
  "Meera J.",
  "Nikhil T.",
  "Pooja V.",
  "Rahul D.",
  "Shreya B.",
  "Imran Q.",
  "Tanvi K.",
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function buildPlan(): BedSeed[] {
  const plan: BedSeed[] = [];
  const tiers: TierKey[] = ["single", "double", "triple"];
  for (const tier of tiers) {
    const cfg = ROOM_PLAN[tier];
    for (const floor of FLOORS) {
      const floorNum = floor === "1st" ? 1 : floor === "2nd" ? 2 : 3;
      for (const cooling of COOLINGS) {
        const tag = cooling === "ac" ? "A" : "N";
        let slot = 0;
        for (let r = 1; r <= cfg.rooms; r += 1) {
          const roomCode = `${floorNum}${cfg.prefix}${r}${tag}`;
          for (let b = 0; b < cfg.bedsPerRoom; b += 1) {
            const letter = LETTERS[slot] ?? "X";
            const position = POSITIONS[tier][slot] ?? "Standard";
            const bedLabel =
              tier === "single" ? `Suite ${letter}` : `Bed ${letter}`;
            const bedKey = `${tier}-${cooling}-${floor}-${roomCode}-${bedLabel}`.toLowerCase();
            const h = hash(bedKey);
            const bucket = h % 100;
            const status: BedSeed["status"] =
              bucket < 26 ? "booked" : bucket < 36 ? "reserved" : "available";
            plan.push({
              bedKey,
              tier,
              cooling,
              floor,
              roomCode,
              bedLabel,
              position,
              status,
              residentHint:
                status === "booked"
                  ? `Occupied · ${RESIDENTS[h % RESIDENTS.length]}`
                  : status === "reserved"
                    ? "Token paid · held 48 hrs"
                    : null,
              gridSlot: slot,
            });
            slot += 1;
          }
        }
      }
    }
  }
  return plan;
}

export const BED_PLAN = buildPlan();
