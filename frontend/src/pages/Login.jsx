import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mensagemParaUsuario } from "../utils/apiErrors.js";
import { toast } from "sonner";
import { login, setAuth } from "../api/auth.js";
import FormField from "../components/FormField.jsx";
import { Mail, Lock, LogIn } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email?.trim()) {
      toast.error("Informe o email.");
      return;
    }
    if (!password) {
      toast.error("Informe a senha.");
      return;
    }
    if (password.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const payload = await login(email, password);
      setAuth(payload.access_token, payload.role, payload.user_id);
      toast.success("Login realizado com sucesso.");
      navigate("/ebis");
    } catch (err) {
      toast.error(mensagemParaUsuario(err, "Falha no login. Verifique email e senha."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <style>{`
        #login-card-inner {
          background: rgba(10, 10, 15, 0.98) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.9) !important;
        }
        #login-card-inner label {
          color: #ffffff !important;
          font-weight: 800 !important;
          font-size: 0.85rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          opacity: 1 !important;
        }
        #login-card-inner input {
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          color: #ffffff !important;
          height: 56px !important;
        }
        #login-card-inner input::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }
      `}</style>

      <div id="login-card-inner" className="login-card glass relative z-10 flex flex-col items-center gap-6">
        <header className="flex flex-col items-center gap-3 w-full">
          <img
            src="/img/Logo_oficial_CCB.png"
            alt="Logo CCB"
            className="login-logo mb-2"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <h2 className="login-title">Login</h2>
          <p className="login-subtitle">EBI Vila Paula</p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full" noValidate>
          <FormField
            label="Email Institucional"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="username"
            icon={<Mail className="text-white/80" size={18} />}
            placeholder="seu.nome@ebi.com"
          />
          <FormField
            label="Senha de Acesso"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            icon={<Lock className="text-white/80" size={18} />}
            placeholder="********"
          />
          <button
            type="submit"
            disabled={loading}
            className="gradient-button w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white shadow-lg active:scale-95 transition-transform mt-2"
          >
            {loading ? (
              <span className="animate-pulse">Autenticando...</span>
            ) : (
              <>
                <LogIn size={20} />
                <span>Entrar no Sistema</span>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
