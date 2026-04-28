import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useMockData } from '../lib/mockData';
import { DollarSign, Wallet, FileText, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { getFaturamento, getComissoes, getOrdensServico } = useMockData();
  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Resumo da Semana</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium opacity-90 flex items-center">
              <DollarSign className="w-4 h-4 mr-1" /> Faturado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(getFaturamento())}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center">
              <Wallet className="w-4 h-4 mr-1" /> Comissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-red-500">{formatCurrency(getComissoes())}</p>
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