import { updatePasswordAction } from "@/lib/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getProfile, requireUser } from "@/lib/auth";
import { getAppSettings } from "@/lib/data";
import { updateSettingsAction } from "@/lib/actions/settings";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ pwError?: string; pwOk?: string }>;
}) {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const settings = await getAppSettings();
  const params = await searchParams;
  const isAdmin = profile?.role === "admin";

  return (
    <section className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Ajustes</h1>

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Configuracion global</CardTitle>
            <CardDescription>
              Esta seccion afecta a toda la app. La tarifa por empleado se gestiona en la pantalla Equipo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateSettingsAction} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="timezone">
                  Zona horaria
                </label>
                <Input id="timezone" name="timezone" defaultValue={settings.timezone} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="employee_display_name">
                  Etiqueta general de equipo
                </label>
                <Input id="employee_display_name" name="employee_display_name" defaultValue={settings.employee_display_name} />
              </div>
              <Button type="submit">Guardar cambios</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
          <CardDescription>Cambia tu contrasena de acceso.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePasswordAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Nueva contrasena
              </label>
              <Input id="password" name="password" type="password" minLength={8} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password_confirm">
                Repetir contrasena
              </label>
              <Input id="password_confirm" name="password_confirm" type="password" minLength={8} required />
            </div>
            {params.pwError ? <p className="text-sm text-red-600">{params.pwError}</p> : null}
            {params.pwOk ? <p className="text-sm text-green-700">{params.pwOk}</p> : null}
            <Button type="submit">Actualizar contrasena</Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}