import { useEffect, useState } from "react";
import { get, post, put } from "../api/client.js";
import FormField from "../components/FormField.jsx";
import Modal from "../components/Modal.jsx";
import { maskPhone } from "../utils/mask.js";
import { mensagemParaUsuario } from "../utils/apiErrors.js";
import { validatePhone } from "../utils/validators.js";
import { toast } from "sonner";
import { Trash2, Baby, User, Phone } from "lucide-react";

const initialForm = {
  name: "",
  guardians: [{ name: "", phone: "" }]
};

export default function Children() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function load() {
    try {
      const data = await get(`/children?search=${encodeURIComponent(search)}&page=${page}`);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(mensagemParaUsuario(err, "Erro ao carregar crianças."));
    }
  }

  useEffect(() => { load(); }, [page, search]);

  function openCreateModal() { setForm(initialForm); setEditingId(null); setModalOpen(true); }

  function openEditModal(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      guardians: (item.guardians || []).map((guardian) => ({
        name: guardian.name,
        phone: maskPhone(guardian.phone || "")
      }))
    });
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); setForm(initialForm); setEditingId(null); }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name?.trim()) return toast.error("Informe o nome da criança.");
    for (const guardian of form.guardians) {
      if (!guardian.name?.trim()) return toast.error("Informe o nome do responsável.");
      if (validatePhone(guardian.phone)) return toast.error(validatePhone(guardian.phone));
    }

    try {
      if (editingId) {
        await put(`/children/${editingId}`, form);
        toast.success("Criança atualizada com sucesso.");
      } else {
        await post("/children", form);
        toast.success("Criança cadastrada com sucesso.");
      }
      closeModal();
      load();
    } catch (err) { toast.error(mensagemParaUsuario(err, "Erro ao salvar.")); }
  }

  function handleGuardianChange(index, field, value) {
    const guardians = form.guardians.map((g, i) => i !== index ? g : { ...g, [field]: value });
    setForm({ ...form, guardians });
  }

  function handleAddGuardian() {
    setForm({ ...form, guardians: [...form.guardians, { name: "", phone: "" }] });
  }

  function handleRemoveGuardian(index) {
    if (form.guardians.length === 1) return toast.error("Informe ao menos um responsavel.");
    setForm({ ...form, guardians: form.guardians.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">search</span>
          <input
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600 text-slate-100"
            placeholder="Search Children..."
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
          <span>Cadastrar Criança</span>
        </button>
      </div>

      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest text-[10px]">Registry</h2>
        <div className="text-primary text-sm font-semibold flex items-center gap-1 cursor-pointer">
          View All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </div>
      </div>

      <div className="compact-card-grid">
        {items.map((item, index) => {
          const primary = item.guardians && item.guardians.length > 0 ? item.guardians[0] : null;
          const accentBg = index % 2 === 0 ? "rgba(139, 92, 246, 0.15)" : "rgba(37, 71, 244, 0.15)";
          const accentColor = index % 2 === 0 ? "var(--accent-purple)" : "var(--primary)";

          return (
            <article key={item.id} className="compact-card">
              <div className="compact-card-header">
                <div className="compact-card-icon" style={{ background: accentBg, color: accentColor }}>
                  <Baby size={20} strokeWidth={2} aria-hidden />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="compact-card-meta">Criança</p>
                  <h3 className="compact-card-title">{item.name}</h3>
                </div>
                <span className="compact-card-tag" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                  Registro
                </span>
              </div>

              <div className="compact-card-body">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <User size={12} strokeWidth={2} aria-hidden />
                  <span className="text-[11px] uppercase tracking-wider">Responsável</span>
                </div>
                <p className="text-slate-200 font-medium text-sm truncate">{primary ? primary.name : "N/A"}</p>
                <div className="flex items-center gap-2 text-slate-400 mt-2">
                  <Phone size={12} strokeWidth={2} aria-hidden />
                  <span className="text-[11px] uppercase tracking-wider">Contato</span>
                </div>
                <p className="text-slate-200 font-medium text-sm">{primary ? primary.phone : "N/A"}</p>
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
        title={editingId ? "Editar Criança" : "Cadastrar Criança"}
        onClose={closeModal}
        contentClassName="sm:max-w-[520px]"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <FormField
            label="Nome da Criança"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            icon={<span className="material-symbols-outlined text-[18px]">child_care</span>}
          />

          <div className="card rounded-2xl border border-white/5 bg-white/5 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest text-[10px]">Responsáveis</h4>
              <button
                type="button"
                className="text-xs font-bold text-primary flex items-center gap-1 hover:text-white transition-colors"
                onClick={handleAddGuardian}
              >
                <span className="material-symbols-outlined text-[14px]">add_circle</span> Adicionar
              </button>
            </div>

            {form.guardians.map((guardian, index) => (
              <div key={`guardian-${index}`} className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3 relative">
                {form.guardians.length > 1 && (
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-red-500/50 hover:text-red-500 transition-colors"
                    onClick={() => handleRemoveGuardian(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <FormField
                  label="Nome"
                  value={guardian.name}
                  onChange={(e) => handleGuardianChange(index, "name", e.target.value)}
                />
                <FormField
                  label="Telefone"
                  value={guardian.phone}
                  onChange={(e) => handleGuardianChange(index, "phone", maskPhone(e.target.value))}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <button type="submit" className="button gradient-button flex-1 py-3">
              {editingId ? "Salvar" : "Concluir Cadastro"}
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
