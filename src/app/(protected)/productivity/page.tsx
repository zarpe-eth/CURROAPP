import { ProductivityChart } from "@/components/charts/productivity-chart";
import { EmployeeSelector } from "@/components/layout/employee-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getVisibleProfiles, isUserAdmin, requireUser, resolveSelectedUserId } from "@/lib/auth";
import { getAppSettings, getDailyTicketStatsByMonth, getSessionsByMonth } from "@/lib/data";
import { buildMonthlyProductivityMetrics } from "@/lib/productivity";
import { formatDuration } from "@/lib/time/calc";
import { getCurrentMonth } from "@/lib/time/dates";

function formatRate(value: number | null) {
  if (value === null) {
    return "Sin datos";
  }

  return `${value} t/h`;
}

function defaultSelectedDate(month: string) {
  const today = new Date().toISOString().slice(0, 10);
  if (today.startsWith(month)) {
    return today;
  }

  return `${month}-01`;
}

export default async function ProductivityPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; userId?: string; date?: string }>;
}) {
  const user = await requireUser();
  const isAdmin = await isUserAdmin(user.id, user.email);
  const visibleProfiles = await getVisibleProfiles(user.id, user.email);
  const settings = await getAppSettings();
  const params = await searchParams;

  const month = params.month ?? getCurrentMonth();
  const selectedUserId = resolveSelectedUserId(user.id, visibleProfiles, params.userId);
  const selectedDate = params.date?.startsWith(month) ? params.date : defaultSelectedDate(month);
  const selectedProfile = visibleProfiles.find((item) => item.id === selectedUserId);

  const [sessions, ticketStats] = await Promise.all([
    getSessionsByMonth(month, settings.timezone, selectedUserId),
    getDailyTicketStatsByMonth(month, selectedUserId),
  ]);

  const metrics = buildMonthlyProductivityMetrics({
    sessions,
    tickets: ticketStats,
    timezone: settings.timezone,
    selectedDate,
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display-font text-3xl font-semibold">Productividad</h1>
          <p className="text-sm text-muted-foreground">
            Tickets resueltos y rendimiento por hora.{" "}
            <span className="font-medium text-foreground">{selectedProfile?.full_name ?? "Mi usuario"}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin ? (
            <EmployeeSelector profiles={visibleProfiles} selectedUserId={selectedUserId} />
          ) : null}
          <form className="flex items-center gap-2" method="get">
            <input type="hidden" name="userId" value={selectedUserId} />
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
            <label htmlFor="date" className="text-sm text-muted-foreground">
              Dia
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={selectedDate}
              className="h-10 rounded-xl border border-border px-3"
            />
          </form>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Tickets respondidos del dia" value={`${metrics.dailyTickets}`} />
        <MetricCard label="Tickets respondidos del mes" value={`${metrics.monthlyTickets}`} />
        <MetricCard label="Tickets respondidos/hora dia" value={formatRate(metrics.dailyTicketsPerHour)} />
        <MetricCard label="Tickets respondidos/hora mes" value={formatRate(metrics.monthlyTicketsPerHour)} />
        <MetricCard label="Promedio diario mes (respondidos)" value={`${metrics.averageDailyTickets}`} />
      </div>

      <Card className="animate-enter" style={{ animationDelay: "110ms" }}>
        <CardHeader>
          <CardTitle>Evolucion diaria</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cruce visual entre volumen de tickets y eficiencia por hora para el periodo filtrado.
          </p>
        </CardHeader>
        <CardContent>
          {metrics.dailyPoints.length ? (
            <ProductivityChart data={metrics.dailyPoints} />
          ) : (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Sin datos de tickets u horas para este mes.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="animate-enter" style={{ animationDelay: "140ms" }}>
        <CardHeader>
          <CardTitle>Detalle diario</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Tickets respondidos</TableHead>
                <TableHead>Tickets respondidos/hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.dailyPoints.map((item) => (
                <TableRow key={item.date}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{formatDuration(Math.round(item.hoursWorked * 3600))}</TableCell>
                  <TableCell>{item.ticketsResolved}</TableCell>
                  <TableCell>{formatRate(item.ticketsPerHour)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!metrics.dailyPoints.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Sin registros en el periodo seleccionado.</p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="animate-enter">
      <CardHeader className="pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      </CardHeader>
      <CardContent>
        <p className="display-font text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
