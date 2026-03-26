"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyHoursPoint } from "@/types/domain";

type MonthlyHoursChartProps = {
  data: DailyHoursPoint[];
};

type TooltipPayloadItem = {
  value: number;
};

function HoursTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) {
    return null;
  }

  const value = payload[0]?.value ?? 0;

  return (
    <div className="rounded-xl border border-border/80 bg-white/95 px-3 py-2 shadow-[0_14px_28px_-18px_rgba(15,23,42,0.45)] backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Dia {label}</p>
      <p className="display-font text-lg font-semibold text-foreground">{value.toFixed(2)} h</p>
    </div>
  );
}

export function MonthlyHoursChart({ data }: MonthlyHoursChartProps) {
  const maxHours = Math.max(...data.map((item) => item.hours), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p className="rounded-full border border-border/80 bg-muted/45 px-3 py-1">Lectura diaria por fecha</p>
        <p>
          Pico del mes: <span className="font-semibold text-foreground">{maxHours.toFixed(2)} h</span>
        </p>
      </div>
      <div className="h-80 w-full rounded-2xl border border-border/80 bg-white/65 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 18, right: 12, left: -8, bottom: 4 }}>
            <defs>
              <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0369A1" stopOpacity={0.92} />
                <stop offset="100%" stopColor="#0891B2" stopOpacity={0.72} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 6" stroke="#d8e1eb" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: "#607083", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#d9e1ea" }}
            />
            <YAxis
              tick={{ fill: "#607083", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `${value}h`}
            />
            <Tooltip cursor={{ fill: "rgba(2,132,199,0.07)" }} content={<HoursTooltip />} />
            <Bar dataKey="hours" radius={[10, 10, 6, 6]} fill="url(#hoursGradient)" animationDuration={700}>
              {data.map((entry) => (
                <Cell key={entry.day} fill={entry.hours === maxHours && maxHours > 0 ? "#075985" : "url(#hoursGradient)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
