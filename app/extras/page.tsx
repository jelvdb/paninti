"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ExtraSticker {
  id: string;
  label: string;
  count: number;
}

export default function ExtrasPage() {
  const [extras, setExtras] = useState<ExtraSticker[]>([]);

  useEffect(() => {
    fetch("/api/state")
      .then((r) => r.json())
      .then((s) => setExtras(s.extras ?? []));
  }, []);

  const handleDelta = useCallback(async (id: string, delta: number) => {
    setExtras((prev) =>
      prev
        .map((e) => e.id === id ? { ...e, count: Math.max(0, e.count + delta) } : e)
        .filter((e) => e.count > 0)
    );
    await fetch("/api/extras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delta", id, delta }),
    });
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setExtras((prev) => prev.filter((e) => e.id !== id));
    await fetch("/api/extras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
  }, []);

  const handleAdd = useCallback(async (label: string) => {
    const res = await fetch("/api/extras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", label }),
    });
    const data = await res.json();
    setExtras(data.extras ?? []);
  }, []);

  const totalExtras = extras.reduce((sum, e) => sum + e.count, 0);

  return (
    <div className="min-h-dvh pb-24">
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 py-4"
        style={{ background: "#0f0f1a", borderBottom: "1px solid #1e2a3a" }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">⭐ Extra stickers</h1>
            <p className="text-xs" style={{ color: "#64748b" }}>
              {extras.length} soort{extras.length !== 1 ? "en" : ""} · {totalExtras} totaal
            </p>
          </div>
          <div
            className="rounded-xl px-3 py-1.5 text-sm font-bold"
            style={{ background: "#1a1a2e", color: "#e8c84a" }}
          >
            {totalExtras}×
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 max-w-lg mx-auto flex flex-col gap-2">
        {extras.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#475569" }}>
            <div className="text-4xl mb-3">⭐</div>
            <p className="font-semibold">Geen extra stickers</p>
            <p className="text-sm mt-1">Gebruik + om extra stickers toe te voegen</p>
          </div>
        ) : (
          extras.map((entry) => (
            <ExtraRow
              key={entry.id}
              entry={entry}
              onDelta={handleDelta}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <div className="fixed bottom-16 right-4 z-40">
        <AddExtraButton onAdd={handleAdd} />
      </div>
    </div>
  );
}

function ExtraRow({
  entry,
  onDelta,
  onDelete,
}: {
  entry: ExtraSticker;
  onDelta: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{ background: "#1a1a2e", border: "1.5px solid #1e2a3a" }}
    >
      <span className="text-xl leading-none">⭐</span>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate" style={{ color: "#f1f5f9" }}>
          {entry.label}
        </div>
        <div className="text-xs" style={{ color: "#475569" }}>
          Extra sticker
        </div>
      </div>

      {/* Count controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
          style={{ background: "#0f1a2e", color: "#94a3b8" }}
          onClick={() => onDelta(entry.id, -1)}
        >
          −
        </button>
        <span className="w-5 text-center font-bold text-sm" style={{ color: "#e8c84a" }}>
          {entry.count}
        </span>
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
          style={{ background: "#0f1a2e", color: "#94a3b8" }}
          onClick={() => onDelta(entry.id, +1)}
        >
          +
        </button>
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm ml-1"
          style={{ background: "#1a0f0f", color: "#f87171" }}
          onClick={() => onDelete(entry.id)}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function AddExtraButton({ onAdd }: { onAdd: (label: string) => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleOpen() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleSubmit() {
    if (!label.trim()) return;
    onAdd(label.trim());
    setLabel("");
    setOpen(false);
  }

  return (
    <>
      <button
        className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg"
        style={{ background: "linear-gradient(135deg, #e8c84a, #f97316)", color: "#0f0f1a" }}
        onClick={handleOpen}
      >
        +
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => { setOpen(false); setLabel(""); }}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-4 max-w-lg mx-auto"
            style={{ background: "#1a1a2e" }}
          >
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 rounded-full" style={{ background: "#334155" }} />
            </div>
            <h3 className="font-bold mb-3">⭐ Extra sticker toevoegen</h3>
            <input
              ref={inputRef}
              className="w-full rounded-xl px-4 py-2.5 text-sm mb-3"
              style={{ background: "#0f1120", border: "1.5px solid #334155", color: "#f1f5f9" }}
              placeholder="Beschrijving (bv. Messi goud, Happy Meals...)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <div className="flex gap-3">
              <button
                className="flex-1 rounded-2xl py-3 font-bold text-sm"
                style={{ background: "#1e2a3a", color: "#94a3b8" }}
                onClick={() => { setOpen(false); setLabel(""); }}
              >
                Annuleren
              </button>
              <button
                className="flex-1 rounded-2xl py-3 font-bold text-sm disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #e8c84a, #f97316)", color: "#0f0f1a" }}
                disabled={!label.trim()}
                onClick={handleSubmit}
              >
                Toevoegen
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
