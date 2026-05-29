import { parse, startOfWeek, endOfWeek, isWithinInterval, subWeeks, eachDayOfInterval, isSameDay } from 'date-fns';

export interface Intervalo {
  inicio: Date;
  fim: Date;
}

const OPCOES = { weekStartsOn: 1 as const }; // semana começa na segunda

/** Converte 'dd/MM/yyyy' (formato salvo nas OS) em Date, ou null se inválido. */
export function parseData(data: string): Date | null {
  const d = parse(data, 'dd/MM/yyyy', new Date());
  return isNaN(d.getTime()) ? null : d;
}

/** Intervalo seg–dom da semana. offset=0 esta semana, 1 semana passada, etc. */
export function intervaloSemana(offset = 0): Intervalo {
  const base = subWeeks(new Date(), offset);
  return { inicio: startOfWeek(base, OPCOES), fim: endOfWeek(base, OPCOES) };
}

export function naSemana(data: string, intervalo: Intervalo): boolean {
  const d = parseData(data);
  return d ? isWithinInterval(d, { start: intervalo.inicio, end: intervalo.fim }) : false;
}

/** Dias do intervalo (para o gráfico de barras por dia). */
export function diasDoIntervalo(intervalo: Intervalo): Date[] {
  return eachDayOfInterval({ start: intervalo.inicio, end: intervalo.fim });
}

export function mesmaData(data: string, dia: Date): boolean {
  const d = parseData(data);
  return d ? isSameDay(d, dia) : false;
}
