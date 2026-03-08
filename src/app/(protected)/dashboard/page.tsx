import { SessionControls } from "@/components/dashboard/session-controls";
import { LiveTimer } from "@/components/dashboard/live-timer";
import { EmployeeSelector } from "@/components/layout/employee-selector";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile, getVisibleProfiles, requireUser, resolveSelectedUserId } from "@/lib/auth";
import { formatCurrency } from "@/lib/constants";
import { getActiveSession, getAppSettings, getTodaySummary } from "@/lib/data";
import { calculateEffectiveDurationSeconds, formatDuration } from "@/lib/time/calc";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const visibleProfiles = await getVisibleProfiles(user.id);
  const params = await searchParams;

  const selectedUserId = resolveSelectedUserId(user.id, visibleProfiles, params.userId);
  const selectedProfile = visibleProfiles.find((item) => item.id === selectedUserId) ?? profile;

  const settings = await getAppSettings();
  const activeSession = await getActiveSession(selectedUserId);
  const today = await getTodaySummary(
    selectedUserId,
    selectedProfile?.hourly_rate_eur ?? 8,
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
  const isOwnView = user.id === selectedUserId;

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
              <p className="mt-2 text-sm text-muted-foreground">
                Usuario seleccionado: <span className="font-semibold text-foreground">{selectedProfile?.full_name}</span>
              </p>
            </div>
            {profile?.role === "admin" ? (
              <EmployeeSelector profiles={visibleProfiles} selectedUserId={selectedUserId} />
            ) : null}
            <Badge className="text-sm">
              {profile?.role === "admin" ? "admin" : "empleado"} · {selectedProfile?.full_name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeSession ? <LiveTimer initialSeconds={activeSeconds} isRunning={status === "active"} /> : null}
          {isOwnView ? (
            <SessionControls status={status} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Vista en modo supervision. Para fichar jornada, selecciona tu propio usuario.
            </p>
          )}
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
            <p className="text-sm text-muted-foreground">Tarifa aplicada</p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatCurrency(selectedProfile?.hourly_rate_eur ?? 8)}</p>
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