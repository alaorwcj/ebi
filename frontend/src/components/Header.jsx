import { useNavigate } from "react-router-dom";
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
    <header className="sticky top-0 z-50 glass px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-3xl">auto_stories</span>
        <h1 className="text-2xl font-extrabold tracking-tight">EBIs</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background-dark"></span>
        </button>
        <div
          className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={() => navigate("/profile")}
          title={roleLabel}
        >
          <img
            alt="User profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYqNuSy071Gnn3BoqpKurlOVhQ9P0EWwjvpRqP_K98LssCn6vakjYTfu_3UqrY9v0IRnftMjNXa9922x7lj5dUAfYbgnQmob5CsvvQUtreiAnHUDXUfmo6pO2PdKUE00EBtwcZ4gM9sFHjqfqTG30WoDzptVJjDXl9M9VcVJmoFA9xlJomZxPUJyEEg0qfJqfh5RoAl9rbtH9vIluRP9f6D7goFbdIX2-AZw1p8wRLuNcZemX7wOg-HEDvw-USH8QmALMxNb21J6PD"
          />
        </div>
      </div>
    </header>
  );
}
