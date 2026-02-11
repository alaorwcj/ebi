import { useEffect, useState } from "react";
import { get, post, put } from "../api/client.js";
import FormField from "../components/FormField.jsx";
import Table from "../components/Table.jsx";
import { maskPhone } from "../utils/mask.js";
import { validateEmail, validatePassword, validatePhone } from "../utils/validators.js";
import { toast } from "sonner";

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  role: "COORDENADORA",
  group_number: 1,
  password: ""
};

export default function Users() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function load() {
    try {
      const data = await get(`/users?search=${encodeURIComponent(search)}&page=${page}`);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.message || "Erro ao carregar usuários.");
    }
  }

  useEffect(() => {
    load();
  }, [page]);

  async function handleSubmit(event) {
    event.preventDefault();
    const emailError = validateEmail(form.email);
    const phoneError = validatePhone(form.phone);
    if (emailError || phoneError) {
      toast.error(emailError || phoneError);
      return;
    }
    if (!editingId) {
      const passwordError = validatePassword(form.password);
      if (passwordError) {
        toast.error(passwordError);
        return;
      }
    } else if (form.password) {
      const passwordError = validatePassword(form.password);
      if (passwordError) {
        toast.error(passwordError);
        return;
      }
    }
    try {
      if (editingId) {
        await put(`/users/${editingId}`, form);
        toast.success("Usuário atualizado com sucesso.");
      } else {
        await post("/users", form);
        toast.success("Usuário cadastrado com sucesso.");
      }
      setForm(initialForm);
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.message || "Erro ao salvar.");
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      full_name: item.full_name,
      email: item.email,
      phone: maskPhone(item.phone || ""),
      role: item.role,
      group_number: item.group_number,
      password: ""
    });
  }

  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="flex-between">
          <h2 className="page-title">Usuários</h2>
          <input
            className="input"
            style={{ maxWidth: "180px" }}
            placeholder="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => {
              setPage(1);
              load();
            }}
          />
        </div>
        <Table
          columns={[
            { key: "full_name", label: "Nome" },
            { key: "role", label: "Funcao" },
            { key: "group_number", label: "Grupo" }
          ]}
          rows={items}
          actions={(row) => (
            <button className="button secondary" onClick={() => handleEdit(row)}>
              Editar
            </button>
          )}
        />
        <div className="flex" style={{ marginTop: "12px" }}>
          <button type="button" className="button secondary" onClick={() => setPage(Math.max(1, page - 1))}>
            Anterior
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={() => setPage(page + 1)}
            disabled={page * 10 >= total}
          >
            Próxima
          </button>
        </div>
      </div>
      <div className="card">
        <h3>{editingId ? "Editar" : "Cadastrar"}</h3>
        <form onSubmit={handleSubmit}>
          <FormField
            label="Nome completo"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
          <FormField
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value.toLowerCase() })}
            type="email"
            required
          />
          <FormField
            label="Contato"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
            required
          />
          <label className="label">Função</label>
          <select
            className="input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="COORDENADORA">Coordenadora</option>
            <option value="COLABORADORA">Colaboradora</option>
          </select>
          <label className="label" style={{ marginTop: "12px" }}>Grupo</label>
          <select
            className="input"
            value={form.group_number}
            onChange={(e) => setForm({ ...form, group_number: Number(e.target.value) })}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
          <FormField
            label="Senha"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            type="password"
            autoComplete="new-password"
            minLength={8}
            required={!editingId}
          />
          <button className="button" style={{ marginTop: "12px" }}>
            {editingId ? "Salvar" : "Cadastrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
