"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Gauge, Settings, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/history", label: "Historial", icon: Table2 },
  { href: "/monthly", label: "Resumen mensual", icon: CalendarDays },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function Sidebar() {
  const currentPath = usePathname();

  return (
    <aside className="hidden w-64 border-r border-border bg-white/80 p-6 lg:block">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">CURROAPP</p>
        <p className="mt-2 text-lg font-semibold">Control de soporte</p>
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const active = currentPath === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted",
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

