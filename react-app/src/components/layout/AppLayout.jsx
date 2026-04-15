import { Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-shell">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className={`layout-body ${isSidebarOpen ? "" : "sidebar-collapsed"}`}>
        <Sidebar isOpen={isSidebarOpen} />
        <main className="main-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
