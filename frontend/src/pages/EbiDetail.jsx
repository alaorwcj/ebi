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
import { toast } from "sonner";

export default function EbiDetail() {
  const { id } = useParams();
  const role = getRole();
  const [ebi, setEbi] = useState(null);
  const [children, setChildren] = useState([]);
  const [form, setForm] = useState({
    child_id: "",
    guardian_id: "",
    guardian_name_day: "",
    guardian_phone_day: ""
  });
  const [confirmId, setConfirmId] = useState(null);
  const [reopenOpen, setReopenOpen] = useState(false);

  async function load() {
    try {
      const data = await get(`/ebi/${id}`);
      setEbi(data);
    } catch (err) {
      toast.error(err.message || "Erro ao carregar EBI.");
    }
  }

  async function loadChildren() {
    try {
      const data = await get("/children?page=1&page_size=200");
      setChildren(data.items);
    } catch (err) {
      toast.error(err.message || "Erro ao carregar crianças.");
    }
  }

  useEffect(() => {
    load();
    loadChildren();
  }, [id]);

  function handleSelectChild(childId) {
    const child = children.find((item) => item.id === Number(childId));
    if (!child) return;
    const guardians = child.guardians || [];
    const primary = guardians.length > 0 ? guardians[0] : null;
    setForm({
      child_id: childId,
      guardian_id: primary ? String(primary.id) : "",
      guardian_name_day: primary ? primary.name : "",
      guardian_phone_day: primary ? maskPhone(primary.phone || "") : ""
    });
  }

  function handleSelectGuardian(guardianId) {
    const child = children.find((item) => item.id === Number(form.child_id));
    if (!child) return;
    const guardian = (child.guardians || []).find((item) => item.id === Number(guardianId));
    if (!guardian) return;
    setForm({
      ...form,
      guardian_id: guardianId,
      guardian_name_day: guardian.name,
      guardian_phone_day: maskPhone(guardian.phone || "")
    });
  }

  async function handleAddPresence(event) {
    event.preventDefault();
    const phoneError = validatePhone(form.guardian_phone_day);
    if (phoneError) {
      toast.error(phoneError);
      return;
    }
    try {
      await post(`/ebi/${id}/presence`, {
        child_id: Number(form.child_id),
        guardian_name_day: form.guardian_name_day,
        guardian_phone_day: form.guardian_phone_day
      });
      toast.success("Presença registrada com sucesso.");
      setForm({ child_id: "", guardian_name_day: "", guardian_phone_day: "" });
      load();
    } catch (err) {
      toast.error(err.message || "Erro ao registrar presença.");
    }
  }

  async function handleCheckout() {
    try {
      await post(`/ebi/presence/${confirmId}/checkout`, {});
      toast.success("Saída registrada com sucesso.");
      setConfirmId(null);
      load();
    } catch (err) {
      toast.error(err.message || "Erro ao registrar saída.");
    }
  }

  async function handleCloseEbi() {
    try {
      await post(`/ebi/${id}/close`, {});
      toast.success("EBI encerrado com sucesso.");
      load();
    } catch (err) {
      toast.error(err.message || "Erro ao encerrar EBI.");
    }
  }

  async function handleReopenEbi() {
    try {
      await post(`/ebi/${id}/reopen`, {});
      toast.success("EBI reaberto com sucesso.");
      setReopenOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || "Erro ao reabrir EBI.");
    }
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
              <button type="button" className="button danger" disabled={!allClosed || ebi.status === "ENCERRADO"} onClick={handleCloseEbi}>
                Encerrar EBI
              </button>
              <button
                type="button"
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
            { key: "child_name", label: "Criança" },
            { key: "guardian_name_day", label: "Responsável" },
            { key: "entry_at", label: "Entrada" },
            { key: "exit_at", label: "Saída" }
          ]}
          rows={ebi.presences.map((item) => ({
            ...item,
            entry_at: formatDateTime(item.entry_at),
            exit_at: formatDateTime(item.exit_at)
          }))}
          actions={(row) => (
            <button
              type="button"
              className="button secondary"
              disabled={Boolean(row.exit_at) || ebi.status === "ENCERRADO"}
              onClick={() => setConfirmId(row.id)}
            >
              Registrar saída
            </button>
          )}
        />
        <div style={{ marginTop: "12px" }}>
          <Link className="button secondary" to={`/reports/ebi/${id}`}>Relatório do EBI</Link>
        </div>
      </div>
      <div className="card">
        <h3>Registrar presença</h3>
        <form onSubmit={handleAddPresence}>
          <label className="label">Criança</label>
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
          <label className="label" style={{ marginTop: "12px" }}>Responsavel</label>
          <select
            className="input"
            value={form.guardian_id}
            onChange={(e) => handleSelectGuardian(e.target.value)}
            disabled={!form.child_id}
          >
            <option value="">Selecione</option>
            {(children.find((item) => item.id === Number(form.child_id))?.guardians || []).map(
              (guardian) => (
                <option key={guardian.id} value={guardian.id}>
                  {guardian.name}
                </option>
              )
            )}
          </select>
          <FormField
            label="Responsável do dia"
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
          <button type="submit" className="button" style={{ marginTop: "12px" }} disabled={ebi.status === "ENCERRADO"}>
            Registrar presença
          </button>
        </form>
      </div>
      <ConfirmModal
        open={Boolean(confirmId)}
        title="Registrar saída"
        description="Confirma o registro de saída desta criança?"
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
