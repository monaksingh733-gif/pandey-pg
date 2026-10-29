"use client";

import { useEffect, useState } from "react";
import { Modal, ModalShell, Button, Pill } from "./ui";
import { Icon } from "./Icon";
import { useAuth } from "@/context/AuthContext";
import { inr, TIERS, type TierKey } from "@/lib/pricing";

interface BookingItem {
  code: string;
  fullName: string;
  tier: string;
  bedLabel: string;
  roomCode: string;
  moveInDate: string;
  monthlyTotal: number;
  status: string;
  createdAt?: string;
}

export function MyPassesModal() {
  const { user, myPassesOpen, closeMyPasses } = useAuth();
  const [passes, setPasses] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [prevOpen, setPrevOpen] = useState(myPassesOpen);

  if (myPassesOpen !== prevOpen) {
    setPrevOpen(myPassesOpen);
    if (myPassesOpen) {
      setLoading(true);
    }
  }

  useEffect(() => {
    if (!myPassesOpen) return;
    let alive = true;

    fetch("/api/bookings", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (!alive) return;
        if (json?.ok && Array.isArray(json.recent)) {
          // If user signed in, match passes by email if possible or list all current active bookings
          setPasses(json.recent);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [myPassesOpen]);

  return (
    <Modal
      open={myPassesOpen}
      onClose={closeMyPasses}
      ariaLabel="My Booking Passes"
      className="max-w-xl"
    >
      <ModalShell
        title="My Booking Passes"
        subtitle={user ? `Signed in as ${user.name} (${user.email})` : "View your official resident passes."}
        onClose={closeMyPasses}
      >
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center">
              <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-gold/25 border-t-gold" />
              <p className="mt-3 text-[12px] uppercase tracking-[0.14em] text-sand-dim">
                Fetching your booking records…
              </p>
            </div>
          ) : passes.length === 0 ? (
            <div className="rounded-xl border border-gold/15 bg-espresso/50 p-8 text-center">
              <Icon name="file" className="mx-auto h-8 w-8 text-sand-dim" />
              <p className="mt-3 font-serif text-lg text-ivory">No booking passes found</p>
              <p className="mt-1 text-[12.5px] text-sand">
                You haven&apos;t reserved a bed yet, or your booking pass was issued under a different email.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {passes.map((p) => {
                const tierInfo = TIERS[p.tier as TierKey];
                return (
                  <div
                    key={p.code}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-gold/20 bg-espresso/60 p-4 transition-all duration-300 hover:border-gold/50 sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-[15px] text-gold-light">{p.code}</span>
                        <Pill tone="green" className="text-[9px]">
                          {p.status}
                        </Pill>
                      </div>
                      <p className="mt-1 text-[13px] font-semibold text-ivory">
                        {p.bedLabel} · Room {p.roomCode} ({tierInfo?.short ?? p.tier})
                      </p>
                      <p className="text-[11.5px] text-sand-dim">
                        Resident: {p.fullName} · Move-in: {p.moveInDate} · {inr(p.monthlyTotal)}/mo
                      </p>
                    </div>

                    <Button
                      size="sm"
                      icon="printer"
                      onClick={() => {
                        closeMyPasses();
                        window.open(`/pass/${encodeURIComponent(p.code)}`, "_blank");
                      }}
                    >
                      View Pass
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ModalShell>
    </Modal>
  );
}
