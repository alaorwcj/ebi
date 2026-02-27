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
  }, [page, search]);

  function openCreateModal() { setForm(initialForm); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setForm(initialForm); }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.ebi_date) return toast.error("Informe a data do EBI.");
    if (!form.coordinator_id) return toast.error("Selecione uma coordenadora.");
    try {
      const payload = { ...form, coordinator_id: Number(form.coordinator_id), collaborator_ids: form.collaborator_ids.map(Number) };
      await post("/ebi", payload);
      toast.success("EBI criado com sucesso.");
      closeModal();
      load();
    } catch (err) { toast.error(mensagemParaUsuario(err, "Erro ao criar EBI.")); }
  }

  function handleSearch(e) {
    if (e.key === 'Enter') load();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">search</span>
          <input
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600 text-slate-100"
            placeholder="Search EBIs..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
        {role === "COORDENADORA" && (
          <button
            onClick={openCreateModal}
            className="gradient-button w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white shadow-lg shadow-primary/20 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span>Criar EBI</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest text-xs">Recent Entries</h2>
        <button className="text-primary text-sm font-semibold flex items-center gap-1">
          View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const isClosed = item.status === "FECHADO";
          // Alternate accent styles based on index or status to showcase design richness
          const accentColorClass = (index % 2 === 1) ? 'accent-purple' : 'primary';

          return (
            <div key={item.id} className="glass p-5 rounded-2xl space-y-4 relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${accentColorClass}/5 rounded-full -mr-16 -mt-16 blur-3xl`}></div>

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-tighter">Data do Registro</p>
                  <h3 className="text-lg font-bold text-slate-100 mt-0.5">{formatDate(item.ebi_date)}</h3>
                </div>
                {isClosed ? (
                  <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded-full border border-red-500/20 status-glow-closed uppercase tracking-wider">Fechado</span>
                ) : (
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full border border-green-500/20 status-glow-open uppercase tracking-wider">Aberto</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${accentColorClass}/10 flex items-center justify-center border border-${accentColorClass}/20`}>
                  <span className={`material-symbols-outlined text-${accentColorClass}`}>groups</span>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Turma / Grupo</p>
                  <p className="font-semibold text-slate-200 uppercase">Grupo {item.group_number}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 relative z-10">
                <Link to={`/ebis/${item.id}`} className="flex-1 py-2.5 rounded-xl bg-slate-100/5 border border-white/10 flex items-center justify-center gap-2 text-sm font-medium hover:bg-white/10 transition-colors text-white">
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  Abrir
                </Link>
                {role === "COORDENADORA" && (
                  <Link to={`/reports/ebi/${item.id}`} className="flex-1 py-2.5 rounded-xl bg-slate-100/5 border border-white/10 flex items-center justify-center gap-2 text-sm font-medium hover:bg-white/10 transition-colors text-white">
                    <span className="material-symbols-outlined text-sm">bar_chart</span>
                    Relatório
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
                {users.filter(u => u.role === "COORDENADORA").map((u) => (
                  <option key={u.id} value={u.id}>{u.full_name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Colaboradoras presentes">
              <select
                className="input"
                multiple
                value={form.collaborator_ids}
                onChange={(e) => setForm({ ...form, collaborator_ids: Array.from(e.target.selectedOptions, o => o.value) })}
              >
                {users.filter(u => u.role === "COLABORADORA").map((u) => (
                  <option key={u.id} value={u.id}>{u.full_name}</option>
                ))}
              </select>
            </FormField>

            <div className="flex gap-3 mt-4">
              <button type="submit" className="flex-1 gradient-button rounded-xl py-3 text-white font-bold tracking-wide">Criar</button>
              <button type="button" className="flex-1 bg-slate-100/5 border border-white/10 rounded-xl py-3 text-white font-medium" onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
