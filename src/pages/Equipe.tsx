import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useEquipe } from '../lib/useEquipe';
import { NovoMecanicoModal } from '../components/ui/NovoMecanicoModal';
import { descreveComissao } from '../lib/comissao';
import type { ComissaoTipo } from '../lib/types';
import { UserPlus, UserCircle, CarFront, Loader2, Trash2, Pencil, Check } from 'lucide-react';

export function Equipe() {
  const { equipe, loading, addMecanico, zerarComissao, removeMecanico, updateComissao } = useEquipe();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editTipo, setEditTipo] = useState<ComissaoTipo>('percentual');
  const [editValor, setEditValor] = useState('');

  const fmt = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const totalComissoes = equipe.reduce((acc, m) => acc + m.comissaoSemana, 0);

  const abrirEdicao = (id: string, tipo: ComissaoTipo | undefined, valor: number | undefined) => {
    setEditandoId(id);
    setEditTipo(tipo ?? 'percentual');
    setEditValor(valor != null ? String(valor) : '');
  };

  const salvarEdicao = async (id: string) => {
    await updateComissao(id, editTipo, parseFloat(editValor.replace(',', '.')) || 0);
    setEditandoId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Equipe e Repasses</h2>
        <Button size="sm" className="gap-1 rounded-full" onClick={() => setMostrarModal(true)}>
          <UserPlus className="w-4 h-4" /> Novo Mecânico
        </Button>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-2">
        <h3 className="text-sm font-bold text-primary">Total a Pagar (acumulado)</h3>
        <p className="text-2xl font-bold mt-1 text-primary">{fmt(totalComissoes)}</p>
      </div>

      {loading && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}

      {!loading && equipe.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <p>Nenhum mecânico cadastrado.</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={() => setMostrarModal(true)}>
            <UserPlus className="w-4 h-4" /> Adicionar mecânico
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {equipe.map((mecanico) => (
          <Card key={mecanico.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-3 rounded-full">
                  <UserCircle className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{mecanico.nome}</p>
                  <div className="flex items-center text-muted-foreground text-xs mt-1 gap-1">
                    <CarFront className="w-3 h-3" /> {mecanico.carrosAtendidos} carros atendidos
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={() => { if (confirm(`Remover ${mecanico.nome}?`)) removeMecanico(mecanico.id); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Regra de comissão */}
              {editandoId === mecanico.id ? (
                <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setEditTipo('percentual')}
                      className={`h-9 rounded-md text-xs font-bold border transition-colors ${editTipo === 'percentual' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300'}`}>
                      % da mão de obra
                    </button>
                    <button type="button" onClick={() => setEditTipo('fixo')}
                      className={`h-9 rounded-md text-xs font-bold border transition-colors ${editTipo === 'fixo' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300'}`}>
                      Valor fixo/carro
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Input type="number" autoFocus placeholder={editTipo === 'percentual' ? '% (ex: 40)' : 'R$ por carro'}
                      value={editValor} onChange={(e) => setEditValor(e.target.value)} className="flex-1" />
                    <Button className="h-10 bg-green-600 hover:bg-green-700 text-white gap-1" onClick={() => salvarEdicao(mecanico.id)}>
                      <Check className="w-4 h-4" /> Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => abrirEdicao(mecanico.id, mecanico.comissaoTipo, mecanico.comissaoValor)}
                  className="mt-3 w-full flex items-center justify-between text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300"
                >
                  <span className="text-gray-500">Comissão: <span className="font-bold text-gray-700">{descreveComissao(mecanico)}</span></span>
                  <Pencil className="w-3 h-3 text-gray-400" />
                </button>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">Comissão acumulada:</span>
                <span className="text-lg font-bold text-red-500">{fmt(mecanico.comissaoSemana)}</span>
              </div>

              <Button
                className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white gap-2"
                onClick={() => { if (confirm(`Zerar repasse de ${mecanico.nome}? Esta ação não pode ser desfeita.`)) zerarComissao(mecanico.id); }}
              >
                Zerar e Pagar — {fmt(mecanico.comissaoSemana)}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {mostrarModal && <NovoMecanicoModal onSalvar={addMecanico} onFechar={() => setMostrarModal(false)} />}
    </div>
  );
}
