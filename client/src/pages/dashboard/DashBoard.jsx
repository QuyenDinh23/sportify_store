import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../../components/ui/sidebar";
import { DashboardSidebar } from "../../components/dashboard/DashBoardSideBar";

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-sport-muted">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
