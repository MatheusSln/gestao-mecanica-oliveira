import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockData } from '../lib/mockData';
import { Button } from '../components/ui/button';
import { ArrowLeft, FileDown, Wrench, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function DetalhesOS() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrdemById } = useMockData();
  const os = getOrdemById(id || '');
  const printRef = useRef<HTMLDivElement>(null);

  if (!os) return <div className="p-4 text-center text-muted-foreground mt-10">OS não encontrada</div>;

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const gerarPDF = async () => {
    if (!printRef.current) return;
    
    const originalText = document.getElementById('btn-text');
    if (originalText) originalText.innerText = 'Gerando...';

    try {
      const element = printRef.current;
      
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        windowWidth: 800,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('recibo-print');
          if (el) {
            el.style.width = '800px';
            el.style.minWidth = '800px';
            el.style.maxWidth = '800px';
            el.style.padding = '32px'; // Garante o padding de desktop no PDF
            
            // Remove overflow de qualquer parente no documento clonado para não cortar
            let parent = el.parentElement;
            while(parent) {
              parent.style.overflow = 'visible';
              parent.style.width = 'auto';
              parent = parent.parentElement;
            }
          }
        }
      });
      
      const data = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`recibo_os_${os.id}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar PDF.");
    } finally {
      if (originalText) originalText.innerText = 'Gerar PDF do Recibo';
    }
  };

  return (
    <div className="space-y-4 pb-20 bg-gray-50 min-h-screen p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full bg-white shadow-sm border">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-bold text-gray-800">Visualizar Recibo</h2>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <div ref={printRef} id="recibo-print" className="bg-white p-6 md:p-8 w-full max-w-[800px] mx-auto relative">
          
          {/* Header do Recibo */}
          <div className="flex justify-between items-start border-b-2 border-gray-200 pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Mecânica Oliveira</h1>
              <p className="text-sm text-gray-500 font-medium">Serviços Automotivos de Qualidade</p>
              <p className="text-xs text-gray-400 mt-1">Rua das Oficinas, 123 - Centro | (31) 99999-9999</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-gray-800 uppercase tracking-widest">Recibo OS</p>
              <p className="text-base font-bold text-gray-600">Nº {os.id}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Emissão: {os.data}</p>
            </div>
          </div>

          {/* Dados do Cliente e Veículo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded border border-gray-200">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Dados do Cliente</p>
              <p className="text-sm font-bold text-gray-800">{os.cliente}</p>
              <p className="text-sm text-gray-600">{os.telefone || 'Telefone não informado'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Dados do Veículo</p>
              <p className="text-sm font-bold text-gray-800">{os.carro}</p>
              <p className="text-sm text-gray-600">Placa: {os.placa || 'Não informada'}</p>
            </div>
          </div>

          {/* Tabela de Itens e Serviços */}
          <div className="mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="py-2 text-xs font-bold text-gray-600 uppercase tracking-wider w-3/5">Descrição</th>
                  <th className="py-2 text-xs font-bold text-gray-600 uppercase tracking-wider text-center w-1/5">Qtd</th>
                  <th className="py-2 text-xs font-bold text-gray-600 uppercase tracking-wider text-right w-1/5">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y border-gray-200">
                {os.pecas && os.pecas.map((peca, idx) => (
                  <tr key={idx}>
                    <td className="py-3 text-sm font-medium text-gray-800">{peca.nome.replace('(Avulsa)', '').trim()}</td>
                    <td className="py-3 text-sm text-gray-600 text-center">{peca.qtd}</td>
                    <td className="py-3 text-sm font-bold text-gray-800 text-right">{formatCurrency(peca.precoVenda * peca.qtd)}</td>
                  </tr>
                ))}
                {os.maoObra > 0 && (
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-800">
                      Mão de Obra Especializada
                      <span className="block text-xs text-gray-500 font-normal mt-0.5">Mecânico: {os.mecanico}</span>
                    </td>
                    <td className="py-3 text-sm text-gray-600 text-center">1</td>
                    <td className="py-3 text-sm font-bold text-gray-800 text-right">{formatCurrency(os.maoObra)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totais */}
          <div className="flex justify-end mb-10 border-t-2 border-gray-800 pt-4">
            <div className="w-full max-w-[250px]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-bold text-gray-800">{formatCurrency(os.valor)}</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Descontos</span>
                <span className="text-sm font-bold text-gray-800">- R$ 0,00</span>
              </div>
              <div className="border-t border-gray-300 my-2 pt-2 flex justify-between items-center">
                <span className="text-base font-bold text-gray-800 uppercase">Total Pago</span>
                <span className="text-xl font-black text-gray-900">{formatCurrency(os.valor)}</span>
              </div>
            </div>
          </div>

          {/* Assinatura Simbolica da Mecanica */}
          <div className="mt-8 pt-8 border-t border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-gray-800 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Documento Válido</span>
            </div>
            
            <p className="text-lg text-gray-800 mt-2 font-bold italic" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Mecânica Oliveira</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold border-t border-gray-400 pt-1 mt-1 w-48 mx-auto">Assinatura Digital</p>
            
            <p className="mt-4 text-[9px] text-gray-400 leading-relaxed max-w-xs mx-auto">
              Este recibo possui validade comprobatória dos serviços prestados. Autenticação interna gerada pelo sistema de gestão.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 z-30 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <Button onClick={gerarPDF} className="w-full gap-2 bg-gray-900 hover:bg-gray-800 text-white h-12 text-base font-bold rounded shadow-md">
          <FileDown className="w-5 h-5" /> 
          <span id="btn-text">Gerar PDF do Recibo</span>
        </Button>
      </div>
    </div>
  );
}