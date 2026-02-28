import { useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  User,
  FolderPlus,
  UsersRound,
  FileText,
  LogOut,
  BarChart2,
} from "lucide-react";
import { useMenu } from "../hooks/useMenu.js";
import { clearAuth, getRole } from "../api/auth.js";

const ICON_MAP = {
  Calendar,
  Users,
  User,
  FolderPlus,
  UsersRound,
  FileText,
  BarChart3: BarChart2,
};

function MenuIcon({ name, size = 20 }) {
  const Icon = ICON_MAP[name] || User;
  return <Icon size={size} strokeWidth={2} aria-hidden />;
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { menuItems } = useMenu();
  const role = getRole();

  const roleLabel =
    role === "ADMINISTRADOR"
      ? "Administrador"
      : role === "COORDENADORA"
        ? "Coordenadora"
        : "Colaboradora";

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate("/login");
  }, [navigate]);

  return (
    <aside className="nav-sidebar">
      {/* Logo / Brand */}
      <div className="nav-sidebar-brand">
        <div className="nav-sidebar-logo">
          <img
            src="/img/Logo_oficial_CCB.png"
            alt="EBI"
            className="w-7 h-7 object-contain brightness-0 invert"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
        <div className="nav-sidebar-brand-text">
          <span className="nav-sidebar-brand-name">EBI Vila Paula</span>
          <span className="nav-sidebar-role">{roleLabel}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="nav-sidebar-divider" />

      {/* Menu items */}
      <nav className="nav-sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `nav-sidebar-item ${isActive ? "nav-sidebar-item--active" : ""}`
            }
          >
            <span className="nav-sidebar-item-icon">
              <MenuIcon name={item.icon} size={20} />
            </span>
            <span className="nav-sidebar-item-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="nav-sidebar-footer">
        <div className="nav-sidebar-divider" />
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `nav-sidebar-item ${isActive ? "nav-sidebar-item--active" : ""}`
          }
        >
          <span className="nav-sidebar-item-icon">
            <User size={20} strokeWidth={2} aria-hidden />
          </span>
          <span className="nav-sidebar-item-label">Meu Perfil</span>
        </NavLink>
        <button
          type="button"
          className="nav-sidebar-item nav-sidebar-logout"
          onClick={handleLogout}
        >
          <span className="nav-sidebar-item-icon">
            <LogOut size={20} strokeWidth={2} aria-hidden />
          </span>
          <span className="nav-sidebar-item-label">Sair</span>
        </button>
      </div>
    </aside>
  );
}
