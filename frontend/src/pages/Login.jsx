import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { login, setAuth } from "../api/auth.js";
import FormField from "../components/FormField.jsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = await login(email, password);
      setAuth(payload.access_token, payload.role, payload.user_id);
      toast.success("Login realizado com sucesso.");
      navigate("/ebis");
    } catch (err) {
      toast.error(err.message || "Falha no login. Verifique email e senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <Card className="w-full max-w-[400px] login-card">
        <CardHeader className="flex flex-col items-center gap-3">
          <img
            src="/img/Logo_oficial_CCB.png"
            alt="Logo CCB"
            className="login-logo"
          />
          <h2 className="login-title text-2xl font-semibold">Login</h2>
          <p className="text-muted-foreground text-sm login-subtitle">EBI Vila Paula</p>
        </CardHeader>
        <CardContent className="px-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="username"
              required
            />
            <FormField
              label="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
