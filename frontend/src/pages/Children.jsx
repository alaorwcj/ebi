import { useEffect, useState } from "react";
import { get, post, put } from "../api/client.js";
import FormField from "../components/FormField.jsx";
import Table from "../components/Table.jsx";
import { maskPhone } from "../utils/mask.js";
import { validatePhone } from "../utils/validators.js";
import { toast } from "sonner";

const initialForm = {
  name: "",
  guardians: [{ name: "", phone: "" }]
};

export default function Children() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function load() {
    try {
      const data = await get(`/children?search=${encodeURIComponent(search)}&page=${page}`);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.message || "Erro ao carregar crianças.");
    }
  }

  useEffect(() => {
    load();
  }, [page]);

  async function handleSubmit(event) {
    event.preventDefault();
    for (const guardian of form.guardians) {
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
      setForm(initialForm);
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.message || "Erro ao salvar.");
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      guardians: (item.guardians || []).map((guardian) => ({
        name: guardian.name,
        phone: maskPhone(guardian.phone || "")
      }))
    });
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
    <div className="grid grid-2">
      <div className="card">
        <div className="flex-between">
          <h2 className="page-title">Crianças</h2>
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
          rows={items.map((item) => {
            const primary = item.guardians && item.guardians.length > 0 ? item.guardians[0] : null;
            return {
              ...item,
              guardian_name: primary ? primary.name : "",
              guardian_phone: primary ? primary.phone : ""
            };
          })}
          actions={(row) => (
            <button className="button secondary" onClick={() => handleEdit(row)}>
              Editar
            </button>
          )}
        />
        <div className="flex" style={{ marginTop: "12px" }}>
          <button type="button" className="button secondary" onClick={() => setPage(Math.max(1, page - 1))}>
            Anterior
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={() => setPage(page + 1)}
            disabled={page * 10 >= total}
          >
            Próxima
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
          <div className="card" style={{ marginTop: "12px" }}>
            <div className="flex-between">
              <strong>Responsaveis</strong>
              <button type="button" className="button secondary" onClick={handleAddGuardian}>
                Adicionar responsavel
              </button>
            </div>
            {form.guardians.map((guardian, index) => (
              <div key={`guardian-${index}`} style={{ marginTop: "12px" }}>
                <FormField
                  label={`Nome do responsavel ${index + 1}`}
                  value={guardian.name}
                  onChange={(e) => handleGuardianChange(index, "name", e.target.value)}
                  required
                />
                <FormField
                  label={`Contato do responsavel ${index + 1}`}
                  value={guardian.phone}
                  onChange={(e) => handleGuardianChange(index, "phone", maskPhone(e.target.value))}
                  required
                />
                <button
                  type="button"
                  className="button danger"
                  onClick={() => handleRemoveGuardian(index)}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
          <button className="button" style={{ marginTop: "12px" }}>
            {editingId ? "Salvar" : "Cadastrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
