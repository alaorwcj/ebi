import { NavLink } from "react-router-dom";

const navItems = [
    { label: "EBIs", path: "/ebis", icon: "dashboard" },
    { label: "Crianças", path: "/children", icon: "child_care" },
    { label: "Usuários", path: "/users", icon: "group" },
    { label: "Reports", path: "/reports/general", icon: "pie_chart" },
    { label: "Perfil", path: "/profile", icon: "account_circle" },
];

export default function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 px-2 pb-6 pt-3 flex justify-around items-center md:hidden z-[1000]">
            {navItems.map((item) => (
                <NavLink
                    key={item.label}
                    to={item.path}
                    end={item.path === "/ebis"}
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 transition-colors ${isActive ? "text-primary fill-[1]" : "text-slate-500"
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <span
                                className="material-symbols-outlined text-[28px]"
                                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                                {item.icon}
                            </span>
                            <span className="text-[10px] font-bold uppercase">{item.label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
