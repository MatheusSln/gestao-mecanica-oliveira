import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useMockData } from '../lib/mockData';
import { Plus, Search, Archive, AlertCircle, Settings2, ShieldCheck, Tag } from 'lucide-react';

export function Estoque() {
  const { getEstoque } = useMockData();
  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');

  const categorias = ['Todas', ...Array.from(new Set(getEstoque().map(p => p.categoria)))];

  const filtered = getEstoque().filter(p => {
    const matchesSearch = 
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.compatibilidade.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = filtroCategoria === 'Todas' || p.categoria === filtroCategoria;

    return matchesSearch && matchesCategoria;
  });

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Estoque de Peças</h2>
        <Button size="sm" className="gap-1 rounded-full bg-gray-900">
          <Plus className="w-4 h-4" /> Cadastrar
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por nome, código ou carro..." 
          className="pl-9"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filtro de Categorias Horizontal (Scrollable) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categorias.map(cat => (
          <button
            key={cat}
            onClick={() => setFiltroCategoria(cat)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filtroCategoria === cat 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-500">Nenhuma peça encontrada.</div>
        )}
        
        {filtered.map(peca => (
          <Card key={peca.id} className={peca.quantidade === 0 ? "border-l-4 border-l-red-500 opacity-75" : peca.quantidade < 5 ? "border-l-4 border-l-yellow-400" : ""}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{peca.categoria}</span>
                    <span className="text-[10px] font-bold text-gray-400">SKU: {peca.codigo}</span>
                  </div>
                  <p className="font-bold text-sm text-gray-800 leading-tight">{peca.nome}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-gray-900">{formatCurrency(peca.precoVenda)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <ShieldCheck className="w-3 h-3" /> Marca: <span className="font-bold">{peca.marca}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Settings2 className="w-3 h-3" /> Aplicação: <span className="font-bold truncate" title={peca.compatibilidade}>{peca.compatibilidade}</span>
              </div>

              <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-3">
                <div className="flex items-center gap-1">
                  {peca.quantidade === 0 ? (
                    <span className="text-sm font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Sem Estoque</span>
                  ) : peca.quantidade < 5 ? (
                    <span className="text-sm font-bold text-yellow-600 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Baixo ({peca.quantidade})</span>
                  ) : (
                    <span className="text-sm font-bold text-green-600 flex items-center gap-1"><Archive className="w-4 h-4"/> {peca.quantidade} unid.</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full border-gray-300">-</Button>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full border-gray-300 bg-gray-50">+</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}