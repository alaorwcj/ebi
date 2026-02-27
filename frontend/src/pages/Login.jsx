import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mensagemParaUsuario } from "../utils/apiErrors.js";
import { toast } from "sonner";
import { login, setAuth } from "../api/auth.js";
import FormField from "../components/FormField.jsx";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email?.trim()) return toast.error("Informe o email.");
    if (!password) return toast.error("Informe a senha.");
    if (password.length < 8) return toast.error("A senha deve ter no mínimo 8 caracteres.");
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))
      return toast.error("A senha deve conter letras e números.");

    setLoading(true);
    try {
      const payload = await login(email, password);
      setAuth(payload.access_token, payload.role, payload.user_id);
      toast.success("Bem-vinda de volta!");
      navigate("/ebis");
    } catch (err) {
      toast.error(mensagemParaUsuario(err, "Falha no login. Verifique as credenciais."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#09090b]">
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="glass w-full max-w-md p-8 md:p-10 space-y-8 relative z-10">
        <header className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl overflow-hidden mb-2">
            <img
              src="/img/Logo_oficial_CCB.png"
              alt="Logo CCB"
              className="w-14 h-14 object-contain brightness-0 invert"
            />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">EBI Management</h2>
            <p className="text-slate-400 font-medium">Vila Paula - Gestão de Alunos</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-4">
            <FormField
              label="Email Institucional"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="username"
              placeholder="seu.nome@ebi.com"
              icon={<span className="material-symbols-outlined text-slate-500 text-[18px]">mail</span>}
            />
            <div className="space-y-1">
              <FormField
                label="Senha de Acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                icon={<span className="material-symbols-outlined text-slate-500 text-[18px]">lock</span>}
              />
              <div className="flex justify-end pr-1">
                <button type="button" className="text-[10px] text-primary font-bold uppercase tracking-wider hover:text-white transition-colors">Esqueceu a senha?</button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gradient-button w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-white shadow-xl active:scale-95 transition-all mt-2 group"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">sync</span>
            ) : (
              <>
                <span>Acessar Dashboard</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <footer className="pt-4 text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Painel de Controle Administrativo</p>
        </footer>
      </div>
    </main>
  );
}
