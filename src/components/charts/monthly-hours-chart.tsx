"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyHoursPoint } from "@/types/domain";

type MonthlyHoursChartProps = {
  data: DailyHoursPoint[];
};

export function MonthlyHoursChart({ data }: MonthlyHoursChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd5" />
          <XAxis dataKey="day" tick={{ fill: "#5c6773", fontSize: 12 }} />
          <YAxis tick={{ fill: "#5c6773", fontSize: 12 }} />
          <Tooltip formatter={(value) => [`${value} h`, "Horas"]} />
          <Bar dataKey="hours" fill="#0f8aa7" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

