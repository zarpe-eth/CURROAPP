import { signOutAction } from "@/lib/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TopBarProps = {
  name: string;
  role: string;
};

export function TopBar({ name, role }: TopBarProps) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-white/90 px-5 py-4 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.35)] backdrop-blur">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Sesion activa</p>
        <p className="display-font text-[1.45rem] leading-none text-foreground">{name}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge>{role}</Badge>
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Salir
          </Button>
        </form>
      </div>
    </header>
  );
}
