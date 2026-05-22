import { useState, useEffect } from 'react';
import type { Peca } from './types';
import { isFirebaseConfigured } from './firebase';
import { subscribeToEstoque, adicionarPeca, atualizarQuantidade } from './firestoreService';
import { useMockData } from './mockData';

export function useEstoque() {
  const { getEstoque } = useMockData();
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFirebase, setUsingFirebase] = useState(false);

  useEffect(() => {
    if (isFirebaseConfigured()) {
      setUsingFirebase(true);
      const unsubscribe = subscribeToEstoque((data) => {
        setPecas(data);
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Fallback: mock data (app funciona sem Firebase configurado)
      setPecas(getEstoque() as Peca[]);
      setLoading(false);
    }
  }, []);

  const addPeca = async (peca: Omit<Peca, 'id'>): Promise<void> => {
    if (usingFirebase) {
      await adicionarPeca(peca);
    } else {
      setPecas((prev) => [...prev, { ...peca, id: `local-${Date.now()}` }]);
    }
  };

  const updateQty = async (id: string, delta: number): Promise<void> => {
    if (usingFirebase) {
      await atualizarQuantidade(id, delta);
    } else {
      setPecas((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, quantidade: Math.max(0, p.quantidade + delta) } : p
        )
      );
    }
  };

  return { pecas, loading, usingFirebase, addPeca, updateQty };
}
