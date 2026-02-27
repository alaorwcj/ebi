import { useMemo } from "react";
import { getRole } from "../api/auth.js";

/**
 * Menu dinâmico por role (ADMINISTRADOR, COORDENADORA, etc.).
 * Retorna menuItems filtrados conforme o perfil do usuário.
 */
export function useMenu() {
  const role = getRole();

  const menuItems = useMemo(() => {
    const adminItems = [
      { label: "EBIs", icon: "Calendar", path: "/ebis" },
      { label: "Crianças", icon: "Users", path: "/children" },
      { label: "Meu Perfil", icon: "User", path: "/profile" },
      { label: "Usuários", icon: "UsersRound", path: "/users" },
    ];

    const coordItems = [
      { label: "EBIs", icon: "Calendar", path: "/ebis" },
      { label: "Crianças", icon: "Users", path: "/children" },
      { label: "Meu Perfil", icon: "User", path: "/profile" },
      { label: "Relatório Geral", icon: "FileText", path: "/reports/general" },
      // {
      //   label: "Relatórios",
      //   icon: "BarChart3",
      //   subItems: [
      //   ],
      // },
    ];

    const defaultItems = [
      { label: "EBIs", icon: "Calendar", path: "/ebis" },
      { label: "Crianças", icon: "Users", path: "/children" },
      { label: "Meu Perfil", icon: "User", path: "/profile" },
    ];

    if (role === "ADMINISTRADOR") return adminItems;
    if (role === "COORDENADORA") return coordItems;
    return defaultItems;
  }, [role]);

  return { menuItems };
}
