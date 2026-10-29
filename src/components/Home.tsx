"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { QuickInfoBar } from "./QuickInfoBar";
import { Rooms } from "./Rooms";
import { Room360Viewer } from "./Room360Viewer";
import { Discover } from "./Discover";
import { Calculator } from "./Calculator";
import { Rules } from "./Rules";
import { Reviews } from "./Reviews";
import { LocationFaq } from "./LocationFaq";
import { Contact, Footer } from "./ContactFooter";
import { FloatingActions } from "./FloatingActions";
import { BookingModal } from "./BookingModal";
import { RoomDetailModal } from "./RoomDetailModal";
import { AmenitiesModal } from "./AmenitiesModal";
import { AuthModal } from "./AuthModal";
import { MyPassesModal } from "./MyPassesModal";
import { Panel, UiProvider } from "./ui";
import { Icon } from "./Icon";
import { useAvailability } from "@/hooks/useAvailability";
import { inr, TIERS, type TierKey } from "@/lib/pricing";

interface RecentBooking {
  code: string;
  fullName: string;
  tier: string;
  bedLabel: string;
  roomCode: string;
  moveInDate: string;
  monthlyTotal: number;
  status: string;
}

function LiveDesk() {
  const [rows, setRows] = useState<RecentBooking[]>([]);
  const [totals, setTotals] = useState<{ count: number; revenue: number } | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/bookings", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!alive || !j?.ok) return;
        setRows(j.recent ?? []);
        setTotals(j.totals ? { count: j.totals.count, revenue: j.totals.revenue } : null);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const items = rows.length
    ? rows.map((r) => {
        const parts = r.fullName.trim().split(/\s+/);
        const nameStr = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
        return {
          icon: "checkcircle",
          title: `${nameStr} booked ${r.bedLabel} · Room ${r.roomCode}`,
          meta: `${TIERS[r.tier as TierKey]?.short ?? r.tier} · move-in ${r.moveInDate} · ${inr(r.monthlyTotal)}/mo`,
        };
      })
    : [
        {
          icon: "sparkles",
          title: "Be the first reservation of the day",
          meta: "Beds are released live as residents check out",
        },
        {
          icon: "clock",
          title: "Token holds expire after 48 hours",
          meta: "Unpaid tokens automatically return the bed to inventory",
        },
      ];

  return (
    <section className="relative overflow-hidden border-y border-gold/12 bg-[linear-gradient(90deg,#17100C,#1C140F_45%,#17100C)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-5 lg:flex-row lg:items-center">
        <div className="flex shrink-0 items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-luxe text-gold">
              Live Reservation Desk
            </p>
            <p className="mt-0.5 text-[11.5px] text-sand-dim">
              {totals ? `${totals.count} online bookings · ${inr(totals.revenue)} collected` : "Syncing with the property register…"}
            </p>
          </div>
        </div>
        <div className="no-scrollbar flex flex-1 gap-3 overflow-x-auto pb-1">
          {items.map((it) => (
            <div
              key={it.title}
              className="flex min-w-[290px] flex-1 items-start gap-3 rounded-xl border border-gold/12 bg-espresso/45 px-4 py-3"
            >
              <Icon name={it.icon} className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-ivory">{it.title}</p>
                <p className="mt-0.5 truncate text-[11px] text-sand-dim">{it.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { beds, summary, loading, error, reload } = useAvailability();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingTier, setBookingTier] = useState<TierKey>("double");
  const [roomTier, setRoomTier] = useState<TierKey | null>(null);
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);

  const openBooking = useCallback((tier?: string) => {
    if (tier && TIERS[tier as TierKey]) setBookingTier(tier as TierKey);
    setAmenitiesOpen(false);
    setRoomTier(null);
    setBookingOpen(true);
  }, []);

  const openRoom = useCallback((tier?: string) => {
    setRoomTier((tier as TierKey) ?? "double");
  }, []);

  const ui = useMemo(() => ({ openBooking, openRoom }), [openBooking, openRoom]);

  return (
    <UiProvider value={ui}>
      <div className="relative min-h-screen bg-espresso">
        <Navbar bedsLeft={summary?.available ?? null} />

        <main>
          <Hero
            bedsLeft={summary?.available ?? null}
            onBook={() => openBooking()}
          />
          <QuickInfoBar />

          {error ? (
            <div className="px-4 pt-8 sm:px-6 lg:px-10">
              <Panel className="mx-auto flex max-w-[1400px] flex-col items-start gap-3 p-4 sm:flex-row sm:items-center">
                <Icon name="alert" className="h-5 w-5 shrink-0 text-[#e8bd7c]" />
                <p className="flex-1 text-[12.5px] text-sand">
                  {error} Bed counts shown may be approximate — you can still complete a booking and the
                  desk will confirm your bed within 30 minutes.
                </p>
                <button
                  type="button"
                  onClick={() => void reload()}
                  className="text-[11px] font-bold uppercase tracking-[0.12em] text-gold hover:text-gold-light"
                >
                  Retry
                </button>
              </Panel>
            </div>
          ) : null}

          <Rooms
            summary={summary}
            loading={loading}
            onBook={(t) => openBooking(t)}
            onView={(t) => openRoom(t)}
          />
          <Room360Viewer onBook={(t) => openBooking(t)} />
          <Discover onExplore={() => setAmenitiesOpen(true)} />
          <LiveDesk />
          <Calculator onBook={(t) => openBooking(t)} />
          <Rules />
          <Reviews />
          <LocationFaq />
          <Contact />
        </main>

        <Footer onBook={() => openBooking()} />
        <FloatingActions />

        <BookingModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          initialTier={bookingTier}
          beds={beds}
          summary={summary}
          loading={loading}
          reload={() => void reload()}
        />
        <RoomDetailModal
          open={roomTier !== null}
          onClose={() => setRoomTier(null)}
          tier={roomTier}
          summary={summary}
          onBook={(t) => openBooking(t)}
        />
        <AmenitiesModal
          open={amenitiesOpen}
          onClose={() => setAmenitiesOpen(false)}
          onBook={() => openBooking()}
        />
        <AuthModal />
        <MyPassesModal />
      </div>
    </UiProvider>
  );
}
