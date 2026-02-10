import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, setAuth } from "../api/auth.js";
import FormField from "../components/FormField.jsx";

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
      navigate("/ebis");
    } catch (err) {
      alert("Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "40px", maxWidth: "400px", margin: "0 auto" }}>
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
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
          <button className="button" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
