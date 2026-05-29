import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useOrdensServico } from '../lib/useOrdensServico';
import { intervaloSemana, naSemana, diasDoIntervalo, mesmaData, type Intervalo } from '../lib/semana';
import type { OrdemServico } from '../lib/types';
import { format } from 'date-fns';
import { DollarSign, Wallet, TrendingUp, TrendingDown, Plus, Loader2, Car, Receipt, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function metricasSemana(ordens: OrdemServico[], intervalo: Intervalo) {
  const fechadas = ordens.filter((o) => o.status === 'Fechada' && naSemana(o.data, intervalo));
  const faturamento = fechadas.reduce((a, o) => a + o.valor, 0);
  const custoPecas = fechadas.reduce(
    (a, o) => a + o.pecas.reduce((s, p) => s + (p.precoCompra ?? 0) * p.qtd, 0),
    0
  );
  const comissao = fechadas.reduce((a, o) => a + (o.comissao ?? 0), 0);
  const lucro = faturamento - custoPecas - comissao;
  const carros = fechadas.length;
  const ticket = carros ? faturamento / carros : 0;
  return { fechadas, faturamento, custoPecas, comissao, lucro, carros, ticket };
}

export function Dashboard() {
  const { ordens, loading } = useOrdensServico();
  const [offset, setOffset] = useState(0); // 0 = esta semana, 1 = semana passada
  const fmt = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const intervalo = intervaloSemana(offset);
  const m = metricasSemana(ordens, intervalo);
  const mPassada = metricasSemana(ordens, intervaloSemana(offset + 1));
  const aReceber = ordens.filter((o) => o.status !== 'Fechada').reduce((a, o) => a + o.valor, 0);

  const deltaPct =
    mPassada.faturamento > 0
      ? ((m.faturamento - mPassada.faturamento) / mPassada.faturamento) * 100
      : null;

  const dias = diasDoIntervalo(intervalo);
  const faturamentoPorDia = dias.map((dia) =>
    m.fechadas.filter((o) => mesmaData(o.data, dia)).reduce((a, o) => a + o.valor, 0)
  );
  const maxDia = Math.max(1, ...faturamentoPorDia);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Resumo da Semana</h2>
        <div className="flex bg-gray-200 rounded-full p-0.5 text-[11px] font-bold">
          <button
            onClick={() => setOffset(0)}
            className={`px-3 py-1 rounded-full transition-colors ${offset === 0 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Esta semana
          </button>
          <button
            onClick={() => setOffset(1)}
            className={`px-3 py-1 rounded-full transition-colors ${offset === 1 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Semana passada
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        {format(intervalo.inicio, 'dd/MM')} a {format(intervalo.fim, 'dd/MM')}
      </p>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {/* Faturamento */}
            <Card className="col-span-2 bg-gray-900 text-white border-none shadow-md">
              <CardHeader className="pb-1 pt-4">
                <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-gray-400" /> Faturamento (OS Fechadas)
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black">{fmt(m.faturamento)}</p>
                  {offset === 0 && deltaPct !== null && (
                    <span className={`flex items-center gap-1 text-xs font-bold mb-1 ${deltaPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {deltaPct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(deltaPct).toFixed(0)}% vs semana passada
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lucro estimado */}
            <Card className="border-green-200 bg-green-50 shadow-sm">
              <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-[10px] font-bold text-green-700 uppercase tracking-wider flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> Lucro Estimado
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-lg font-black text-green-700">{fmt(m.lucro)}</p>
                <p className="text-[9px] text-green-600/80 mt-0.5">peças e comissão já descontadas</p>
              </CardContent>
            </Card>

            {/* A receber */}
            <Card className="border-amber-200 bg-amber-50 shadow-sm">
              <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> A Receber (em aberto)
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-lg font-black text-amber-700">{fmt(aReceber)}</p>
                <p className="text-[9px] text-amber-600/80 mt-0.5">OS ainda não fechadas</p>
              </CardContent>
            </Card>

            {/* Comissão */}
            <Card className="border-red-100 bg-red-50/30">
              <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center">
                  <Wallet className="w-3 h-3 mr-1" /> Comissão (semana)
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-lg font-black text-red-600">{fmt(m.comissao)}</p>
              </CardContent>
            </Card>

            {/* Carros + Ticket */}
            <Card className="border-gray-200">
              <CardContent className="p-3 flex items-center gap-2">
                <Car className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-lg font-black text-gray-800 leading-none">{m.carros}</p>
                  <p className="text-[10px] text-gray-500 font-medium">carros</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-3 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-base font-black text-gray-800 leading-none">{fmt(m.ticket)}</p>
                  <p className="text-[10px] text-gray-500 font-medium">ticket médio</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Faturamento por dia */}
          <Card className="border-gray-200">
            <CardHeader className="pb-1 pt-3">
              <CardTitle className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Faturamento por dia</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-end justify-between gap-1 h-24">
                {faturamentoPorDia.map((valor, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                    <div
                      className={`w-full rounded-t ${valor > 0 ? 'bg-gray-800' : 'bg-gray-200'}`}
                      style={{ height: `${Math.max(4, (valor / maxDia) * 100)}%` }}
                      title={fmt(valor)}
                    />
                    <span className="text-[9px] text-gray-400 font-medium">{DIAS[i]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex justify-between items-center mt-6">
        <h2 className="text-lg font-bold">Últimas OS</h2>
        <Link to="/recibos/nova">
          <Button size="sm" className="gap-1 rounded-full"><Plus className="w-4 h-4" /> Nova OS</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {ordens.slice(0, 5).map((os) => (
          <Link to={`/recibos/${os.id}`} key={os.id} className="block">
            <Card className="hover:border-primary transition-colors">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{os.carro}</p>
                  <p className="text-xs text-muted-foreground">{os.cliente} • Mecânico: {os.mecanico}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{fmt(os.valor)}</p>
                  <span className={`text-[10px] px-2 py-1 rounded-full ${os.status === 'Fechada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {os.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
