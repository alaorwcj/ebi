import { NavLink, useNavigate } from "react-router-dom";
import { useMenu } from "../hooks/useMenu.js";
import { clearAuth } from "../api/auth.js";

// Icon map for bottom nav
const ICON_NAMES = {
    Calendar: "calendar_month",
    Users: "child_care",
    User: "account_circle",
    UsersRound: "group",
    FileText: "bar_chart",
};

export default function BottomNav() {
    const navigate = useNavigate();
    const { menuItems } = useMenu();

    function handleLogout() {
        clearAuth();
        navigate("/login");
    }

    return (
        <nav className="mobile-bottom-nav">
            {menuItems.map((item) => (
                <NavLink
                    key={item.label}
                    to={item.path}
                    end={item.path === "/ebis"}
                    className={({ isActive }) =>
                        `mobile-bottom-nav-item ${isActive ? "mobile-bottom-nav-item--active" : ""}`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <span
                                className="material-symbols-outlined"
                                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                                {ICON_NAMES[item.icon] || "circle"}
                            </span>
                            <span>{item.label}</span>
                        </>
                    )}
                </NavLink>
            ))}

            {/* Logout always visible */}
            <button
                type="button"
                className="mobile-bottom-nav-item mobile-bottom-nav-item--logout"
                onClick={handleLogout}
            >
                <span className="material-symbols-outlined">logout</span>
                <span>Sair</span>
            </button>
        </nav>
    );
}
