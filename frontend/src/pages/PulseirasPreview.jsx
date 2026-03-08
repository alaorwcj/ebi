import React from 'react';
import { Printer } from "lucide-react";

export default function PulseirasPreview() {
    const handlePrint = () => {
        window.print();
    };

    // Mock data for 5 pairs (10 wristbands)
    const mockData = [
        { child: "Abel Batista Oliveira", guardian: "Joyce Natinele Batista", phone: "(11) 99999-9999", pin: "AB34" },
        { child: "Laura Pinheiro Kubo", guardian: "Ana Beatriz de Souza", phone: "(11) 98888-8888", pin: "X9F2" },
        { child: "João Ângelo Camargo", guardian: "Claudia Regina Camargo", phone: "(11) 97777-7777", pin: "1L9P" },
        { child: "Helena da Silva Belfort", guardian: "Walewska Belfort Bezerra", phone: "(11) 96666-6666", pin: "M7K2" },
        { child: "Arthur Vinícius Moreira", guardian: "Bianca Moreira dos Santos", phone: "(11) 95555-5555", pin: "8R4W" },
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8 print:p-0 print:bg-white print:text-black">
            <div className="max-w-4xl mx-auto mb-8 print:hidden flex justify-between items-center bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Pré-visualização das Pulseiras / Etiquetas</h1>
                    <p className="text-slate-400 text-sm max-w-2xl">
                        Este é um modelo de teste de como a página A4 será impressa.
                        <br />Formato configurado: <b>10 etiquetas por folha, sendo 2 vias (1 criança, 1 responsável) por família.</b>
                        <br />Tamanho de cada pulseira: <b>24,5 cm x 2 cm</b>.
                    </p>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                    <Printer size={20} />
                    Imprimir / PDF Teste
                </button>
            </div>

            <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0 !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-container { width: 297mm; height: 210mm; display: flex; align-items: center; justify-content: center; }
        }
      `}</style>

            {/* A4 Canvas */}
            <div className="print-container overflow-x-auto pb-10 print:pb-0 flex justify-center">
                <div
                    className="bg-white relative shadow-2xl print:shadow-none"
                    style={{ width: "29.7cm", height: "21cm", padding: "0.5cm" }}
                >
                    <div className="w-full h-full border border-gray-300 flex flex-col box-border">

                        {mockData.map((data, index) => (
                            <React.Fragment key={index}>
                                {/* Via da Criança */}
                                <div className="flex border-b border-dashed border-gray-400 relative overflow-hidden" style={{ width: "24.5cm", height: "2cm", backgroundColor: "#eef2ff" }}>
                                    <div className="w-[3cm] border-r border-dashed border-gray-400 bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 flex-shrink-0">
                                        Área de Fechamento / Adesivo
                                    </div>

                                    <div className="flex-1 flex items-center px-4 justify-between" style={{ color: "#1e3a8a" }}>
                                        <div className="flex items-center gap-6">
                                            <div className="uppercase font-bold tracking-widest text-[10px]" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>CRIANÇA</div>
                                            <div className="flex flex-col justify-center">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-[12px] opacity-70 uppercase tracking-widest">Nome:</span>
                                                    <span className="font-bold text-[14px] uppercase">{data.child}</span>
                                                </div>
                                                <div className="flex items-baseline gap-2 mt-0.5">
                                                    <span className="text-[10px] opacity-70 uppercase tracking-widest">Resp:</span>
                                                    <span className="font-semibold text-[11px] uppercase truncate max-w-[8cm]">{data.guardian}</span>
                                                    <span className="text-[10px] opacity-70 uppercase tracking-widest ml-4">Contato:</span>
                                                    <span className="font-bold text-[11px] uppercase tracking-wider">{data.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Via do Responsável */}
                                <div className="flex border-b border-dashed border-gray-400 relative overflow-hidden" style={{ width: "24.5cm", height: "2cm", backgroundColor: "#fff1f2" }}>
                                    <div className="w-[3cm] border-r border-dashed border-gray-400 bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 flex-shrink-0">
                                        Área de Fechamento / Adesivo
                                    </div>

                                    <div className="flex-1 flex items-center px-4 justify-between" style={{ color: "#9f1239" }}>
                                        <div className="flex items-center gap-6">
                                            <div className="uppercase font-bold tracking-widest text-[10px]" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>RESPONSÁVEL</div>
                                            <div className="flex flex-col justify-center">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-[12px] opacity-70 uppercase tracking-widest">Nome:</span>
                                                    <span className="font-bold text-[14px] uppercase">{data.guardian}</span>
                                                </div>
                                                <div className="flex items-baseline gap-2 mt-0.5">
                                                    <span className="text-[10px] opacity-70 uppercase tracking-widest">Criança vinculada:</span>
                                                    <span className="font-bold text-[12px] uppercase">{data.child}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* PIN do lado direito  */}
                                        <div className="flex flex-col items-end justify-center pr-2">
                                            <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest leading-none mb-1">PIN DE SEGURANÇA</span>
                                            <span className="font-black text-[22px] tracking-[4px] leading-none bg-red-900/10 px-3 py-1 rounded-lg border border-red-900/20">{data.pin}</span>
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}

                    </div>
                </div>
            </div>
        </div>
    );
}
