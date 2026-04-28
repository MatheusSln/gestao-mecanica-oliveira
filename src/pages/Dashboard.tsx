import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useMockData } from '../lib/mockData';
import { DollarSign, Wallet, TrendingUp, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { getFaturamento, getComissoes, getOrdensServico } = useMockData();
  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const faturado = getFaturamento();
  const comissoes = getComissoes();
  const liquido = faturado - comissoes;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Resumo da Semana</h2>
      
      <div className="grid grid-cols-2 gap-3">
        <Card className="col-span-2 bg-gray-900 text-white border-none shadow-md">
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
              <DollarSign className="w-4 h-4 mr-1 text-gray-400" /> Faturado
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-3xl font-black">{formatCurrency(faturado)}</p>
          </CardContent>
        </Card>
        
        <Card className="border-red-100 bg-red-50/30">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center">
              <Wallet className="w-3 h-3 mr-1" /> Comissões
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-lg font-black text-red-600">-{formatCurrency(comissoes)}</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 shadow-sm">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-[10px] font-bold text-green-700 uppercase tracking-wider flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> Valor Líquido
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-lg font-black text-green-700">{formatCurrency(liquido)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mt-6">
        <h2 className="text-lg font-bold">Últimas OS</h2>
        <Link to="/recibos/nova">
          <Button size="sm" className="gap-1 rounded-full">
            <Plus className="w-4 h-4" /> Nova OS
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {getOrdensServico().map(os => (
          <Link to={`/recibos/${os.id}`} key={os.id} className="block">
            <Card className="hover:border-primary transition-colors">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{os.carro}</p>
                  <p className="text-xs text-muted-foreground">{os.cliente} • Mecânico: {os.mecanico}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(os.valor)}</p>
                  <span className={`text-[10px] px-2 py-1 rounded-full ${os.status === 'Fechada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {os.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}