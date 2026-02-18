import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(true); /* recolhida por padrão (estilo WPay) */
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen((o) => !o)}
      />
      <div className="app-main">
        <Header />
        <div className="app-content">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}
