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
  getDocs,
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

// ─── SEED ────────────────────────────────────────────────────────────────────

let seedRun: Promise<void> | null = null;

export function initializeDataIfEmpty(): Promise<void> {
  if (!db) return Promise.resolve();
  // Idempotente: StrictMode (dev) dispara o efeito 2x; sem isto o seed grava duplicado.
  if (!seedRun) seedRun = _initializeDataIfEmpty();
  return seedRun;
}

async function _initializeDataIfEmpty(): Promise<void> {
  if (!db) return;

  const [estoqueSnap, osSnap, equipeSnap] = await Promise.all([
    getDocs(collection(db, 'estoque')),
    getDocs(collection(db, 'ordensServico')),
    getDocs(collection(db, 'equipe')),
  ]);

  const batch = writeBatch(db);
  let hasData = false;

  if (estoqueSnap.empty) {
    hasData = true;
    const pecasSeed: Omit<Peca, 'id'>[] = [
      { nome: 'Óleo 5W30 Sintético', marca: 'Mobil', codigo: 'MO-5W30', categoria: 'Lubrificantes', compatibilidade: 'Universal', quantidade: 12, precoVenda: 45.00 },
      { nome: 'Óleo 15W40 Semissintético', marca: 'Castrol', codigo: 'CA-15W40', categoria: 'Lubrificantes', compatibilidade: 'Universal', quantidade: 8, precoVenda: 38.00 },
      { nome: 'Filtro de Óleo', marca: 'Tecfil', codigo: 'PSL55', categoria: 'Filtros', compatibilidade: 'VW Motor EA111/EA211', quantidade: 15, precoVenda: 25.00 },
      { nome: 'Filtro de Ar', marca: 'Mann', codigo: 'C2998', categoria: 'Filtros', compatibilidade: 'Honda Civic 17+', quantidade: 4, precoVenda: 65.00 },
      { nome: 'Pastilha de Freio Dianteira', marca: 'Cobreq', codigo: 'N-1502', categoria: 'Freios', compatibilidade: 'Honda Civic 17+', quantidade: 2, precoVenda: 280.00 },
      { nome: 'Pastilha de Freio Dianteira', marca: 'Fras-le', codigo: 'PD/371', categoria: 'Freios', compatibilidade: 'VW Gol/Voyage G5', quantidade: 6, precoVenda: 110.00 },
      { nome: 'Correia Dentada', marca: 'Dayco', codigo: '135SP254H', categoria: 'Motor', compatibilidade: 'VW Motor EA111', quantidade: 3, precoVenda: 145.00 },
      { nome: 'Amortecedor Dianteiro', marca: 'Monroe', codigo: 'SP041', categoria: 'Suspensão', compatibilidade: 'GM Onix 13-19', quantidade: 0, precoVenda: 350.00 },
    ];
    pecasSeed.forEach((p) => batch.set(doc(collection(db!, 'estoque')), { ...p, criadoEm: serverTimestamp() }));
  }

  // Seed equipe first to get IDs for OS
  const mecanicoIds: Record<string, string> = {};
  if (equipeSnap.empty) {
    hasData = true;
    const mecanicos = [
      { nome: 'Marcos (Mecânico Sênior)', comissaoSemana: 850.00, carrosAtendidos: 4, comissaoTipo: 'percentual', comissaoValor: 40 },
      { nome: 'Pedro (Auxiliar)', comissaoSemana: 400.00, carrosAtendidos: 2, comissaoTipo: 'percentual', comissaoValor: 25 },
    ];
    mecanicos.forEach((m) => {
      const ref = doc(collection(db!, 'equipe'));
      mecanicoIds[m.nome] = ref.id;
      batch.set(ref, { ...m, criadoEm: serverTimestamp() });
    });
  }

  if (osSnap.empty) {
    hasData = true;
    const marcosId = mecanicoIds['Marcos (Mecânico Sênior)'] ?? 'local';
    const pedroId = mecanicoIds['Pedro (Auxiliar)'] ?? 'local';

    const osSeed: Omit<OrdemServico, 'id'>[] = [
      {
        carro: 'Gol G5 1.0', placa: 'ABC-1234', cliente: 'João Silva', telefone: '(31) 98888-1111',
        mecanico: 'Marcos (Mecânico Sênior)', mecanicoId: marcosId,
        pecas: [
          { nome: 'Óleo 5W30 Sintético', qtd: 4, precoVenda: 45.00 },
          { nome: 'Filtro de Ar', qtd: 1, precoVenda: 35.00 },
        ] as PecaOS[],
        maoObra: 515.00, valor: 850.00, status: 'Fechada', data: '24/04/2026',
        criadoEm: serverTimestamp(),
      },
      {
        carro: 'Civic 2018 2.0', placa: 'XYZ-9876', cliente: 'Maria Souza', telefone: '(31) 97777-2222',
        mecanico: 'Pedro (Auxiliar)', mecanicoId: pedroId,
        pecas: [
          { nome: 'Pastilha de Freio Dianteira', qtd: 1, precoVenda: 280.00 },
          { nome: 'Correia Dentada', qtd: 2, precoVenda: 180.00 },
        ] as PecaOS[],
        maoObra: 560.00, valor: 1200.00, status: 'Fechada', data: '25/04/2026',
        criadoEm: serverTimestamp(),
      },
      {
        carro: 'Hilux 2.8 Diesel', placa: 'HIL-0001', cliente: 'Carlos', telefone: '(31) 96666-3333',
        mecanico: 'Marcos (Mecânico Sênior)', mecanicoId: marcosId,
        pecas: [] as PecaOS[],
        maoObra: 450.00, valor: 450.00, status: 'Em Aberto', data: '27/04/2026',
        criadoEm: serverTimestamp(),
      },
    ];
    osSeed.forEach((os) => batch.set(doc(collection(db!, 'ordensServico')), os));
  }

  if (hasData) await batch.commit();
}
