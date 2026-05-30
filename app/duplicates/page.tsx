"use client";

import { useCallback, useEffect, useState } from "react";
import { sections, Sticker, Section } from "@/data/stickers";
import { requireAuth } from "@/lib/auth";
import { c, typeInk } from "@/lib/theme";

interface DuplicateEntry {
  sticker: Sticker;
  section: Section;
  count: number;
}

// Build a lookup map: stickerId → { sticker, section }
const stickerMap = new Map<string, { sticker: Sticker; section: Section }>();
for (const section of sections) {
  for (const sticker of section.stickers) {
    stickerMap.set(sticker.id, { sticker, section });
  }
}

export default function DuplicatesPage() {
  const [duplicates, setDuplicates] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/state")
      .then((r) => r.json())
      .then((s) => setDuplicates(s.duplicates ?? {}));
  }, []);

  const handleDelta = useCallback(async (stickerId: string, delta: number) => {
    if (!await requireAuth()) return;
    setDuplicates((prev) => {
      const next = { ...prev };
      const val = Math.max(0, (next[stickerId] ?? 0) + delta);
      if (val === 0) delete next[stickerId];
      else next[stickerId] = val;
      return next;
    });
    await fetch("/api/duplicates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stickerId, delta }),
    });
  }, []);

  const entries: DuplicateEntry[] = Object.entries(duplicates)
    .map(([id, count]) => {
      const found = stickerMap.get(id);
      if (!found) return null;
      return { sticker: found.sticker, section: found.section, count };
    })
    .filter(Boolean)
    .sort((a, b) => a!.sticker.code.localeCompare(b!.sticker.code)) as DuplicateEntry[];

  const totalDuplicates = entries.reduce((sum, e) => sum + e.count, 0);

  return (
    <div className="min-h-dvh pb-24">
      {/* Header */}
      <div
        className="sticky top-11 z-30 px-4 py-4"
        style={{ background: c.bg, borderBottom: `1px solid ${c.border}` }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: c.text }}>🔁 Dubbele stickers</h1>
            <p className="text-xs" style={{ color: c.textMuted }}>
              {entries.length} verschillende · {totalDuplicates} totaal
            </p>
          </div>
          <div
            className="rounded-xl px-3 py-1.5 text-sm font-bold"
            style={{ background: c.purpleTint, color: c.purpleInk }}
          >
            {totalDuplicates}×
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 max-w-lg mx-auto flex flex-col gap-2">
        {entries.length === 0 ? (
          <div className="text-center py-16" style={{ color: c.textSubtle }}>
            <div className="text-4xl mb-3">🔁</div>
            <p className="font-semibold" style={{ color: c.textMuted }}>Geen dubbels</p>
            <p className="text-sm mt-1">Gebruik + om dubbele stickers toe te voegen</p>
          </div>
        ) : (
          entries.map((entry) => (
            <DuplicateRow key={entry.sticker.id} entry={entry} onDelta={handleDelta} />
          ))
        )}
      </div>

      {/* Add button — opens a search modal (future) — for now just a hint */}
      <div className="fixed bottom-16 right-4 z-40">
        <AddDuplicateButton onAdd={handleDelta} />
      </div>
    </div>
  );
}

function DuplicateRow({
  entry,
  onDelta,
}: {
  entry: DuplicateEntry;
  onDelta: (id: string, delta: number) => void;
}) {
  const { sticker, section, count } = entry;

  const color = typeInk[sticker.type] ?? c.tealInk;

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{ background: c.surface, border: `1.5px solid ${c.border}` }}
    >
      {/* Flag + code */}
      <span className="text-xl leading-none">{section.flag}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold" style={{ color }}>
            {sticker.code}
          </span>
          {sticker.type === "foil" && <span className="text-xs">✨</span>}
          {sticker.type === "team-photo" && <span className="text-xs">📸</span>}
        </div>
        <div className="text-sm truncate" style={{ color: c.text }}>
          {sticker.label}
        </div>
        <div className="text-xs" style={{ color: c.textSubtle }}>
          {section.name}
        </div>
      </div>

      {/* Count controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
          style={{ background: c.surfaceMuted, color: c.textMuted }}
          onClick={() => onDelta(sticker.id, -1)}
        >
          −
        </button>
        <span className="w-5 text-center font-bold text-sm" style={{ color: c.purpleInk }}>
          {count}
        </span>
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
          style={{ background: c.surfaceMuted, color: c.textMuted }}
          onClick={() => onDelta(sticker.id, +1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

function AddDuplicateButton({ onAdd }: { onAdd: (id: string, delta: number) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = query.trim().length >= 2
    ? [...stickerMap.entries()]
        .filter(([, { sticker }]) =>
          sticker.code.toLowerCase().includes(query.toLowerCase()) ||
          sticker.label.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
    : [];

  return (
    <>
      <button
        className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg"
        style={{ background: c.primary, color: c.white }}
        onClick={async () => { if (await requireAuth()) setOpen(true); }}
      >
        +
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(20,23,58,0.45)" }}
            onClick={() => { setOpen(false); setQuery(""); }}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-4 max-w-lg mx-auto"
            style={{ background: c.surface, maxHeight: "70dvh", overflowY: "auto" }}
          >
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 rounded-full" style={{ background: c.borderStrong }} />
            </div>
            <h3 className="font-bold mb-3" style={{ color: c.text }}>Dubbel toevoegen</h3>
            <input
              autoFocus
              className="w-full rounded-xl px-4 py-2.5 text-sm mb-3"
              style={{ background: c.surfaceMuted, border: `1.5px solid ${c.border}`, color: c.text }}
              placeholder="Zoek op code (bv. BEL5) of naam..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              {results.map(([id, { sticker, section }]) => (
                <button
                  key={id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left"
                  style={{ background: c.surfaceMuted, border: `1.5px solid ${c.border}` }}
                  onClick={() => {
                    onAdd(id, 1);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <span className="text-lg">{section.flag}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-sm font-bold" style={{ color: c.purpleInk }}>
                      {sticker.code}
                    </span>
                    <span className="text-sm ml-2" style={{ color: c.text }}>
                      {sticker.label}
                    </span>
                    <div className="text-xs" style={{ color: c.textSubtle }}>{section.name}</div>
                  </div>
                  <span style={{ color: c.greenInk }}>+ toevoegen</span>
                </button>
              ))}
              {query.trim().length >= 2 && results.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: c.textSubtle }}>
                  Geen stickers gevonden voor &ldquo;{query}&rdquo;
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
