import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useMockData } from '../lib/mockData';
import { ArrowLeft, Save, Plus, Trash2, Printer, Search, FileSignature } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function NovaOS() {
  const navigate = useNavigate();
  const { getEstoque, getEquipe } = useMockData();
  const [pecasUsadas, setPecasUsadas] = useState<{ id: string, peca: any, qtd: number }[]>([]);
  const [valorMaoObra, setValorMaoObra] = useState('');
  
  // Estado para peça avulsa (comprada na hora)
  const [mostrarPecaAvulsa, setMostrarPecaAvulsa] = useState(false);
  const [pecaAvulsaNome, setPecaAvulsaNome] = useState('');
  const [pecaAvulsaValor, setPecaAvulsaValor] = useState('');

  const totalPecas = pecasUsadas.reduce((acc, curr) => acc + (curr.peca.precoVenda * curr.qtd), 0);
  const totalMaoObra = parseFloat(valorMaoObra) || 0;
  const totalOS = totalPecas + totalMaoObra;

  const addPecaEstoque = (pecaId: string) => {
    if (!pecaId) return;
    const pecaDb = getEstoque().find(p => p.id === pecaId);
    if (!pecaDb) return;

    setPecasUsadas(prev => {
      const exists = prev.find(p => p.id === pecaId);
      if (exists) {
        return prev.map(p => p.id === pecaId ? { ...p, qtd: p.qtd + 1 } : p);
      }
      return [...prev, { id: pecaId, peca: pecaDb, qtd: 1 }];
    });
  };

  const addPecaAvulsa = () => {
    if (!pecaAvulsaNome || !pecaAvulsaValor) return;
    const valor = parseFloat(pecaAvulsaValor.replace(',', '.'));
    if (isNaN(valor)) return;

    const novaPeca = {
      id: `custom-${Date.now()}`,
      peca: {
        nome: `(Avulsa) ${pecaAvulsaNome}`,
        precoVenda: valor
      },
      qtd: 1
    };

    setPecasUsadas(prev => [...prev, novaPeca]);
    setPecaAvulsaNome('');
    setPecaAvulsaValor('');
    setMostrarPecaAvulsa(false);
  };

  const removePeca = (pecaId: string) => {
    setPecasUsadas(prev => prev.filter(p => p.id !== pecaId));
  };

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-4 pb-24 bg-gray-50 min-h-screen p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full bg-white shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Nova Ordem de Serviço</h2>
          <p className="text-xs text-gray-500 font-medium">Preencha os dados do atendimento</p>
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
            <FileSignature className="w-3 h-3"/> Dados Iniciais
          </h3>
        </div>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Placa</label>
              <Input placeholder="ABC-1234" className="uppercase font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Modelo / Motor</label>
              <Input placeholder="Ex: Gol 1.0 EA111" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Cliente / Telefone</label>
            <Input placeholder="Nome e (DDD) Número" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Mecânico Responsável</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900">
              <option value="">Selecione quem fará o serviço...</option>
              {getEquipe().map(m => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
            Peças e Materiais
          </h3>
          <span className="text-sm font-black text-gray-900">{formatCurrency(totalPecas)}</span>
        </div>
        
        <CardContent className="p-4 space-y-4">
          
          {/* Busca Rápida no Estoque */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Peças do Estoque</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <select 
                  id="peca-select" 
                  className="flex h-10 w-full rounded-md border border-input bg-white pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 appearance-none"
                  onChange={(e) => {
                    addPecaEstoque(e.target.value);
                    e.target.value = '';
                  }}
                >
                  <option value="">Buscar por nome ou SKU...</option>
                  {getEstoque().map(p => (
                    <option key={p.id} value={p.id}>[{p.codigo}] {p.nome} - {formatCurrency(p.precoVenda)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-dashed border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium">OU</span>
            <div className="flex-grow border-t border-dashed border-gray-200"></div>
          </div>

          {/* Adicionar Peça Avulsa (Fornecedor Externo) */}
          {!mostrarPecaAvulsa ? (
            <Button variant="outline" className="w-full border-dashed border-gray-300 text-gray-600 gap-2" onClick={() => setMostrarPecaAvulsa(true)}>
              <Plus className="w-4 h-4"/> Adicionar Peça Avulsa (Comprada Fora)
            </Button>
          ) : (
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Nova Peça Avulsa / Terceirizada</h4>
              <div>
                <Input 
                  placeholder="Descrição da Peça (Ex: Jogo de Velas NGK)" 
                  value={pecaAvulsaNome}
                  onChange={e => setPecaAvulsaNome(e.target.value)}
                  className="bg-white mb-2"
                />
                <div className="flex gap-2">
                  <Input 
                    placeholder="Valor (Ex: 120.00)" 
                    type="number"
                    value={pecaAvulsaValor}
                    onChange={e => setPecaAvulsaValor(e.target.value)}
                    className="bg-white"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6" onClick={addPecaAvulsa}>
                    Incluir
                  </Button>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-500 w-full mt-1" onClick={() => setMostrarPecaAvulsa(false)}>Cancelar</Button>
            </div>
          )}

          {/* Lista de Peças Selecionadas */}
          <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
            {pecasUsadas.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200 text-sm">
                <div className="flex items-start gap-3 flex-1">
                  <span className="font-black text-gray-800 bg-gray-100 px-2 py-1 rounded text-xs">{item.qtd}x</span>
                  <span className="leading-tight text-gray-700 font-medium pr-2">
                    {item.peca.nome}
                    {item.peca.codigo && <span className="block text-[10px] text-gray-400 font-bold mt-0.5">SKU: {item.peca.codigo}</span>}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-black text-gray-900">{formatCurrency(item.peca.precoVenda * item.qtd)}</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removePeca(item.id)}>
                    Remover
                  </Button>
                </div>
              </div>
            ))}
            {pecasUsadas.length === 0 && (
              <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                <p className="text-xs text-gray-400 font-medium">Nenhuma peça adicionada a esta OS.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
            Mão de Obra e Fechamento
          </h3>
        </div>
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Valor do Serviço Prestado (R$)</label>
            <Input 
              type="number" 
              placeholder="0,00" 
              className="text-xl font-black h-14" 
              value={valorMaoObra}
              onChange={e => setValorMaoObra(e.target.value)}
            />
            <p className="text-[10px] text-gray-500 mt-2 font-medium">Este valor será contabilizado para a comissão semanal do mecânico responsável.</p>
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-30 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total da O.S.</span>
          <span className="text-2xl font-black text-gray-900">{formatCurrency(totalOS)}</span>
        </div>
        <div className="flex gap-3">
          <Button className="flex-1 font-bold bg-white text-gray-900 border-2 border-gray-900 hover:bg-gray-50 h-12" onClick={() => navigate('/recibos')}>
            Salvar
          </Button>
          <Button className="flex-1 font-bold bg-gray-900 hover:bg-gray-800 text-white h-12" onClick={() => navigate('/recibos/1001')}>
            Finalizar & PDF
          </Button>
        </div>
      </div>
    </div>
  );
}