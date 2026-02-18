import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { get } from "../api/client.js";
import { formatDate, formatDateTime } from "../utils/format.js";
import { mensagemParaUsuario } from "../utils/apiErrors.js";
import { useMediaQuery, MOBILE_BREAKPOINT } from "../hooks/useMediaQuery.js";
import { toast } from "sonner";

export default function EbiReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

  useEffect(() => {
    get(`/reports/ebi/${id}`)
      .then(setReport)
      .catch((err) => toast.error(mensagemParaUsuario(err, "Erro ao carregar relatório.")));
  }, [id]);

  if (!report) {
    return (
      <div className="card rounded-2xl border border-border/50 shadow-xl animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-muted/50 mb-6" />
        <div className="h-64 rounded-xl bg-muted/30" />
      </div>
    );
  }

  function handlePrint() {
    window.print();
  }

  const presences = report.presences || [];
  const hasPresences = presences.length > 0;

  return (
    <div className="ebi-report">
      <div className="ebi-report-header page-header flex-between">
        <h2 className="page-title">Relatório do EBI</h2>
        <div className="page-header-actions">
          <button type="button" className="button rounded-xl" onClick={handlePrint}>
            Imprimir relatório
          </button>
        </div>
      </div>
      <div className="card ebi-report-card rounded-2xl border border-border/50 shadow-xl">
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
          {isMobile ? (
            <div className="table-cards" role="list">
              {hasPresences ? (
                presences.map((item, index) => (
                  <article key={index} className="table-card" role="listitem">
                    <div className="table-card-fields">
                      <div className="table-card-field">
                        <span className="table-card-label">Criança</span>
                        <span className="table-card-value">{item.child_name}</span>
                      </div>
                      <div className="table-card-field">
                        <span className="table-card-label">Responsável</span>
                        <span className="table-card-value">{item.guardian_name_day}</span>
                      </div>
                      <div className="table-card-field">
                        <span className="table-card-label">Contato</span>
                        <span className="table-card-value">{item.guardian_phone_day}</span>
                      </div>
                      <div className="table-card-field">
                        <span className="table-card-label">Entrada</span>
                        <span className="table-card-value">{formatDateTime(item.entry_at)}</span>
                      </div>
                      <div className="table-card-field">
                        <span className="table-card-label">Saída</span>
                        <span className="table-card-value">{formatDateTime(item.exit_at)}</span>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="table-card table-card--empty">
                  <p className="text-muted-foreground text-sm">Nenhuma presença registrada</p>
                </div>
              )}
            </div>
          ) : (
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
                  {hasPresences ? (
                    presences.map((item, index) => (
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
          )}
        </section>
      </div>
    </div>
  );
}
