import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  increment,
  serverTimestamp,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Peca, OrdemServico, Mecanico, PecaOS, ComissaoTipo } from './types';

// ─── ESTOQUE ─────────────────────────────────────────────────────────────────

export function subscribeToEstoque(callback: (pecas: Peca[]) => void): () => void {
  if (!db) return () => {};
  const q = query(collection(db, 'estoque'), orderBy('nome'));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Peca))
  );
}

export async function adicionarPeca(peca: Omit<Peca, 'id'>): Promise<string> {
  if (!db) throw new Error('Firebase não configurado');
  const ref = await addDoc(collection(db, 'estoque'), { ...peca, criadoEm: serverTimestamp() });
  return ref.id;
}

export async function atualizarQuantidade(id: string, delta: number): Promise<void> {
  if (!db) throw new Error('Firebase não configurado');
  await updateDoc(doc(db, 'estoque', id), { quantidade: increment(delta) });
}

export async function removerPeca(id: string): Promise<void> {
  if (!db) throw new Error('Firebase não configurado');
  await deleteDoc(doc(db, 'estoque', id));
}

// ─── ORDENS DE SERVIÇO ───────────────────────────────────────────────────────

export function subscribeToOrdensServico(callback: (ordens: OrdemServico[]) => void): () => void {
  if (!db) return () => {};
  const q = query(collection(db, 'ordensServico'), orderBy('criadoEm', 'desc'));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as OrdemServico)
  ));
}

export async function adicionarOS(
  os: Omit<OrdemServico, 'id' | 'criadoEm'>
): Promise<string> {
  if (!db) throw new Error('Firebase não configurado');
  const batch = writeBatch(db);
  const osRef = doc(collection(db, 'ordensServico'));
  batch.set(osRef, { ...os, criadoEm: serverTimestamp() });
  // Atualiza a comissão e contador do mecânico
  if (os.mecanicoId) {
    batch.update(doc(db, 'equipe', os.mecanicoId), {
      comissaoSemana: increment(os.comissao ?? 0),
      carrosAtendidos: increment(1),
    });
  }
  // Baixa do estoque para peças vinculadas a um item cadastrado
  for (const peca of os.pecas) {
    if (peca.pecaId) {
      batch.update(doc(db, 'estoque', peca.pecaId), { quantidade: increment(-peca.qtd) });
    }
  }
  await batch.commit();
  return osRef.id;
}

type OSData = Omit<OrdemServico, 'id' | 'criadoEm' | 'status' | 'assinatura'>;

export async function atualizarOS(
  id: string,
  nova: OSData,
  antiga: OrdemServico,
  validos: { pecas: Set<string>; equipe: Set<string> }
): Promise<void> {
  if (!db) throw new Error('Firebase não configurado');
  const batch = writeBatch(db);

  batch.update(doc(db, 'ordensServico', id), {
    carro: nova.carro,
    placa: nova.placa,
    cliente: nova.cliente,
    telefone: nova.telefone,
    mecanico: nova.mecanico,
    mecanicoId: nova.mecanicoId,
    pecas: nova.pecas,
    maoObra: nova.maoObra,
    valor: nova.valor,
    data: nova.data,
    comissao: nova.comissao ?? 0,
  });

  // Reconcilia estoque: devolve as peças antigas e baixa as novas (delta líquido).
  // Só toca em peças que ainda existem (evita falhar o batch por doc removido).
  const deltas = new Map<string, number>();
  for (const p of antiga.pecas) if (p.pecaId) deltas.set(p.pecaId, (deltas.get(p.pecaId) ?? 0) + p.qtd);
  for (const p of nova.pecas) if (p.pecaId) deltas.set(p.pecaId, (deltas.get(p.pecaId) ?? 0) - p.qtd);
  for (const [pecaId, delta] of deltas) {
    if (delta !== 0 && validos.pecas.has(pecaId)) {
      batch.update(doc(db, 'estoque', pecaId), { quantidade: increment(delta) });
    }
  }

  // Reconcilia comissão / contador de carros (só mecânicos que ainda existem)
  const antComissao = antiga.comissao ?? 0;
  const novaComissao = nova.comissao ?? 0;
  if (antiga.mecanicoId === nova.mecanicoId) {
    if (nova.mecanicoId && validos.equipe.has(nova.mecanicoId) && novaComissao !== antComissao) {
      batch.update(doc(db, 'equipe', nova.mecanicoId), { comissaoSemana: increment(novaComissao - antComissao) });
    }
  } else {
    if (antiga.mecanicoId && validos.equipe.has(antiga.mecanicoId)) {
      batch.update(doc(db, 'equipe', antiga.mecanicoId), {
        comissaoSemana: increment(-antComissao),
        carrosAtendidos: increment(-1),
      });
    }
    if (nova.mecanicoId && validos.equipe.has(nova.mecanicoId)) {
      batch.update(doc(db, 'equipe', nova.mecanicoId), {
        comissaoSemana: increment(novaComissao),
        carrosAtendidos: increment(1),
      });
    }
  }

  await batch.commit();
}

export async function fecharOS(id: string, assinatura?: string): Promise<void> {
  if (!db) throw new Error('Firebase não configurado');
  const data: Record<string, unknown> = { status: 'Fechada' };
  if (assinatura) data.assinatura = assinatura;
  await updateDoc(doc(db, 'ordensServico', id), data);
}

export async function reabrirOS(id: string): Promise<void> {
  if (!db) throw new Error('Firebase não configurado');
  await updateDoc(doc(db, 'ordensServico', id), { status: 'Em Aberto' });
}

export async function excluirOS(id: string, pecas?: PecaOS[]): Promise<void> {
  if (!db) throw new Error('Firebase não configurado');
  const batch = writeBatch(db);
  batch.delete(doc(db, 'ordensServico', id));
  // Devolve ao estoque as peças que tinham baixado
  for (const peca of pecas ?? []) {
    if (peca.pecaId) {
      batch.update(doc(db, 'estoque', peca.pecaId), { quantidade: increment(peca.qtd) });
    }
  }
  await batch.commit();
}

// ─── EQUIPE ──────────────────────────────────────────────────────────────────

export function subscribeToEquipe(callback: (equipe: Mecanico[]) => void): () => void {
  if (!db) return () => {};
  const q = query(collection(db, 'equipe'), orderBy('nome'));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Mecanico))
  );
}

export async function adicionarMecanico(
  nome: string,
  comissaoTipo: ComissaoTipo = 'percentual',
  comissaoValor = 0
): Promise<string> {
  if (!db) throw new Error('Firebase não configurado');
  const ref = await addDoc(collection(db, 'equipe'), {
    nome,
    comissaoSemana: 0,
    carrosAtendidos: 0,
    comissaoTipo,
    comissaoValor,
    criadoEm: serverTimestamp(),
  });
  return ref.id;
}

export async function atualizarComissaoMecanico(
  id: string,
  comissaoTipo: ComissaoTipo,
  comissaoValor: number
): Promise<void> {
  if (!db) throw new Error('Firebase não configurado');
  await updateDoc(doc(db, 'equipe', id), { comissaoTipo, comissaoValor });
}

export async function zerarComissaoMecanico(id: string): Promise<void> {
  if (!db) throw new Error('Firebase não configurado');
  await updateDoc(doc(db, 'equipe', id), { comissaoSemana: 0, carrosAtendidos: 0 });
}

export async function excluirMecanico(id: string): Promise<void> {
  if (!db) throw new Error('Firebase não configurado');
  await deleteDoc(doc(db, 'equipe', id));
}
