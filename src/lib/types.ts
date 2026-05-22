export interface PecaOS {
  nome: string;
  qtd: number;
  precoVenda: number;
}

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
  mecanico: string;
  mecanicoId: string;
  pecas: PecaOS[];
  maoObra: number;
  valor: number;
  status: 'Em Aberto' | 'Fechada';
  data: string;
  assinatura?: string;
  criadoEm?: unknown;
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
}
