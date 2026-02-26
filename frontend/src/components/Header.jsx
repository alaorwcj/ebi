import { useNavigate } from "react-router-dom";
import { getRole } from "../api/auth.js";
import { Bell, BookOpen } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const role = getRole();
  const roleLabel = role === "ADMINISTRADOR"
    ? "Administrador"
    : role === "COORDENADORA"
      ? "Coordenadora"
      : "Colaboradora";

  return (
    <header className="sticky top-0 z-50 glass px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <BookOpen className="text-primary" size={28} />
        <h1 className="text-2xl font-extrabold tracking-tight text-white">EBIs</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
          <Bell size={24} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#09090b]"></span>
        </button>

        <div
          className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
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
