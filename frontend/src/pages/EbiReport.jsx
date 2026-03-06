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
    <div className="space-y-6 print:m-0 print:p-0 print:bg-white print:text-black">

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

      {/* Container Principal do Relatório */}
      <div className="glass p-8 rounded-2xl print:p-0 print:border-0 print:shadow-none print:rounded-none print:bg-transparent">

        {/* Cabeçalho do Documento Impresso */}
        <div className="border-b border-white/10 pb-6 mb-8 print:border-black/20">
          <h1 className="text-3xl font-bold text-white print:text-black mb-2 tracking-tight">Relatório EBI - Vila Paula</h1>
          <div className="flex justify-end items-end text-sm text-slate-400 print:text-gray-600">
            <p>Gerado em: <span className="font-mono">{currentDate}</span></p>
          </div>
        </div>

        {/* Seção 1: KPIs e Informações Gerais */}
        <section className="mb-10">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 print:text-gray-500 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary print:text-gray-500 text-[18px]">info</span>
            Dados Gerais
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 print:border-gray-300 print:bg-gray-50">
              <p className="text-[10px] uppercase font-bold text-slate-500 print:text-gray-500 tracking-wider mb-1">Data do EBI</p>
              <p className="text-xl font-bold text-white print:text-black">{formatDate(report.ebi_date)}</p>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 print:border-gray-300 print:bg-gray-50">
              <p className="text-[10px] uppercase font-bold text-slate-500 print:text-gray-500 tracking-wider mb-1">Tema</p>
              <p className="text-xl font-bold text-white print:text-black truncate">{report.tema || "-"}</p>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 print:border-gray-300 print:bg-gray-50">
              <p className="text-[10px] uppercase font-bold text-slate-500 print:text-gray-500 tracking-wider mb-1">Grupo Responsável</p>
              <p className="text-xl font-bold text-white print:text-black">Grupo {report.group_number}</p>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 print:border-gray-300 print:bg-gray-50">
              <p className="text-[10px] uppercase font-bold text-slate-500 print:text-gray-500 tracking-wider mb-1">Coordenadora</p>
              <p className="text-xl font-bold text-primary print:text-black truncate">{report.coordinator_name}</p>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 print:border-gray-300 print:bg-gray-50">
              <p className="text-[10px] uppercase font-bold text-slate-500 print:text-gray-500 tracking-wider mb-1">Total de Crianças</p>
              <p className="text-xl font-bold text-white print:text-black">{presences.length}</p>
            </div>
          </div>
        </section>

        {/* Seção 2: Equipe */}
        <section className="mb-10">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 print:text-gray-500 flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-cyan print:text-gray-500 text-[18px]">engineering</span>
            Equipe Presente
          </h3>
          <div className="bg-slate-900/30 p-5 rounded-xl border border-white/5 print:border-gray-300 print:bg-transparent">
            {report.collaborators && report.collaborators.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 list-inside list-disc text-slate-300 print:text-black text-sm">
                {report.collaborators.map((name, i) => (
                  <li key={i} className="py-1 border-b border-white/5 print:border-gray-200 last:border-0">{name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic text-sm">Nenhuma colaboradora registrada.</p>
            )}
          </div>
        </section>

        {/* Seção 3: Tabela de Crianças */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 print:text-gray-500 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400 print:text-gray-500 text-[18px]">family_restroom</span>
            Controle de Presença (Crianças)
          </h3>

          {hasPresences ? (
            <div className="overflow-x-auto rounded-xl border border-white/10 print:border-gray-300">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-white/10 print:bg-gray-100 print:border-gray-300 text-slate-300 print:text-black uppercase text-[10px] tracking-wider">
                    <th className="p-4 font-bold w-12 text-center">#</th>
                    <th className="p-4 font-bold">Nome da Criança</th>
                    <th className="p-4 font-bold">Responsável</th>
                    <th className="p-4 font-bold">Telefone</th>
                    <th className="p-4 font-bold text-center">Entrada</th>
                    <th className="p-4 font-bold text-center">Saída</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-gray-200 bg-slate-900/20 print:bg-white text-slate-200 print:text-black">
                  {presences.map((item, index) => (
                    <tr key={index} className="hover:bg-white/5 print:hover:bg-transparent transition-colors">
                      <td className="p-4 text-center text-slate-500 font-mono text-xs">{index + 1}</td>
                      <td className="p-4 font-semibold">{item.child_name}</td>
                      <td className="p-4 text-slate-400 print:text-gray-700">{item.guardian_name_day}</td>
                      <td className="p-4 font-mono text-xs text-slate-400 print:text-gray-700">{item.guardian_phone_day}</td>
                      <td className="p-4 text-center font-mono text-xs text-green-400 print:text-black">
                        {formatDateTime(item.entry_at).split(" ").pop()}
                      </td>
                      <td className="p-4 text-center font-mono text-xs text-primary print:text-black">
                        {item.exit_at ? formatDateTime(item.exit_at).split(" ").pop() : "--:--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-black/20 rounded-xl p-8 text-center border border-white/5 border-dashed print:border-gray-300">
              <p className="text-slate-500 print:text-gray-600 text-sm">Nenhuma presença registrada neste EBI.</p>
            </div>
          )}
        </section>

        {/* Rodapé de Impressão */}
        <div className="hidden print:block mt-16 pt-8 border-t border-gray-300 text-center text-gray-400 text-xs">
          <p>EBI Vila Paula - Sistema de Gestão Interna</p>
          <p>Página 1 de 1</p>
        </div>

      </div>
    </div>
  );
}
