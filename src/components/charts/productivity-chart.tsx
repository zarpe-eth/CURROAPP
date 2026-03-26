"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyProductivityPoint } from "@/types/domain";

type ProductivityChartProps = {
  data: DailyProductivityPoint[];
};

type TooltipPayloadItem = {
  name?: string;
  value: number;
};

function ProductivityTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const tickets = payload.find((item) => item.name === "ticketsResolved")?.value ?? 0;
  const tph = payload.find((item) => item.name === "ticketsPerHour")?.value ?? 0;

  return (
    <div className="rounded-xl border border-border/80 bg-white/95 px-3 py-2 shadow-[0_14px_28px_-18px_rgba(15,23,42,0.45)] backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Dia {label}</p>
      <p className="text-sm text-foreground">
        Tickets: <span className="font-semibold">{tickets}</span>
      </p>
      <p className="text-sm text-foreground">
        Tickets/h: <span className="font-semibold">{Number(tph).toFixed(2)}</span>
      </p>
    </div>
  );
}

export function ProductivityChart({ data }: ProductivityChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    day: item.date.slice(-2),
    ticketsPerHour: item.ticketsPerHour ?? 0,
  }));

  const maxTickets = Math.max(...chartData.map((item) => item.ticketsResolved), 0);
  const maxTph = Math.max(...chartData.map((item) => item.ticketsPerHour), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/40 px-3 py-1">
            <span className="size-2 rounded-full bg-sky-700" /> Tickets respondidos
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/40 px-3 py-1">
            <span className="size-2 rounded-full bg-amber-600" /> Tickets por hora
          </span>
        </div>
        <p>
          Max: <span className="font-semibold text-foreground">{maxTickets}</span> tickets · {" "}
          <span className="font-semibold text-foreground">{maxTph.toFixed(2)}</span> t/h
        </p>
      </div>
      <div className="h-80 w-full rounded-2xl border border-border/80 bg-white/65 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 18, right: 14, left: -8, bottom: 4 }}>
            <defs>
              <linearGradient id="ticketsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0369A1" stopOpacity={0.92} />
                <stop offset="100%" stopColor="#0891B2" stopOpacity={0.66} />
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
              yAxisId="tickets"
              tick={{ fill: "#607083", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="rate"
              orientation="right"
              tick={{ fill: "#607083", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `${value.toFixed(1)}`}
            />
            <Tooltip cursor={{ fill: "rgba(2,132,199,0.07)" }} content={<ProductivityTooltip />} />
            <Bar
              yAxisId="tickets"
              dataKey="ticketsResolved"
              name="ticketsResolved"
              fill="url(#ticketsGradient)"
              radius={[10, 10, 6, 6]}
              animationDuration={700}
            />
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="ticketsPerHour"
              name="ticketsPerHour"
              stroke="#d97706"
              strokeWidth={2.25}
              dot={{ r: 3, fill: "#d97706" }}
              activeDot={{ r: 5 }}
              animationDuration={850}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
