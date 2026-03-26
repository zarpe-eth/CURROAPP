import { MonthlyHoursChart } from "@/components/charts/monthly-hours-chart";
import { EmployeeSelector } from "@/components/layout/employee-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getProfile,
  getVisibleProfiles,
  isUserAdmin,
  requireUser,
  resolveSelectedUserId,
} from "@/lib/auth";
import { formatCurrency } from "@/lib/constants";
import { buildMonthlyMetrics, getAppSettings, getSessionsByMonth } from "@/lib/data";
import { getCurrentMonth } from "@/lib/time/dates";

export default async function MonthlyPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; userId?: string }>;
}) {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const isAdmin = await isUserAdmin(user.id, user.email);
  const visibleProfiles = await getVisibleProfiles(user.id, user.email);
  const settings = await getAppSettings();
  const params = await searchParams;
  const month = params.month ?? getCurrentMonth();
  const selectedUserId = resolveSelectedUserId(user.id, visibleProfiles, params.userId);
  const selectedProfile = visibleProfiles.find((item) => item.id === selectedUserId) ?? profile;
  const sessions = await getSessionsByMonth(month, settings.timezone, selectedUserId);
  const metrics = buildMonthlyMetrics(sessions, selectedProfile?.hourly_rate_eur ?? 8, settings.timezone);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="display-font text-3xl font-semibold">Resumen mensual</h1>
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <EmployeeSelector profiles={visibleProfiles} selectedUserId={selectedUserId} />
          ) : null}
          <form className="flex items-center gap-2" method="get">
            <input type="hidden" name="userId" value={selectedUserId} />
            <label htmlFor="month" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total horas" value={`${metrics.totalHours} h`} />
        <MetricCard label="Dias trabajados" value={`${metrics.workedDays}`} />
        <MetricCard label="Media horas/dia" value={`${metrics.averageHoursPerDay} h`} />
        <MetricCard label="Dinero mes" value={formatCurrency(metrics.monthlyMoney)} />
      </div>

      <Card className="animate-enter" style={{ animationDelay: "80ms" }}>
        <CardHeader>
          <CardTitle>Horas por dia</CardTitle>
          <p className="text-sm text-muted-foreground">
            Visualizacion diaria del mes seleccionado para detectar picos y regularidad.
          </p>
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
    <Card className="animate-enter" style={{ animationDelay: "80ms" }}>
      <CardHeader className="pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      </CardHeader>
      <CardContent>
        <p className="display-font text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}


