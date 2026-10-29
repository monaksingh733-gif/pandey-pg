"use client";

import { useCallback, useEffect, useState } from "react";
import type { CoolingKey, FloorKey, TierKey } from "@/lib/pricing";

export interface BedDTO {
  id: number;
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

export interface SummaryDTO {
  totalBeds: number;
  available: number;
  reserved: number;
  booked: number;
  byTier: Record<TierKey, { available: number; total: number }>;
}

export function useAvailability() {
  const [beds, setBeds] = useState<BedDTO[]>([]);
  const [summary, setSummary] = useState<SummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/availability", { cache: "no-store" });
      const json = await res.json();
      if (json?.ok) {
        setBeds(json.beds as BedDTO[]);
        setSummary(json.summary as SummaryDTO);
        setError(null);
      } else {
        setError("Live inventory unavailable right now.");
      }
    } catch {
      setError("Could not reach the reservation desk.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/availability", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (!alive) return;
        if (json?.ok) {
          setBeds(json.beds as BedDTO[]);
          setSummary(json.summary as SummaryDTO);
          setError(null);
        } else {
          setError("Live inventory unavailable right now.");
        }
      })
      .catch(() => {
        if (alive) setError("Could not reach the reservation desk.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return { beds, summary, loading, error, reload: fetchAvailability };
}
