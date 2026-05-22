import { useState, useEffect } from 'react';
import type { OrdemServico } from './types';
import { isFirebaseConfigured } from './firebase';
import {
  subscribeToOrdensServico,
  adicionarOS,
  fecharOS,
  reabrirOS,
  excluirOS,
} from './firestoreService';
import { useMockData } from './mockData';

export function useOrdensServico() {
  const { getOrdensServico } = useMockData();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFirebase] = useState(isFirebaseConfigured());

  useEffect(() => {
    if (isFirebaseConfigured()) {
      return subscribeToOrdensServico((data) => {
        setOrdens(data);
        setLoading(false);
      });
    } else {
      setOrdens(getOrdensServico() as OrdemServico[]);
      setLoading(false);
    }
  }, []);

  const addOS = async (os: Omit<OrdemServico, 'id' | 'criadoEm'>): Promise<string> => {
    if (usingFirebase) {
      return adicionarOS(os);
    } else {
      const id = `local-${Date.now()}`;
      setOrdens((prev) => [{ ...os, id }, ...prev]);
      return id;
    }
  };

  const closeOS = async (id: string, assinatura?: string): Promise<void> => {
    if (usingFirebase) {
      await fecharOS(id, assinatura);
    } else {
      setOrdens((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: 'Fechada', assinatura } : o))
      );
    }
  };

  const reopenOS = async (id: string): Promise<void> => {
    if (usingFirebase) {
      await reabrirOS(id);
    } else {
      setOrdens((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: 'Em Aberto', assinatura: undefined } : o))
      );
    }
  };

  const deleteOS = async (id: string): Promise<void> => {
    if (usingFirebase) {
      await excluirOS(id);
    } else {
      setOrdens((prev) => prev.filter((o) => o.id !== id));
    }
  };

  const getOrdemById = (id: string): OrdemServico | undefined =>
    ordens.find((o) => o.id === id);

  return { ordens, loading, usingFirebase, addOS, closeOS, reopenOS, deleteOS, getOrdemById };
}
