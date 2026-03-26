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
import {
  getVisibleProfiles,
  isUserAdmin,
  requireUser,
  resolveSelectedUserId,
} from "@/lib/auth";
import { formatCurrency } from "@/lib/constants";
import { getAppSettings, getSessionsByMonth } from "@/lib/data";
import { formatDuration } from "@/lib/time/calc";
import { formatDate, formatTime, getCurrentMonth } from "@/lib/time/dates";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; userId?: string }>;
}) {
  const user = await requireUser();
  const isAdmin = await isUserAdmin(user.id, user.email);
  const visibleProfiles = await getVisibleProfiles(user.id, user.email);
  const settings = await getAppSettings();
  const params = await searchParams;
  const month = params.month ?? getCurrentMonth();
  const selectedUserId = resolveSelectedUserId(user.id, visibleProfiles, params.userId);
  const sessions = await getSessionsByMonth(month, settings.timezone, selectedUserId);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="display-font text-3xl font-semibold">Historial de jornadas</h1>
        <div className="flex items-center gap-3">
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
          </form>
        </div>
      </div>

      <Card className="animate-enter" style={{ animationDelay: "70ms" }}>
        <CardHeader>
          <CardTitle>Registro mensual</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Duracion</TableHead>
                <TableHead>Dinero</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{formatDate(session.started_at, settings.timezone)}</TableCell>
                  <TableCell>{formatTime(session.started_at, settings.timezone)}</TableCell>
                  <TableCell>
                    {session.ended_at ? formatTime(session.ended_at, settings.timezone) : "Activa"}
                  </TableCell>
                  <TableCell>{formatDuration(session.duration_seconds ?? 0)}</TableCell>
                  <TableCell>{formatCurrency(session.money_earned ?? 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!sessions.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Sin jornadas en este mes.</p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}


