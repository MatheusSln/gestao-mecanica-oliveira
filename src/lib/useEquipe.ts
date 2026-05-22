import { useState, useEffect } from 'react';
import type { Mecanico } from './types';
import { isFirebaseConfigured } from './firebase';
import {
  subscribeToEquipe,
  adicionarMecanico,
  zerarComissaoMecanico,
  excluirMecanico,
} from './firestoreService';
import { useMockData } from './mockData';

export function useEquipe() {
  const { getEquipe } = useMockData();
  const [equipe, setEquipe] = useState<Mecanico[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFirebase] = useState(isFirebaseConfigured());

  useEffect(() => {
    if (isFirebaseConfigured()) {
      return subscribeToEquipe((data) => {
        setEquipe(data);
        setLoading(false);
      });
    } else {
      setEquipe(getEquipe() as Mecanico[]);
      setLoading(false);
    }
  }, []);

  const addMecanico = async (nome: string): Promise<void> => {
    if (usingFirebase) {
      await adicionarMecanico(nome);
    } else {
      setEquipe((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, nome, comissaoSemana: 0, carrosAtendidos: 0 },
      ]);
    }
  };

  const zerarComissao = async (id: string): Promise<void> => {
    if (usingFirebase) {
      await zerarComissaoMecanico(id);
    } else {
      setEquipe((prev) =>
        prev.map((m) => (m.id === id ? { ...m, comissaoSemana: 0, carrosAtendidos: 0 } : m))
      );
    }
  };

  const removeMecanico = async (id: string): Promise<void> => {
    if (usingFirebase) {
      await excluirMecanico(id);
    } else {
      setEquipe((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return { equipe, loading, usingFirebase, addMecanico, zerarComissao, removeMecanico };
}
