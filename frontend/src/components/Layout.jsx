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
    <div className="app-layout print:block print:bg-white">
      {/* Sidebar — desktop */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="app-main print:ml-0 print:w-full print:block">
        <div className="print:hidden">
          <Header />
        </div>
        <main className="app-content print:p-0 print:m-0">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — mobile */}
      <div className="print:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

