import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { get } from "../api/client.js";
import { formatDate, formatDateTime } from "../utils/format.js";
import { mensagemParaUsuario } from "../utils/apiErrors.js";
import { toast } from "sonner";

export default function EbiReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);

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

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="space-y-6 print:m-0 print:p-0 print:!bg-white print:!text-black">

      {/* Header Interativo (Oculto na impressão) */}
      <div className="flex items-center justify-between mb-4 print:hidden px-2">
        <div>
          <h2 className="text-2xl font-bold text-white">Relatório do EBI</h2>
          <p className="text-slate-400 text-sm">Visão Detalhada</p>
        </div>
        <button type="button" className="gradient-button h-11 px-6 font-semibold" onClick={handlePrint}>
          <span className="material-symbols-outlined mr-2">print</span>
          Imprimir Relatório
        </button>
      </div>

      <div className="glass p-8 rounded-2xl print:p-0 print:border-0 print:shadow-none print:!bg-white print:!text-black print:m-0">

        <div className="border-b border-white/10 pb-6 mb-8 print:border-black print:pb-1 print:mb-4">
          <h1 className="text-3xl font-bold text-white print:text-black print:text-xl">Relatório de Atividades - EBI Vila Paula</h1>
          <div className="flex justify-between items-center text-sm text-slate-400 print:text-black print:text-[10px] mt-1">
            <p className="hidden print:block font-bold">Gestão Interna</p>
            <p>Emissão: {currentDate}</p>
          </div>
        </div>

        {/* Informações da Sessão */}
        <div className="mb-4 print:mb-2 space-y-4 print:space-y-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:block text-slate-200 print:!text-black">
            <p className="print:text-[10px]"><span className="font-bold uppercase text-[9px] text-slate-500 print:!text-black">Data:</span> {formatDate(report.ebi_date)}</p>
            <p className="print:text-[10px]"><span className="font-bold uppercase text-[9px] text-slate-500 print:!text-black">Aula:</span> {report.tema || "Não informado"}</p>
            <p className="print:text-[10px]"><span className="font-bold uppercase text-[9px] text-slate-500 print:!text-black">Grupo:</span> {report.group_number}</p>
            <p className="print:text-[10px]"><span className="font-bold uppercase text-[9px] text-slate-500 print:!text-black">Coordenadora:</span> {report.coordinator_name}</p>
          </div>
        </div>

        {/* Equipe */}
        <div className="mb-4 print:mb-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 print:!text-black print:text-[10px] print:mb-0 print:border-b print:border-black/10">Equipe</h3>
          <div className="text-slate-300 print:!text-black">
            {report.collaborators && report.collaborators.length > 0 ? (
              <p className="text-sm print:text-[10px] leading-tight">
                {report.collaborators.join(" • ")}
              </p>
            ) : (
              <p className="italic text-sm">Nenhuma colaboradora registrada.</p>
            )}
          </div>
        </div>

        {/* Tabela de Crianças */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1 print:!text-black print:text-[10px] print:mb-0 print:border-b print:border-black/10">Presença</h3>

          {hasPresences ? (
            <table className="w-full text-left border-collapse print:!text-black">
              <thead>
                <tr className="border-b-2 border-white/10 print:border-black/20 text-slate-400 print:!text-black uppercase text-[9px] font-bold">
                  <th className="p-1 w-6">Nº</th>
                  <th className="p-1">Criança</th>
                  <th className="p-1">Responsável</th>
                  <th className="p-1 text-center w-14">Entrada</th>
                  <th className="p-1 text-center w-14">Saída</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-black/10 text-slate-200 print:!text-black">
                {presences.map((item, index) => (
                  <tr key={index}>
                    <td className="p-1 text-[10px]">{index + 1}</td>
                    <td className="p-1 font-semibold text-xs print:text-[10px] uppercase">{item.child_name}</td>
                    <td className="p-1 text-[10px] opacity-80 print:opacity-100 uppercase">{item.guardian_name_day}</td>
                    <td className="p-1 text-center text-[10px]">
                      {formatDateTime(item.entry_at).split(" ").pop()}
                    </td>
                    <td className="p-1 text-center text-[10px]">
                      {item.exit_at ? formatDateTime(item.exit_at).split(" ").pop() : "--:--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-500 italic text-sm">Sem presenças registradas.</p>
          )}
        </div>

        {/* Rodapé */}
        <div className="hidden print:block mt-4 pt-1 border-t border-black/10 text-center text-black/30 text-[8px] uppercase">
          EBI Vila Paula - Sistema de Gestão
        </div>

      </div>
    </div>
  );
}
