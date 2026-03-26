import { redirect } from "next/navigation";
import { EmployeeSelector } from "@/components/layout/employee-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getVisibleProfiles, isUserAdmin, requireUser, resolveSelectedUserId } from "@/lib/auth";
import { updateEmployeeRateAction } from "@/lib/actions/settings";
import { upsertDailyTicketsAction } from "@/lib/actions/tickets";
import { getDailyTicketStatsByMonth } from "@/lib/data";
import { getCurrentMonth } from "@/lib/time/dates";

function defaultSelectedDate(month: string) {
  const today = new Date().toISOString().slice(0, 10);
  if (today.startsWith(month)) {
    return today;
  }

  return `${month}-01`;
}

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; userId?: string; date?: string; saveError?: string; saveOk?: string }>;
}) {
  const user = await requireUser();
  const isAdmin = await isUserAdmin(user.id, user.email);

  if (!isAdmin) {
    redirect("/productivity");
  }

  const visibleProfiles = await getVisibleProfiles(user.id, user.email);
  const params = await searchParams;

  const month = params.month ?? getCurrentMonth();
  const selectedUserId = resolveSelectedUserId(user.id, visibleProfiles, params.userId);
  const selectedDate = params.date?.startsWith(month) ? params.date : defaultSelectedDate(month);
  const saveError = params.saveError;
  const saveOk = params.saveOk === "1";

  const ticketStats = await getDailyTicketStatsByMonth(month, selectedUserId);
  const selectedDayTickets = ticketStats.find((item) => item.stat_date === selectedDate)?.tickets_resolved ?? 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display-font text-3xl font-semibold">Equipo</h1>
          <p className="text-sm text-muted-foreground">Gestion manual de tickets diarios y tarifas por empleado.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <EmployeeSelector profiles={visibleProfiles} selectedUserId={selectedUserId} />
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

      <Card className="animate-enter" style={{ animationDelay: "70ms" }}>
        <CardHeader>
          <CardTitle>Registrar tickets respondidos diarios</CardTitle>
        </CardHeader>
        <CardContent>
          {saveError ? (
            <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Error al guardar: {saveError}
            </p>
          ) : null}
          {saveOk ? (
            <p className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Tickets guardados correctamente.
            </p>
          ) : null}
          <form action={upsertDailyTicketsAction} className="grid gap-3 md:grid-cols-[1fr_180px_160px_140px]">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trabajador</label>
              <select name="user_id" defaultValue={selectedUserId} className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm">
                {visibleProfiles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fecha</label>
              <Input name="stat_date" type="date" defaultValue={selectedDate} required />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tickets</label>
                <Input
                  name="tickets_resolved"
                  type="number"
                  min="0"
                step="1"
                defaultValue={selectedDayTickets}
                required
              />
            </div>
            <Button type="submit" className="self-end">
              Guardar tickets
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="animate-enter" style={{ animationDelay: "70ms" }}>
        <CardHeader>
          <CardTitle>Tickets respondidos registrados del mes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tickets respondidos</TableHead>
                <TableHead>Actualizado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ticketStats.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.stat_date}</TableCell>
                  <TableCell>{item.tickets_resolved}</TableCell>
                  <TableCell>{new Date(item.updated_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!ticketStats.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Sin tickets registrados en este mes.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="animate-enter" style={{ animationDelay: "70ms" }}>
        <CardHeader>
          <CardTitle>Tarifas por empleado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {visibleProfiles.map((item) => (
            <form
              key={item.id}
              action={updateEmployeeRateAction}
              className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-[1fr_220px_120px]"
            >
              <input type="hidden" name="employee_id" value={item.id} />
              <div>
                <p className="font-medium">{item.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.email} - {item.role === "admin" ? "Admin" : "Empleado"}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tarifa EUR/h</label>
                <Input name="hourly_rate_eur" type="number" min="1" step="0.1" defaultValue={item.hourly_rate_eur} />
              </div>
              <Button type="submit" className="self-end">
                Guardar
              </Button>
            </form>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

