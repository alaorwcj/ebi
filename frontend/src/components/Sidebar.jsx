import { NavLink } from "react-router-dom";
import { getRole } from "../api/auth.js";

const navItems = [
  { to: "/ebis", label: "EBIs", icon: IconEbis },
  { to: "/children", label: "Crianças", icon: IconChildren },
  { to: "/profile", label: "Meu Perfil", icon: IconProfile },
  { to: "/users", label: "Usuários", icon: IconUsers, role: "ADMINISTRADOR" },
  { to: "/reports/general", label: "Relatório Geral", icon: IconChart, role: "COORDENADORA" },
];

function IconEbis() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconChildren() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileToggle }) {
  const role = getRole();
  const filtered = navItems.filter((item) => !item.role || item.role === role);

  const linkContent = (item) => (
    <>
      <span className="sidebar-icon">{item.icon ? <item.icon /> : null}</span>
      <span className="sidebar-label">{item.label}</span>
    </>
  );

  const nav = (
    <nav className="sidebar-nav">
      {filtered.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link--active" : ""}`}
          end={item.to === "/ebis"}
          onClick={onMobileToggle}
        >
          {linkContent(item)}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        className="sidebar-mobile-trigger"
        onClick={onMobileToggle}
        aria-label="Abrir menu"
        aria-expanded={mobileOpen}
      >
        <IconMenu />
      </button>
      <div className={`sidebar-overlay ${mobileOpen ? "sidebar-overlay--open" : ""}`} onClick={onMobileToggle} aria-hidden="true" />
      <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""} ${mobileOpen ? "sidebar--mobile-open" : ""}`}>
        <div className="sidebar-inner">
          <div className="sidebar-header">
            <img
              src="/img/Logo_oficial_CCB.png"
              alt="Logo CCB"
              className="sidebar-logo"
            />
            <button
              type="button"
              className="sidebar-collapse-btn"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            >
              {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
            </button>
          </div>
          {nav}
        </div>
      </aside>
    </>
  );
}
