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
      <div className="glass p-8 animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-slate-800/50 mb-6" />
        <div className="h-64 rounded-xl bg-slate-800/30" />
      </div>
    );
  }

  function handlePrint() { window.print(); }

  const presences = report.presences || [];
  const hasPresences = presences.length > 0;

  return (
    <div className="space-y-6 print:space-y-0 print:bg-white print:text-black">
      <div className="flex items-center justify-between mb-4 print:hidden px-2">
        <div>
          <h2 className="text-2xl font-bold text-white">Relatório do EBI</h2>
          <p className="text-slate-400 text-sm">Dashboard Informativo</p>
        </div>
        <button type="button" className="gradient-button h-11 px-5" onClick={handlePrint}>
          <span className="material-symbols-outlined">print</span>
          Imprimir
        </button>
      </div>

      <div className="glass p-6 space-y-8 print:p-0 print:border-0 print:shadow-none print:bg-transparent">
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[14px]">info</span> Dados do EBI
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-black/20 rounded-2xl p-6 border border-white/5">
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">Data</p>
              <p className="text-lg font-bold text-white">{formatDate(report.ebi_date)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">Grupo</p>
              <p className="text-lg font-bold text-white">{report.group_number}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">Coordenadora</p>
              <p className="text-lg font-bold text-white text-primary">{report.coordinator_name}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-purple text-[14px]">groups</span> Equipe Presente
          </h3>
          <div className="flex flex-wrap gap-2">
            {report.collaborators && report.collaborators.length > 0
              ? report.collaborators.map((name, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                  {name}
                </span>
              ))
              : <p className="text-slate-500 italic text-sm">Nenhuma colaboradora registrada.</p>}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400 text-[14px]">list_alt</span> Lista de Crianças ({presences.length})
          </h3>

          <div className="space-y-4">
            {hasPresences ? (
              presences.map((item, index) => (
                <div key={index} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{item.child_name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">person</span> {item.guardian_name_day}
                        <span className="mx-1">•</span>
                        <span className="material-symbols-outlined text-[12px]">call</span> {item.guardian_phone_day}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right md:text-left self-end md:self-auto">
                    <div className="text-center">
                      <p className="text-[9px] uppercase font-bold text-slate-500 tracking-tighter">Entrada</p>
                      <p className="text-xs font-mono text-green-400">{formatDateTime(item.entry_at).split(" ").pop()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] uppercase font-bold text-slate-500 tracking-tighter">Saída</p>
                      <p className="text-xs font-mono text-primary">{item.exit_at ? formatDateTime(item.exit_at).split(" ").pop() : "--:--"}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-black/20 rounded-2xl p-8 text-center border border-white/5 border-dashed">
                <p className="text-slate-500 text-sm">Nenhuma presença registrada neste EBI.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
