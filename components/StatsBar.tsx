"use client";

import { c } from "@/lib/theme";

interface StatsBarProps {
  total: number;
  collected: number;
}

export default function StatsBar({ total, collected }: StatsBarProps) {
  const pct = total > 0 ? Math.round((collected / total) * 100) : 0;

  return (
    <div className="sticky top-11 z-30 px-4 py-3" style={{ background: c.bg, borderBottom: `1px solid ${c.border}` }}>
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: c.text }}>🏆 Collectie</h1>
          <p className="text-xs" style={{ color: c.textMuted }}>
            {collected} verzameld · {total - collected} nog te gaan
          </p>
        </div>
        <div
          className="rounded-xl px-3 py-1.5 text-sm font-bold"
          style={{ background: c.purpleTint, color: c.purpleInk }}
        >
          {pct}%
        </div>
      </div>
    </div>
  );
}
