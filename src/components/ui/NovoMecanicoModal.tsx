import React, { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

interface NovoMecanicoModalProps {
  onSalvar: (nome: string) => Promise<void>;
  onFechar: () => void;
}

export function NovoMecanicoModal({ onSalvar, onFechar }: NovoMecanicoModalProps) {
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = async () => {
    if (!nome.trim()) return;
    setSalvando(true);
    try {
      await onSalvar(nome.trim());
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
              onKeyDown={(e) => e.key === 'Enter' && handleSalvar()}
              autoFocus
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
