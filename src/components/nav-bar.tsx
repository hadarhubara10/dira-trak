"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "דאשבורד", icon: "📊" },
  { href: "/?view=list", label: "רשימה", icon: "📝" },
  { href: "/stats", label: "סטטיסטיקה", icon: "📈" },
] as const;

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 items-center justify-around border-t border-border-light bg-surface px-5 pt-2.5 pb-7">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/stats"
            ? pathname === "/stats"
            : item.href === "/?view=list"
            ? pathname === "/" // List view is also on /
            : pathname === "/";

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 text-[10px] ${
              isActive ? "text-accent-blue" : "text-text-muted"
            }`}
          >
            <span className="text-[22px]">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
