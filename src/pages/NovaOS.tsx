import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useEstoque } from '../lib/useEstoque';
import { useEquipe } from '../lib/useEquipe';
import { useOrdensServico } from '../lib/useOrdensServico';
import type { PecaOS } from '../lib/types';
import { calcComissao } from '../lib/comissao';
import { ArrowLeft, Save, Plus, Trash2, Search, FileSignature, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export function NovaOS() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editMode = Boolean(id);
  const { pecas } = useEstoque();
  const { equipe } = useEquipe();
  const { ordens, loading, addOS, updateOS } = useOrdensServico();
  const osEdit = id ? ordens.find((o) => o.id === id) : undefined;

  const [placa, setPlaca] = useState('');
  const [carro, setCarro] = useState('');
  const [cliente, setCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mecanicoId, setMecanicoId] = useState('');
  const [pecasUsadas, setPecasUsadas] = useState<{ id: string; peca: PecaOS & { codigo?: string }; qtd: number }[]>([]);
  const [valorMaoObra, setValorMaoObra] = useState('');
  const [mostrarPecaAvulsa, setMostrarPecaAvulsa] = useState(false);
  const [pecaAvulsaNome, setPecaAvulsaNome] = useState('');
  const [pecaAvulsaValor, setPecaAvulsaValor] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [carregado, setCarregado] = useState(false);

  // Pré-preenche o formulário ao editar uma OS existente
  useEffect(() => {
    if (!editMode || !osEdit || carregado || equipe.length === 0) return;
    setPlaca(osEdit.placa);
    setCarro(osEdit.carro);
    setCliente(osEdit.cliente);
    setTelefone(osEdit.telefone);
    // Casa pelo id; se não existir mais (mecânico removido/re-seed), tenta pelo nome
    const mecId = equipe.some((m) => m.id === osEdit.mecanicoId)
      ? osEdit.mecanicoId
      : equipe.find((m) => m.nome === osEdit.mecanico)?.id ?? '';
    setMecanicoId(mecId);
    setValorMaoObra(osEdit.maoObra ? String(osEdit.maoObra) : '');
    setPecasUsadas(
      osEdit.pecas.map((p) => ({
        id: p.pecaId ?? `avulsa-${Math.random().toString(36).slice(2, 8)}`,
        peca: {
          nome: p.nome,
          precoVenda: p.precoVenda,
          qtd: p.qtd,
          precoCompra: p.precoCompra,
          codigo: p.pecaId ? pecas.find((e) => e.id === p.pecaId)?.codigo : undefined,
        },
        qtd: p.qtd,
      }))
    );
    setCarregado(true);
  }, [editMode, osEdit, carregado, pecas, equipe]);

  const mecanicoSelecionado = equipe.find((m) => m.id === mecanicoId);
  const totalPecas = pecasUsadas.reduce((acc, curr) => acc + curr.peca.precoVenda * curr.qtd, 0);
  const totalMaoObra = parseFloat(valorMaoObra) || 0;
  const totalOS = totalPecas + totalMaoObra;
  const fmt = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const addPecaEstoque = (pecaId: string) => {
    if (!pecaId) return;
    const pecaDb = pecas.find((p) => p.id === pecaId);
    if (!pecaDb) return;
    setPecasUsadas((prev) => {
      const exists = prev.find((p) => p.id === pecaId);
      if (exists) return prev.map((p) => p.id === pecaId ? { ...p, qtd: p.qtd + 1 } : p);
      return [...prev, { id: pecaId, peca: { nome: pecaDb.nome, precoVenda: pecaDb.precoVenda, qtd: 1, codigo: pecaDb.codigo, precoCompra: pecaDb.precoCompra }, qtd: 1 }];
    });
  };

  const addPecaAvulsa = () => {
    if (!pecaAvulsaNome || !pecaAvulsaValor) return;
    const valor = parseFloat(pecaAvulsaValor.replace(',', '.'));
    if (isNaN(valor)) return;
    setPecasUsadas((prev) => [...prev, { id: `avulsa-${Date.now()}`, peca: { nome: `(Avulsa) ${pecaAvulsaNome}`, precoVenda: valor, qtd: 1 }, qtd: 1 }]);
    setPecaAvulsaNome('');
    setPecaAvulsaValor('');
    setMostrarPecaAvulsa(false);
  };

  const removePeca = (id: string) => setPecasUsadas((prev) => prev.filter((p) => p.id !== id));

  const hoje = new Date().toLocaleDateString('pt-BR');

  const salvar = async (navegar: boolean) => {
    if (!carro || !cliente || !mecanicoId) {
      setErro('Preencha carro/motor, cliente e mecânico.');
      return;
    }
    setErro('');
    setSalvando(true);
    try {
      const pecasOS: PecaOS[] = pecasUsadas.map((item) => {
        const linha: PecaOS = {
          nome: item.peca.nome,
          qtd: item.qtd,
          precoVenda: item.peca.precoVenda,
        };
        if (!item.id.startsWith('avulsa-')) {
          linha.pecaId = item.id;
          if (item.peca.precoCompra != null) linha.precoCompra = item.peca.precoCompra;
        }
        return linha;
      });

      const dados = {
        carro: carro.trim(),
        placa: placa.trim().toUpperCase(),
        cliente: cliente.trim(),
        telefone: telefone.trim(),
        mecanico: mecanicoSelecionado?.nome ?? '',
        mecanicoId,
        pecas: pecasOS,
        maoObra: totalMaoObra,
        valor: totalOS,
        data: editMode && osEdit ? osEdit.data : hoje,
        comissao: calcComissao(mecanicoSelecionado, totalMaoObra),
      };

      if (editMode && id) {
        await updateOS(id, dados);
        navigate(`/recibos/${id}`);
      } else {
        const novoId = await addOS({ ...dados, status: 'Em Aberto' });
        navigate(navegar ? `/recibos/${novoId}` : '/recibos');
      }
    } catch {
      setErro('Erro ao salvar a OS. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (editMode && !carregado) {
    const naoAchou = !osEdit && !loading;
    return (
      <div className="p-4 text-center mt-20">
        {naoAchou ? (
          <p className="text-sm text-muted-foreground">OS não encontrada.</p>
        ) : (
          <>
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Carregando OS...</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 bg-gray-50 min-h-screen p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full bg-white shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">{editMode ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</h2>
          <p className="text-xs text-gray-500 font-medium">{editMode ? 'Altere os dados e salve' : 'Preencha os dados do atendimento'}</p>
        </div>
      </div>

      {/* Dados Iniciais */}
      <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
            <FileSignature className="w-3 h-3" /> Dados Iniciais
          </h3>
        </div>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Placa</label>
              <Input placeholder="ABC-1234" className="uppercase font-bold" value={placa} onChange={(e) => setPlaca(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Modelo / Motor</label>
              <Input placeholder="Ex: Gol 1.0 EA111" value={carro} onChange={(e) => setCarro(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Cliente</label>
            <Input placeholder="Nome do cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Telefone</label>
            <Input placeholder="(DDD) Número" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Mecânico Responsável</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
              value={mecanicoId}
              onChange={(e) => setMecanicoId(e.target.value)}
            >
              <option value="">Selecione quem fará o serviço...</option>
              {equipe.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Peças */}
      <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Peças e Materiais</h3>
          <span className="text-sm font-black text-gray-900">{fmt(totalPecas)}</span>
        </div>
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Peças do Estoque</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-white pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 appearance-none"
                onChange={(e) => { addPecaEstoque(e.target.value); e.target.value = ''; }}
              >
                <option value="">Buscar por nome ou SKU...</option>
                {pecas.filter((p) => p.quantidade > 0).map((p) => (
                  <option key={p.id} value={p.id}>[{p.codigo}] {p.nome} — {fmt(p.precoVenda)} ({p.quantidade} em estoque)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-dashed border-gray-200" />
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium">OU</span>
            <div className="flex-grow border-t border-dashed border-gray-200" />
          </div>

          {!mostrarPecaAvulsa ? (
            <Button variant="outline" className="w-full border-dashed border-gray-300 text-gray-600 gap-2" onClick={() => setMostrarPecaAvulsa(true)}>
              <Plus className="w-4 h-4" /> Adicionar Peça Avulsa (Comprada Fora)
            </Button>
          ) : (
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Nova Peça Avulsa / Terceirizada</h4>
              <Input placeholder="Descrição da Peça" value={pecaAvulsaNome} onChange={(e) => setPecaAvulsaNome(e.target.value)} className="bg-white mb-2" />
              <div className="flex gap-2">
                <Input placeholder="Valor (Ex: 120.00)" type="number" value={pecaAvulsaValor} onChange={(e) => setPecaAvulsaValor(e.target.value)} className="bg-white" />
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6" onClick={addPecaAvulsa}>Incluir</Button>
              </div>
              <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-500 w-full" onClick={() => setMostrarPecaAvulsa(false)}>Cancelar</Button>
            </div>
          )}

          <div className="space-y-2 mt-2">
            {pecasUsadas.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200 text-sm">
                <div className="flex items-start gap-3 flex-1">
                  <span className="font-black text-gray-800 bg-gray-100 px-2 py-1 rounded text-xs">{item.qtd}x</span>
                  <span className="leading-tight text-gray-700 font-medium pr-2">{item.peca.nome}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-black text-gray-900">{fmt(item.peca.precoVenda * item.qtd)}</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removePeca(item.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            {pecasUsadas.length === 0 && (
              <div className="text-center py-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                <p className="text-xs text-gray-400 font-medium">Nenhuma peça adicionada.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mão de Obra */}
      <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Mão de Obra e Fechamento</h3>
        </div>
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Valor do Serviço Prestado (R$)</label>
            <Input type="number" placeholder="0,00" className="text-xl font-black h-14" value={valorMaoObra} onChange={(e) => setValorMaoObra(e.target.value)} />
            <p className="text-[10px] text-gray-500 mt-2 font-medium">Será contabilizado para a comissão semanal do mecânico.</p>
          </div>
        </CardContent>
      </Card>

      {erro && <p className="text-sm text-red-500 font-medium px-1">{erro}</p>}

      {/* Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-30 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total da O.S.</span>
          <span className="text-2xl font-black text-gray-900">{fmt(totalOS)}</span>
        </div>
        {editMode ? (
          <Button className="w-full font-bold bg-gray-900 hover:bg-gray-800 text-white h-12" onClick={() => salvar(true)} disabled={salvando}>
            {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" /> Salvar alterações</>}
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button className="flex-1 font-bold bg-white text-gray-900 border-2 border-gray-900 hover:bg-gray-50 h-12" onClick={() => salvar(false)} disabled={salvando}>
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" /> Salvar</>}
            </Button>
            <Button className="flex-1 font-bold bg-gray-900 hover:bg-gray-800 text-white h-12" onClick={() => salvar(true)} disabled={salvando}>
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finalizar & PDF'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
