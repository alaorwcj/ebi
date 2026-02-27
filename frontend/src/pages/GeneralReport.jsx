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
  Legend,
  Filler
} from "chart.js";
import { get } from "../api/client.js";
import { mensagemParaUsuario } from "../utils/apiErrors.js";
import { toast } from "sonner";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler);

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
        <div className="h-8 w-48 rounded-xl bg-slate-800/50 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(9, 9, 11, 0.95)',
        titleColor: '#94a3b8',
        bodyColor: '#f1f5f9',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: false
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          font: { size: 10 }
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          color: '#64748b',
          font: { size: 10 }
        }
      }
    }
  };

  const last3Labels = ["Há 2 meses", "Mês passado", "Este mês"];
  const last12Labels = Array.from({ length: 12 }, (_, i) => `${12 - i}º mês`).reverse();

  return (
    <div className="space-y-8 pb-10">
      <div className="px-2">
        <h2 className="text-2xl font-bold text-white">Relatório Geral</h2>
        <p className="text-slate-400 text-sm">Visão consolidada da operação</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-5 flex flex-col items-center justify-center text-center space-y-1">
          <span className="material-symbols-outlined text-primary mb-2">supervisor_account</span>
          <p className="text-2xl font-black text-white">{report.total_coordenadoras}</p>
          <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Coordenadoras</p>
        </div>
        <div className="glass p-5 flex flex-col items-center justify-center text-center space-y-1">
          <span className="material-symbols-outlined text-accent-purple mb-2">volunteer_activism</span>
          <p className="text-2xl font-black text-white">{report.total_colaboradoras}</p>
          <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Colaboradoras</p>
        </div>
        <div className="glass p-5 flex flex-col items-center justify-center text-center space-y-1">
          <span className="material-symbols-outlined text-green-400 mb-2">trending_up</span>
          <p className="text-2xl font-black text-white">{report.average_presence_month.toFixed(1)}</p>
          <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Média Mensal</p>
        </div>
        <div className="glass p-5 flex flex-col items-center justify-center text-center space-y-1">
          <span className="material-symbols-outlined text-orange-400 mb-2">calendar_month</span>
          <p className="text-2xl font-black text-white">{report.average_presence_year.toFixed(1)}</p>
          <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Média Anual</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-[18px]">bar_chart</span>
            <h3 className="text-sm font-bold text-slate-200">Presenças Trimestrais</h3>
          </div>
          <div className="h-[240px]">
            <Bar
              options={chartOptions}
              data={{
                labels: last3Labels,
                datasets: [{
                  label: "Presenças",
                  data: report.last_3_months_counts,
                  backgroundColor: "#2547f4",
                  borderRadius: 8,
                  barThickness: 32
                }]
              }}
            />
          </div>
        </div>

        <div className="glass p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-accent-purple text-[18px]">show_chart</span>
            <h3 className="text-sm font-bold text-slate-200">Média de Presenças (12 meses)</h3>
          </div>
          <div className="h-[240px]">
            <Line
              options={chartOptions}
              data={{
                labels: last12Labels,
                datasets: [{
                  label: "Média",
                  data: report.last_12_months_avg,
                  borderColor: "#8b5cf6",
                  backgroundColor: "rgba(139, 92, 246, 0.1)",
                  fill: true,
                  tension: 0.4,
                  pointRadius: 4,
                  pointBackgroundColor: "#8b5cf6"
                }]
              }}
            />
          </div>
        </div>
      </div>

      {report.by_group && Object.keys(report.by_group).length > 0 && (
        <div className="glass p-6">
          <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500 text-[14px]">grid_view</span> Presenças por Grupo
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(report.by_group).map(([group, count]) => (
              <div key={group} className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <p className="text-xs font-bold text-slate-400 mb-1">Grupo {group}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-white">{count}</span>
                  <span className="text-[10px] text-slate-500">votos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
