import { ReactNode } from "react";

import DashboardAuthGuard from "@/components/dashboard/dashboard-auth-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardAuthGuard>
      <DashboardShell>
        {children}
      </DashboardShell>
    </DashboardAuthGuard>
  );
}