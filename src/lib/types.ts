export interface Peca {
  id: string;
  nome: string;
  marca: string;
  codigo: string;
  categoria: string;
  compatibilidade: string;
  quantidade: number;
  precoVenda: number;
  precoCompra?: number;
}

export interface OrdemServico {
  id: string;
  carro: string;
  placa: string;
  cliente: string;
  telefone: string;
  valor: number;
  status: 'Em Aberto' | 'Fechada';
  mecanico: string;
  pecas: { nome: string; qtd: number; precoVenda: number }[];
  maoObra: number;
  data: string;
}

export interface Mecanico {
  id: string;
  nome: string;
  comissaoSemana: number;
  carrosAtendidos: number;
}

export interface ProductLookupResult {
  nome: string;
  marca: string;
  categoria?: string;
  descricao?: string;
}
