import { TasksPage } from "@/components/tasks/tasks-page";
import { getProfile, getVisibleProfiles, isUserAdmin, requireUser } from "@/lib/auth";
import { getVisibleTasks } from "@/lib/data";

export default async function TasksRoute() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const admin = await isUserAdmin(user.id, user.email);
  const visibleProfiles = await getVisibleProfiles(user.id, user.email);
  const tasks = await getVisibleTasks();

  const assignableProfiles = admin
    ? visibleProfiles.filter((item) => item.role === "employee")
    : visibleProfiles;

  return (
    <TasksPage
      isAdmin={admin}
      currentUserId={user.id}
      currentUserName={profile?.full_name ?? profile?.email ?? "Usuario"}
      tasks={tasks}
      profiles={assignableProfiles}
    />
  );
}
