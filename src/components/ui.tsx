"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { cn } from "@/lib/cn";

/* ---------------------------------------------------------------- buttons */

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
  icon?: string;
  iconRight?: string;
  block?: boolean;
  href?: string;
};

export function Button({
  variant = "solid",
  size = "md",
  icon,
  iconRight,
  block,
  className,
  children,
  href,
  ...rest
}: BtnProps) {
  const base =
    "group relative inline-flex items-center justify-center gap-2 font-sans font-bold uppercase tracking-[0.14em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-espresso";
  const sizes = {
    sm: "px-4 py-2 text-[10px] rounded-md",
    md: "px-6 py-3 text-[11px] rounded-lg",
    lg: "px-8 py-4 text-xs rounded-lg",
  };
  const variants = {
    solid:
      "bg-gradient-to-b from-gold-light to-gold text-espresso shadow-[0_10px_30px_-12px_rgba(200,157,84,0.85)] hover:from-[#eccb8f] hover:to-gold-light hover:shadow-[0_16px_40px_-12px_rgba(222,179,104,0.95)] hover:-translate-y-0.5 active:translate-y-0",
    outline:
      "border border-gold/45 text-gold hover:border-gold hover:bg-gold/10 hover:text-gold-light hover:-translate-y-0.5",
    ghost:
      "border border-ivory/15 text-ivory/80 hover:border-gold/45 hover:text-gold hover:bg-gold/5",
    dark: "bg-coffee-2 text-ivory border border-gold/15 hover:border-gold/40 hover:text-gold-light",
  };

  const content = (
    <>
      {icon ? <Icon name={icon} className="h-4 w-4 shrink-0" /> : null}
      <span>{children}</span>
      {iconRight ? (
        <Icon
          name={iconRight}
          className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
        />
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(base, sizes[size], variants[variant], block && "w-full", className)}
        {...(rest as any)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={cn(base, sizes[size], variants[variant], block && "w-full", className)}
      {...rest}
    >
      {content}
    </button>
  );
}

/* ------------------------------------------------------------------ atoms */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-luxe text-gold",
        className,
      )}
    >
      <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/70" />
      {children}
    </div>
  );
}

export function Panel({
  children,
  className,
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div className={cn("glass-panel rounded-2xl", glow && "shadow-[0_0_60px_-25px_rgba(200,157,84,0.55)]", className)}>
      {children}
    </div>
  );
}

export function Pill({
  children,
  tone = "gold",
  className,
}: {
  children: ReactNode;
  tone?: "gold" | "green" | "amber" | "muted" | "danger";
  className?: string;
}) {
  const tones = {
    gold: "border-gold/35 bg-gold/12 text-gold-light",
    green: "border-success/35 bg-success/12 text-success",
    amber: "border-[#e0a95f]/40 bg-[#e0a95f]/12 text-[#e8bd7c]",
    muted: "border-ivory/12 bg-ivory/5 text-sand",
    danger: "border-danger/35 bg-danger/12 text-danger",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-sm",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name="star"
          className={cn("h-3.5 w-3.5", i <= value ? "fill-gold text-gold" : "text-gold/25")}
          strokeWidth={1.4}
        />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- inputs */

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold/85">
          {label}
          {required ? <span className="ml-1 text-danger">*</span> : null}
        </span>
        {hint ? <span className="text-[10px] text-sand-dim">{hint}</span> : null}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-danger">
          <Icon name="alert" className="h-3.5 w-3.5" strokeWidth={2} />
          {error}
        </span>
      ) : null}
    </label>
  );
}

const fieldBase =
  "w-full rounded-lg border bg-espresso/70 px-3.5 py-2.5 text-sm text-ivory placeholder:text-sand-dim/70 outline-none transition-all duration-200 focus:border-gold/60 focus:bg-espresso focus:ring-2 focus:ring-gold/20";

export function TextInput({
  invalid,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(fieldBase, invalid ? "border-danger/60" : "border-gold/15", className)}
      {...rest}
    />
  );
}

