import { useNavigate } from "react-router-dom";
import { Bell, BookOpen, User } from "lucide-react";
import { getRole } from "../api/auth.js";

export default function Header() {
  const navigate = useNavigate();
  const role = getRole();
  const roleLabel =
    role === "ADMINISTRADOR"
      ? "Administrador"
      : role === "COORDENADORA"
        ? "Coordenadora"
        : "Colaboradora";

  return (
    <header className="app-header">
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <BookOpen size={22} color="var(--primary)" strokeWidth={2.5} />
        <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)" }}>
          EBI Vila Paula
        </h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          style={{ position: "relative", padding: "8px", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", borderRadius: "50%" }}
          title="Notificações"
        >
          <Bell size={20} strokeWidth={2} />
          <span style={{ position: "absolute", top: "8px", right: "8px", width: "7px", height: "7px", background: "#ef4444", borderRadius: "50%", border: "2px solid var(--background-dark)" }} />
        </button>
        <div
          style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(37,71,244,0.15)", border: "1.5px solid rgba(37,71,244,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          onClick={() => navigate("/profile")}
          title={roleLabel}
        >
          <User size={18} color="var(--primary)" strokeWidth={2} />
        </div>
      </div>
    </header>
  );
}
