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
import { mensagemParaUsuario } from "../utils/apiErrors.js";
import { toast } from "sonner";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

export default function GeneralReport() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    get("/reports/general")
      .then(setReport)
      .catch((err) => toast.error(mensagemParaUsuario(err, "Erro ao carregar relatório.")));
  }, []);

  if (!report) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-xl bg-muted/50 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card rounded-2xl h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const last3Labels = ["Há 2 meses", "Mês passado", "Este mês"];
  const last12Labels = Array.from({ length: 12 }, (_, i) => `${12 - i}º mês`).reverse();

  return (
    <div className="report-general space-y-8">
      <h2 className="page-title">Relatório Geral</h2>
      <div className="report-cards">
        <div className="report-card">
          <span className="report-card-value">{report.total_coordenadoras}</span>
          <span className="report-card-label">Coordenadoras</span>
        </div>
        <div className="report-card">
          <span className="report-card-value">{report.total_colaboradoras}</span>
          <span className="report-card-label">Colaboradoras</span>
        </div>
        <div className="report-card">
          <span className="report-card-value">{report.average_presence_month.toFixed(1)}</span>
          <span className="report-card-label">Média mensal (presenças)</span>
        </div>
        <div className="report-card">
          <span className="report-card-value">{report.average_presence_year.toFixed(1)}</span>
          <span className="report-card-label">Média anual (presenças)</span>
        </div>
      </div>
      {report.by_group && Object.keys(report.by_group).length > 0 && (
        <div className="card rounded-2xl border border-border/50 shadow-xl">
          <h3 className="text-lg font-medium text-foreground mb-1">Presenças por grupo</h3>
          <div className="report-by-group">
            {Object.entries(report.by_group).map(([group, count]) => (
              <div key={group} className="report-by-group-item">
                <strong>Grupo {group}</strong>
                <span>{count} presenças</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="report-charts grid grid-2">
        <ChartCard title="Presenças nos últimos 3 meses">
          <Bar
            data={{
              labels: last3Labels,
              datasets: [
                {
                  label: "Presenças",
                  data: report.last_3_months_counts,
                  backgroundColor: "var(--accent)"
                }
              ]
            }}
            options={{ responsive: true, maintainAspectRatio: true }}
          />
        </ChartCard>
        <ChartCard title="Média de presenças (últimos 12 meses)">
          <Line
            data={{
              labels: last12Labels,
              datasets: [
                {
                  label: "Média",
                  data: report.last_12_months_avg,
                  borderColor: "var(--accent)",
                  backgroundColor: "rgba(52, 114, 247, 0.1)"
                }
              ]
            }}
            options={{ responsive: true, maintainAspectRatio: true }}
          />
        </ChartCard>
      </div>
    </div>
  );
}
