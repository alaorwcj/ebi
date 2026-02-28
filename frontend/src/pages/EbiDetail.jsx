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
  const [form, setForm] = useState({ child_id: "", guardian_id: "", guardian_name_day: "", guardian_phone_day: "" });
  const [presenceModalOpen, setPresenceModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [checkoutPin, setCheckoutPin] = useState("");
  const [checkoutJustification, setCheckoutJustification] = useState("");
  const [noPinMode, setNoPinMode] = useState(false);
  const [entryPinOpen, setEntryPinOpen] = useState(false);
  const [entryPinCode, setEntryPinCode] = useState("");

  async function load() {
    try {
      const data = await get(`/ebi/${id}`);
      setEbi(data);
    } catch (err) { toast.error(mensagemParaUsuario(err, "Erro ao carregar EBI.")); }
  }

  async function loadChildren() {
    try {
      const data = await get("/children?page=1&page_size=100");
      setChildren(data.items);
    } catch (err) { toast.error(mensagemParaUsuario(err, "Erro ao carregar crianças.")); }
  }

  useEffect(() => { load(); loadChildren(); }, [id]);

  function handleSelectChild(childId) {
    const child = children.find((item) => item.id === Number(childId));
    if (!child) return;
    const primary = (child.guardians || []).length > 0 ? child.guardians[0] : null;
    setForm({ child_id: childId, guardian_id: primary ? String(primary.id) : "", guardian_name_day: primary ? primary.name : "", guardian_phone_day: primary ? maskPhone(primary.phone || "") : "" });
  }

  function handleSelectGuardian(guardianId) {
    const child = children.find((item) => item.id === Number(form.child_id));
    if (!child) return;
    const guardian = (child.guardians || []).find((item) => item.id === Number(guardianId));
    if (!guardian) return;
    setForm({ ...form, guardian_id: guardianId, guardian_name_day: guardian.name, guardian_phone_day: maskPhone(guardian.phone || "") });
  }

  function openPresenceModal() { setForm({ child_id: "", guardian_id: "", guardian_name_day: "", guardian_phone_day: "" }); setPresenceModalOpen(true); }
  function closePresenceModal() { setPresenceModalOpen(false); setForm({ child_id: "", guardian_id: "", guardian_name_day: "", guardian_phone_day: "" }); }

  async function handleAddPresence(event) {
    event.preventDefault();
    if (!form.child_id) return toast.error("Selecione uma criança.");
    if (!form.guardian_name_day?.trim()) return toast.error("Informe o nome do responsável.");
    if (validatePhone(form.guardian_phone_day)) return toast.error(validatePhone(form.guardian_phone_day));

    try {
      const created = await post(`/ebi/${id}/presence`, { child_id: Number(form.child_id), guardian_name_day: form.guardian_name_day, guardian_phone_day: form.guardian_phone_day });
      toast.success("Presença registrada.");
      closePresenceModal();
      if (created?.pin_code) { setEntryPinCode(created.pin_code); setEntryPinOpen(true); }
      load();
    } catch (err) { toast.error(mensagemParaUsuario(err, "Erro ao registrar.")); }
  }

  async function handleCheckout() {
    try {
      const payload = noPinMode
        ? { checkout_justification: checkoutJustification }
        : { pin_code: checkoutPin };
      await post(`/ebi/presence/${confirmId}/checkout`, payload);
      toast.success("Saída registrada.");
      setConfirmId(null); setCheckoutPin(""); setCheckoutJustification(""); setNoPinMode(false); load();
    } catch (err) { toast.error(mensagemParaUsuario(err, "Erro na saída.")); }
  }

  async function handleCloseEbi() {
    try { await post(`/ebi/${id}/close`, {}); toast.success("EBI encerrado."); load(); }
    catch (err) { toast.error(mensagemParaUsuario(err, "Erro ao encerrar EBI.")); }
  }

  async function handleReopenEbi() {
    try { await post(`/ebi/${id}/reopen`, {}); toast.success("EBI reaberto."); setReopenOpen(false); load(); }
    catch (err) { toast.error(mensagemParaUsuario(err, "Erro ao reabrir.")); }
  }

  if (!ebi) {
    return (
      <div className="glass p-6 animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-slate-800/50 mb-4" />
        <div className="h-32 rounded-xl bg-slate-800/30" />
      </div>
    );
  }

  const allClosed = ebi.presences.every((item) => item.exit_at);

  return (
    <div className="space-y-6">
      <div className="glass p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white mb-1">EBI {formatDate(ebi.ebi_date)}</h3>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-medium">Grupo {ebi.group_number}</span>
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${ebi.status === 'FECHADO' || ebi.status === 'ENCERRADO'
                ? 'bg-red-500/10 text-red-500 border-red-500/20 status-glow-closed'
                : 'bg-green-500/10 text-green-500 border-green-500/20 status-glow-open'
                }`}>
                {ebi.status}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="gradient-button px-6"
              onClick={openPresenceModal}
              disabled={ebi.status === "ENCERRADO"}
            >
              <span className="material-symbols-outlined">how_to_reg</span>
              Registrar presença
            </button>
            {role === "COORDENADORA" && (
              <>
                <button
                  type="button"
                  className="button bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                  disabled={!allClosed || ebi.status === "ENCERRADO"}
                  onClick={handleCloseEbi}
                >
                  <span className="material-symbols-outlined">lock</span>
                  Encerrar EBI
                </button>
                <button
                  type="button"
                  className="button secondary"
                  disabled={ebi.status !== "ENCERRADO"}
                  onClick={() => setReopenOpen(true)}
                >
                  <span className="material-symbols-outlined">lock_open</span>
                  Reabrir EBI
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="glass p-1">
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
              className="button secondary py-2 px-3 text-sm h-auto min-h-0 w-auto inline-flex"
              disabled={Boolean(row.exit_at) || ebi.status === "ENCERRADO"}
              onClick={() => { setConfirmId(row.id); setCheckoutPin(""); setCheckoutJustification(""); setNoPinMode(false); }}
            >
              Registrar saída
            </button>
          )}
        />
      </div>

      {role === "COORDENADORA" && (
        <div className="mt-6">
          <Link className="button secondary w-auto inline-flex" to={`/reports/ebi/${id}`}>
            <span className="material-symbols-outlined">bar_chart</span>
            Relatório do EBI
          </Link>
        </div>
      )}

      <Modal open={presenceModalOpen} title="Registrar presença" onClose={closePresenceModal} contentClassName="sm:max-w-[480px]">
        <form onSubmit={handleAddPresence} className="flex flex-col gap-4" noValidate>
          <div>
            <label className="label">Criança</label>
            <select className="input focus:ring-primary focus:border-transparent transition-all" value={form.child_id} onChange={(e) => handleSelectChild(e.target.value)}>
              <option value="">Selecione</option>
              {children.map((child) => (<option key={child.id} value={child.id}>{child.name}</option>))}
            </select>
          </div>
          <div>
            <label className="label">Responsavel</label>
            <select className="input focus:ring-primary focus:border-transparent transition-all" value={form.guardian_id} onChange={(e) => handleSelectGuardian(e.target.value)} disabled={!form.child_id}>
              <option value="">Selecione</option>
              {(children.find((item) => item.id === Number(form.child_id))?.guardians || []).map((guardian) => (
                <option key={guardian.id} value={guardian.id}>{guardian.name}</option>
              ))}
            </select>
          </div>
          <FormField label="Responsável do dia" value={form.guardian_name_day} onChange={(e) => setForm({ ...form, guardian_name_day: e.target.value })} icon={<span className="material-symbols-outlined text-[18px]">person</span>} />
          <FormField label="Contato do dia" value={form.guardian_phone_day} onChange={(e) => setForm({ ...form, guardian_phone_day: maskPhone(e.target.value) })} icon={<span className="material-symbols-outlined text-[18px]">call</span>} />

          <div className="flex gap-3 mt-2">
            <button type="submit" className="button gradient-button flex-1 py-3">Registrar presença</button>
            <button type="button" className="button secondary flex-1" onClick={closePresenceModal}>Cancelar</button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(confirmId)} title="Registrar saída" onClose={() => { setConfirmId(null); setCheckoutPin(""); setCheckoutJustification(""); setNoPinMode(false); }}>
        <div className="space-y-4">
          {!noPinMode ? (
            <>
              <FormField
                label="PIN numérico (4 dígitos)"
                value={checkoutPin}
                onChange={(e) => setCheckoutPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                autoComplete="one-time-code"
                icon={<span className="material-symbols-outlined text-[18px]">pin</span>}
              />
              <button
                type="button"
                className="gradient-button mt-2"
                onClick={handleCheckout}
                disabled={checkoutPin.length !== 4}
              >
                Confirmar saída
              </button>
              <button
                type="button"
                onClick={() => { setNoPinMode(true); setCheckoutPin(""); }}
                style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline", display: "block", margin: "0 auto", padding: "4px 0" }}
              >
                Esqueceu ou perdeu o PIN?
              </button>
            </>
          ) : (
            <>
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "var(--radius)", padding: "12px 14px", marginBottom: "4px" }}>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#f87171", fontWeight: 600 }}>
                  ⚠️ Saída sem PIN — use somente em caso de perda ou esquecimento do PIN.
                </p>
              </div>
              <div>
                <label className="label">Justificativa obrigatória</label>
                <textarea
                  className="input"
                  style={{ height: "auto", minHeight: "90px", paddingLeft: "16px", resize: "vertical" }}
                  placeholder="Descreva o motivo da saída sem PIN (mínimo 10 caracteres)..."
                  value={checkoutJustification}
                  onChange={(e) => setCheckoutJustification(e.target.value)}
                  maxLength={500}
                />
                <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "var(--muted)", textAlign: "right" }}>
                  {checkoutJustification.length}/500
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="button secondary"
                  style={{ flex: 1 }}
                  onClick={() => { setNoPinMode(false); setCheckoutJustification(""); }}
                >
                  Voltar ao PIN
                </button>
                <button
                  type="button"
                  style={{ flex: 2 }}
                  className="gradient-button"
                  onClick={handleCheckout}
                  disabled={checkoutJustification.trim().length < 10}
                >
                  Confirmar saída sem PIN
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal open={entryPinOpen} title="PIN gerado" onClose={() => { setEntryPinOpen(false); setEntryPinCode(""); }}>
        <p className="text-slate-400 mb-4 text-center">Informe este PIN ao responsável para liberar a saída:</p>
        <div className="text-4xl font-extrabold tracking-[0.2em] text-center text-primary bg-primary/10 rounded-2xl py-6 mb-6 border border-primary/20">
          {entryPinCode}
        </div>
        <button type="button" className="gradient-button" onClick={() => { setEntryPinOpen(false); setEntryPinCode(""); }}>Entendi</button>
      </Modal>

      <ConfirmModal open={reopenOpen} title="Reabrir EBI" description="Confirma a reabertura deste EBI?" onConfirm={handleReopenEbi} onClose={() => setReopenOpen(false)} />
    </div>
  );
}
