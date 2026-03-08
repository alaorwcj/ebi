import React from 'react';
import { Printer, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Pulseiras() {
    const location = useLocation();
    const navigate = useNavigate();
    const childrenToPrint = location.state?.children || [];

    const handlePrint = () => {
        window.print();
    };

    // Calculate chunks of 5 (10 wristbands per A4 page max)
    const chunks = [];
    for (let i = 0; i < childrenToPrint.length; i += 5) {
        chunks.push(childrenToPrint.slice(i, i + 5));
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 py-8 print:p-0 print:bg-white print:text-black flex flex-col items-center">
            <div className="max-w-[29.7cm] w-full mb-8 print:hidden flex justify-between items-center bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Impressão de Pulseiras</h1>
                    <p className="text-slate-400 text-sm max-w-2xl">
                        Mapeadas <b>{childrenToPrint.length}</b> crianças para impressão.
                        <br />Selecione o formato <b>Paisagem (Landscape)</b>, no tamanho <b>A4</b> e desative as margens.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center px-5 py-3 rounded-xl border border-slate-600 font-semibold text-slate-300 hover:bg-slate-700 transition"
                    >
                        <ArrowLeft size={20} className="mr-2" /> Voltar
                    </button>
                    <button
                        onClick={handlePrint}
                        className="gradient-button flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-transform"
                    >
                        <Printer size={20} className="mr-2" /> Imprimir Pulseiras
                    </button>
                </div>
            </div>

            <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0 !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-container { width: 297mm; height: 210mm; display: flex; align-items: center; justify-content: center; }
        }
      `}</style>

            {chunks.length === 0 && (
                <div className="text-center text-slate-500 mt-10 print:hidden">Nenhuma criança encontrada para exibir.</div>
            )}

            {chunks.map((pageChunk, pageIndex) => (
                <div key={`page-${pageIndex}`} className="print-container overflow-x-auto pb-10 print:pb-0 flex justify-center mb-8" style={{ pageBreakAfter: "always" }}>
                    <div
                        className="bg-white relative shadow-2xl print:shadow-none"
                        style={{ width: "29.7cm", height: "21cm", padding: "0.5cm" }}
                    >
                        <div className="w-full h-full border border-gray-300 flex flex-col box-border">

                            {pageChunk.map((c, index) => {
                                const guardianName = c.guardians && c.guardians.length > 0 ? c.guardians[0].name : "Responsável Não Informado";
                                const phone = c.guardians && c.guardians.length > 0 ? c.guardians[0].phone : "Sem Contato";
                                const pin = c.pin || "ERRO";

                                return (
                                    <React.Fragment key={`wristbands-${c.id || index}`}>
                                        {/* Via da Criança */}
                                        <div className="flex border-b border-dashed border-gray-400 relative overflow-hidden" style={{ width: "24.5cm", height: "2cm", backgroundColor: "#ffffff" }}>
                                            <div className="w-[3cm] border-r border-dashed border-gray-400 bg-white flex items-center justify-center text-[10px] text-gray-700 flex-shrink-0 text-center px-1 print:text-transparent">
                                                Área de Fechamento / Adesivo
                                            </div>

                                            <div className="flex-1 flex items-center px-4 justify-between" style={{ color: "#000000" }}>
                                                <div className="flex items-center gap-6">
                                                    <div className="uppercase font-bold tracking-widest text-[10px]" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>CRIANÇA</div>
                                                    <div className="flex flex-col justify-center">
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-[12px] opacity-70 uppercase tracking-widest">Nome:</span>
                                                            <span className="font-bold text-[14px] uppercase">{c.name}</span>
                                                        </div>
                                                        <div className="flex items-baseline gap-2 mt-0.5">
                                                            <span className="text-[10px] opacity-70 uppercase tracking-widest">Resp:</span>
                                                            <span className="font-semibold text-[11px] uppercase truncate max-w-[8cm]">{guardianName}</span>
                                                            <span className="text-[10px] opacity-70 uppercase tracking-widest ml-4">Contato:</span>
                                                            <span className="font-bold text-[11px] uppercase tracking-wider">{phone}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Via do Responsável */}
                                        <div className="flex border-b border-dashed border-gray-400 relative overflow-hidden" style={{ width: "24.5cm", height: "2cm", backgroundColor: "#ffffff" }}>
                                            <div className="w-[3cm] border-r border-dashed border-gray-400 bg-white flex items-center justify-center text-[10px] text-gray-700 flex-shrink-0 text-center px-1 print:text-transparent">
                                                Área de Fechamento / Adesivo
                                            </div>

                                            <div className="flex-1 flex items-center px-4 justify-between" style={{ color: "#000000" }}>
                                                <div className="flex items-center gap-6">
                                                    <div className="uppercase font-bold tracking-widest text-[10px]" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>RESP.</div>
                                                    <div className="flex flex-col justify-center">
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-[12px] opacity-70 uppercase tracking-widest">Nome:</span>
                                                            <span className="font-bold text-[14px] uppercase">{guardianName}</span>
                                                        </div>
                                                        <div className="flex items-baseline gap-2 mt-0.5">
                                                            <span className="text-[10px] opacity-70 uppercase tracking-widest">Criança vinculada:</span>
                                                            <span className="font-bold text-[12px] uppercase">{c.name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* PIN do lado direito  */}
                                                <div className="flex flex-col items-end justify-center pr-2">
                                                    <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest leading-none mb-1">PIN DE SEGURANÇA</span>
                                                    <span className="font-black text-[22px] tracking-[4px] leading-none bg-white px-3 py-1 rounded-lg border border-gray-800">{pin}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
