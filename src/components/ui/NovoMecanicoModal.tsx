import React, { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import type { ComissaoTipo } from '../../lib/types';

interface NovoMecanicoModalProps {
  onSalvar: (nome: string, comissaoTipo: ComissaoTipo, comissaoValor: number) => Promise<void>;
  onFechar: () => void;
}

export function NovoMecanicoModal({ onSalvar, onFechar }: NovoMecanicoModalProps) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<ComissaoTipo>('percentual');
  const [valor, setValor] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = async () => {
    if (!nome.trim()) return;
    setSalvando(true);
    try {
      await onSalvar(nome.trim(), tipo, parseFloat(valor.replace(',', '.')) || 0);
      onFechar();
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-gray-700" />
            <h2 className="font-bold text-gray-800">Novo Mecânico</h2>
          </div>
          <button onClick={onFechar} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">
              Nome / Função
            </label>
            <Input
              placeholder="Ex: Carlos (Mecânico Pleno)"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">
              Como ganha comissão?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipo('percentual')}
                className={`h-10 rounded-md text-xs font-bold border transition-colors ${tipo === 'percentual' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}
              >
                % da mão de obra
              </button>
              <button
                type="button"
                onClick={() => setTipo('fixo')}
                className={`h-10 rounded-md text-xs font-bold border transition-colors ${tipo === 'fixo' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}
              >
                Valor fixo por carro
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">
              {tipo === 'percentual' ? 'Percentual (%)' : 'Valor por carro (R$)'}
            </label>
            <Input
              type="number"
              placeholder={tipo === 'percentual' ? 'Ex: 40' : 'Ex: 50,00'}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSalvar()}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-11" onClick={onFechar}>
              Cancelar
            </Button>
            <Button
              className="flex-1 h-11 bg-gray-900 text-white hover:bg-gray-800"
              onClick={handleSalvar}
              disabled={salvando || !nome.trim()}
            >
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Adicionar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
