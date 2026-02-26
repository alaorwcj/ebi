import { useEffect, useState } from "react";
import { get, post, put } from "../api/client.js";
import FormField from "../components/FormField.jsx";
import Modal from "../components/Modal.jsx";
import { maskPhone } from "../utils/mask.js";
import { mensagemParaUsuario } from "../utils/apiErrors.js";
import { validateEmail, validatePassword, validatePhone } from "../utils/validators.js";
import { toast } from "sonner";
import { Search, PlusCircle, User, Shield, Users as UsersIcon, Edit, Lock, Mail, Phone, ExternalLink } from "lucide-react";

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
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
          <input
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600 text-white"
            placeholder="Search Users..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => {
              setPage(1);
              load();
            }}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
        </div>
        <button
          className="gradient-button w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white shadow-lg active:scale-95 transition-transform"
          onClick={openCreateModal}
        >
          <PlusCircle size={22} />
          <span>Cadastrar Usuário</span>
        </button>
      </div>

      {/* Grid Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest text-[10px]">Team Members</h2>
        <div className="text-primary text-sm font-semibold flex items-center gap-1 cursor-pointer">
          View All <ExternalLink size={14} />
        </div>
      </div>

      {/* Data Grid */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="card p-5 rounded-2xl space-y-4 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-[10px] font-medium uppercase tracking-tighter">Colaboradora</p>
                <h3 className="text-lg font-bold text-slate-100 mt-0.5">{item.full_name}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${item.role === 'ADMINISTRADOR'
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : item.role === 'COORDENADORA'
                    ? 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_12px_rgba(37,71,244,0.2)]'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                }`}>
                {item.role === 'ADMINISTRADOR' ? 'Admin' : item.role === 'COORDENADORA' ? 'Coord' : 'Colab'}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Mail className="text-slate-500" size={16} />
                <div>
                  <p className="text-slate-500 text-[10px]">E-mail</p>
                  <p className="font-semibold text-slate-200 text-sm">{item.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <UsersIcon className="text-slate-500" size={16} />
                <div>
                  <p className="text-slate-500 text-[10px]">Grupo / Turma</p>
                  <p className="font-semibold text-slate-200 text-sm uppercase">Grupo {item.group_number || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => openEditModal(item)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100/5 border border-white/10 flex items-center justify-center gap-2 text-sm font-medium hover:bg-white/10 transition-colors text-white"
              >
                <Edit size={16} />
                Editar Usuário
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex gap-2 mt-4 pb-8">
        <button
          className="flex-1 py-3 rounded-xl bg-slate-100/5 border border-white/10 text-white font-medium disabled:opacity-50"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Anterior
        </button>
        <button
          className="flex-1 py-3 rounded-xl bg-slate-100/5 border border-white/10 text-white font-medium disabled:opacity-50"
          onClick={() => setPage(page + 1)}
          disabled={page * 10 >= total}
        >
          Próxima
        </button>
      </div>

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
            icon={<User size={18} />}
          />
          <FormField
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value.toLowerCase() })}
            type="email"
            icon={<Mail size={18} />}
          />
          <FormField
            label="Telefone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
            icon={<Phone size={18} />}
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
            icon={<Lock size={18} />}
            placeholder={editingId ? "Deixe em branco para manter" : "Mínimo 8 caracteres"}
          />

          <div className="flex gap-3 mt-2">
            <button type="submit" className="button gradient-button flex-1 py-3">
              {editingId ? "Salvar Alterações" : "Criar Usuário"}
            </button>
            <button type="button" className="button secondary flex-1" onClick={closeModal}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
