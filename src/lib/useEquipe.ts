import { useData } from './DataProvider';

export function useEquipe() {
  const { equipe, loading, usingFirebase, addMecanico, zerarComissao, removeMecanico, updateComissao } = useData();
  return { equipe, loading, usingFirebase, addMecanico, zerarComissao, removeMecanico, updateComissao };
}
