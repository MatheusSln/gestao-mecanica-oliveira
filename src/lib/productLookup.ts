import type { ProductLookupResult } from './types';

const UPC_API = 'https://api.upcitemdb.com/prod/trial/lookup?upc=';

export async function buscarProdutoPorCodigo(codigo: string): Promise<ProductLookupResult[]> {
  try {
    const response = await fetch(`${UPC_API}${encodeURIComponent(codigo)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return [];
    const data = await response.json();
    if (data.code !== 'OK' || !data.items?.length) return [];
    
    return data.items.map((item: any) => ({
      nome: item.title ?? '',
      marca: item.brand ?? '',
      categoria: mapearCategoria(item.category ?? ''),
    }));
  } catch {
    return [];
  }
}

function mapearCategoria(cat: string | string[]): string {
  if (!cat) return '';
  const categoryStr = Array.isArray(cat) ? cat.join(' ') : String(cat);
  const lower = categoryStr.toLowerCase();
  if (lower.includes('oil') || lower.includes('lubric')) return 'Lubrificantes';
  if (lower.includes('filter')) return 'Filtros';
  if (lower.includes('brake') || lower.includes('freio')) return 'Freios';
  if (lower.includes('engine') || lower.includes('motor')) return 'Motor';
  if (lower.includes('suspen') || lower.includes('shock')) return 'Suspensão';
  return '';
}
