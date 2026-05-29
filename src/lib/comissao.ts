import type { Mecanico } from './types';

type ConfigComissao = Pick<Mecanico, 'comissaoTipo' | 'comissaoValor'>;

/** Comissão gerada por uma OS, segundo a regra do mecânico. */
export function calcComissao(mecanico: ConfigComissao | undefined, maoObra: number): number {
  if (!mecanico || !mecanico.comissaoValor) return 0;
  if (mecanico.comissaoTipo === 'fixo') return mecanico.comissaoValor;
  return maoObra * (mecanico.comissaoValor / 100);
}

/** Texto curto descrevendo a regra de comissão (ex: "40% da mão de obra" ou "R$ 50/carro"). */
export function descreveComissao(mecanico: ConfigComissao): string {
  if (!mecanico.comissaoValor) return 'Sem comissão definida';
  if (mecanico.comissaoTipo === 'fixo') {
    return `R$ ${mecanico.comissaoValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/carro`;
  }
  return `${mecanico.comissaoValor}% da mão de obra`;
}
