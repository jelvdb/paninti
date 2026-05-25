"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ExtraSticker {
  id: string;
  label: string;
  count: number;
}

type ScanStep = "idle" | "open" | "analyzing" | "review";

export default function ExtrasPage() {
  const [extras, setExtras] = useState<ExtraSticker[]>([]);
  const [scanStep, setScanStep] = useState<ScanStep>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [detected, setDetected] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

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

  function handleFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleAnalyze() {
    if (!file) return;
    setScanStep("analyzing");
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch("/api/analyze-extras", { method: "POST", body: fd });
    const data = await res.json();
    setDetected(data.labels ?? []);
    setScanStep("review");
  }

  async function handleApprove() {
    for (const label of detected) {
      const res = await fetch("/api/extras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", label }),
      });
      const data = await res.json();
      setExtras(data.extras ?? []);
    }
    resetScan();
  }

  function resetScan() {
    setScanStep("idle");
    setFile(null);
    setPreview(null);
    setDetected([]);
  }

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
            <p className="text-sm mt-1">Scan de voorkant om stickers toe te voegen</p>
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

      {/* Scan FAB */}
      <button
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full font-bold shadow-lg text-sm"
        style={{ background: "linear-gradient(135deg, #e8c84a, #f97316)", color: "#0f0f1a" }}
        onClick={() => setScanStep("open")}
      >
        📷 Scannen
      </button>

      {/* Scan sheet */}
      {(scanStep === "open" || scanStep === "analyzing") && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.85)" }}>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-lg font-bold">⭐ Extra stickers scannen</h2>
              <button className="text-2xl" style={{ color: "#94a3b8" }} onClick={resetScan}>✕</button>
            </div>

            <button
              className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-8"
              style={{ borderColor: "#334d80", background: "#1a1a2e" }}
              onClick={() => inputRef.current?.click()}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" className="max-h-52 rounded-xl object-contain" />
              ) : (
                <>
                  <span className="text-4xl">📸</span>
                  <span className="text-sm" style={{ color: "#94a3b8" }}>Tik om foto te kiezen</span>
                  <span className="text-xs" style={{ color: "#475569" }}>Leg de voorkant van de extra stickers in beeld</span>
                </>
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            <button
              disabled={!file || scanStep === "analyzing"}
              className="rounded-2xl py-4 font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #e8c84a, #f97316)", color: "#0f0f1a" }}
              onClick={handleAnalyze}
            >
              {scanStep === "analyzing" ? (
                <><span className="animate-spin">⟳</span> Stickers herkennen...</>
              ) : (
                "Analyseren"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Review sheet */}
      {scanStep === "review" && (
        <div className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}>
          <div
            className="fixed inset-x-0 bottom-0 rounded-t-3xl overflow-y-auto"
            style={{ background: "#1a1a2e", maxHeight: "90dvh" }}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ background: "#334155" }} />
            </div>
            <div className="px-4 pb-10 max-w-lg mx-auto">
              <div className="flex items-center gap-3 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {preview && <img src={preview} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />}
                <div>
                  <h2 className="font-bold text-base">Extra stickers herkend</h2>
                  <p className="text-sm" style={{ color: "#94a3b8" }}>
                    {detected.length} sticker{detected.length !== 1 ? "s" : ""} gevonden — controleer en keur goed
                  </p>
                </div>
              </div>

              {detected.length > 0 ? (
                <div className="rounded-2xl p-4 mb-3" style={{ background: "#0d1f2b", border: "1.5px solid #4ade8033" }}>
                  <p className="text-sm font-bold mb-3" style={{ color: "#4ade80" }}>⭐ Gevonden ({detected.length})</p>
                  <div className="flex flex-col gap-2">
                    {detected.map((label, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-base leading-none">⭐</span>
                        <span className="text-sm" style={{ color: "#e2e8f0" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6" style={{ color: "#64748b" }}>
                  <p className="text-3xl mb-2">🤔</p>
                  <p className="font-semibold">Geen stickers herkend</p>
                  <p className="text-sm mt-1">Probeer een duidelijkere foto van de voorkant</p>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  className="flex-1 rounded-2xl py-4 font-bold text-sm"
                  style={{ background: "#1e2a3a", color: "#94a3b8" }}
                  onClick={resetScan}
                >
                  Annuleren
                </button>
                {detected.length > 0 && (
                  <button
                    className="flex-1 rounded-2xl py-4 font-bold text-sm"
                    style={{ background: "linear-gradient(135deg, #e8c84a, #f97316)", color: "#0f0f1a" }}
                    onClick={handleApprove}
                  >
                    Toevoegen
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
        <div className="text-sm font-semibold truncate" style={{ color: "#f1f5f9" }}>{entry.label}</div>
        <div className="text-xs" style={{ color: "#475569" }}>Extra sticker</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
          style={{ background: "#0f1a2e", color: "#94a3b8" }}
          onClick={() => onDelta(entry.id, -1)}
        >−</button>
        <span className="w-5 text-center font-bold text-sm" style={{ color: "#e8c84a" }}>{entry.count}</span>
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
          style={{ background: "#0f1a2e", color: "#94a3b8" }}
          onClick={() => onDelta(entry.id, +1)}
        >+</button>
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm ml-1"
          style={{ background: "#1a0f0f", color: "#f87171" }}
          onClick={() => onDelete(entry.id)}
        >✕</button>
      </div>
    </div>
  );
}
