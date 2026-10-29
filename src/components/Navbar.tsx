"use client";

import { useEffect, useRef, useState } from "react";
import { Button, useUi } from "./ui";
import { Icon } from "./Icon";
import { GoogleIcon } from "./GoogleIcon";
import { BRAND } from "@/lib/data";
import { cn } from "@/lib/cn";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "rooms", label: "Rooms & Pricing" },
  { id: "virtual-tour", label: "360° View" },
  { id: "amenities", label: "Amenities & Mess" },
  { id: "rules", label: "PG Rules" },
  { id: "reviews", label: "Reviews" },
  { id: "contact", label: "Contact" },
];

export function BrandMark({
  compact = false,
  href = "#home",
}: {
  compact?: boolean;
  href?: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3"
      aria-label="PANDEY PG home"
      onClick={(e) => {
        if (href.startsWith("#")) {
          const el = document.getElementById(href.replace("#", ""));
          if (el) {
            e.preventDefault();
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            window.location.href = `/${href}`;
          }
        }
      }}
    >
      <span className="relative grid h-11 w-11 shrink-0 place-items-center">
        <span className="absolute inset-0 rotate-45 rounded-[7px] border border-gold/55 bg-gradient-to-br from-gold/25 to-transparent transition-all duration-500 group-hover:rotate-[135deg] group-hover:border-gold" />
        <span className="absolute inset-[9px] rotate-45 rounded-[3px] bg-gradient-to-br from-gold-light to-gold-deep shadow-[0_0_16px_rgba(200,157,84,0.65)]" />
        <Icon
          name="gem"
          className="relative h-4 w-4 text-espresso"
          strokeWidth={2.4}
        />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-serif font-semibold tracking-[0.14em] text-ivory transition-colors group-hover:text-gold-light",
            compact ? "text-lg" : "text-xl sm:text-2xl",
          )}
        >
          {BRAND.name}
        </span>
        <span className="mt-1 text-[8px] font-bold uppercase tracking-luxe text-gold sm:text-[9px]">
          {BRAND.tagline}
        </span>
      </span>
    </a>
  );
}

