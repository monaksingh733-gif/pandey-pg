"use client";

import { useState, useRef, useEffect } from "react";
import { Eyebrow, Button } from "./ui";
import { Icon } from "./Icon";
import { IMG } from "@/lib/data";
import { TIERS, type TierKey } from "@/lib/pricing";

interface RoomSpace {
  key: string;
  name: string;
  tier?: TierKey;
  image: string;
  description: string;
  hotspots: {
    id: string;
    label: string;
    desc: string;
    icon: string;
    x: number; // percentage horizontally
    y: number; // percentage vertically
  }[];
}

const SPACES: RoomSpace[] = [
  {
    key: "single",
    name: "Executive Single Suite",
    tier: "single",
    image: IMG.single,
    description: "Private 180 sq.ft. haven for quiet focus, career preparation and complete privacy.",
    hotspots: [
      {
        id: "bed",
        label: "Orthopedic Storage Bed",
        desc: "Single spring mattress with hydraulic storage drawers and fresh linen.",
        icon: "bed",
        x: 35,
        y: 65,
      },
      {
        id: "ac",
        label: "1.5 Ton Inverter AC",
        desc: "Silent dual-inverter split AC with independent room remote control.",
        icon: "zap",
        x: 52,
        y: 22,
      },
      {
        id: "study",
        label: "Dedicated Study Station",
        desc: "Hardwood desk, ergonomic high-back chair, bookshelf and dual power sockets.",
        icon: "clipboard",
        x: 75,
        y: 58,
      },
      {
        id: "wifi",
        label: "300 Mbps Wi-Fi Mesh",
        desc: "Floor mesh access point directly outside the door for uninterrupted video calls.",
        icon: "wifi",
        x: 18,
        y: 35,
      },
    ],
  },
  {
    key: "double",
    name: "Deluxe Double Sharing",
    tier: "double",
    image: IMG.double,
    description: "Spacious 220 sq.ft. twin sharing room with personal desks and dual 3-door wardrobes.",
    hotspots: [
      {
        id: "bed1",
        label: "Bed A (Window View)",
        desc: "Naturally sunlit bed position with individual reading lamp and side drawer.",
        icon: "bed",
        x: 28,
        y: 68,
      },
      {
        id: "wardrobe",
        label: "Personal Wardrobes",
        desc: "Separate lockable wardrobes for both residents with dedicated shoe racks.",
        icon: "lock",
        x: 82,
        y: 45,
      },
      {
        id: "ac2",
        label: "High-Efficiency AC",
        desc: "Equally distributed cooling across both study stations and beds.",
        icon: "zap",
        x: 50,
        y: 20,
      },
    ],
  },
  {
    key: "triple",
    name: "Premium Triple Sharing",
    tier: "triple",
    image: IMG.triple,
    description: "Budget-friendly 260 sq.ft. shared room with generous aisle space and attached washroom.",
    hotspots: [
      {
        id: "space",
        label: "Wide Central Aisle",
        desc: "Generous walking clearance ensuring privacy for all 3 residents.",
        icon: "sparkles",
        x: 48,
        y: 72,
      },
      {
        id: "study3",
        label: "3 Independent Study Desks",
        desc: "No sharing of study areas — everyone gets their own workspace.",
        icon: "clipboard",
        x: 80,
        y: 60,
      },
    ],
  },
  {
    key: "washroom",
    name: "En-Suite Modern Washroom",
    image: IMG.washroom,
    description: "Hygienic anti-skid tiled washroom with daily sanitation and 24/7 hot water geyser.",
    hotspots: [
      {
        id: "geyser",
        label: "25L Instant Geyser",
        desc: "Continuous hot water supply for morning bath during winter months.",
        icon: "zap",
        x: 45,
        y: 28,
      },
      {
        id: "cleaning",
        label: "Daily Housekeeping",
        desc: "Deep cleaned and disinfected every morning by full-time staff.",
        icon: "sparkles",
        x: 60,
        y: 65,
      },
    ],
  },
  {
    key: "dining",
    name: "Homely Mess & Dining Hall",
    image: IMG.dining,
    description: "Hygienic dining hall serving hot chef-cooked meals 3 times a day plus evening snacks.",
    hotspots: [
      {
        id: "mess",
        label: "Unlimited Buffet Meals",
        desc: "3-time breakfast, lunch & dinner with weekly rotating paneer and special feasts.",
        icon: "utensils",
        x: 50,
        y: 55,
      },
      {
        id: "ro",
        label: "Commercial RO Water",
        desc: "Multi-stage UV+RO water purifier with hot, cold and room temperature dispensers.",
        icon: "shield",
        x: 82,
        y: 40,
      },
    ],
  },
];

