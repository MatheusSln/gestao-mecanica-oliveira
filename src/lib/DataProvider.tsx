import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Peca, OrdemServico, Mecanico, ComissaoTipo } from './types';
import { isFirebaseConfigured } from './firebase';
import {
  subscribeToEstoque, adicionarPeca, atualizarQuantidade, removerPeca,
  subscribeToOrdensServico, adicionarOS, fecharOS, reabrirOS, excluirOS,
  subscribeToEquipe, adicionarMecanico, zerarComissaoMecanico, excluirMecanico,
  atualizarComissaoMecanico, initializeDataIfEmpty,
} from './firestoreService';
import { useMockData } from './mockData';

interface DataContextValue {
  pecas: Peca[];
  ordens: OrdemServico[];
  equipe: Mecanico[];
  loading: boolean;
  usingFirebase: boolean;
  addPeca: (peca: Omit<Peca, 'id'>) => Promise<void>;
  updateQty: (id: string, delta: number) => Promise<void>;
  removePeca: (id: string) => Promise<void>;
  addOS: (os: Omit<OrdemServico, 'id' | 'criadoEm'>) => Promise<string>;
  closeOS: (id: string, assinatura?: string) => Promise<void>;
  reopenOS: (id: string) => Promise<void>;
  deleteOS: (id: string) => Promise<void>;
  addMecanico: (nome: string, comissaoTipo?: ComissaoTipo, comissaoValor?: number) => Promise<void>;
  zerarComissao: (id: string) => Promise<void>;
  removeMecanico: (id: string) => Promise<void>;
  updateComissao: (id: string, comissaoTipo: ComissaoTipo, comissaoValor: number) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

const LS = {
  estoque: 'mecanica:estoque',
  ordens: 'mecanica:ordens',
  equipe: 'mecanica:equipe',
};

function loadLS<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* ignore */ }
  try { localStorage.setItem(key, JSON.stringify(seed)); } catch { /* ignore */ }
  return seed;
}

