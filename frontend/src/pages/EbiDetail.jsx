import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { get, post } from "../api/client.js";
import FormField from "../components/FormField.jsx";
import Table from "../components/Table.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { formatDate, formatDateTime } from "../utils/format.js";
import { getRole } from "../api/auth.js";
import { maskPhone } from "../utils/mask.js";
import { validatePhone } from "../utils/validators.js";

export default function EbiDetail() {
  const { id } = useParams();
  const role = getRole();
  const [ebi, setEbi] = useState(null);
  const [children, setChildren] = useState([]);
  const [form, setForm] = useState({
    child_id: "",
    guardian_name_day: "",
    guardian_phone_day: ""
  });
  const [confirmId, setConfirmId] = useState(null);
  const [reopenOpen, setReopenOpen] = useState(false);

  async function load() {
    const data = await get(`/ebi/${id}`);
    setEbi(data);
  }

  async function loadChildren() {
    const data = await get("/children?page=1&page_size=200");
    setChildren(data.items);
  }

  useEffect(() => {
    load();
    loadChildren();
  }, [id]);

  function handleSelectChild(childId) {
    const child = children.find((item) => item.id === Number(childId));
    if (!child) return;
    setForm({
      child_id: childId,
      guardian_name_day: child.guardian_name,
      guardian_phone_day: maskPhone(child.guardian_phone || "")
    });
  }

  async function handleAddPresence(event) {
    event.preventDefault();
    const phoneError = validatePhone(form.guardian_phone_day);
    if (phoneError) {
      alert(phoneError);
      return;
    }
    await post(`/ebi/${id}/presence`, {
      child_id: Number(form.child_id),
      guardian_name_day: form.guardian_name_day,
      guardian_phone_day: form.guardian_phone_day
    });
    setForm({ child_id: "", guardian_name_day: "", guardian_phone_day: "" });
    load();
  }

  async function handleCheckout() {
    await post(`/ebi/presence/${confirmId}/checkout`, {});
    setConfirmId(null);
    load();
  }

  async function handleCloseEbi() {
    await post(`/ebi/${id}/close`, {});
    load();
  }

  async function handleReopenEbi() {
    await post(`/ebi/${id}/reopen`, {});
    setReopenOpen(false);
    load();
  }

  if (!ebi) return <div className="card">Carregando...</div>;

  const allClosed = ebi.presences.every((item) => item.exit_at);

  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="flex-between">
          <div>
            <h3>EBI {formatDate(ebi.ebi_date)}</h3>
            <p className="muted">Grupo {ebi.group_number}</p>
            <p className="muted">Status: {ebi.status}</p>
          </div>
          {role === "COORDENADORA" && (
            <div className="flex">
              <button className="button" disabled={!allClosed || ebi.status === "ENCERRADO"} onClick={handleCloseEbi}>
                Encerrar EBI
              </button>
              <button
                className="button secondary"
                disabled={ebi.status !== "ENCERRADO"}
                onClick={() => setReopenOpen(true)}
              >
                Reabrir EBI
              </button>
            </div>
          )}
        </div>
        <Table
          columns={[
            { key: "child_name", label: "Crianca" },
            { key: "guardian_name_day", label: "Responsavel" },
            { key: "entry_at", label: "Entrada" },
            { key: "exit_at", label: "Saida" }
          ]}
          rows={ebi.presences.map((item) => ({
            ...item,
            entry_at: formatDateTime(item.entry_at),
            exit_at: formatDateTime(item.exit_at)
          }))}
          actions={(row) => (
            <button
              className="button secondary"
              disabled={Boolean(row.exit_at) || ebi.status === "ENCERRADO"}
              onClick={() => setConfirmId(row.id)}
            >
              Registrar saida
            </button>
          )}
        />
        <div style={{ marginTop: "12px" }}>
          <Link className="button secondary" to={`/reports/ebi/${id}`}>Relatorio do EBI</Link>
        </div>
      </div>
      <div className="card">
        <h3>Registrar Presenca</h3>
        <form onSubmit={handleAddPresence}>
          <label className="label">Crianca</label>
          <select
            className="input"
            value={form.child_id}
            onChange={(e) => handleSelectChild(e.target.value)}
            required
          >
            <option value="">Selecione</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>
          <FormField
            label="Responsavel do dia"
            value={form.guardian_name_day}
            onChange={(e) => setForm({ ...form, guardian_name_day: e.target.value })}
            required
          />
          <FormField
            label="Contato do dia"
            value={form.guardian_phone_day}
            onChange={(e) => setForm({ ...form, guardian_phone_day: maskPhone(e.target.value) })}
            required
          />
          <button className="button" style={{ marginTop: "12px" }} disabled={ebi.status === "ENCERRADO"}>
            Adicionar presenca
          </button>
        </form>
      </div>
      <ConfirmModal
        open={Boolean(confirmId)}
        title="Registrar saida"
        description="Confirma o registro de saida desta crianca?"
        onConfirm={handleCheckout}
        onClose={() => setConfirmId(null)}
      />
      <ConfirmModal
        open={reopenOpen}
        title="Reabrir EBI"
        description="Confirma a reabertura deste EBI?"
        onConfirm={handleReopenEbi}
        onClose={() => setReopenOpen(false)}
      />
    </div>
  );
}
