import { useEffect, useState } from "react";
import { get, post, put } from "../api/client.js";
import FormField from "../components/FormField.jsx";
import Table from "../components/Table.jsx";

const initialForm = {
  name: "",
  guardian_name: "",
  guardian_phone: ""
};

export default function Children() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function load() {
    const data = await get(`/children?search=${encodeURIComponent(search)}&page=${page}`);
    setItems(data.items);
    setTotal(data.total);
  }

  useEffect(() => {
    load();
  }, [page]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (editingId) {
      await put(`/children/${editingId}`, form);
    } else {
      await post("/children", form);
    }
    setForm(initialForm);
    setEditingId(null);
    load();
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      guardian_name: item.guardian_name,
      guardian_phone: item.guardian_phone
    });
  }

  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="flex-between">
          <h3>Criancas</h3>
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
            { key: "name", label: "Nome" },
            { key: "guardian_name", label: "Responsavel" },
            { key: "guardian_phone", label: "Contato" }
          ]}
          rows={items}
          actions={(row) => (
            <button className="button secondary" onClick={() => handleEdit(row)}>
              Editar
            </button>
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
      <div className="card">
        <h3>{editingId ? "Editar" : "Cadastrar"}</h3>
        <form onSubmit={handleSubmit}>
          <FormField
            label="Nome da crianca"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <FormField
            label="Nome do responsavel"
            value={form.guardian_name}
            onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
            required
          />
          <FormField
            label="Contato do responsavel"
            value={form.guardian_phone}
            onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })}
            required
          />
          <button className="button" style={{ marginTop: "12px" }}>
            {editingId ? "Salvar" : "Cadastrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
