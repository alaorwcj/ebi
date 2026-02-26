import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get, post } from "../api/client.js";
import DatePicker from "../components/DatePicker.jsx";
import FormField from "../components/FormField.jsx";
import Modal from "../components/Modal.jsx";
import { formatDate } from "../utils/format.js";
import { mensagemParaUsuario } from "../utils/apiErrors.js";
import { getRole } from "../api/auth.js";
import { toast } from "sonner";
import { Search, PlusCircle, ExternalLink, BarChart3, Users } from "lucide-react";

const initialForm = {
  ebi_date: "",
  group_number: 1,
  coordinator_id: "",
  collaborator_ids: []
};

export default function Ebis() {
  const role = getRole();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  async function load() {
    try {
      const data = await get(`/ebi?search=${encodeURIComponent(search)}&page=${page}`);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(mensagemParaUsuario(err, "Erro ao carregar EBIs."));
    }
  }

  async function loadUsers() {
    try {
      const data = await get("/users?page=1&page_size=100");
      setUsers(data.items);
    } catch (err) {
      toast.error(mensagemParaUsuario(err, "Erro ao carregar colaboradoras."));
    }
  }

  useEffect(() => {
    load();
    if (role === "COORDENADORA" || role === "ADMINISTRADOR") {
      loadUsers();
    }
  }, [page]);

  function openCreateModal() {
    setForm(initialForm);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(initialForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.ebi_date) {
      toast.error("Informe a data do EBI.");
      return;
    }
    if (!form.coordinator_id) {
      toast.error("Selecione uma coordenadora.");
      return;
    }
    try {
      const payload = {
        ...form,
        coordinator_id: Number(form.coordinator_id),
        collaborator_ids: form.collaborator_ids.map(Number)
      };
      await post("/ebi", payload);
      toast.success("EBI criado com sucesso.");
      closeModal();
      load();
    } catch (err) {
      toast.error(mensagemParaUsuario(err, "Erro ao criar EBI."));
    }
  }

  function handleCollaborators(value) {
    const selected = Array.from(value.target.selectedOptions).map((opt) => opt.value);
    setForm({ ...form, collaborator_ids: selected });
  }

  return (
    <div className="space-y-6">
      {/* Action Bar (Search + Create) */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
          <input
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600 text-white"
            placeholder="Search EBIs..."
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
        {role === "COORDENADORA" && (
          <button
            className="gradient-button w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white shadow-lg active:scale-95 transition-transform"
            onClick={openCreateModal}
          >
            <PlusCircle size={22} />
            <span>Criar EBI</span>
          </button>
        )}
      </div>

      {/* Grid Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest text-[10px]">Recent Entries</h2>
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
                <p className="text-slate-500 text-[10px] font-medium uppercase tracking-tighter">Data do Registro</p>
                <h3 className="text-lg font-bold text-slate-100 mt-0.5">{formatDate(item.ebi_date)}</h3>
              </div>
              <span className={`px-3 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${item.status === 'FECHADO'
                  ? 'bg-red-500/10 text-red-500 border-red-500/20 status-glow-closed'
                  : 'bg-green-500/10 text-green-500 border-green-500/20 status-glow-open'
                }`}>
                {item.status}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Users className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-slate-500 text-[10px]">Turma / Grupo</p>
                <p className="font-semibold text-slate-200 uppercase text-sm">Grupo {item.group_number}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Link to={`/ebis/${item.id}`} className="flex-1 py-2.5 rounded-xl bg-slate-100/5 border border-white/10 flex items-center justify-center gap-2 text-sm font-medium hover:bg-white/10 transition-colors text-white">
                <ExternalLink size={16} />
                Abrir
              </Link>
              {(role === "COORDENADORA" || role === "ADMINISTRADOR") && (
                <Link to={`/reports/ebi/${item.id}`} className="flex-1 py-2.5 rounded-xl bg-slate-100/5 border border-white/10 flex items-center justify-center gap-2 text-sm font-medium hover:bg-white/10 transition-colors text-white">
                  <BarChart3 size={16} />
                  Relatório
                </Link>
              )}
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

      {/* Modal logic remains for creation */}
      {role === "COORDENADORA" && (
        <Modal
          open={modalOpen}
          title="Criar EBI"
          onClose={closeModal}
          contentClassName="sm:max-w-[480px]"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <DatePicker
              label="Data"
              value={form.ebi_date}
              onChange={(e) => setForm({ ...form, ebi_date: e.target.value })}
            />
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

            <FormField label="Coordenadora">
              <select
                className="input"
                value={form.coordinator_id}
                onChange={(e) => setForm({ ...form, coordinator_id: e.target.value })}
              >
                <option value="">Selecione</option>
                {users
                  .filter((user) => user.role === "COORDENADORA")
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name}
                    </option>
                  ))}
              </select>
            </FormField>

            <FormField label="Colaboradoras presentes">
              <select
                className="input"
                multiple
                value={form.collaborator_ids}
                onChange={handleCollaborators}
              >
                {users
                  .filter((user) => user.role === "COLABORADORA")
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name}
                    </option>
                  ))}
              </select>
            </FormField>

            <div className="flex gap-3 mt-2">
              <button type="submit" className="button gradient-button flex-1 py-3">Criar</button>
              <button type="button" className="button secondary flex-1" onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
