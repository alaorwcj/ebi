import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get, post } from "../api/client.js";
import DatePicker from "../components/DatePicker.jsx";
import FormField from "../components/FormField.jsx";
import Table from "../components/Table.jsx";
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
    if (role === "COORDENADORA") {
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
    <div className="card rounded-2xl border border-border/50 shadow-xl">
      <div className="page-header flex-between">
        <h2 className="text-xl font-semibold text-foreground">EBIs</h2>
        <div className="page-header-actions flex" style={{ gap: "8px" }}>
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
          {role === "COORDENADORA" && (
            <button type="button" className="button rounded-xl" onClick={openCreateModal}>
              Criar EBI
            </button>
          )}
        </div>
      </div>
      <Table
        columns={[
          { key: "ebi_date", label: "Data" },
          { key: "group_number", label: "Grupo" },
          { key: "status", label: "Status" }
        ]}
        rows={items.map((item) => ({
          ...item,
          ebi_date: formatDate(item.ebi_date)
        }))}
        actions={(row) => (
          <div className="flex gap-2 justify-end">
            <Link className="button secondary rounded-xl" to={`/ebis/${row.id}`}>
              Abrir
            </Link>
            {role === "COORDENADORA" && (
              <Link className="button secondary rounded-xl" to={`/reports/ebi/${row.id}`}>
                Relatório
              </Link>
            )}
          </div>
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

      {role === "COORDENADORA" && (
        <Modal
          open={modalOpen}
          title="Criar EBI"
          onClose={closeModal}
          contentClassName="sm:max-w-[480px]"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>
            <DatePicker
              label="Data"
              value={form.ebi_date}
              onChange={(e) => setForm({ ...form, ebi_date: e.target.value })}
            />
            <label className="label">Grupo</label>
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
            <label className="label" style={{ marginTop: "12px" }}>Coordenadora</label>
            <select
              className="input rounded-xl"
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
            <label className="label" style={{ marginTop: "12px" }}>Colaboradoras presentes</label>
            <select
              className="input rounded-xl"
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
            <div className="flex gap-3 mt-4">
              <button type="submit" className="button rounded-xl">Criar</button>
              <button type="button" className="button secondary rounded-xl" onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
