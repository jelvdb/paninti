"use client";

import { sections } from "@/data/stickers";
import type { Sticker, Section as StickerSection } from "@/data/stickers";

const stickerMap = new Map<string, { sticker: Sticker; section: StickerSection }>();
for (const section of sections) {
  for (const sticker of section.stickers) {
    stickerMap.set(sticker.id, { sticker, section });
  }
}

interface AnalysisResult {
  newStickers: string[];
  duplicateStickers: string[];
  unknownCodes: string[];
}

interface Props {
  preview: string;
  result: AnalysisResult;
  onApprove: () => void;
  onCancel: () => void;
  applying: boolean;
}

export default function PhotoReviewModal({ preview, result, onApprove, onCancel, applying }: Props) {
  const { newStickers, duplicateStickers, unknownCodes } = result;
  const total = newStickers.length + duplicateStickers.length;

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} />

      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl overflow-y-auto"
        style={{ background: "#1a1a2e", maxHeight: "90dvh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ background: "#334155" }} />
        </div>

        <div className="px-4 pb-10 max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
            <div>
              <h2 className="font-bold text-base">Stickers gedetecteerd</h2>
              <p className="text-sm" style={{ color: "#94a3b8" }}>
                {total} sticker{total !== 1 ? "s" : ""} herkend — controleer en keur goed
              </p>
            </div>
          </div>

          {/* New stickers */}
          {newStickers.length > 0 && (
            <Section
              title="Nieuw"
              emoji="✨"
              color="#4ade80"
              bg="#0d2b1a"
              ids={newStickers}
            />
          )}

          {/* Duplicate stickers */}
          {duplicateStickers.length > 0 && (
            <Section
              title="Dubbel"
              emoji="🔁"
              color="#fbbf24"
              bg="#2a1f0a"
              ids={duplicateStickers}
            />
          )}

          {/* Unknown codes */}
          {unknownCodes.length > 0 && (
            <div className="rounded-2xl p-4 mb-3" style={{ background: "#1a1218", border: "1.5px solid #3f1f2a" }}>
              <p className="text-sm font-semibold mb-2" style={{ color: "#f87171" }}>
                ⚠️ Niet herkend ({unknownCodes.length})
              </p>
              <p className="text-xs" style={{ color: "#64748b" }}>
                {unknownCodes.join(", ")}
              </p>
            </div>
          )}

          {total === 0 && (
            <div className="text-center py-6" style={{ color: "#64748b" }}>
              <p className="text-3xl mb-2">🤔</p>
              <p className="font-semibold">Geen codes herkend</p>
              <p className="text-sm mt-1">Probeer een duidelijkere foto</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              className="flex-1 rounded-2xl py-4 font-bold text-sm"
              style={{ background: "#1e2a3a", color: "#94a3b8" }}
              onClick={onCancel}
              disabled={applying}
            >
              Annuleren
            </button>
            {total > 0 && (
              <button
                className="flex-1 rounded-2xl py-4 font-bold text-sm"
                style={{ background: applying ? "#334155" : "linear-gradient(135deg, #e8c84a, #f97316)", color: "#0f0f1a" }}
                onClick={onApprove}
                disabled={applying}
              >
                {applying ? "Opslaan..." : "Goedkeuren"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Section({
  title, emoji, color, bg, ids,
}: {
  title: string; emoji: string; color: string; bg: string; ids: string[];
}) {
  return (
    <div className="rounded-2xl p-4 mb-3" style={{ background: bg, border: `1.5px solid ${color}33` }}>
      <p className="text-sm font-bold mb-3" style={{ color }}>
        {emoji} {title} ({ids.length})
      </p>
      <div className="flex flex-col gap-2">
        {ids.map((id) => {
          const found = stickerMap.get(id);
          if (!found) return null;
          const { sticker, section } = found;
          return (
            <div key={id} className="flex items-center gap-2">
              <span className="text-lg leading-none">{section.flag}</span>
              <span className="font-mono text-xs font-bold" style={{ color, minWidth: 52 }}>
                {sticker.code}
              </span>
              <span className="text-sm truncate" style={{ color: "#e2e8f0" }}>
                {sticker.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
