import type { OrdemServico } from './types';
import { useData } from './DataProvider';

export function useOrdensServico() {
  const { ordens, loading, usingFirebase, addOS, closeOS, reopenOS, deleteOS } = useData();
  const getOrdemById = (id: string): OrdemServico | undefined =>
    ordens.find((o) => o.id === id);
  return { ordens, loading, usingFirebase, addOS, closeOS, reopenOS, deleteOS, getOrdemById };
}
