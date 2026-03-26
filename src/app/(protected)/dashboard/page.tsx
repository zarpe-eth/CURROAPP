import { SessionControls } from "@/components/dashboard/session-controls";
import { LiveTimer } from "@/components/dashboard/live-timer";
import { EmployeeSelector } from "@/components/layout/employee-selector";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getProfile,
  getVisibleProfiles,
  isUserAdmin,
  requireUser,
  resolveSelectedUserId,
} from "@/lib/auth";
import { formatCurrency } from "@/lib/constants";
import { getActiveSession, getAppSettings, getTodaySummary } from "@/lib/data";
import { formatDuration } from "@/lib/time/calc";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const isAdmin = await isUserAdmin(user.id, user.email);
  const visibleProfiles = await getVisibleProfiles(user.id, user.email);
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

  const status = activeSession?.status ?? "idle";
  const isOwnView = user.id === selectedUserId;

  return (
    <section className="space-y-6">
      <Card className="animate-enter p-2">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Estado actual</p>
              <CardTitle className="text-3xl">
                {status === "active" ? "Trabajando" : status === "paused" ? "En pausa" : "Sin jornada activa"}
              </CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Usuario seleccionado: <span className="font-semibold text-foreground">{selectedProfile?.full_name}</span>
              </p>
            </div>
            {isAdmin ? (
              <EmployeeSelector profiles={visibleProfiles} selectedUserId={selectedUserId} />
            ) : null}
            <Badge className="text-sm">
              {isAdmin ? "admin" : "empleado"} - {selectedProfile?.full_name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeSession ? (
            <LiveTimer
              startedAt={activeSession.started_at}
              endedAt={activeSession.ended_at}
              breaks={activeSession.work_breaks ?? []}
              status={activeSession.status}
              sessionId={activeSession.id}
              oneHourNotified={activeSession.one_hour_notified ?? false}
              enableOneHourNotification={isOwnView}
            />
          ) : null}
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
        <Card className="animate-enter" style={{ animationDelay: "60ms" }}>
          <CardHeader className="pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Horas hoy</p>
          </CardHeader>
          <CardContent>
            <p className="display-font text-3xl font-semibold">{formatDuration(today.seconds)}</p>
          </CardContent>
        </Card>
        <Card className="animate-enter" style={{ animationDelay: "100ms" }}>
          <CardHeader className="pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Dinero hoy</p>
          </CardHeader>
          <CardContent>
            <p className="display-font text-3xl font-semibold">{formatCurrency(today.money)}</p>
          </CardContent>
        </Card>
        <Card className="animate-enter" style={{ animationDelay: "140ms" }}>
          <CardHeader className="pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Tarifa aplicada</p>
          </CardHeader>
          <CardContent>
            <p className="display-font text-3xl font-semibold">{formatCurrency(selectedProfile?.hourly_rate_eur ?? 8)}</p>
          </CardContent>
        </Card>
        <Card className="animate-enter" style={{ animationDelay: "180ms" }}>
          <CardHeader className="pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Zona horaria</p>
          </CardHeader>
          <CardContent>
            <p className="display-font text-xl font-semibold">{settings.timezone}</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

