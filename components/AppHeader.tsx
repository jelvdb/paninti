import { c } from "@/lib/theme";

export default function AppHeader() {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-center py-2"
      style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}
    >
      <img src="/paninti.png" alt="Panini" style={{ height: 28, width: "auto" }} />
    </header>
  );
}
