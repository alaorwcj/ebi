import { useEffect, useState } from "react";
import { get, post, put } from "../api/client.js";
import FormField from "../components/FormField.jsx";
import Table from "../components/Table.jsx";
import Modal from "../components/Modal.jsx";
import { maskPhone } from "../utils/mask.js";
import { mensagemParaUsuario } from "../utils/apiErrors.js";
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
    <div className="card rounded-2xl border border-border/50 shadow-xl">
      <div className="page-header flex-between">
        <h2 className="text-xl font-semibold text-foreground">Crianças</h2>
        <div className="page-header-actions flex gap-2">
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
          <button type="button" className="button rounded-xl" onClick={openCreateModal}>
            Cadastrar
          </button>
        </div>
      </div>
      <Table
        columns={[
          { key: "name", label: "Nome" },
          { key: "guardian_name", label: "Responsável" },
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
          <button className="button secondary rounded-xl" onClick={() => openEditModal(row)}>
            Editar
          </button>
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

      <Modal
        open={modalOpen}
        title={editingId ? "Editar criança" : "Cadastrar criança"}
        onClose={closeModal}
        contentClassName="sm:max-w-[520px]"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>
          <FormField
            label="Nome da crianca"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="card rounded-xl border border-border/50 shadow-md mt-4 p-4">
            <div className="flex-between">
              <strong className="text-sm font-medium">Responsáveis</strong>
              <button type="button" className="button secondary rounded-xl text-sm" onClick={handleAddGuardian}>
                Adicionar responsável
              </button>
            </div>
            {form.guardians.map((guardian, index) => (
              <div key={`guardian-${index}`} style={{ marginTop: "12px" }}>
                <FormField
                  label={`Nome do responsavel ${index + 1}`}
                  value={guardian.name}
                  onChange={(e) => handleGuardianChange(index, "name", e.target.value)}
                />
                <FormField
                  label={`Contato do responsavel ${index + 1}`}
                  value={guardian.phone}
                  onChange={(e) => handleGuardianChange(index, "phone", maskPhone(e.target.value))}
                />
                <button
                  type="button"
                  className="button danger rounded-xl text-sm"
                  onClick={() => handleRemoveGuardian(index)}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="button rounded-xl">
              {editingId ? "Salvar" : "Cadastrar"}
            </button>
            <button type="button" className="button secondary rounded-xl" onClick={closeModal}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
