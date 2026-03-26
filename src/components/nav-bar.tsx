"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "דאשבורד", icon: LayoutDashboard },
  { href: "/?view=list", label: "רשימה", icon: List },
  { href: "/stats", label: "סטטיסטיקה", icon: BarChart3 },
];

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

        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 text-[10px] ${
              isActive ? "text-accent-blue" : "text-text-muted"
            }`}
          >
            <Icon className="h-[22px] w-[22px]" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
