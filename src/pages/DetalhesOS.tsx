import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrdensServico } from '../lib/useOrdensServico';
import { Button } from '../components/ui/button';
import { SignaturePad } from '../components/ui/SignaturePad';
import type { SignaturePadHandle } from '../components/ui/SignaturePad';
import { ArrowLeft, FileDown, CheckCircle2, PenLine, Lock, Unlock, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function DetalhesOS() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ordens, closeOS, reopenOS } = useOrdensServico();
  const sigPadRef = useRef<SignaturePadHandle>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [gerando, setGerando] = useState(false);
  const [fechando, setFechando] = useState(false);
  const [mostrarAssinatura, setMostrarAssinatura] = useState(false);

  const os = ordens.find((o) => o.id === id);

  if (!os) {
    return (
      <div className="p-4 text-center mt-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Carregando OS...</p>
      </div>
    );
  }

  const fmt = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const gerarPDF = async () => {
    if (!printRef.current) return;
    setGerando(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        windowWidth: 800,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('recibo-print');
          if (el) {
            el.style.width = '800px';
            el.style.minWidth = '800px';
            el.style.maxWidth = '800px';
            el.style.padding = '32px';
            let parent = el.parentElement;
            while (parent) {
              parent.style.overflow = 'visible';
              parent.style.width = 'auto';
              parent = parent.parentElement;
            }
          }
        },
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, (canvas.height * pdfWidth) / canvas.width);
      pdf.save(`recibo_os_${os.id.slice(-6)}.pdf`);
    } catch {
      alert('Erro ao gerar PDF.');
    } finally {
      setGerando(false);
    }
  };

  const handleFecharOS = async () => {
    const assinatura = sigPadRef.current?.isEmpty() === false
      ? sigPadRef.current?.toDataURL() ?? undefined
      : undefined;
    setFechando(true);
    try {
      await closeOS(os.id, assinatura);
      setMostrarAssinatura(false);
    } finally {
      setFechando(false);
    }
  };

  const handleReabrirOS = async () => {
    if (!confirm('Reabrir esta OS?')) return;
    await reopenOS(os.id);
  };

  return (
    <div className="space-y-4 pb-32 bg-gray-50 min-h-screen p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full bg-white shadow-sm border">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-bold text-gray-800">Visualizar Recibo</h2>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${os.status === 'Fechada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {os.status}
        </span>
      </div>

      {/* Recibo (capturado para PDF) */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <div ref={printRef} id="recibo-print" className="bg-white p-6 md:p-8 w-full max-w-[800px] mx-auto relative">

          <div className="flex justify-between items-start border-b-2 border-gray-200 pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Mecânica Oliveira</h1>
              <p className="text-sm text-gray-500 font-medium">Serviços Automotivos de Qualidade</p>
              <p className="text-xs text-gray-400 mt-1">Rua das Oficinas, 123 - Centro | (31) 99999-9999</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-gray-800 uppercase tracking-widest">Recibo OS</p>
              <p className="text-base font-bold text-gray-600">Nº {os.id.slice(-6).toUpperCase()}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Emissão: {os.data}</p>
            </div>
          </div>

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

          <div className="mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="py-2 text-xs font-bold text-gray-600 uppercase tracking-wider w-3/5">Descrição</th>
                  <th className="py-2 text-xs font-bold text-gray-600 uppercase tracking-wider text-center w-1/5">Qtd</th>
                  <th className="py-2 text-xs font-bold text-gray-600 uppercase tracking-wider text-right w-1/5">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {os.pecas.map((peca, idx) => (
                  <tr key={idx}>
                    <td className="py-3 text-sm font-medium text-gray-800">{peca.nome.replace('(Avulsa)', '').trim()}</td>
                    <td className="py-3 text-sm text-gray-600 text-center">{peca.qtd}</td>
                    <td className="py-3 text-sm font-bold text-gray-800 text-right">{fmt(peca.precoVenda * peca.qtd)}</td>
                  </tr>
                ))}
                {os.maoObra > 0 && (
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-800">
                      Mão de Obra Especializada
                      <span className="block text-xs text-gray-500 font-normal mt-0.5">Mecânico: {os.mecanico}</span>
                    </td>
                    <td className="py-3 text-sm text-gray-600 text-center">1</td>
                    <td className="py-3 text-sm font-bold text-gray-800 text-right">{fmt(os.maoObra)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-8 border-t-2 border-gray-800 pt-4">
            <div className="w-full max-w-[250px]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Subtotal Peças</span>
                <span className="text-sm font-bold text-gray-800">{fmt(os.pecas.reduce((a, p) => a + p.precoVenda * p.qtd, 0))}</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Mão de Obra</span>
                <span className="text-sm font-bold text-gray-800">{fmt(os.maoObra)}</span>
              </div>
              <div className="border-t border-gray-300 my-2 pt-2 flex justify-between items-center">
                <span className="text-base font-bold text-gray-800 uppercase">Total</span>
                <span className="text-xl font-black text-gray-900">{fmt(os.valor)}</span>
              </div>
            </div>
          </div>

          {/* Assinatura no recibo */}
          <div className="mt-6 pt-6 border-t border-dashed border-gray-300 flex flex-col items-center text-center">
            {os.assinatura ? (
              <>
                <img src={os.assinatura} alt="Assinatura" className="h-20 object-contain mb-2" />
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-bold text-green-700 uppercase tracking-widest">Documento Assinado</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-52 border-t border-gray-400 mt-8" />
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold pt-1">Assinatura do Cliente</p>
              </>
            )}
            <p className="mt-4 text-[9px] text-gray-400 leading-relaxed max-w-xs mx-auto">
              Este recibo possui validade comprobatória dos serviços prestados. Autenticação interna gerada pelo sistema de gestão.
            </p>
          </div>
        </div>
      </div>

      {/* Seção de assinatura (OS em aberto) */}
      {os.status === 'Em Aberto' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PenLine className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-800">Coletar Assinatura do Cliente</h3>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setMostrarAssinatura(!mostrarAssinatura)}>
              {mostrarAssinatura ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>

          {mostrarAssinatura && (
            <>
              <p className="text-xs text-gray-500">Peça ao cliente para assinar confirmando a entrega do veículo:</p>
              <SignaturePad ref={sigPadRef} />
            </>
          )}

          <Button
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold gap-2"
            onClick={handleFecharOS}
            disabled={fechando}
          >
            {fechando
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Lock className="w-4 h-4" /> Fechar OS{mostrarAssinatura ? ' com Assinatura' : ''}</>
            }
          </Button>
        </div>
      )}

      {os.status === 'Fechada' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-green-800 text-sm">OS Concluída e Fechada</p>
            <p className="text-xs text-green-600">{os.assinatura ? 'Documento assinado pelo cliente.' : 'Fechada sem assinatura.'}</p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-gray-500 h-8 gap-1 flex-shrink-0" onClick={handleReabrirOS}>
            <Unlock className="w-3 h-3" /> Reabrir
          </Button>
        </div>
      )}

      {/* PDF */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 z-30 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <Button onClick={gerarPDF} disabled={gerando} className="w-full gap-2 bg-gray-900 hover:bg-gray-800 text-white h-12 text-base font-bold rounded shadow-md">
          {gerando ? <Loader2 className="w-5 h-5 animate-spin" /> : <><FileDown className="w-5 h-5" /> Gerar PDF do Recibo</>}
        </Button>
      </div>
    </div>
  );
}
