import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import BottomNav from "./BottomNav.jsx";
import { toast } from "sonner";

export default function Layout() {
  useEffect(() => {
    if (sessionStorage.getItem("access_denied")) {
      sessionStorage.removeItem("access_denied");
      toast.error("Acesso não autorizado para este perfil.");
    }
  }, []);

  return (
    <div className="app-layout">
      {/* Sidebar — desktop */}
      <Sidebar />

      {/* Main content */}
      <div className="app-main">
        <Header />
        <main className="app-content">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — mobile */}
      <BottomNav />
    </div>
  );
}

