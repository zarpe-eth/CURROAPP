"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Profile } from "@/types/domain";

type EmployeeSelectorProps = {
  profiles: Profile[];
  selectedUserId: string;
};

export function EmployeeSelector({ profiles, selectedUserId }: EmployeeSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (userId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("userId", userId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="employee-select" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Empleado
      </label>
      <select
        id="employee-select"
        className="h-10 min-w-72 rounded-xl border border-border/90 bg-white px-3 text-sm shadow-sm outline-none focus:border-primary/45"
        value={selectedUserId}
        onChange={(event) => onChange(event.target.value)}
      >
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.full_name} ({profile.email ?? "sin email"})
          </option>
        ))}
      </select>
    </div>
  );
}
