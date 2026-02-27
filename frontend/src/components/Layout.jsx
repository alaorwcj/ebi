import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import BottomNav from "./BottomNav.jsx";
import { toast } from "sonner";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("access_denied")) {
      sessionStorage.removeItem("access_denied");
      toast.error("Acesso não autorizado para este perfil.");
    }
  }, []);

  return (
    <div className="app-layout min-h-screen bg-[#09090b] relative overflow-x-hidden">
      {/* Background Blobs for Auth Area */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[40%] bg-accent-purple/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen((o) => !o)}
      />

      <div className="app-main relative z-10">
        <Header />
        <main className="app-content relative pb-24 md:pb-10">
          <Outlet />
        </main>
        <Footer />
        <BottomNav />
      </div>
    </div>
  );
}
