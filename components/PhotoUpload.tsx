"use client";

import { useState, useRef } from "react";
import PhotoReviewModal from "./PhotoReviewModal";

interface AnalysisResult {
  newStickers: string[];
  duplicateStickers: string[];
  unknownCodes: string[];
}

interface Photo {
  filename: string;
  date: string;
  note: string;
}

interface Props {
  photos: Photo[];
  onUploaded: (photos: Photo[], newIds: string[], dupIds: string[]) => void;
}

type Step = "idle" | "open" | "analyzing" | "review" | "applying";

export default function PhotoUpload({ photos, onUploaded }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleAnalyze() {
    if (!file) return;
    setStep("analyzing");

    const fd = new FormData();
    fd.append("photo", file);

    const res = await fetch("/api/analyze-photo", { method: "POST", body: fd });
    const data = await res.json();
    setResult(data);
    setStep("review");
  }

  async function handleApprove() {
    if (!result || !file) return;
    setStep("applying");

    // Apply stickers to state
    await fetch("/api/apply-stickers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newStickers: result.newStickers,
        duplicateStickers: result.duplicateStickers,
      }),
    });

    // Also save the photo itself
    const fd = new FormData();
    fd.append("photo", file);
    fd.append("note", `${result.newStickers.length} nieuw · ${result.duplicateStickers.length} dubbel`);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
    if (uploadRes.ok) {
      const stateRes = await fetch("/api/state");
      const state = await stateRes.json();
      onUploaded(state.photos, result.newStickers, result.duplicateStickers);
    }

    reset();
  }

  function reset() {
    setStep("idle");
    setFile(null);
    setPreview(null);
    setResult(null);
  }

  return (
    <>
      {/* FAB */}
      <button
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full font-bold shadow-lg text-sm"
        style={{ background: "linear-gradient(135deg, #e8c84a, #f97316)", color: "#0f0f1a" }}
        onClick={() => setStep("open")}
      >
        📷 Foto opladen
      </button>

      {/* Upload sheet */}
      {(step === "open" || step === "analyzing") && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.85)" }}>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-lg font-bold">📷 Stickers opladen</h2>
              <button className="text-2xl" style={{ color: "#94a3b8" }} onClick={reset}>✕</button>
            </div>

            {/* Drop zone */}
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
                  <span className="text-sm" style={{ color: "#94a3b8" }}>
                    Tik om foto te kiezen
                  </span>
                  <span className="text-xs" style={{ color: "#475569" }}>
                    Leg stickers naast elkaar, codekant boven
                  </span>
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
              disabled={!file || step === "analyzing"}
              className="rounded-2xl py-4 font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #e8c84a, #f97316)", color: "#0f0f1a" }}
              onClick={handleAnalyze}
            >
              {step === "analyzing" ? (
                <>
                  <span className="animate-spin">⟳</span> Stickers herkennen...
                </>
              ) : (
                "Analyseren"
              )}
            </button>

            {/* History */}
            {photos.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "#94a3b8" }}>
                  Eerder opgeladen
                </h3>
                <div className="flex flex-col gap-2">
                  {photos.slice(0, 5).map((p) => (
                    <div
                      key={p.filename}
                      className="flex items-center gap-3 rounded-xl p-3"
                      style={{ background: "#1a1a2e" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/uploads/${p.filename}`}
                        alt=""
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs" style={{ color: "#94a3b8" }}>
                          {new Date(p.date).toLocaleDateString("nl-BE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        {p.note && (
                          <div className="text-sm truncate">{p.note}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review modal */}
      {step === "review" && result && preview && (
        <PhotoReviewModal
          preview={preview}
          result={result}
          onApprove={handleApprove}
          onCancel={reset}
          applying={false}
        />
      )}

      {step === "applying" && result && preview && (
        <PhotoReviewModal
          preview={preview}
          result={result}
          onApprove={handleApprove}
          onCancel={reset}
          applying={true}
        />
      )}
    </>
  );
}
