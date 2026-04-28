import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useMockData } from '../lib/mockData';
import { UserPlus, UserCircle, CarFront } from 'lucide-react';

export function Equipe() {
  const { getEquipe } = useMockData();
  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Equipe e Repasses</h2>
        <Button size="sm" className="gap-1 rounded-full">
          <UserPlus className="w-4 h-4" /> Novo Mecânico
        </Button>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-2">
        <h3 className="text-sm font-bold text-primary">Total a Pagar (Semana)</h3>
        <p className="text-2xl font-bold mt-1 text-primary">
          {formatCurrency(getEquipe().reduce((acc, curr) => acc + curr.comissaoSemana, 0))}
        </p>
      </div>

      <div className="space-y-3">
        {getEquipe().map(mecanico => (
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
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">Comissão acumulada:</span>
                <span className="text-lg font-bold text-red-500">{formatCurrency(mecanico.comissaoSemana)}</span>
              </div>

              <Button className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white gap-2">
                Zerar Semana e Pagar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}