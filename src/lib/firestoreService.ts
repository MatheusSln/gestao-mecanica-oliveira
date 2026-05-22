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
} from 'firebase/firestore';
import { db } from './firebase';
import type { Peca } from './types';

const ESTOQUE_COLLECTION = 'estoque';

export function subscribeToEstoque(callback: (pecas: Peca[]) => void): () => void {
  if (!db) return () => {};
  const q = query(collection(db, ESTOQUE_COLLECTION), orderBy('nome'));
  return onSnapshot(q, (snapshot) => {
    const pecas = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Peca[];
    callback(pecas);
  });
}

export async function adicionarPeca(peca: Omit<Peca, 'id'>): Promise<string> {
  if (!db) throw new Error('Firebase não configurado');
  const docRef = await addDoc(collection(db, ESTOQUE_COLLECTION), {
    ...peca,
    criadoEm: serverTimestamp(),
  });
  return docRef.id;
}

export async function atualizarQuantidade(id: string, delta: number): Promise<void> {
  if (!db) throw new Error('Firebase não configurado');
  const ref = doc(db, ESTOQUE_COLLECTION, id);
  await updateDoc(ref, { quantidade: increment(delta) });
}

export async function atualizarPeca(id: string, dados: Partial<Omit<Peca, 'id'>>): Promise<void> {
  if (!db) throw new Error('Firebase não configurado');
  const ref = doc(db, ESTOQUE_COLLECTION, id);
  await updateDoc(ref, dados);
}

export async function removerPeca(id: string): Promise<void> {
  if (!db) throw new Error('Firebase não configurado');
  await deleteDoc(doc(db, ESTOQUE_COLLECTION, id));
}