export function SelectInput({
  invalid,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        className={cn(
          fieldBase,
          "appearance-none pr-9",
          invalid ? "border-danger/60" : "border-gold/15",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <Icon
        name="chevrondown"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/70"
      />
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className,
}: {
  options: { value: T; label: string; icon?: string; sub?: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 rounded-xl border border-gold/15 bg-espresso/60 p-1.5",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-lg border font-sans font-bold uppercase tracking-[0.12em] transition-all duration-250",
              size === "sm" ? "px-3 py-1.5 text-[10px]" : "px-3.5 py-2.5 text-[11px]",
              active
                ? "border-gold/60 bg-gradient-to-b from-gold-light to-gold text-espresso shadow-[0_8px_22px_-12px_rgba(200,157,84,0.9)]"
                : "border-transparent text-sand hover:border-gold/25 hover:bg-gold/8 hover:text-gold-light",
            )}
          >
            {o.icon ? <Icon name={o.icon} className="mr-1.5 inline h-3.5 w-3.5" /> : null}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  labelOn,
  labelOff,
  title,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  labelOn: string;
  labelOff: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={title ?? labelOn}
      onClick={() => onChange(!checked)}
      className="group flex w-full items-center gap-3 rounded-xl border border-gold/15 bg-espresso/50 px-3 py-2.5 text-left transition-all duration-300 hover:border-gold/35 hover:bg-gold/5"
    >
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300",
          checked ? "border-gold/60 bg-gold/35" : "border-ivory/15 bg-coffee-2",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 h-4.5 w-4.5 -translate-y-1/2 rounded-full transition-all duration-300",
            checked
              ? "left-[22px] bg-gradient-to-b from-gold-light to-gold shadow-[0_0_12px_rgba(222,179,104,0.8)]"
              : "left-[3px] bg-sand-dim",
          )}
          style={{ height: 18, width: 18 }}
        />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[11px] font-bold uppercase tracking-[0.14em] text-ivory">
          {checked ? labelOn : labelOff}
        </span>
        {title ? <span className="block truncate text-[10px] text-sand-dim">{title}</span> : null}
      </span>
    </button>
  );
}

export function CheckCard({
  checked,
  onChange,
  title,
  note,
  price,
  icon,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  note?: string;
  price?: string;
  icon?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all duration-250",
        checked
          ? "border-gold/55 bg-gold/10 shadow-[inset_0_0_24px_rgba(200,157,84,0.12)]"
          : "border-gold/12 bg-espresso/45 hover:border-gold/30 hover:bg-gold/5",
        disabled && "cursor-not-allowed opacity-45",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          checked ? "border-gold bg-gold text-espresso" : "border-gold/30 bg-transparent",
        )}
      >
        {checked ? <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          {icon ? <Icon name={icon} className="h-4 w-4 shrink-0 text-gold" /> : null}
          <span className="truncate text-[12px] font-bold uppercase tracking-[0.1em] text-ivory">
            {title}
          </span>
        </span>
        {note ? <span className="mt-0.5 block text-[11px] leading-snug text-sand-dim">{note}</span> : null}
      </span>
      {price ? (
        <span className="shrink-0 text-[11px] font-bold text-gold-light">{price}</span>
      ) : null}
    </button>
  );
}

/* ------------------------------------------------------------------ modal */

export function Modal({
  open,
  onClose,
  children,
  className,
  ariaLabel,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto overscroll-contain bg-espresso/85 p-3 backdrop-blur-md sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={cn("w-full animate-scale-in", className)}>{children}</div>
    </div>
  );
}

export function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
  step,
  steps,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  step?: number;
  steps?: number;
}) {
  return (
    <Panel className="overflow-hidden" glow>
      <div className="relative flex items-start justify-between gap-4 border-b border-gold/15 bg-gradient-to-r from-coffee via-coffee-2 to-coffee px-5 py-4 sm:px-7">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-lg text-ivory sm:text-xl">{title}</h3>
          {subtitle ? <p className="mt-0.5 truncate text-[11px] text-sand-dim">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 rounded-lg border border-gold/20 p-2 text-sand transition-all hover:border-gold/50 hover:text-gold"
        >
          <Icon name="x" className="h-4 w-4" strokeWidth={2} />
        </button>
        {step && steps ? (
          <div className="absolute inset-x-0 bottom-0 flex h-0.5">
            {Array.from({ length: steps }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "flex-1 transition-colors duration-500",
                  i < step ? "bg-gradient-to-r from-gold to-gold-light" : "bg-gold/12",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
      <div className="max-h-[68vh] overflow-y-auto px-5 py-5 sm:px-7">{children}</div>
      {footer ? (
        <div className="border-t border-gold/15 bg-espresso/60 px-5 py-4 sm:px-7">{footer}</div>
      ) : null}
    </Panel>
  );
}

/* ------------------------------------------------------------ ui context */

interface UiState {
  openBooking: (tier?: string) => void;
  openTour?: () => void;
  openRoom: (tier?: string) => void;
}

const UiContext = createContext<UiState | null>(null);

export function UiProvider({ value, children }: { value: UiState; children: ReactNode }) {
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(): UiState {
  const ctx = useContext(UiContext);
  if (!ctx) {
    throw new Error("useUi must be used inside UiProvider");
  }
  return ctx;
}

/* ------------------------------------------------------------- utilities */

export function useReveal<T extends HTMLElement>() {
  const [ref, setRef] = useState<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!ref || shown) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(ref);
    return () => io.disconnect();
  }, [ref, shown]);

  return { setRef, shown };
}

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback(async (text: string, key = "default") => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  }, []);
  return useMemo(() => ({ copied, copy }), [copied, copy]);
}
