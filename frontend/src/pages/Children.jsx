import { useEffect, useState } from "react";
import { get, post, put } from "../api/client.js";
import FormField from "../components/FormField.jsx";
import Modal from "../components/Modal.jsx";
import { maskPhone } from "../utils/mask.js";
import { mensagemParaUsuario } from "../utils/apiErrors.js";
import { validatePhone } from "../utils/validators.js";
import { toast } from "sonner";
import { Search, PlusCircle, User, Phone, Edit, Trash2, ExternalLink } from "lucide-react";

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
      name: item.name,
      guardians: (item.guardians || []).map((guardian) => ({
        name: guardian.name,
        phone: maskPhone(guardian.phone || "")
      }))
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
    if (!form.name?.trim()) {
      toast.error("Informe o nome da criança.");
      return;
    }
    for (const guardian of form.guardians) {
      if (!guardian.name?.trim()) {
        toast.error("Informe o nome do responsável.");
        return;
      }
      const phoneError = validatePhone(guardian.phone);
      if (phoneError) {
        toast.error(phoneError);
        return;
      }
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
    } catch (err) {
      toast.error(mensagemParaUsuario(err, "Erro ao salvar."));
    }
  }

  function handleGuardianChange(index, field, value) {
    const guardians = form.guardians.map((guardian, i) => {
      if (i !== index) return guardian;
      return { ...guardian, [field]: value };
    });
    setForm({ ...form, guardians });
  }

  function handleAddGuardian() {
    setForm({ ...form, guardians: [...form.guardians, { name: "", phone: "" }] });
  }

  function handleRemoveGuardian(index) {
    if (form.guardians.length === 1) {
      toast.error("Informe ao menos um responsavel.");
      return;
    }
    setForm({
      ...form,
      guardians: form.guardians.filter((_, i) => i !== index)
    });
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
          <input
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600 text-white"
            placeholder="Search Children..."
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
          <span>Cadastrar Criança</span>
        </button>
      </div>

      {/* Grid Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest text-[10px]">Registry</h2>
        <div className="text-primary text-sm font-semibold flex items-center gap-1 cursor-pointer">
          View All <ExternalLink size={14} />
        </div>
      </div>

      {/* Data Grid */}
      <div className="space-y-4">
        {items.map((item) => {
          const primary = item.guardians && item.guardians.length > 0 ? item.guardians[0] : null;
          return (
            <div key={item.id} className="card p-5 rounded-2xl space-y-4 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-[10px] font-medium uppercase tracking-tighter">Criança</p>
                  <h3 className="text-lg font-bold text-slate-100 mt-0.5">{item.name}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <User className="text-primary" size={20} />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <User className="text-slate-500" size={16} />
                  <div>
                    <p className="text-slate-500 text-[10px]">Responsável</p>
                    <p className="font-semibold text-slate-200 text-sm uppercase">{primary ? primary.name : "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-slate-500" size={16} />
                  <div>
                    <p className="text-slate-500 text-[10px]">Contato</p>
                    <p className="font-semibold text-slate-200 text-sm">{primary ? primary.phone : "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100/5 border border-white/10 flex items-center justify-center gap-2 text-sm font-medium hover:bg-white/10 transition-colors text-white"
                >
                  <Edit size={16} />
                  Editar
                </button>
              </div>
            </div>
          );
        })}
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
        title={editingId ? "Editar Criança" : "Cadastrar Criança"}
        onClose={closeModal}
        contentClassName="sm:max-w-[520px]"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <FormField
            label="Nome da Criança"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="card rounded-2xl border border-white/5 bg-white/5 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest text-[10px]">Responsáveis</h4>
              <button
                type="button"
                className="text-xs font-bold text-primary flex items-center gap-1"
                onClick={handleAddGuardian}
              >
                <PlusCircle size={14} /> Adicionar
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

          <div className="flex gap-3 mt-2">
            <button type="submit" className="button gradient-button flex-1 py-3">
              {editingId ? "Salvar Alterações" : "Concluir Cadastro"}
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
