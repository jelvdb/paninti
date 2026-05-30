"use client";

import { useState } from "react";
import { sections } from "@/data/stickers";
import type { Sticker, Section as StickerSection } from "@/data/stickers";
import { c } from "@/lib/theme";

const stickerMap = new Map<string, { sticker: Sticker; section: StickerSection }>();
for (const section of sections) {
  for (const sticker of section.stickers) {
    stickerMap.set(sticker.id, { sticker, section });
  }
}

type StickerStatus = "new" | "duplicate" | "ignore";

const STATUS: Record<StickerStatus, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  new:       { label: "Nieuw",  emoji: "✨", color: c.greenInk,   bg: c.greenTint,    border: c.successBright },
  duplicate: { label: "Dubbel", emoji: "🔁", color: c.orangeInk,  bg: c.orangeTint,   border: c.orangeInk },
  ignore:    { label: "Negeer", emoji: "✕",  color: c.textSubtle, bg: c.surfaceMuted, border: c.border },
};

const CYCLE: Record<StickerStatus, StickerStatus> = {
  new: "duplicate",
  duplicate: "ignore",
  ignore: "new",
};

export interface AnalysisResult {
  newStickers: string[];
  duplicateStickers: string[];
  unknownCodes: string[];
}

export interface CorrectedResult {
  newStickers: string[];
  duplicateStickers: string[];
}

interface Props {
  preview: string;
  result: AnalysisResult;
  onApprove: (corrected: CorrectedResult) => void;
  onCancel: () => void;
  applying: boolean;
}

export default function PhotoReviewModal({ preview, result, onApprove, onCancel, applying }: Props) {
  const allIds = [...result.newStickers, ...result.duplicateStickers];

  const [statuses, setStatuses] = useState<Record<string, StickerStatus>>(() => {
    const init: Record<string, StickerStatus> = {};
    for (const id of result.newStickers) init[id] = "new";
    for (const id of result.duplicateStickers) init[id] = "duplicate";
    return init;
  });

  function cycle(id: string) {
    setStatuses((prev) => ({ ...prev, [id]: CYCLE[prev[id]] }));
  }

  function handleApprove() {
    onApprove({
      newStickers: allIds.filter((id) => statuses[id] === "new"),
      duplicateStickers: allIds.filter((id) => statuses[id] === "duplicate"),
    });
  }

  const activeCount = allIds.filter((id) => statuses[id] !== "ignore").length;
  const newCount = allIds.filter((id) => statuses[id] === "new").length;
  const dupCount = allIds.filter((id) => statuses[id] === "duplicate").length;

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: "rgba(20,23,58,0.5)", backdropFilter: "blur(4px)" }} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl overflow-y-auto"
        style={{ background: c.surface, maxHeight: "92dvh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ background: c.borderStrong }} />
        </div>

        <div className="px-4 pb-10 max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base" style={{ color: c.text }}>Stickers controleren</h2>
              <p className="text-sm" style={{ color: c.textMuted }}>
                {allIds.length} herkend · tik badge om te corrigeren
              </p>
            </div>
          </div>

          {/* Summary pills */}
          {allIds.length > 0 && (
            <div className="flex gap-2 mb-4">
              <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: c.greenTint, color: c.greenInk }}>
                ✨ {newCount} nieuw
              </span>
              <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: c.orangeTint, color: c.orangeInk }}>
                🔁 {dupCount} dubbel
              </span>
            </div>
          )}

          {/* Sticker rows */}
          <div className="flex flex-col gap-2 mb-4">
            {allIds.map((id) => {
              const found = stickerMap.get(id);
              if (!found) return null;
              const { sticker, section } = found;
              const s = statuses[id];
              const cfg = STATUS[s];
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors"
                  style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}` }}
                >
                  <span className="text-xl leading-none shrink-0">{section.flag}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-xs font-bold mr-2" style={{ color: cfg.color }}>
                      {sticker.code}
                    </span>
                    <span className="text-sm" style={{ color: c.text }}>
                      {sticker.label}
                    </span>
                  </div>
                  <button
                    onClick={() => cycle(id)}
                    className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shrink-0 active:scale-95 transition-transform"
                    style={{ background: cfg.bg, color: cfg.color }}
                    disabled={applying}
                  >
                    {cfg.emoji} {cfg.label}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Unknown codes */}
          {result.unknownCodes.length > 0 && (
            <div className="rounded-2xl p-4 mb-4" style={{ background: c.redTint, border: `1.5px solid ${c.redInk}` }}>
              <p className="text-sm font-semibold mb-1" style={{ color: c.redInk }}>
                ⚠️ Niet herkend ({result.unknownCodes.length})
              </p>
              <p className="text-xs leading-relaxed" style={{ color: c.textMuted }}>
                {result.unknownCodes.join("  ·  ")}
              </p>
            </div>
          )}

          {allIds.length === 0 && (
            <div className="text-center py-10" style={{ color: c.textMuted }}>
              <p className="text-4xl mb-3">🤔</p>
              <p className="font-semibold" style={{ color: c.text }}>Geen stickers herkend</p>
              <p className="text-sm mt-1">Probeer een scherpere foto, codekant omhoog</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              className="flex-1 rounded-2xl py-4 font-bold text-sm"
              style={{ background: c.surfaceMuted, color: c.textMuted }}
              onClick={onCancel}
              disabled={applying}
            >
              Annuleren
            </button>
            <button
              className="flex-1 rounded-2xl py-4 font-bold text-sm disabled:opacity-40"
              style={{
                background: applying || activeCount === 0 ? c.borderStrong : c.primary,
                color: c.white,
              }}
              onClick={handleApprove}
              disabled={applying || activeCount === 0}
            >
              {applying ? "Opslaan..." : activeCount > 0 ? `Bevestigen (${activeCount})` : "Niets te bevestigen"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
