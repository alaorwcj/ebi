import { Link, Outlet, useNavigate } from "react-router-dom";
import { clearAuth, getRole } from "../api/auth.js";

export default function Layout() {
  const navigate = useNavigate();
  const role = getRole();

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <div>
      <header>
        <div>
          <strong>EBI Vila Paula</strong>
        </div>
        <nav>
          <Link to="/ebis">EBIs</Link>
          <Link to="/children">Criancas</Link>
          {role === "COORDENADORA" && <Link to="/users">Colaboradoras</Link>}
          {role === "COORDENADORA" && <Link to="/reports/general">Relatorio Geral</Link>}
        </nav>
        <button className="button secondary" onClick={handleLogout}>Sair</button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
