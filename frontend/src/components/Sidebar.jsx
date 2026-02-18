import { useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  User,
  FolderPlus,
  UsersRound,
  BarChart3,
  FileText,
  LogOut,
  Menu,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useMenu } from "../hooks/useMenu.js";
import { SidebarIconBox } from "./SidebarIconBox.jsx";
import { clearAuth, getRole } from "../api/auth.js";
import { useMediaQuery, MOBILE_BREAKPOINT } from "../hooks/useMediaQuery.js";

const ICON_MAP = {
  Calendar,
  Users,
  User,
  FolderPlus,
  UsersRound,
  BarChart3,
  FileText,
};

function MenuIcon({ name, size = 22 }) {
  const Icon = ICON_MAP[name] || User;
  return <Icon size={size} strokeWidth={2} aria-hidden />;
}

export default function Sidebar({
  collapsed: controlledCollapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileToggle,
}) {
  const navigate = useNavigate();
  const { menuItems } = useMenu();
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

  const isExpanded = controlledCollapsed === false;

  const toggleSidebar = useCallback(() => {
    if (isExpanded) setExpandedMenus(new Set());
    onToggleCollapse?.();
  }, [isExpanded, onToggleCollapse]);

  const isSubmenuExpanded = useCallback(
    (label) => expandedMenus.has(label),
    [expandedMenus]
  );

  const toggleSubmenu = useCallback(
    (menuLabel) => {
      if (!isExpanded) onToggleCollapse?.();
      setExpandedMenus((prev) => {
        const next = new Set(prev);
        if (next.has(menuLabel)) next.delete(menuLabel);
        else next.add(menuLabel);
        return next;
      });
    },
    [isExpanded, onToggleCollapse]
  );

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate("/login");
    onMobileToggle?.();
  }, [navigate, onMobileToggle]);

  const navigateToProfile = useCallback(() => {
    navigate("/profile");
    onMobileToggle?.();
  }, [navigate, onMobileToggle]);

  const role = getRole();
  const userName =
    role === "ADMINISTRADOR"
      ? "Administrador"
      : role === "COORDENADORA"
        ? "Coordenadora"
        : "Colaboradora";
  const profileImageUrl = null; // opcional: URL da foto do usuário

  return (
    <>
      <button
        type="button"
        className="sidebar-wpay-mobile-trigger"
        onClick={onMobileToggle}
        aria-label="Abrir menu"
        aria-expanded={mobileOpen}
      >
        <Menu size={24} strokeWidth={2} aria-hidden />
      </button>
      <div
        className={`sidebar-wpay-overlay ${mobileOpen ? "sidebar-wpay-overlay--open" : ""}`}
        onClick={onMobileToggle}
        aria-hidden
      />
      <section
        id="sidebar-wpay-content"
        className={`sidebar-wpay ${isExpanded || mobileOpen ? "sidebar-wpay--expanded" : ""} ${mobileOpen ? "sidebar-wpay--mobile-open" : ""}`}
      >
        {/* Botão hamburger: no mobile abre/fecha overlay; no desktop expande/recolhe a pill */}
        <div
          id="sidebar-wpay-logo"
          className="sidebar-wpay-logo"
          onClick={() => {
            if (isMobile) {
              onMobileToggle?.();
            } else {
              if (mobileOpen) onMobileToggle?.();
              else toggleSidebar();
            }
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            if (isMobile) onMobileToggle?.();
            else {
              if (mobileOpen) onMobileToggle?.();
              else toggleSidebar();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={
            isMobile
              ? mobileOpen
                ? "Fechar menu"
                : "Abrir menu"
              : mobileOpen
                ? "Fechar menu"
                : isExpanded
                  ? "Recolher menu"
                  : "Expandir menu"
          }
        >
          <Menu size={24} strokeWidth={2} aria-hidden className="sidebar-wpay-logo-icon" />
        </div>

        {/* Área de menus (scroll) */}
        <div id="sidebar-wpay-menus" className="sidebar-wpay-menus">
          <ul>
            {menuItems.map((menu) => (
              <li key={menu.label} className="sidebar-wpay-menu-wrapper">
                {!menu.subItems?.length ? (
                  <NavLink
                    to={menu.path}
                    className={({ isActive }) =>
                      `sidebar-wpay-menu-item ${isActive ? "sidebar-wpay-menu-item--active" : ""}`
                    }
                    onClick={() => {
                      if (mobileOpen) onMobileToggle?.();
                    }}
                  >
                    <SidebarIconBox size="medium">
                      <MenuIcon name={menu.icon} />
                    </SidebarIconBox>
                    <span className="sidebar-wpay-label">{menu.label}</span>
                  </NavLink>
                ) : (
                  <>
                    <div
                      className={`sidebar-wpay-menu-item sidebar-wpay-menu-item--has-submenu ${isSubmenuExpanded(menu.label) ? "sidebar-wpay-menu-item--submenu-open" : ""}`}
                      onClick={() => toggleSubmenu(menu.label)}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") && toggleSubmenu(menu.label)
                      }
                      role="button"
                      tabIndex={0}
                    >
                      <SidebarIconBox size="medium">
                        <MenuIcon name={menu.icon} />
                      </SidebarIconBox>
                      <span className="sidebar-wpay-label">{menu.label}</span>
                      {isExpanded &&
                        (isSubmenuExpanded(menu.label) ? (
                          <ChevronUp size={16} className="sidebar-wpay-chevron" aria-hidden />
                        ) : (
                          <ChevronDown size={16} className="sidebar-wpay-chevron" aria-hidden />
                        ))}
                    </div>
                    <ul
                      className={`sidebar-wpay-submenu ${isSubmenuExpanded(menu.label) ? "sidebar-wpay-submenu--expanded" : ""}`}
                    >
                      {menu.subItems.map((sub) => (
                        <li key={sub.label} className="sidebar-wpay-submenu-item">
                          <NavLink
                            to={sub.path}
                            className={({ isActive }) =>
                              `sidebar-wpay-submenu-link ${isActive ? "sidebar-wpay-submenu-link--active" : ""}`
                            }
                            onClick={() => {
                              if (mobileOpen) onMobileToggle?.();
                            }}
                          >
                            <SidebarIconBox size="small">
                              <MenuIcon name={sub.icon} size={16} />
                            </SidebarIconBox>
                            <span className="sidebar-wpay-label">{sub.label}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer fixo */}
        <div id="sidebar-wpay-footer" className="sidebar-wpay-footer">
          <ul>
            <li>
              <button
                type="button"
                className="sidebar-wpay-menu-item sidebar-wpay-footer-logout"
                onClick={handleLogout}
              >
                <SidebarIconBox size="medium">
                  <LogOut size={22} strokeWidth={2} aria-hidden />
                </SidebarIconBox>
                <span className="sidebar-wpay-label">Sair</span>
              </button>
            </li>
          </ul>
          <div
            className="sidebar-wpay-user-profile"
            onClick={navigateToProfile}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && navigateToProfile()
            }
            role="button"
            tabIndex={0}
          >
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="" className="sidebar-wpay-user-avatar" />
            ) : (
              <div className="sidebar-wpay-user-placeholder">
                <User size={22} strokeWidth={2} aria-hidden />
              </div>
            )}
            <span className="sidebar-wpay-label sidebar-wpay-user-name">{userName}</span>
          </div>
        </div>
      </section>
    </>
  );
}
