"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { c } from "@/lib/theme";

export default function BottomNav() {
  const path = usePathname();
  const [collectedCount, setCollectedCount] = useState<number | null>(null);
  const [duplicatesCount, setDuplicatesCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/state")
      .then((r) => r.json())
      .then((s) => {
        setCollectedCount(Object.keys(s.collected ?? {}).length);
        setDuplicatesCount(
          Object.values(s.duplicates ?? {}).reduce((sum: number, n) => sum + (n as number), 0)
        );
      });
  }, []);

  const tabs = [
    { href: "/",           label: "Collectie", icon: "📚", count: collectedCount },
    { href: "/duplicates", label: "Dubbels",   icon: "🔁", count: duplicatesCount },
    { href: "/extras",     label: "Extra",     icon: "⭐", count: null },
    { href: "/upload",     label: "Foto",      icon: "📷", count: null },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex"
      style={{ background: c.surface, borderTop: `1px solid ${c.border}` }}
    >
      {tabs.map((tab) => {
        const active = path === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3"
            style={{ color: active ? c.purpleInk : c.textSubtle }}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className="text-xs font-semibold">{tab.label}</span>
            {tab.count !== null && (
              <span
                className="text-xs font-bold leading-none"
                style={{ color: active ? c.purpleInk : c.textSubtle }}
              >
                {tab.count ?? "·"}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
