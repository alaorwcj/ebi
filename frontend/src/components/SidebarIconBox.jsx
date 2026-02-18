/**
 * Envolve ícones na sidebar com tamanho consistente.
 * Na sidebar o fundo fica transparente (override via CSS).
 */
export function SidebarIconBox({ size = "medium", children, className = "" }) {
  return (
    <div
      className={`sidebar-icon-box sidebar-icon-box--${size} ${className}`.trim()}
      aria-hidden
    >
      {children}
    </div>
  );
}
