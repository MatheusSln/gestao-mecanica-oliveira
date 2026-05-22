import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useOrdensServico } from '../lib/useOrdensServico';
import { Plus, Search, Printer, Loader2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Recibos() {
  const { ordens, loading, deleteOS } = useOrdensServico();
  const [searchTerm, setSearchTerm] = useState('');
  const fmt = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const filtered = ordens.filter((os) =>
    os.carro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (os.placa ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Ordens de Serviço</h2>
        <Link to="/recibos/nova">
          <Button size="sm" className="gap-1 rounded-full"><Plus className="w-4 h-4" /> Nova</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar placa, carro ou cliente..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}

      <div className="space-y-3">
        {!loading && filtered.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p>Nenhuma OS encontrada.</p>
            <Link to="/recibos/nova">
              <Button variant="outline" size="sm" className="mt-3 gap-1"><Plus className="w-4 h-4" /> Nova OS</Button>
            </Link>
          </div>
        )}

        {filtered.map((os) => (
          <Card key={os.id} className="hover:border-primary transition-colors">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{os.carro}</p>
                  <p className="text-sm text-muted-foreground">{os.cliente} • Placa: {os.placa || '—'}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full ${os.status === 'Fechada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {os.status}
                </span>
              </div>

              <div className="bg-gray-50 p-2 rounded flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Mecânico: {os.mecanico} • {os.data}</span>
                <span className="font-bold text-primary">{fmt(os.valor)}</span>
              </div>

              <div className="flex gap-2">
                <Link to={`/recibos/${os.id}`} className="flex-1">
                  <Button variant="outline" className="w-full h-8 text-xs gap-2">
                    <Printer className="w-3 h-3" /> Ver Detalhes / PDF
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={() => { if (confirm(`Excluir OS de ${os.cliente}?`)) deleteOS(os.id); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
