import { useNavigate } from "react-router-dom";
import { clearAuth, getRole } from "../api/auth.js";
import ThemeToggle from "./ThemeToggle.jsx";
import { Button } from "@/components/ui/button";

export default function Header() {
  const navigate = useNavigate();
  const role = getRole();
  const roleLabel = role === "ADMINISTRADOR"
    ? "Administrador"
    : role === "COORDENADORA"
      ? "Coordenadora"
      : "Colaboradora";

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <header className="app-header">
      <div className="app-header-brand">
        <strong>EBI Vila Paula</strong>
      </div>
      <div className="app-header-actions">
        <span className="app-header-user" title={roleLabel}>
          {roleLabel}
        </span>
        <ThemeToggle />
        <Button type="button" variant="secondary" onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </header>
  );
}
