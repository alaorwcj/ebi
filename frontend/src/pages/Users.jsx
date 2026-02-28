import { useEffect, useState } from "react";
import { get, post, put } from "../api/client.js";
import FormField from "../components/FormField.jsx";
import Modal from "../components/Modal.jsx";
import { maskPhone } from "../utils/mask.js";
import { mensagemParaUsuario } from "../utils/apiErrors.js";
import { validateEmail, validatePassword, validatePhone } from "../utils/validators.js";
import { toast } from "sonner";
import { UserCircle, Mail, UsersRound } from "lucide-react";

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

  useEffect(() => { load(); }, [page, search]);

  function openCreateModal() { setForm(initialForm); setEditingId(null); setModalOpen(true); }

  function openEditModal(item) {
    setEditingId(item.id);
    setForm({
      full_name: item.full_name, email: item.email, phone: maskPhone(item.phone || ""),
      role: item.role, group_number: item.group_number, password: ""
    });
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); setForm(initialForm); setEditingId(null); }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.full_name?.trim()) return toast.error("Informe o nome completo.");
    if (validateEmail(form.email) || validatePhone(form.phone)) return toast.error("Verifique os dados informados.");
    if (!editingId && validatePassword(form.password)) return toast.error(validatePassword(form.password));

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
    } catch (err) { toast.error(mensagemParaUsuario(err, "Erro ao salvar.")); }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">search</span>
          <input
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600 text-slate-100"
            placeholder="Search Users..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
        </div>
        <button
          className="gradient-button w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white shadow-lg active:scale-95 transition-transform"
          onClick={openCreateModal}
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span>Cadastrar Usuário</span>
        </button>
      </div>

      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest text-[10px]">Team Members</h2>
        <div className="text-primary text-sm font-semibold flex items-center gap-1 cursor-pointer">
          View All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </div>
      </div>

      <div className="compact-card-grid">
        {items.map((item, index) => {
          const accentBg = index % 2 === 1 ? "rgba(139, 92, 246, 0.15)" : "rgba(37, 71, 244, 0.15)";
          const accentColor = index % 2 === 1 ? "var(--accent-purple)" : "var(--primary)";
          const roleStyles = item.role === "ADMINISTRADOR"
            ? { background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.3)" }
            : item.role === "COORDENADORA"
              ? { background: "rgba(37, 71, 244, 0.15)", color: "var(--primary)", border: "1px solid rgba(37, 71, 244, 0.3)" }
              : { background: "rgba(255,255,255,0.06)", color: "var(--muted)", border: "1px solid var(--border)" };
          const roleLabel = item.role === "ADMINISTRADOR" ? "Admin" : item.role === "COORDENADORA" ? "Coord" : "Colab";

          return (
            <article key={item.id} className="compact-card">
              <div className="compact-card-header">
                <div className="compact-card-icon" style={{ background: accentBg, color: accentColor }}>
                  <UserCircle size={20} strokeWidth={2} aria-hidden />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="compact-card-meta">Colaboradora</p>
                  <h3 className="compact-card-title">{item.full_name}</h3>
                </div>
                <span className="compact-card-tag" style={roleStyles}>
                  {roleLabel}
                </span>
              </div>

              <div className="compact-card-body">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Mail size={12} strokeWidth={2} aria-hidden />
                  <span className="text-[11px] uppercase tracking-wider">E-mail</span>
                </div>
                <p className="text-slate-200 font-medium text-sm truncate">{item.email}</p>
                <div className="flex items-center gap-2 text-slate-400 mt-2">
                  <UsersRound size={12} strokeWidth={2} aria-hidden />
                  <span className="text-[11px] uppercase tracking-wider">Grupo</span>
                </div>
                <p className="text-slate-200 font-medium text-sm">Grupo {item.group_number || "N/A"}</p>
              </div>

              <div className="compact-card-divider" />

              <div className="compact-card-actions">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="compact-card-btn-primary"
                >
                  Editar
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <nav className="pagination" aria-label="Paginação">
        <button
          type="button"
          className="pagination-btn"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Página anterior"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        <span className="pagination-page">{page} de {Math.max(1, Math.ceil(total / 10))}</span>
        <button
          type="button"
          className="pagination-btn"
          onClick={() => setPage(page + 1)}
          disabled={page * 10 >= total}
          aria-label="Próxima página"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </nav>

      <Modal
        open={modalOpen}
        title={editingId ? "Editar Usuário" : "Novo Usuário"}
        onClose={closeModal}
        contentClassName="sm:max-w-[480px]"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <FormField
            label="Nome Completo"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            icon={<span className="material-symbols-outlined text-[18px]">person</span>}
          />
          <FormField
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value.toLowerCase() })}
            type="email"
            icon={<span className="material-symbols-outlined text-[18px]">mail</span>}
          />
          <FormField
            label="Telefone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
            icon={<span className="material-symbols-outlined text-[18px]">call</span>}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Função">
              <select
                className="input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="COORDENADORA">Coordenadora</option>
                <option value="COLABORADORA">Colaboradora</option>
              </select>
            </FormField>
            <FormField label="Grupo">
              <select
                className="input"
                value={form.group_number}
                onChange={(e) => setForm({ ...form, group_number: Number(e.target.value) })}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </FormField>
          </div>

          <FormField
            label="Senha"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            type="password"
            autoComplete="new-password"
            icon={<span className="material-symbols-outlined text-[18px]">lock</span>}
            placeholder={editingId ? "Deixe em branco para manter" : "Mínimo 8 caracteres"}
          />

          <div className="flex gap-3 mt-4">
            <button type="submit" className="flex-1 gradient-button rounded-xl py-3 text-white font-bold tracking-wide">
              {editingId ? "Salvar" : "Criar Usuário"}
            </button>
            <button type="button" className="flex-1 bg-slate-100/5 border border-white/10 rounded-xl py-3 text-white font-medium" onClick={closeModal}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
