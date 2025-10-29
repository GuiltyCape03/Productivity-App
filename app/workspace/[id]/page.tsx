import { DashboardProvider } from "@/modules/dashboard/DashboardProvider";
import { PageView } from "@/modules/workspace/PageView";

interface WorkspacePageProps {
  params: { id: string };
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  return (
    <DashboardProvider>
      <PageView id={params.id} />
    </DashboardProvider>
  );
}
