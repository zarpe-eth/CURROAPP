import { MonthlyHoursChart } from "@/components/charts/monthly-hours-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/constants";
import { buildMonthlyMetrics, getAppSettings, getSessionsByMonth } from "@/lib/data";
import { getCurrentMonth } from "@/lib/time/dates";

export default async function MonthlyPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await requireUser();
  const settings = await getAppSettings();
  const params = await searchParams;
  const month = params.month ?? getCurrentMonth();
  const sessions = await getSessionsByMonth(month, settings.timezone, user.id);
  const metrics = buildMonthlyMetrics(sessions, settings.hourly_rate_eur, settings.timezone);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Resumen mensual</h1>
        <form className="flex items-center gap-2" method="get">
          <label htmlFor="month" className="text-sm text-muted-foreground">
            Mes
          </label>
          <input
            id="month"
            name="month"
            type="month"
            defaultValue={month}
            className="h-10 rounded-xl border border-border px-3"
          />
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total horas" value={`${metrics.totalHours} h`} />
        <MetricCard label="Días trabajados" value={`${metrics.workedDays}`} />
        <MetricCard label="Media horas/día" value={`${metrics.averageHoursPerDay} h`} />
        <MetricCard label="Dinero mes" value={formatCurrency(metrics.monthlyMoney)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Horas por día</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyHoursChart data={metrics.dailyHours} />
        </CardContent>
      </Card>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

