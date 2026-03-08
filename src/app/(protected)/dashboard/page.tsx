import { SessionControls } from "@/components/dashboard/session-controls";
import { LiveTimer } from "@/components/dashboard/live-timer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile, requireUser } from "@/lib/auth";
import { DEFAULT_HOURLY_RATE, formatCurrency } from "@/lib/constants";
import { getActiveSession, getAppSettings, getTodaySummary } from "@/lib/data";
import { calculateEffectiveDurationSeconds, formatDuration } from "@/lib/time/calc";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const settings = await getAppSettings();
  const activeSession = await getActiveSession(user.id);

  const today = await getTodaySummary(
    user.id,
    settings.hourly_rate_eur ?? DEFAULT_HOURLY_RATE,
    settings.timezone,
  );

  const activeSeconds = activeSession
    ? calculateEffectiveDurationSeconds(
        activeSession.started_at,
        activeSession.ended_at,
        activeSession.work_breaks ?? [],
        new Date().toISOString(),
      )
    : 0;

  const status = activeSession?.status ?? "idle";

  return (
    <section className="space-y-6">
      <Card className="border-0 bg-white p-2 shadow-lg shadow-slate-200/70">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-widest text-muted-foreground">Estado actual</p>
              <CardTitle className="text-3xl">
                {status === "active" ? "Trabajando" : status === "paused" ? "En pausa" : "Sin jornada activa"}
              </CardTitle>
            </div>
            <Badge className="text-sm">
              {profile?.role === "admin" ? "admin" : "empleado"} · {settings.employee_display_name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeSession ? <LiveTimer initialSeconds={activeSeconds} isRunning={status === "active"} /> : null}
          <SessionControls status={status} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Horas hoy</p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatDuration(today.seconds)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Dinero hoy</p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatCurrency(today.money)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Tarifa por hora</p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatCurrency(settings.hourly_rate_eur)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Zona horaria</p>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{settings.timezone}</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

