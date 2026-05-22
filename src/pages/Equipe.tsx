import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useEquipe } from '../lib/useEquipe';
import { NovoMecanicoModal } from '../components/ui/NovoMecanicoModal';
import { UserPlus, UserCircle, CarFront, Loader2, Trash2 } from 'lucide-react';

export function Equipe() {
  const { equipe, loading, addMecanico, zerarComissao, removeMecanico } = useEquipe();
  const [mostrarModal, setMostrarModal] = useState(false);
  const fmt = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const totalComissoes = equipe.reduce((acc, m) => acc + m.comissaoSemana, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Equipe e Repasses</h2>
        <Button size="sm" className="gap-1 rounded-full" onClick={() => setMostrarModal(true)}>
          <UserPlus className="w-4 h-4" /> Novo Mecânico
        </Button>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-2">
        <h3 className="text-sm font-bold text-primary">Total a Pagar (Semana)</h3>
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

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">Comissão acumulada:</span>
                <span className="text-lg font-bold text-red-500">{fmt(mecanico.comissaoSemana)}</span>
              </div>

              <Button
                className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white gap-2"
                onClick={() => { if (confirm(`Zerar semana de ${mecanico.nome}? Esta ação não pode ser desfeita.`)) zerarComissao(mecanico.id); }}
              >
                Zerar Semana e Pagar — {fmt(mecanico.comissaoSemana)}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {mostrarModal && <NovoMecanicoModal onSalvar={addMecanico} onFechar={() => setMostrarModal(false)} />}
    </div>
  );
}
