import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { getProfile, isUserAdmin, requireUser } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const isAdmin = await isUserAdmin(user.id, user.email);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1480px] gap-6 px-3 py-4 md:px-6 md:py-6">
        <Sidebar role={isAdmin ? "admin" : "employee"} />
        <main className="w-full animate-enter">
          <TopBar
            name={profile?.full_name ?? profile?.email ?? "Usuario"}
            role={isAdmin ? "Admin" : "Empleado"}
          />
          {children}
        </main>
      </div>
    </div>
  );
}
