import { NavLink } from "react-router-dom";
import { LayoutDashboard, Baby, Users, User } from "lucide-react";

export default function BottomNav() {
    const navItems = [
        { label: "EBIs", path: "/", icon: LayoutDashboard },
        { label: "Crianças", path: "/children", icon: Baby },
        { label: "Usuários", path: "/users", icon: Users },
        { label: "Perfil", path: "/profile", icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 px-2 pb-6 pt-3 flex justify-around items-center md:hidden z-[1000]">
            {navItems.map((item) => (
                <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 transition-colors ${isActive ? "text-primary fill-primary" : "text-slate-500"
                        }`
                    }
                >
                    <item.icon size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
