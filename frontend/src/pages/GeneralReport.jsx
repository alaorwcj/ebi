import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import { get } from "../api/client.js";
import ChartCard from "../components/ChartCard.jsx";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

export default function GeneralReport() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    get("/reports/general").then(setReport);
  }, []);

  if (!report) return <div className="card">Carregando...</div>;

  const last3Labels = ["-2 meses", "-1 mes", "Atual"];
  const last12Labels = Array.from({ length: 12 }).map((_, index) => `${12 - index}m`);

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3>Resumo Geral</h3>
        <p>Total coordenadoras: {report.total_coordenadoras}</p>
        <p>Total colaboradoras: {report.total_colaboradoras}</p>
        <p>Grupos: {JSON.stringify(report.by_group)}</p>
        <p>Media mensal: {report.average_presence_month.toFixed(2)}</p>
        <p>Media anual: {report.average_presence_year.toFixed(2)}</p>
        <div style={{ marginTop: "12px" }}>
          <strong>Colaboradoras cadastradas</strong>
          <ul>
            {report.people.map((person, index) => (
              <li key={`${person.full_name}-${index}`}>
                {person.full_name} - {person.role === "COORDENADORA" ? "Coordenadora" : "Colaboradora"}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ChartCard title="Presencas nos ultimos 3 meses">
        <Bar
          data={{
            labels: last3Labels,
            datasets: [
              {
                label: "Presencas",
                data: report.last_3_months_counts,
                backgroundColor: "#1f6feb"
              }
            ]
          }}
          options={{ responsive: true }}
        />
      </ChartCard>
      <ChartCard title="Media de presencas (12 meses)">
        <Line
          data={{
            labels: last12Labels,
            datasets: [
              {
                label: "Media",
                data: report.last_12_months_avg,
                borderColor: "#b42318",
                backgroundColor: "rgba(180, 35, 24, 0.2)"
              }
            ]
          }}
          options={{ responsive: true }}
        />
      </ChartCard>
    </div>
  );
}
