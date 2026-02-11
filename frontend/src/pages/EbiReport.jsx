import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { get } from "../api/client.js";
import { formatDate, formatDateTime } from "../utils/format.js";
import { toast } from "sonner";

export default function EbiReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    get(`/reports/ebi/${id}`)
      .then(setReport)
      .catch((err) => toast.error(err.message || "Erro ao carregar relatório."));
  }, [id]);

  if (!report) return <div className="card">Carregando...</div>;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="ebi-report">
      <div className="ebi-report-header flex-between">
        <h2 className="page-title">Relatório do EBI</h2>
        <button type="button" className="button" onClick={handlePrint}>
          Imprimir relatório
        </button>
      </div>
      <div className="card ebi-report-card">
        <section className="ebi-report-section">
          <h3>Dados do EBI</h3>
          <dl className="ebi-report-dl">
            <dt>Data</dt>
            <dd>{formatDate(report.ebi_date)}</dd>
            <dt>Grupo</dt>
            <dd>{report.group_number}</dd>
            <dt>Coordenadora</dt>
            <dd>{report.coordinator_name}</dd>
          </dl>
        </section>
        <section className="ebi-report-section">
          <h3>Equipe presente</h3>
          <p className="ebi-report-collaborators">
            {report.collaborators && report.collaborators.length > 0
              ? report.collaborators.join(", ")
              : "—"}
          </p>
        </section>
        <section className="ebi-report-section">
          <h3>Lista de crianças</h3>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Criança</th>
                  <th>Responsável</th>
                  <th>Contato</th>
                  <th>Entrada</th>
                  <th>Saída</th>
                </tr>
              </thead>
              <tbody>
                {report.presences && report.presences.length > 0 ? (
                  report.presences.map((item, index) => (
                    <tr key={index}>
                      <td>{item.child_name}</td>
                      <td>{item.guardian_name_day}</td>
                      <td>{item.guardian_phone_day}</td>
                      <td>{formatDateTime(item.entry_at)}</td>
                      <td>{formatDateTime(item.exit_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="muted">Nenhuma presença registrada</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
