"use client";

import { Sticker } from "@/data/stickers";
import { c, typeTint } from "@/lib/theme";

interface StickerGridProps {
  stickers: Sticker[];
  collected: Record<string, boolean>;
  onStickerClick: (sticker: Sticker) => void;
}

const TYPE_EMOJI: Record<string, string> = {
  special: "⭐",
  insert: "🔴",
};

export default function StickerGrid({ stickers, collected, onStickerClick }: StickerGridProps) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
      {stickers.map((sticker) => {
        const isCollected = !!collected[sticker.id];
        const emoji = TYPE_EMOJI[sticker.type] ?? "";
        // Uncollected tiles get a faint type tint; collected tiles go green.
        const bg = isCollected ? c.greenTint : typeTint[sticker.type] ?? c.surfaceMuted;
        const border = isCollected ? c.successBright : c.border;
        return (
          <button
            key={sticker.id}
            className="sticker-btn rounded-lg flex flex-col items-center justify-center gap-0.5 relative"
            style={{
              height: 88,
              background: bg,
              border: `1.5px solid ${border}`,
            }}
            onClick={() => onStickerClick(sticker)}
          >
            {isCollected && (
              <span
                className="absolute leading-none font-bold"
                style={{ top: 5, right: 7, fontSize: 10, color: c.greenInk }}
              >
                ✓
              </span>
            )}
            {emoji && !isCollected && (
              <span className="text-xs leading-none">{emoji}</span>
            )}
            <span
              className="font-bold leading-none"
              style={{
                color: isCollected ? c.greenInk : c.text,
                fontSize: sticker.code.length > 5 ? "15px" : "18px",
              }}
            >
              {sticker.code}
            </span>
            {sticker.type === "player" && sticker.label && (
              <span
                className="leading-none truncate w-full text-center px-1"
                style={{ fontSize: "12px", color: isCollected ? c.greenInk : c.textSubtle }}
              >
                {sticker.label.split(" ").pop()}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
