import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { getProfile, requireUser } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f9f4ee_0%,#f4f8fb_50%,#f8f9fa_100%)]">
      <div className="mx-auto flex max-w-[1480px]">
        <Sidebar role={profile?.role ?? "employee"} />
        <main className="w-full p-4 md:p-8">
          <TopBar
            name={profile?.full_name ?? profile?.email ?? "Usuario"}
            role={profile?.role === "admin" ? "Admin" : "Empleado"}
          />
          {children}
        </main>
      </div>
    </div>
  );
}

