import type { ProductLookupResult } from './types';

const UPC_API = 'https://api.upcitemdb.com/prod/trial/lookup?upc=';

export async function buscarProdutoPorCodigo(codigo: string): Promise<ProductLookupResult | null> {
  try {
    const response = await fetch(`${UPC_API}${encodeURIComponent(codigo)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.code !== 'OK' || !data.items?.length) return null;
    const item = data.items[0];
    return {
      nome: item.title ?? '',
      marca: item.brand ?? '',
      categoria: mapearCategoria(item.category ?? ''),
    };
  } catch {
    return null;
  }
}

function mapearCategoria(cat: string): string {
  const lower = cat.toLowerCase();
  if (lower.includes('oil') || lower.includes('lubric')) return 'Lubrificantes';
  if (lower.includes('filter')) return 'Filtros';
  if (lower.includes('brake') || lower.includes('freio')) return 'Freios';
  if (lower.includes('engine') || lower.includes('motor')) return 'Motor';
  if (lower.includes('suspen') || lower.includes('shock')) return 'Suspensão';
  return '';
}
