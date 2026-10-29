import type { FloorKey, TierKey } from "./pricing";
import { FLOOR_LABEL } from "./pricing";
import { BED_PLAN, type BedSeed, FLOORS, COOLINGS } from "./inventoryPlan";
import { DataPipeline } from "./dataPipeline";

export { BED_PLAN, FLOORS, COOLINGS };
export type { BedSeed };

export async function ensureSeed(): Promise<void> {
  await DataPipeline.init();
}

export interface AvailabilitySummary {
  totalBeds: number;
  available: number;
  reserved: number;
  booked: number;
  byTier: Record<TierKey, { available: number; total: number }>;
}

export async function getInventory(): Promise<{ rows: any[]; summary: AvailabilitySummary }> {
  return await DataPipeline.beds.getSummary();
}

export function floorLabel(floor: string) {
  return FLOOR_LABEL[floor as FloorKey] ?? floor;
}