function saveLS(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

function novoId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { getEstoque, getEquipe, getOrdensServico } = useMockData();
  const usingFirebase = isFirebaseConfigured();
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [equipe, setEquipe] = useState<Mecanico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (usingFirebase) {
      initializeDataIfEmpty().catch(console.error);
      const arrived = { e: false, o: false, q: false };
      const done = () => { if (arrived.e && arrived.o && arrived.q) setLoading(false); };
      const u1 = subscribeToEstoque((d) => { setPecas(d); arrived.e = true; done(); });
      const u2 = subscribeToOrdensServico((d) => { setOrdens(d); arrived.o = true; done(); });
      const u3 = subscribeToEquipe((d) => { setEquipe(d); arrived.q = true; done(); });
      return () => { u1(); u2(); u3(); };
    }
    setPecas(loadLS(LS.estoque, getEstoque() as Peca[]));
    setOrdens(loadLS(LS.ordens, getOrdensServico() as OrdemServico[]));
    setEquipe(loadLS(LS.equipe, getEquipe() as Mecanico[]));
    setLoading(false);
  }, []);

  // ─── ESTOQUE ───────────────────────────────────────────────────────────────

  const addPeca = async (peca: Omit<Peca, 'id'>): Promise<void> => {
    if (usingFirebase) { await adicionarPeca(peca); return; }
    setPecas((prev) => {
      const next = [...prev, { ...peca, id: novoId() }];
      saveLS(LS.estoque, next);
      return next;
    });
  };

  const updateQty = async (id: string, delta: number): Promise<void> => {
    if (usingFirebase) { await atualizarQuantidade(id, delta); return; }
    setPecas((prev) => {
      const next = prev.map((p) =>
        p.id === id ? { ...p, quantidade: Math.max(0, p.quantidade + delta) } : p
      );
      saveLS(LS.estoque, next);
      return next;
    });
  };

  const removePeca = async (id: string): Promise<void> => {
    if (usingFirebase) { await removerPeca(id); return; }
    setPecas((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveLS(LS.estoque, next);
      return next;
    });
  };

  // ─── ORDENS DE SERVIÇO ───────────────────────────────────────────────────────

  const addOS = async (os: Omit<OrdemServico, 'id' | 'criadoEm'>): Promise<string> => {
    if (usingFirebase) return adicionarOS(os);

    const id = novoId();
    setOrdens((prev) => {
      const next = [{ ...os, id }, ...prev];
      saveLS(LS.ordens, next);
      return next;
    });
    if (os.mecanicoId) {
      setEquipe((prev) => {
        const next = prev.map((m) =>
          m.id === os.mecanicoId
            ? { ...m, comissaoSemana: m.comissaoSemana + (os.comissao ?? 0), carrosAtendidos: m.carrosAtendidos + 1 }
            : m
        );
        saveLS(LS.equipe, next);
        return next;
      });
    }
    setPecas((prev) => {
      const next = prev.map((p) => {
        const usado = os.pecas.filter((x) => x.pecaId === p.id).reduce((a, x) => a + x.qtd, 0);
        return usado ? { ...p, quantidade: Math.max(0, p.quantidade - usado) } : p;
      });
      saveLS(LS.estoque, next);
      return next;
    });
    return id;
  };

  const closeOS = async (id: string, assinatura?: string): Promise<void> => {
    if (usingFirebase) { await fecharOS(id, assinatura); return; }
    setOrdens((prev) => {
      const next = prev.map((o) =>
        o.id === id ? { ...o, status: 'Fechada' as const, assinatura } : o
      );
      saveLS(LS.ordens, next);
      return next;
    });
  };

  const reopenOS = async (id: string): Promise<void> => {
    if (usingFirebase) { await reabrirOS(id); return; }
    setOrdens((prev) => {
      const next = prev.map((o) =>
        o.id === id ? { ...o, status: 'Em Aberto' as const, assinatura: undefined } : o
      );
      saveLS(LS.ordens, next);
      return next;
    });
  };

  const deleteOS = async (id: string): Promise<void> => {
    const os = ordens.find((o) => o.id === id);
    if (usingFirebase) { await excluirOS(id, os?.pecas); return; }
    if (os) {
      setPecas((prev) => {
        const next = prev.map((p) => {
          const devolver = os.pecas.filter((x) => x.pecaId === p.id).reduce((a, x) => a + x.qtd, 0);
          return devolver ? { ...p, quantidade: p.quantidade + devolver } : p;
        });
        saveLS(LS.estoque, next);
        return next;
      });
    }
    setOrdens((prev) => {
      const next = prev.filter((o) => o.id !== id);
      saveLS(LS.ordens, next);
      return next;
    });
  };

  // ─── EQUIPE ──────────────────────────────────────────────────────────────────

  const addMecanico = async (
    nome: string,
    comissaoTipo: ComissaoTipo = 'percentual',
    comissaoValor = 0
  ): Promise<void> => {
    if (usingFirebase) { await adicionarMecanico(nome, comissaoTipo, comissaoValor); return; }
    setEquipe((prev) => {
      const next = [...prev, { id: novoId(), nome, comissaoSemana: 0, carrosAtendidos: 0, comissaoTipo, comissaoValor }];
      saveLS(LS.equipe, next);
      return next;
    });
  };

  const updateComissao = async (
    id: string,
    comissaoTipo: ComissaoTipo,
    comissaoValor: number
  ): Promise<void> => {
    if (usingFirebase) { await atualizarComissaoMecanico(id, comissaoTipo, comissaoValor); return; }
    setEquipe((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, comissaoTipo, comissaoValor } : m));
      saveLS(LS.equipe, next);
      return next;
    });
  };

  const zerarComissao = async (id: string): Promise<void> => {
    if (usingFirebase) { await zerarComissaoMecanico(id); return; }
    setEquipe((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, comissaoSemana: 0, carrosAtendidos: 0 } : m));
      saveLS(LS.equipe, next);
      return next;
    });
  };

  const removeMecanico = async (id: string): Promise<void> => {
    if (usingFirebase) { await excluirMecanico(id); return; }
    setEquipe((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveLS(LS.equipe, next);
      return next;
    });
  };

  const value: DataContextValue = {
    pecas, ordens, equipe, loading, usingFirebase,
    addPeca, updateQty, removePeca,
    addOS, closeOS, reopenOS, deleteOS,
    addMecanico, zerarComissao, removeMecanico, updateComissao,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData precisa estar dentro de <DataProvider>');
  return ctx;
}
