import { signOutAction } from "@/lib/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TopBarProps = {
  name: string;
  role: string;
};

export function TopBar({ name, role }: TopBarProps) {
  return (
    <header className="mb-8 flex items-center justify-between rounded-2xl border border-border bg-white px-5 py-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Hola</p>
        <p className="text-xl font-semibold">{name}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge className="bg-muted text-muted-foreground">{role}</Badge>
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Salir
          </Button>
        </form>
      </div>
    </header>
  );
}

