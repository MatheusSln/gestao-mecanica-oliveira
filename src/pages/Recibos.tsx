import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useMockData } from '../lib/mockData';
import { Plus, Search, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Recibos() {
  const { getOrdensServico } = useMockData();
  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = getOrdensServico().filter(os => 
    os.carro.toLowerCase().includes(searchTerm.toLowerCase()) || 
    os.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Ordens de Serviço</h2>
        <Link to="/recibos/nova">
          <Button size="sm" className="gap-1 rounded-full">
            <Plus className="w-4 h-4" /> Nova
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar placa, carro ou cliente..." 
          className="pl-9"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.map(os => (
          <Link to={`/recibos/${os.id}`} key={os.id} className="block">
            <Card className="hover:border-primary transition-colors">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{os.carro}</p>
                    <p className="text-sm text-muted-foreground">{os.cliente}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full ${os.status === 'Fechada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {os.status}
                  </span>
                </div>
                
                <div className="bg-gray-50 p-2 rounded flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Mecânico: {os.mecanico}</span>
                  <span className="font-bold text-primary">{formatCurrency(os.valor)}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="w-full h-8 text-xs gap-2 pointer-events-none">
                    <Printer className="w-3 h-3" /> Ver Detalhes / Gerar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}