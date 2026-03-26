"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, Gauge, Settings, Table2, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/types/domain";

const items: Array<{ href: string; label: string; icon: LucideIcon; adminOnly?: boolean }> = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/productivity", label: "Productividad", icon: BarChart3 },
  { href: "/history", label: "Historial", icon: Table2 },
  { href: "/monthly", label: "Resumen mensual", icon: CalendarDays },
  { href: "/team", label: "Equipo", icon: Users, adminOnly: true },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

type SidebarProps = {
  role: AppRole;
};

export function Sidebar({ role }: SidebarProps) {
  const currentPath = usePathname();
  const visibleItems = items.filter((item) => !item.adminOnly || role === "admin");

  return (
    <aside className="hidden w-72 shrink-0 rounded-3xl border border-border/80 bg-white/85 p-6 shadow-[0_12px_34px_-18px_rgba(15,23,42,0.45)] backdrop-blur lg:block">
      <div className="mb-8 rounded-2xl border border-border/70 bg-muted/45 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">CURROAPP</p>
        <p className="mt-1 display-font text-2xl font-semibold text-foreground">Control de soporte</p>
      </div>
      <nav className="space-y-2">
        {visibleItems.map((item, index) => {
          const active = currentPath === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ animationDelay: `${index * 35}ms` }}
              className={cn(
                "animate-enter flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-primary text-white shadow-[0_8px_18px_-10px_rgba(3,105,161,0.8)]"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
