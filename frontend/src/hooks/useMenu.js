import { useMemo } from "react";
import { getRole } from "../api/auth.js";

/**
 * Menu dinâmico por role (ADMINISTRADOR, COORDENADORA, COLABORADORA).
 * "Meu Perfil" e "Sair" são gerenciados diretamente pelo Sidebar/BottomNav.
 */
export function useMenu() {
  const role = getRole();

  const menuItems = useMemo(() => {
    const adminItems = [
      { label: "EBIs", icon: "Calendar", path: "/ebis" },
      { label: "Crianças", icon: "Users", path: "/children" },
      { label: "Usuários", icon: "UsersRound", path: "/users" },
    ];

    const coordItems = [
      { label: "EBIs", icon: "Calendar", path: "/ebis" },
      { label: "Crianças", icon: "Users", path: "/children" },
      { label: "Relatório Geral", icon: "FileText", path: "/reports/general" },
    ];

    const defaultItems = [
      { label: "EBIs", icon: "Calendar", path: "/ebis" },
      { label: "Crianças", icon: "Users", path: "/children" },
    ];

    if (role === "ADMINISTRADOR") return adminItems;
    if (role === "COORDENADORA") return coordItems;
    return defaultItems;
  }, [role]);

  return { menuItems };
}
