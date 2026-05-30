"use client";

import { Sticker, Section } from "@/data/stickers";
import { requireAuth } from "@/lib/auth";
import { c, typeInk, typeTint } from "@/lib/theme";

interface Props {
  sticker: Sticker;
  section: Section;
  collected: boolean;
  onToggle: () => void;
  onClose: () => void;
}

async function authThenToggle(onToggle: () => void) {
  if (await requireAuth()) onToggle();
}

const TYPE_LABEL: Record<string, string> = {
  foil:        "✨ Foil",
  player:      "⚽ Speler",
  "team-photo": "📸 Teamfoto",
  special:     "⭐ Speciaal",
  insert:      "🔴 Insert",
};

export default function StickerDetailModal({ sticker, section, collected, onToggle, onClose }: Props) {
  const ink = typeInk[sticker.type] ?? c.tealInk;
  const tint = typeTint[sticker.type] ?? c.tealTint;
  const isPlayer = sticker.type === "player";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(20,23,58,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl pb-safe"
        style={{ background: c.surface, maxHeight: "85dvh", overflowY: "auto" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: c.borderStrong }} />
        </div>

        <div className="px-6 pt-2 pb-8 max-w-lg mx-auto">
          {/* Country header */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-2xl">{section.flag}</span>
            <span className="font-semibold" style={{ color: c.textMuted }}>{section.name}</span>
            <div className="ml-auto">
              <button onClick={onClose} className="text-xl" style={{ color: c.textSubtle }}>✕</button>
            </div>
          </div>

          {/* Sticker card */}
          <div
            className="rounded-2xl p-5 mb-6 flex flex-col items-center gap-3 text-center"
            style={{ background: tint, border: `2px solid ${ink}` }}
          >
            <span
              className="text-4xl font-black tracking-tight font-mono"
              style={{ color: ink }}
            >
              {sticker.code}
            </span>
            <span className="text-xl font-bold leading-tight" style={{ color: c.text }}>
              {sticker.label}
            </span>
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: c.surface, color: ink }}
            >
              {TYPE_LABEL[sticker.type] ?? sticker.type}
            </span>

            {isPlayer && (
              <p className="text-xs mt-1" style={{ color: c.textSubtle }}>
                {section.name} · FIFA WK 2026
              </p>
            )}
          </div>

          {/* Toggle button */}
          {collected ? (
            <button
              className="w-full rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2"
              style={{ background: c.greenTint, border: `2px solid ${c.successBright}`, color: c.greenInk }}
              onClick={() => authThenToggle(onToggle)}
            >
              ✓ Verzameld — tik om te verwijderen
            </button>
          ) : (
            <button
              className="w-full rounded-2xl py-4 font-bold text-base"
              style={{ background: c.primary, color: c.white }}
              onClick={() => authThenToggle(onToggle)}
            >
              Afvinken als verzameld
            </button>
          )}
        </div>
      </div>
    </>
  );
}
