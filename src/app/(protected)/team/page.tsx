import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { assertAdmin, getVisibleProfiles, requireUser } from "@/lib/auth";
import { updateEmployeeRateAction } from "@/lib/actions/settings";

export default async function TeamPage() {
  const user = await requireUser();
  const profiles = await getVisibleProfiles(user.id);
  const me = profiles.find((profile) => profile.id === user.id);

  if (!me || me.role !== "admin") {
    redirect("/dashboard");
  }

  await assertAdmin(user.id);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Equipo</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona tarifa por empleado. Esta tarifa es la usada para calcular dinero en dashboard, historial y resumen.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tarifas por empleado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profiles.map((profile) => (
            <form
              key={profile.id}
              action={updateEmployeeRateAction}
              className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-[1fr_220px_120px]"
            >
              <input type="hidden" name="employee_id" value={profile.id} />
              <div>
                <p className="font-medium">{profile.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {profile.email} · {profile.role === "admin" ? "Admin" : "Empleado"}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tarifa EUR/h
                </label>
                <Input
                  name="hourly_rate_eur"
                  type="number"
                  min="1"
                  step="0.1"
                  defaultValue={profile.hourly_rate_eur}
                />
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
