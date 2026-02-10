import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { get } from "../api/client.js";
import { formatDate, formatDateTime } from "../utils/format.js";

export default function EbiReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    get(`/reports/ebi/${id}`).then(setReport);
  }, [id]);

  if (!report) return <div className="card">Carregando...</div>;

  return (
    <div className="card">
      <h3>Relatorio do EBI</h3>
      <p>Data: {formatDate(report.ebi_date)}</p>
      <p>Grupo: {report.group_number}</p>
      <p>Coordenadora: {report.coordinator_name}</p>
      <p>Colaboradoras: {report.collaborators.join(", ")}</p>
      <table className="table" style={{ marginTop: "16px" }}>
        <thead>
          <tr>
            <th>Crianca</th>
            <th>Responsavel</th>
            <th>Contato</th>
            <th>Entrada</th>
            <th>Saida</th>
          </tr>
        </thead>
        <tbody>
          {report.presences.map((item, index) => (
            <tr key={index}>
              <td>{item.child_name}</td>
              <td>{item.guardian_name_day}</td>
              <td>{item.guardian_phone_day}</td>
              <td>{formatDateTime(item.entry_at)}</td>
              <td>{formatDateTime(item.exit_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
