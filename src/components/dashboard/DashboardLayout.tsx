import { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 h-full z-50">
        <DashboardSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>
      <div 
        className="flex flex-col overflow-hidden transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '64px' : '256px' }}
      >
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;