export function Room360Viewer({ onBook }: { onBook: (tier?: TierKey) => void }) {
  const [selectedSpace, setSelectedSpace] = useState<RoomSpace>(SPACES[0]);
  const [panOffset, setPanOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [activePin, setActivePin] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto rotation effect when not dragging
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    const interval = setInterval(() => {
      setPanOffset((prev) => (prev + 0.15) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  // Touch and mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    setStartX(e.clientX);
    setPanOffset((prev) => {
      const next = prev - delta * 0.12;
      return next < 0 ? next + 100 : next % 100;
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setStartX(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const delta = e.touches[0].clientX - startX;
    setStartX(e.touches[0].clientX);
    setPanOffset((prev) => {
      const next = prev - delta * 0.18;
      return next < 0 ? next + 100 : next % 100;
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Compass angle calculation
  const compassAngle = Math.round((panOffset / 100) * 360);

  return (
    <section id="virtual-tour" className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1400px]">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <Eyebrow>Interactive Inspection</Eyebrow>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-ivory sm:text-5xl">
              360° Virtual <span className="text-gold-shimmer italic">Room Inspector</span>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-sand">
              Drag, pan and inspect our furnished bedrooms, study areas, attached washrooms and dining hall.
              Tap any hotspot pin to inspect mattresses, AC, power outlets and storage.
            </p>
          </div>

          {/* Space Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {SPACES.map((s) => (
              <button
                key={s.key}
                onClick={() => {
                  setSelectedSpace(s);
                  setActivePin(null);
                  setPanOffset(0);
                }}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedSpace.key === s.key
                    ? "border border-gold bg-gold text-espresso shadow-[0_0_20px_rgba(200,157,84,0.3)]"
                    : "border border-gold/25 bg-[#17100C] text-sand hover:border-gold hover:text-gold-light"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* 360 Viewport Container */}
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-gold/30 bg-[#120D0A] shadow-2xl">
          {/* Top Control Bar */}
          <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2 rounded-full border border-gold/30 bg-espresso/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gold backdrop-blur-md">
              <span className="h-2 w-2 animate-ping rounded-full bg-gold" />
              <span>360° Panorama: {compassAngle}°</span>
            </span>

            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md transition-all ${
                autoRotate
                  ? "border-gold/40 bg-gold/20 text-gold-light"
                  : "border-gold/20 bg-espresso/80 text-sand-dim"
              }`}
            >
              {autoRotate ? "Auto Spin: ON" : "Auto Spin: PAUSED"}
            </button>
          </div>

          {/* Zoom controls */}
          <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full border border-gold/30 bg-espresso/80 p-1 backdrop-blur-md">
            <button
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
              className="grid h-7 w-7 place-items-center rounded-full text-xs font-bold text-gold hover:bg-gold/20"
              title="Zoom In"
            >
              +
            </button>
            <span className="px-1 text-[10px] font-bold text-sand-dim">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.max(1.0, z - 0.1))}
              className="grid h-7 w-7 place-items-center rounded-full text-xs font-bold text-gold hover:bg-gold/20"
              title="Zoom Out"
            >
              −
            </button>
          </div>

          {/* Interactive Pan Canvas */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`relative h-[480px] w-full select-none overflow-hidden sm:h-[580px] ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {/* Seamless Panoramic Background Layer */}
            <div
              className="absolute inset-y-0 h-full w-[250%] transition-transform duration-75 ease-out"
              style={{
                transform: `translateX(-${panOffset * 0.8}%) scale(${zoom})`,
                backgroundImage: `url(${selectedSpace.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "brightness(0.95) contrast(1.05)",
              }}
            />

            {/* Subtle Room Depth Vignette */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-espresso/40" />

            {/* Feature Hotspots Overlay */}
            {selectedSpace.hotspots.map((h) => {
              // Adjust hotspot X position relative to current pan offset
              const adjustedX = ((h.x - panOffset * 0.4 + 100) % 100);
              const isActive = activePin === h.id;

              return (
                <div
                  key={h.id}
                  className="absolute z-20 transition-all duration-200"
                  style={{ left: `${adjustedX}%`, top: `${h.y}%` }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePin(isActive ? null : h.id);
                      setAutoRotate(false);
                    }}
                    className={`group relative grid h-10 w-10 place-items-center rounded-full border-2 transition-transform duration-300 hover:scale-110 ${
                      isActive
                        ? "border-gold bg-gold text-espresso shadow-[0_0_25px_rgba(200,157,84,0.8)]"
                        : "border-gold/60 bg-espresso/90 text-gold shadow-lg"
                    }`}
                  >
                    <Icon name={h.icon} className="h-4 w-4" />
                    <span className="absolute -inset-1 -z-10 animate-ping rounded-full bg-gold/30" />
                  </button>

                  {/* Hotspot Popup Card */}
                  {isActive && (
                    <div className="animate-fade-up absolute bottom-12 left-1/2 z-30 w-64 -translate-x-1/2 rounded-2xl border border-gold/40 bg-espresso/95 p-4 text-left shadow-2xl backdrop-blur-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                          Verified Feature
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePin(null);
                          }}
                          className="text-xs text-sand-dim hover:text-ivory"
                        >
                          ✕
                        </button>
                      </div>
                      <h4 className="mt-1 font-serif text-sm font-bold text-ivory">{h.label}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-sand">{h.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Drag Hint on Center Bottom */}
            <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-gold/25 bg-espresso/85 px-4 py-1.5 text-[11px] font-medium text-sand backdrop-blur-md">
              ↔ Drag or swipe horizontally to rotate 360°
            </div>
          </div>

          {/* Bottom Details & Direct Booking Bar */}
          <div className="flex flex-col items-start justify-between gap-4 border-t border-gold/20 bg-[#17100C] p-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                  Room Inspection Active
                </span>
              </div>
              <h3 className="mt-1 font-serif text-xl text-ivory">{selectedSpace.name}</h3>
              <p className="mt-0.5 text-xs text-sand-dim">{selectedSpace.description}</p>
            </div>

            <div className="flex w-full items-center gap-3 sm:w-auto">
              <Button
                variant="outline"
                size="md"
                icon="chat"
                className="flex-1 sm:flex-initial"
                onClick={() =>
                  window.open(
                    `https://wa.me/919548175915?text=${encodeURIComponent(
                      `Hi PANDEY PG! I am viewing the 360° Virtual Inspector for ${selectedSpace.name} and would like to ask a quick question.`
                    )}`
                  )
                }
              >
                Ask Warden
              </Button>
              <Button
                size="md"
                icon="bed"
                className="flex-1 sm:flex-initial"
                onClick={() => onBook(selectedSpace.tier || "single")}
              >
                Book This Bed
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
