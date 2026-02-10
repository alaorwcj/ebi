import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get, post } from "../api/client.js";
import FormField from "../components/FormField.jsx";
import Table from "../components/Table.jsx";
import { formatDate } from "../utils/format.js";
import { getRole } from "../api/auth.js";

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
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  async function load() {
    const data = await get(`/ebi?search=${encodeURIComponent(search)}&page=${page}`);
    setItems(data.items);
    setTotal(data.total);
  }

  async function loadUsers() {
    const data = await get("/users?page=1&page_size=100");
    setUsers(data.items);
  }

  useEffect(() => {
    load();
    if (role === "COORDENADORA") {
      loadUsers();
    }
  }, [page]);

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      coordinator_id: Number(form.coordinator_id),
      collaborator_ids: form.collaborator_ids.map(Number)
    };
    await post("/ebi", payload);
    setForm(initialForm);
    load();
  }

  function handleCollaborators(value) {
    const selected = Array.from(value.target.selectedOptions).map((opt) => opt.value);
    setForm({ ...form, collaborator_ids: selected });
  }

  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="flex-between">
          <h3>EBIs</h3>
          <div className="flex">
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
            {role === "COORDENADORA" && (
              <Link className="button" to="#form">Criar EBI</Link>
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
            <div className="flex">
              <Link className="button secondary" to={`/ebis/${row.id}`}>
                Abrir
              </Link>
              {role === "COORDENADORA" && (
                <Link className="button secondary" to={`/reports/ebi/${row.id}`}>
                  Relatorio
                </Link>
              )}
            </div>
          )}
        />
        <div className="flex" style={{ marginTop: "12px" }}>
          <button className="button secondary" onClick={() => setPage(Math.max(1, page - 1))}>
            Anterior
          </button>
          <button
            className="button secondary"
            onClick={() => setPage(page + 1)}
            disabled={page * 10 >= total}
          >
            Proxima
          </button>
        </div>
      </div>
      {role === "COORDENADORA" && (
        <div className="card" id="form">
          <h3>Criar EBI</h3>
          <form onSubmit={handleSubmit}>
            <FormField
              label="Data"
              type="date"
              value={form.ebi_date}
              onChange={(e) => setForm({ ...form, ebi_date: e.target.value })}
              required
            />
            <p className="muted">Formato: DD/MM/AAAA</p>
            <label className="label">Grupo</label>
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
            <label className="label" style={{ marginTop: "12px" }}>Coordenadora</label>
            <select
              className="input"
              value={form.coordinator_id}
              onChange={(e) => setForm({ ...form, coordinator_id: e.target.value })}
              required
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
            <button className="button" style={{ marginTop: "12px" }}>Criar</button>
          </form>
        </div>
      )}
    </div>
  );
}
