"use client";

import { useState } from "react";
import { Section, Sticker } from "@/data/stickers";
import StickerGrid from "./StickerGrid";

interface CountrySectionProps {
  section: Section;
  collected: Record<string, boolean>;
  onStickerClick: (sticker: Sticker, section: Section) => void;
}

export default function CountrySection({ section, collected, onStickerClick }: CountrySectionProps) {
  const [open, setOpen] = useState(false);
  const sectionCollected = section.stickers.filter((s) => collected[s.id]).length;
  const total = section.stickers.length;
  const pct = Math.round((sectionCollected / total) * 100);
  const done = sectionCollected === total;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#1a1a2e", border: done ? "1.5px solid #16a34a" : "1.5px solid #1e2a3a" }}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-3"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-2xl leading-none">{section.flag}</span>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{section.name}</span>
            {done && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: "#14532d", color: "#4ade80" }}>
                ✓ Compleet
              </span>
            )}
          </div>
          <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: "#0f1a2e" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: done ? "#16a34a" : "linear-gradient(90deg, #e8c84a, #f97316)",
              }}
            />
          </div>
        </div>
        <div className="text-right min-w-[40px]">
          <span className="text-sm font-bold" style={{ color: done ? "#4ade80" : "#e8c84a" }}>
            {sectionCollected}/{total}
          </span>
        </div>
        <span
          className="text-sm"
          style={{
            color: "#475569",
            display: "inline-block",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "none",
          }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="px-3 pb-4">
          <StickerGrid
            stickers={section.stickers}
            collected={collected}
            onStickerClick={(sticker) => onStickerClick(sticker, section)}
          />
        </div>
      )}
    </div>
  );
}
