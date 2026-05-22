import React, { useState } from 'react';
import { BarcodeScanner } from './BarcodeScanner';
import { Button } from './button';
import { Input } from './input';
import { buscarProdutoPorCodigo } from '../../lib/productLookup';
import type { Peca } from '../../lib/types';
import { X, ScanBarcode, Loader2, CheckCircle2, PackagePlus } from 'lucide-react';

interface AdicionarPecaModalProps {
  onSalvar: (peca: Omit<Peca, 'id'>) => Promise<void>;
  onFechar: () => void;
}

type Etapa = 'escolha' | 'scanner' | 'form';

const CATEGORIAS = ['Lubrificantes', 'Filtros', 'Freios', 'Motor', 'Suspensão', 'Elétrica', 'Outros'];

const FORM_VAZIO = {
  nome: '', marca: '', codigo: '', categoria: '',
  compatibilidade: '', quantidade: '1', precoVenda: '', precoCompra: '',
};

export function AdicionarPecaModal({ onSalvar, onFechar }: AdicionarPecaModalProps) {
  const [etapa, setEtapa] = useState<Etapa>('escolha');
  const [form, setForm] = useState(FORM_VAZIO);
  const [buscando, setBuscando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvoComSucesso, setSalvoComSucesso] = useState(false);
  const [erroSalvar, setErroSalvar] = useState('');

  const setField = (f: keyof typeof FORM_VAZIO, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleScan = async (codigo: string) => {
    setEtapa('form');
    setField('codigo', codigo);
    setBuscando(true);
    const produto = await buscarProdutoPorCodigo(codigo);
    if (produto) {
      setForm((prev) => ({
        ...prev,
        nome: produto.nome || prev.nome,
        marca: produto.marca || prev.marca,
        categoria: produto.categoria || prev.categoria,
      }));
    }
    setBuscando(false);
  };

  const handleSalvar = async () => {
    if (!form.nome || !form.precoVenda) return;
    setErroSalvar('');
    setSalvando(true);
    try {
      await onSalvar({
        nome: form.nome.trim(),
        marca: form.marca.trim(),
        codigo: form.codigo.trim(),
        categoria: form.categoria || 'Outros',
        compatibilidade: form.compatibilidade.trim() || 'Universal',
        quantidade: parseInt(form.quantidade) || 0,
        precoVenda: parseFloat(form.precoVenda.replace(',', '.')) || 0,
        precoCompra: form.precoCompra ? parseFloat(form.precoCompra.replace(',', '.')) : undefined,
      });
      setSalvoComSucesso(true);
      setTimeout(onFechar, 900);
    } catch {
      setErroSalvar('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (etapa === 'scanner') {
    return <BarcodeScanner onScan={handleScan} onCancel={() => { setEtapa('form'); setField('codigo', ''); }} />;
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-gray-700" />
            <h2 className="font-bold text-gray-800">Adicionar Peça</h2>
          </div>
          <button onClick={onFechar} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {etapa === 'escolha' && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-500 text-center">Como deseja adicionar a peça?</p>
            <button
              onClick={() => setEtapa('scanner')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-900 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              <ScanBarcode className="w-8 h-8 flex-shrink-0" />
              <div className="text-left">
                <p className="font-bold text-sm">Escanear com a câmera</p>
                <p className="text-xs text-white/70 mt-0.5">Aponte para o código de barras ou QR code</p>
              </div>
            </button>
            <button
              onClick={() => setEtapa('form')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors"
            >
              <PackagePlus className="w-8 h-8 flex-shrink-0 text-gray-400" />
              <div className="text-left">
                <p className="font-bold text-sm text-gray-800">Digitar manualmente</p>
                <p className="text-xs text-gray-500 mt-0.5">Preencher todos os dados no formulário</p>
              </div>
            </button>
          </div>
        )}

        {etapa === 'form' && (
          <div className="p-4 space-y-4">
            {salvoComSucesso && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Peça salva com sucesso!</span>
              </div>
            )}
            {buscando && (
              <div className="flex items-center gap-2 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Buscando informações do produto...</span>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Código / SKU / EAN</label>
              <div className="flex gap-2">
                <Input placeholder="Ex: MO-5W30 ou 7891234567890" value={form.codigo} onChange={(e) => setField('codigo', e.target.value)} className="flex-1" />
                <Button variant="outline" size="icon" onClick={() => setEtapa('scanner')} title="Escanear" className="flex-shrink-0">
                  <ScanBarcode className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Nome da Peça *</label>
              <Input placeholder="Ex: Óleo 5W30 Sintético" value={form.nome} onChange={(e) => setField('nome', e.target.value)} />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Marca</label>
              <Input placeholder="Ex: Mobil, Castrol, Cobreq..." value={form.marca} onChange={(e) => setField('marca', e.target.value)} />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Categoria</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                value={form.categoria}
                onChange={(e) => setField('categoria', e.target.value)}
              >
                <option value="">Selecionar...</option>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Compatibilidade</label>
              <Input placeholder="Ex: VW Gol G5, Universal..." value={form.compatibilidade} onChange={(e) => setField('compatibilidade', e.target.value)} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Qtd.</label>
                <Input type="number" min="0" placeholder="0" value={form.quantidade} onChange={(e) => setField('quantidade', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Preço Compra</label>
                <Input type="number" placeholder="0,00" value={form.precoCompra} onChange={(e) => setField('precoCompra', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Preço Venda *</label>
                <Input type="number" placeholder="0,00" value={form.precoVenda} onChange={(e) => setField('precoVenda', e.target.value)} />
              </div>
            </div>

            {erroSalvar && <p className="text-sm text-red-500 font-medium">{erroSalvar}</p>}

            <div className="flex gap-3 pt-2 pb-2">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setEtapa('escolha')}>Voltar</Button>
              <Button
                className="flex-1 h-12 bg-gray-900 hover:bg-gray-800 text-white font-bold"
                onClick={handleSalvar}
                disabled={salvando || !form.nome || !form.precoVenda || salvoComSucesso}
              >
                {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Peça'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
