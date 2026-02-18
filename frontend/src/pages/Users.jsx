import { useEffect, useState } from "react";
import { get, post, put } from "../api/client.js";
import FormField from "../components/FormField.jsx";
import Table from "../components/Table.jsx";
import Modal from "../components/Modal.jsx";
import { maskPhone } from "../utils/mask.js";
import { mensagemParaUsuario } from "../utils/apiErrors.js";
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
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function load() {
    try {
      const data = await get(`/users?search=${encodeURIComponent(search)}&page=${page}`);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(mensagemParaUsuario(err, "Erro ao carregar usuários."));
    }
  }

  useEffect(() => {
    load();
  }, [page]);

  function openCreateModal() {
    setForm(initialForm);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEditModal(item) {
    setEditingId(item.id);
    setForm({
      full_name: item.full_name,
      email: item.email,
      phone: maskPhone(item.phone || ""),
      role: item.role,
      group_number: item.group_number,
      password: ""
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(initialForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.full_name?.trim()) {
      toast.error("Informe o nome completo.");
      return;
    }
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
      closeModal();
      load();
    } catch (err) {
      toast.error(mensagemParaUsuario(err, "Erro ao salvar."));
    }
  }

  return (
    <div className="card rounded-2xl border border-border/50 shadow-xl">
      <div className="page-header flex-between">
        <h2 className="text-xl font-semibold text-foreground">Usuários</h2>
        <div className="page-header-actions flex gap-2">
          <input
            className="input rounded-xl"
            style={{ maxWidth: "200px" }}
            placeholder="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => {
              setPage(1);
              load();
            }}
          />
          <button type="button" className="button rounded-xl" onClick={openCreateModal}>
            Cadastrar
          </button>
        </div>
      </div>
      <Table
        columns={[
          { key: "full_name", label: "Nome" },
          { key: "role", label: "Função" },
          { key: "group_number", label: "Grupo" }
        ]}
        rows={items}
        actions={(row) => (
          <button className="button secondary rounded-xl" onClick={() => openEditModal(row)}>
            Editar
          </button>
        )}
      />
      <div className="pagination-actions flex gap-2 mt-6">
        <button type="button" className="button secondary rounded-xl" onClick={() => setPage(Math.max(1, page - 1))}>
          Anterior
        </button>
        <button
          type="button"
          className="button secondary rounded-xl"
          onClick={() => setPage(page + 1)}
          disabled={page * 10 >= total}
        >
          Próxima
        </button>
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? "Editar usuário" : "Cadastrar usuário"}
        onClose={closeModal}
        contentClassName="sm:max-w-[480px]"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>
          <FormField
            label="Nome completo"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <FormField
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value.toLowerCase() })}
            type="email"
          />
          <FormField
            label="Contato"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
          />
          <label className="label">Função</label>
          <select
            className="input rounded-xl"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="COORDENADORA">Coordenadora</option>
            <option value="COLABORADORA">Colaboradora</option>
          </select>
          <label className="label" style={{ marginTop: "12px" }}>Grupo</label>
          <select
            className="input rounded-xl"
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
          />
          <div className="flex gap-3 mt-4">
            <button type="submit" className="button rounded-xl">
              {editingId ? "Salvar" : "Cadastrar"}
            </button>
            <button type="button" className="button secondary rounded-xl" onClick={closeModal}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
