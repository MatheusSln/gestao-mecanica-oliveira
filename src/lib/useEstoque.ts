import { useData } from './DataProvider';

export function useEstoque() {
  const { pecas, loading, usingFirebase, addPeca, updateQty, removePeca } = useData();
  return { pecas, loading, usingFirebase, addPeca, updateQty, removePeca };
}
