"use client";

import { Icon } from "./Icon";
import { QUICK_INFO, waLink, BRAND } from "@/lib/data";

export function QuickInfoBar() {
  return (
    <section id="quick-info" className="relative z-20 -mt-4 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="glass-panel grid grid-cols-1 divide-y divide-gold/12 rounded-2xl md:grid-cols-3 md:divide-x md:divide-y-0">
          {QUICK_INFO.map((item, i) => {
            const isPhone = i === 2;
            return (
              <div
                key={item.label}
                className="group flex items-start gap-4 px-5 py-6 transition-colors duration-400 hover:bg-gold/5 sm:px-7"
              >
                <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full border border-gold/40 bg-gradient-to-br from-gold/18 to-transparent transition-all duration-500 group-hover:border-gold group-hover:shadow-[0_0_26px_-6px_rgba(200,157,84,0.85)]">
                  <Icon name={item.icon} className="h-6 w-6 text-gold-light" strokeWidth={1.5} />
                  <span className="absolute inset-[-5px] rounded-full border border-gold/12" />
                </span>
                <div className="min-w-0">
                  <p className="text-[9.5px] font-bold uppercase tracking-luxe text-gold">
                    {item.label}
                  </p>
                  <p className="mt-2 font-serif text-[17px] leading-tight text-ivory">
                    {item.primary}
                  </p>
                  {isPhone ? (
                    <a
                      href={waLink("Hi PANDEY PG, I need help with a room enquiry.")}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] text-sand transition-colors hover:text-success"
                    >
                      <Icon name="chat" className="h-3.5 w-3.5" />
                      {item.secondary}
                    </a>
                  ) : (
                    <p className="mt-1.5 text-[12px] leading-snug text-sand">{item.secondary}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[10.5px] uppercase tracking-[0.18em] text-sand-dim">
          {BRAND.address}
        </p>
      </div>
    </section>
  );
}
