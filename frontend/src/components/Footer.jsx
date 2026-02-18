export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="app-footer-container">
        © {currentYear} EBI Vila Paula. Todos os direitos reservados.{" "}
        {/* <a href="mailto:suporte@ebivillapaula.com.br" className="app-footer-link">
          suporte@ebivillapaula.com.br
        </a> */}
      </div>
    </footer>
  );
}
