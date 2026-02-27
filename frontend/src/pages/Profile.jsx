import { useEffect, useState } from "react";
import { get, put } from "../api/client.js";
import DatePicker from "../components/DatePicker.jsx";
import FormField from "../components/FormField.jsx";
import { maskCPF, maskPhone, maskZipCode } from "../utils/mask.js";
import { mensagemParaUsuario } from "../utils/apiErrors.js";
import { validatePhone } from "../utils/validators.js";
import { toast } from "sonner";

const documentTypeLabels = {
  ANTECEDENTES_CRIMINAIS: "Antecedentes Criminais",
  CERTIDAO_NEGATIVA_ESTADUAL: "Certidão Negativa",
  RG: "RG",
  CPF: "CPF",
  COMPROVANTE_RESIDENCIA: "Residência",
  ATESTADO_SAUDE: "Atestado de Saúde",
  OUTROS: "Outros"
};

const brazilianStates = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    full_name: "", phone: "", cpf: "", rg: "", birth_date: "", address: "", city: "", state: "SP", zip_code: "", emergency_contact_name: "", emergency_contact_phone: "", password: ""
  });
  const [uploading, setUploading] = useState(false);

  async function loadProfile() {
    try {
      const data = await get("/profile/me");
      setProfile(data);
      setForm({
        full_name: data.full_name || "", phone: maskPhone(data.phone || ""), cpf: maskCPF(data.cpf || ""), rg: data.rg || "", birth_date: data.birth_date || "", address: data.address || "", city: data.city || "", state: data.state || "SP", zip_code: maskZipCode(data.zip_code || ""), emergency_contact_name: data.emergency_contact_name || "", emergency_contact_phone: maskPhone(data.emergency_contact_phone || ""), password: ""
      });
    } catch (err) { toast.error(mensagemParaUsuario(err, "Erro ao carregar perfil.")); }
  }

  useEffect(() => { loadProfile(); }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.full_name?.trim()) return toast.error("Informe o nome completo.");
    if (validatePhone(form.phone)) return toast.error(validatePhone(form.phone));
    try {
      await put("/profile/me", form);
      toast.success("Perfil atualizado.");
      loadProfile();
    } catch (err) { toast.error(mensagemParaUsuario(err, "Erro ao salvar perfil.")); }
  }

  async function handleFileUpload(event, documentType) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast.error("Arquivo muito grande. Máximo 10MB.");
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) return toast.error("Formato não permitido. Use PDF, JPG ou PNG.");

    setUploading(true);
    try {
      const formData = new FormData(); formData.append("document_type", documentType); formData.append("file", file);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/me/documents`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, body: formData });
      if (!response.ok) throw new Error((await response.json()).detail || "Erro ao enviar");
      toast.success("Enviado com sucesso.");
      loadProfile();
    } catch (err) { toast.error(mensagemParaUsuario(err, "Erro ao enviar.")); }
    finally { setUploading(false); event.target.value = ""; }
  }

  async function handleDownload(documentId, filename) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/me/documents/${documentId}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      if (!response.ok) throw new Error("Erro ao baixar");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a);
    } catch (err) { toast.error(mensagemParaUsuario(err, "Erro ao baixar.")); }
  }

  async function handleDelete(documentId) {
    if (!confirm("Tem certeza que deseja remover este documento?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/me/documents/${documentId}`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      if (!response.ok) throw new Error("Erro ao remover");
      toast.success("Removido com sucesso.");
      loadProfile();
    } catch (err) { toast.error(mensagemParaUsuario(err, "Erro ao remover.")); }
  }

  if (!profile) return <div className="glass p-8 animate-pulse"><div className="h-8 w-48 rounded-xl bg-slate-800/50 mb-6" /><div className="h-64 rounded-xl bg-slate-800/30" /></div>;

  return (
    <div className="space-y-6 lg:flex lg:gap-6 lg:space-y-0">
      <div className="glass p-6 lg:w-2/3">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person</span> Meu Perfil
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-4">
            <h3 className="section-label mt-4">Dados Básicos</h3>
            <FormField label="Nome completo" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <FormField label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} />
            <FormField label="Nova senha" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" placeholder="Deixe em branco para não alterar" minLength={8} />
          </div>

          <div className="space-y-4">
            <h3 className="section-label mt-6 border-t border-white/5 pt-6">Documentos Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })} placeholder="000.000.000-00" />
              <FormField label="RG" value={form.rg} onChange={(e) => setForm({ ...form, rg: e.target.value })} />
            </div>
            <DatePicker label="Data de Nascimento" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} maxDate={new Date()} />
          </div>

          <div className="space-y-4">
            <h3 className="section-label mt-6 border-t border-white/5 pt-6">Endereço</h3>
            <FormField label="Endereço completo" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rua, número, complemento" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <div>
                <label className="label">Estado</label>
                <select className="input focus:ring-primary focus:border-transparent transition-all" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
                  {brazilianStates.map(state => (<option key={state} value={state}>{state}</option>))}
                </select>
              </div>
              <FormField label="CEP" value={form.zip_code} onChange={(e) => setForm({ ...form, zip_code: maskZipCode(e.target.value) })} placeholder="00000-000" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="section-label mt-6 border-t border-white/5 pt-6">Contato de Emergência</h3>
            <FormField label="Nome do contato" value={form.emergency_contact_name} onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })} />
            <FormField label="Telefone do contato" value={form.emergency_contact_phone} onChange={(e) => setForm({ ...form, emergency_contact_phone: maskPhone(e.target.value) })} />
          </div>

          <button className="gradient-button w-full sm:w-auto" type="submit">Salvar Alterações do Perfil</button>
        </form>
      </div>

      <div className="glass p-6 lg:w-1/3">
        <h2 className="text-xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-accent-purple">folder_open</span> Documentos
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          É obrigatório o envio dos documentos abaixo para atuação na EBI Vila Paula.
        </p>

        <div className="space-y-4">
          {Object.entries(documentTypeLabels).map(([type, label]) => {
            const doc = profile?.documents?.find(d => d.document_type === type);
            return (
              <div key={type} className="bg-slate-900/40 rounded-xl p-4 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold text-slate-200">{label}</h4>
                  {doc && <span className="text-[10px] uppercase tracking-wider font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-500/20">Enviado</span>}
                </div>

                {doc ? (
                  <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/5">
                    <span className="text-xs text-slate-400 truncate w-full" title={doc.filename}>{doc.filename} ({(doc.file_size / 1024).toFixed(0)} KB)</span>
                    <div className="flex gap-2">
                      <button type="button" className="button secondary flex-1 py-1.5 px-3 h-auto min-h-0 text-xs" onClick={() => handleDownload(doc.id, doc.filename)}>Baixar</button>
                      <button type="button" className="button bg-red-500/10 text-red-500 border border-red-500/20 flex-1 py-1.5 px-3 h-auto min-h-0 text-xs shadow-none hover:bg-red-500/20" onClick={() => handleDelete(doc.id)}>Remover</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => handleFileUpload(e, type)} disabled={uploading} className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