export function Navbar({ bedsLeft }: { bedsLeft: number | null }) {
  const { openBooking } = useUi();
  const { user, openAuthModal, openMyPasses, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [drawer, setDrawer] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.6, 1] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    };
    if (userDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userDropdown]);

  const go = (id: string) => {
    setDrawer(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[90] transition-all duration-500",
          scrolled
            ? "border-b border-gold/15 bg-espresso/88 backdrop-blur-xl shadow-[0_18px_50px_-30px_rgba(0,0,0,1)]"
            : "border-b border-transparent bg-gradient-to-b from-espresso/85 to-transparent",
        )}
      >
        <div className="mx-auto flex h-[74px] max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
          <BrandMark />

          <nav className="hidden items-center gap-1 xl:flex">
            {LINKS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => go(l.id)}
                className={cn(
                  "group relative px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors duration-300",
                  active === l.id ? "text-gold-light" : "text-sand hover:text-ivory",
                )}
              >
                {l.label}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-0.5 h-px origin-left bg-gradient-to-r from-gold to-gold-light transition-transform duration-400",
                    active === l.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                  )}
                />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {bedsLeft !== null && bedsLeft > 0 ? (
              <span className="mr-1 hidden items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-success 2xl:flex">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                {bedsLeft <= 12 ? `${bedsLeft} Beds Left` : `${bedsLeft} Beds Free`}
              </span>
            ) : null}

            {/* Google User Menu or Sign In Button */}
            {user ? (
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdown((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-gold/35 bg-coffee/80 py-1 pl-1 pr-3 text-[11px] font-bold text-ivory transition-all hover:border-gold hover:bg-gold/10"
                  aria-label="User account menu"
                >
                  <span className="relative grid h-7 w-7 place-items-center overflow-hidden rounded-full border border-gold/40 bg-gold text-[11px] font-bold text-espresso">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user.name[0]
                    )}
                  </span>
                  <span className="hidden max-w-[85px] truncate sm:inline">{user.givenName}</span>
                  <Icon
                    name="chevrondown"
                    className={cn(
                      "h-3 w-3 text-sand transition-transform duration-200",
                      userDropdown && "rotate-180",
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                {userDropdown && (
                  <div className="animate-scale-in absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl border border-gold/25 bg-mocha p-2 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                    <div className="border-b border-gold/15 p-3">
                      <p className="text-[12px] font-bold text-ivory">{user.name}</p>
                      <p className="truncate text-[11px] text-sand-dim">{user.email}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-[9.5px] font-semibold text-success">
                        <GoogleIcon className="h-3 w-3" />
                        <span>Google Verified Resident</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdown(false);
                          openMyPasses();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[11.5px] text-ivory transition-colors hover:bg-gold/10 hover:text-gold-light"
                      >
                        <Icon name="file" className="h-4 w-4 text-gold" />
                        <span>My Booking Passes</span>
                      </button>
                    </div>

                    <div className="border-t border-gold/12 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdown(false);
                          signOut();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[11.5px] text-danger transition-colors hover:bg-danger/10"
                      >
                        <Icon name="x" className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-coffee/80 px-2.5 py-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-ivory transition-all hover:border-gold hover:bg-gold/12 active:scale-95 sm:px-3.5"
                title="Sign in with Google"
              >
                <GoogleIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            <a
              href="/resident"
              className="hidden items-center gap-1.5 rounded-lg border border-gold/25 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-sand transition-all hover:border-gold hover:bg-gold/10 hover:text-gold-light md:inline-flex"
            >
              <Icon name="home" className="h-3.5 w-3.5" />
              Resident
            </a>
            <a
              href="/admin"
              className="hidden items-center gap-1.5 rounded-lg border border-gold/25 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-gold/90 transition-all hover:border-gold hover:bg-gold/10 hover:text-gold-light md:inline-flex"
            >
              <Icon name="shield" className="h-3.5 w-3.5" />
              Warden
            </a>
            <Button size="sm" iconRight="arrow" onClick={() => openBooking()}>
              Book
            </Button>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setDrawer(true)}
              className="rounded-lg border border-gold/25 p-2 text-gold transition-colors hover:bg-gold/10 xl:hidden"
            >
              <Icon name="menu" className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[110] xl:hidden",
          drawer ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!drawer}
      >
        <div
          onClick={() => setDrawer(false)}
          className={cn(
            "absolute inset-0 bg-espresso/80 backdrop-blur-sm transition-opacity duration-300",
            drawer ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col border-l border-gold/20 bg-mocha shadow-[-30px_0_80px_-30px_rgba(0,0,0,1)] transition-transform duration-400 ease-out",
            drawer ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-gold/15 px-5 py-4">
            <BrandMark compact />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setDrawer(false)}
              className="rounded-lg border border-gold/20 p-2 text-sand transition-colors hover:text-gold"
            >
              <Icon name="x" className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          {/* User status card in drawer */}
          <div className="border-b border-gold/15 p-4">
            {user ? (
              <div className="rounded-xl border border-gold/20 bg-espresso/60 p-3.5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-gold/40 bg-gold text-[13px] font-bold text-espresso">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      user.name[0]
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ivory">{user.name}</p>
                    <p className="truncate text-[11px] text-sand-dim">{user.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-[9.5px]"
                    icon="file"
                    onClick={() => {
                      setDrawer(false);
                      openMyPasses();
                    }}
                  >
                    My Passes
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[9.5px] text-danger"
                    onClick={() => {
                      setDrawer(false);
                      signOut();
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDrawer(false);
                  openAuthModal();
                }}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gold/30 bg-coffee/80 py-3 text-[12px] font-bold uppercase tracking-[0.12em] text-ivory transition-colors hover:border-gold hover:bg-gold/12"
              >
                <GoogleIcon className="h-4 w-4" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {LINKS.map((l, i) => (
              <button
                key={l.id}
                type="button"
                onClick={() => go(l.id)}
                className="flex w-full items-center justify-between border-b border-gold/8 px-3 py-3.5 text-left text-[13px] font-bold uppercase tracking-[0.14em] text-ivory transition-colors hover:text-gold-light"
              >
                {l.label}
                <span className="flex items-center gap-2 text-[10px] text-sand-dim">
                  {String(i + 1).padStart(2, "0")}
                  <Icon name="chevronright" className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}
          </nav>
          <div className="space-y-2.5 border-t border-gold/15 px-5 py-5">
            <Button
              block
              icon="bed"
              onClick={() => {
                setDrawer(false);
                openBooking();
              }}
            >
              Book Your Bed
            </Button>
            <a
              href="/resident"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gold/30 bg-coffee/60 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ivory hover:border-gold hover:bg-gold/10"
            >
              <Icon name="home" className="h-4 w-4 text-gold" />
              Resident Portal (Mess &amp; Gate Pass)
            </a>
            <a
              href="/admin"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gold/30 bg-coffee/60 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-gold hover:border-gold hover:bg-gold/10"
            >
              <Icon name="shield" className="h-4 w-4" />
              Warden Portal
            </a>
            <Button
              block
              variant="outline"
              icon="chat"
              onClick={() => window.open(`https://wa.me/${BRAND.whatsapp}`, "_blank")}
            >
              WhatsApp Us
            </Button>
            <p className="pt-1 text-center text-[11px] text-sand-dim">{BRAND.phone}</p>
          </div>
        </aside>
      </div>
    </>
  );
}
