import { useEffect, useState } from "react";
import { get, put } from "../api/client.js";
import FormField from "../components/FormField.jsx";
import { maskCPF, maskPhone, maskZipCode } from "../utils/mask.js";
import { toast } from "sonner";

const documentTypeLabels = {
  ANTECEDENTES_CRIMINAIS: "Certidão de Antecedentes Criminais (Federal)",
  CERTIDAO_NEGATIVA_ESTADUAL: "Certidão Negativa Criminal (Estadual)",
  RG: "RG - Registro Geral",
  CPF: "CPF - Cadastro de Pessoa Física",
  COMPROVANTE_RESIDENCIA: "Comprovante de Residência",
  ATESTADO_SAUDE: "Atestado de Saúde",
  OUTROS: "Outros Documentos"
};

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    cpf: "",
    rg: "",
    birth_date: "",
    address: "",
    city: "",
    state: "SP",
    zip_code: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    password: ""
  });
  const [uploading, setUploading] = useState(false);

  async function loadProfile() {
    try {
      const data = await get("/profile/me");
      setProfile(data);
      setForm({
        full_name: data.full_name || "",
        phone: maskPhone(data.phone || ""),
        cpf: maskCPF(data.cpf || ""),
        rg: data.rg || "",
        birth_date: data.birth_date || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "SP",
        zip_code: maskZipCode(data.zip_code || ""),
        emergency_contact_name: data.emergency_contact_name || "",
        emergency_contact_phone: maskPhone(data.emergency_contact_phone || ""),
        password: ""
      });
    } catch (err) {
      toast.error(err.message || "Erro ao carregar perfil.");
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await put("/profile/me", form);
      toast.success("Perfil atualizado com sucesso.");
      loadProfile();
    } catch (err) {
      toast.error(err.message || "Erro ao salvar perfil.");
    }
  }

  async function handleFileUpload(event, documentType) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    // Validar tipo
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato não permitido. Use PDF, JPG ou PNG.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("document_type", documentType);
      formData.append("file", file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/me/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Erro ao enviar documento");
      }

      toast.success("Documento enviado com sucesso.");
      loadProfile();
    } catch (err) {
      toast.error(err.message || "Erro ao enviar documento.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleDownload(documentId, filename) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/me/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) throw new Error("Erro ao baixar documento");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      toast.error(err.message || "Erro ao baixar documento.");
    }
  }

  async function handleDelete(documentId) {
    if (!confirm("Tem certeza que deseja remover este documento?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/me/documents/${documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) throw new Error("Erro ao remover documento");

      toast.success("Documento removido com sucesso.");
      loadProfile();
    } catch (err) {
      toast.error(err.message || "Erro ao remover documento.");
    }
  }

  function getDocumentForType(type) {
    return profile?.documents?.find(doc => doc.document_type === type);
  }

  if (!profile) {
    return <div className="card">Carregando...</div>;
  }

  return (
    <div className="grid grid-2">
      <div className="card">
        <h2 className="page-title">Meu Perfil</h2>
        <form onSubmit={handleSubmit}>
          <h3 style={{ marginTop: "24px", marginBottom: "12px" }}>Dados Básicos</h3>
          
          <FormField
            label="Nome completo"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
          
          <FormField
            label="Telefone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
            required
          />

          <FormField
            label="Nova senha (deixe em branco para não alterar)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            type="password"
            autoComplete="new-password"
            minLength={8}
          />

          <h3 style={{ marginTop: "24px", marginBottom: "12px" }}>Documentos Pessoais</h3>
          
          <div className="grid grid-2">
            <FormField
              label="CPF"
              value={form.cpf}
              onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })}
              placeholder="000.000.000-00"
            />
            
            <FormField
              label="RG"
              value={form.rg}
              onChange={(e) => setForm({ ...form, rg: e.target.value })}
            />
          </div>

          <FormField
            label="Data de Nascimento"
            value={form.birth_date}
            onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
            type="date"
          />

          <h3 style={{ marginTop: "24px", marginBottom: "12px" }}>Endereço</h3>
          
          <FormField
            label="Endereço completo"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Rua, número, complemento"
          />

          <div className="grid grid-3">
            <FormField
              label="Cidade"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            
            <div>
              <label className="label">Estado</label>
              <select
                className="input"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              >
                {brazilianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <FormField
              label="CEP"
              value={form.zip_code}
              onChange={(e) => setForm({ ...form, zip_code: maskZipCode(e.target.value) })}
              placeholder="00000-000"
            />
          </div>

          <h3 style={{ marginTop: "24px", marginBottom: "12px" }}>Contato de Emergência</h3>
          
          <FormField
            label="Nome do contato"
            value={form.emergency_contact_name}
            onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
          />
          
          <FormField
            label="Telefone do contato"
            value={form.emergency_contact_phone}
            onChange={(e) => setForm({ ...form, emergency_contact_phone: maskPhone(e.target.value) })}
          />

          <button className="button" style={{ marginTop: "24px" }}>
            Salvar Perfil
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="page-title">Documentos Obrigatórios</h2>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
          Conforme legislação brasileira (ECA - Estatuto da Criança e do Adolescente),
          é obrigatório o envio dos documentos abaixo para trabalhar com crianças.
        </p>

        {Object.entries(documentTypeLabels).map(([type, label]) => {
          const doc = getDocumentForType(type);
          return (
            <div key={type} style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #e0e0e0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label className="label" style={{ margin: 0 }}>{label}</label>
                {doc && (
                  <span style={{ fontSize: "12px", color: "#28a745", fontWeight: "600" }}>
                    ✓ Enviado
                  </span>
                )}
              </div>
              
              {doc ? (
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "#666", flex: 1 }}>
                    {doc.filename} ({(doc.file_size / 1024).toFixed(0)} KB)
                  </span>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => handleDownload(doc.id, doc.filename)}
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    Baixar
                  </button>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => handleDelete(doc.id)}
                    style={{ fontSize: "12px", padding: "6px 12px", backgroundColor: "#dc3545" }}
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => handleFileUpload(e, type)}
                    disabled={uploading}
                    style={{ fontSize: "13px" }}
                  />
                  <p style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                    Formatos: PDF, JPG, PNG. Máximo: 10MB
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {uploading && (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            Enviando documento...
          </div>
        )}
      </div>
    </div>
  );
}
