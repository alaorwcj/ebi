import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { get, post } from "../api/client.js";
import FormField from "../components/FormField.jsx";
import Table from "../components/Table.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import Modal from "../components/Modal.jsx";
import { formatDate, formatDateTime } from "../utils/format.js";
import { getRole } from "../api/auth.js";
import { maskPhone } from "../utils/mask.js";
import { mensagemParaUsuario } from "../utils/apiErrors.js";
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
  const [presenceModalOpen, setPresenceModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [checkoutPin, setCheckoutPin] = useState("");
  const [entryPinOpen, setEntryPinOpen] = useState(false);
  const [entryPinCode, setEntryPinCode] = useState("");

  async function load() {
    try {
      const data = await get(`/ebi/${id}`);
      setEbi(data);
    } catch (err) {
      toast.error(mensagemParaUsuario(err, "Erro ao carregar EBI."));
    }
  }

  async function loadChildren() {
    try {
      const data = await get("/children?page=1&page_size=100");
      setChildren(data.items);
    } catch (err) {
      toast.error(mensagemParaUsuario(err, "Erro ao carregar crianças."));
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

  function openPresenceModal() {
    setForm({
      child_id: "",
      guardian_id: "",
      guardian_name_day: "",
      guardian_phone_day: ""
    });
    setPresenceModalOpen(true);
  }

  function closePresenceModal() {
    setPresenceModalOpen(false);
    setForm({
      child_id: "",
      guardian_id: "",
      guardian_name_day: "",
      guardian_phone_day: ""
    });
  }

  async function handleAddPresence(event) {
    event.preventDefault();
    if (!form.child_id) {
      toast.error("Selecione uma criança.");
      return;
    }
    if (!form.guardian_name_day?.trim()) {
      toast.error("Informe o nome do responsável do dia.");
      return;
    }
    const phoneError = validatePhone(form.guardian_phone_day);
    if (phoneError) {
      toast.error(phoneError);
      return;
    }
    try {
      const created = await post(`/ebi/${id}/presence`, {
        child_id: Number(form.child_id),
        guardian_name_day: form.guardian_name_day,
        guardian_phone_day: form.guardian_phone_day
      });
      toast.success("Presença registrada com sucesso.");
      closePresenceModal();
      if (created?.pin_code) {
        setEntryPinCode(created.pin_code);
        setEntryPinOpen(true);
      }
      load();
    } catch (err) {
      toast.error(mensagemParaUsuario(err, "Erro ao registrar presença."));
    }
  }

  async function handleCheckout() {
    try {
      await post(`/ebi/presence/${confirmId}/checkout`, { pin_code: checkoutPin });
      toast.success("Saída registrada com sucesso.");
      setConfirmId(null);
      setCheckoutPin("");
      load();
    } catch (err) {
      toast.error(mensagemParaUsuario(err, "Erro ao registrar saída."));
    }
  }

  async function handleCloseEbi() {
    try {
      await post(`/ebi/${id}/close`, {});
      toast.success("EBI encerrado com sucesso.");
      load();
    } catch (err) {
      toast.error(mensagemParaUsuario(err, "Erro ao encerrar EBI."));
    }
  }

  async function handleReopenEbi() {
    try {
      await post(`/ebi/${id}/reopen`, {});
      toast.success("EBI reaberto com sucesso.");
      setReopenOpen(false);
      load();
    } catch (err) {
      toast.error(mensagemParaUsuario(err, "Erro ao reabrir EBI."));
    }
  }

  if (!ebi) {
    return (
      <div className="card rounded-2xl border border-border/50 shadow-xl animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-muted/50 mb-4" />
        <div className="h-32 rounded-xl bg-muted/30" />
      </div>
    );
  }

  const allClosed = ebi.presences.every((item) => item.exit_at);

  return (
    <div className="card rounded-2xl border border-border/50 shadow-xl">
      <div className="page-header flex-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">EBI {formatDate(ebi.ebi_date)}</h3>
          <p className="muted">Grupo {ebi.group_number}</p>
          <p className="muted">Status: {ebi.status}</p>
        </div>
        <div className="page-header-actions flex gap-2 flex-wrap">
          <button
            type="button"
            className="button rounded-xl"
            onClick={openPresenceModal}
            disabled={ebi.status === "ENCERRADO"}
          >
            Registrar presença
          </button>
          {role === "COORDENADORA" && (
            <>
              <button type="button" className="button danger rounded-xl" disabled={!allClosed || ebi.status === "ENCERRADO"} onClick={handleCloseEbi}>
                Encerrar EBI
              </button>
              <button
                type="button"
                className="button secondary rounded-xl"
                disabled={ebi.status !== "ENCERRADO"}
                onClick={() => setReopenOpen(true)}
              >
                Reabrir EBI
              </button>
            </>
          )}
        </div>
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
            className="button secondary rounded-xl"
            disabled={Boolean(row.exit_at) || ebi.status === "ENCERRADO"}
            onClick={() => {
              setConfirmId(row.id);
              setCheckoutPin("");
            }}
          >
            Registrar saída
          </button>
        )}
      />
      <div className="mt-6">
        <Link className="button secondary rounded-xl" to={`/reports/ebi/${id}`}>Relatório do EBI</Link>
      </div>

      <Modal
        open={presenceModalOpen}
        title="Registrar presença"
        onClose={closePresenceModal}
        contentClassName="sm:max-w-[480px]"
      >
        <form onSubmit={handleAddPresence} className="flex flex-col gap-2" noValidate>
          <label className="label">Criança</label>
          <select
            className="input rounded-xl"
            value={form.child_id}
            onChange={(e) => handleSelectChild(e.target.value)}
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
            className="input rounded-xl"
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
          />
          <FormField
            label="Contato do dia"
            value={form.guardian_phone_day}
            onChange={(e) => setForm({ ...form, guardian_phone_day: maskPhone(e.target.value) })}
          />
          <div className="flex gap-3 mt-4">
            <button type="submit" className="button rounded-xl">Registrar presença</button>
            <button type="button" className="button secondary rounded-xl" onClick={closePresenceModal}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(confirmId)}
        title="PIN de saída"
        onClose={() => {
          setConfirmId(null);
          setCheckoutPin("");
        }}
      >
        <FormField
          label="PIN (4 dígitos)"
          value={checkoutPin}
          onChange={(e) => setCheckoutPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          inputMode="numeric"
          autoComplete="one-time-code"
        />
        <button
          type="button"
          className="button rounded-xl"
          onClick={handleCheckout}
          disabled={checkoutPin.length !== 4}
        >
          Confirmar saída
        </button>
      </Modal>
      <Modal
        open={entryPinOpen}
        title="PIN gerado"
        onClose={() => {
          setEntryPinOpen(false);
          setEntryPinCode("");
        }}
      >
        <p className="muted">Informe este PIN ao responsável para liberar a saída:</p>
        <div style={{ fontSize: "24px", fontWeight: "700", letterSpacing: "4px" }}>
          {entryPinCode}
        </div>
        <button
          type="button"
          className="button secondary rounded-xl"
          onClick={() => {
            setEntryPinOpen(false);
            setEntryPinCode("");
          }}
        >
          Entendi
        </button>
      </Modal>
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
