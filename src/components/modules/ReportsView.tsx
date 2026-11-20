import React, { useState } from 'react';
import { Info } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Advisor, Lead, Property, RentPayment } from '../../types/crm';
import { formatMXN } from '../../utils/crmLogic';

export interface ReportsViewProps {
  properties: Property[];
  leads: Lead[];
  advisors: Advisor[];
  payments: RentPayment[];
}

type PeriodOption = '30d' | 'trimestre' | '6m' | 'anual';

const PERIOD_MULTIPLIERS: Record<PeriodOption, number> = {
  '30d': 0.35,
  trimestre: 1,
  '6m': 1.85,
  anual: 3.4,
};

export const ReportsView: React.FC<ReportsViewProps> = ({
  properties,
  leads,
  advisors,
  payments,
}) => {
  const [period, setPeriod] = useState<PeriodOption>('trimestre');
  const mult = PERIOD_MULTIPLIERS[period];

  const salesVsRentalsData = [
    { mes: 'Jul', ventas: Math.round(24.5 * mult * 10) / 10, rentas: Math.round(2.1 * mult * 10) / 10 },
    { mes: 'Ago', ventas: Math.round(21.0 * mult * 10) / 10, rentas: Math.round(2.4 * mult * 10) / 10 },
    { mes: 'Sep', ventas: Math.round(29.4 * mult * 10) / 10, rentas: Math.round(2.6 * mult * 10) / 10 },
    { mes: 'Oct', ventas: Math.round(34.8 * mult * 10) / 10, rentas: Math.round(2.8 * mult * 10) / 10 },
    { mes: 'Nov', ventas: Math.round(38.6 * mult * 10) / 10, rentas: Math.round(3.1 * mult * 10) / 10 },
  ];

  const funnelStages = [
    { etapa: 'Nuevos', cantidad: leads.length },
    { etapa: 'Contactados', cantidad: leads.filter((l) => l.stage !== 'Nuevo').length },
    {
      etapa: 'Visita',
      cantidad: leads.filter((l) =>
        ['Visita agendada', 'Visita realizada', 'Oferta', 'Cerrado ganado'].includes(l.stage),
      ).length,
    },
    {
      etapa: 'Oferta',
      cantidad: leads.filter((l) => ['Oferta', 'Cerrado ganado'].includes(l.stage)).length,
    },
    {
      etapa: 'Cerrado',
      cantidad: leads.filter((l) => l.stage === 'Cerrado ganado').length,
    },
  ];

  const advisorPerformance = advisors.map((a) => ({
    nombre: a.name.split(' ')[0],
    cierres: Math.max(1, Math.round(a.closedDealsQuarter * mult)),
    volumenM: Math.round((a.monthlyVolumeMXN / 1_000_000) * mult * 10) / 10,
  }));

  const topViewedProperties = [...properties]
    .sort((a, b) => b.viewsCount - a.viewsCount)
    .slice(0, 5);

  const paidPayments = payments.filter((p) => p.status === 'Pagado').reduce((s, p) => s + p.amountMXN, 0);
  const totalPayments = payments.reduce((s, p) => s + p.amountMXN, 0);
  const collectionRate = totalPayments > 0 ? Math.round((paidPayments / totalPayments) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Demo Disclaimer + Period Selector */}
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-blue-200/80 bg-blue-50/50 p-4 sm:flex-row sm:items-center dark:border-blue-900/50 dark:bg-blue-950/20">
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1E3A8A] dark:text-blue-400" />
          <p className="text-xs text-slate-700 dark:text-slate-300">
            <strong>Datos de demostración:</strong> Los indicadores y series históricas presentadas corresponden al dataset de prueba de Lumark Propiedades para evaluación visual del módulo analítico.
          </p>
        </div>

        <select
          aria-label="Seleccionar periodo de reporte"
          value={period}
          onChange={(e) => setPeriod(e.target.value as PeriodOption)}
          className="h-9 shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="30d">Últimos 30 días</option>
          <option value="trimestre">Trimestre actual</option>
          <option value="6m">Últimos 6 meses</option>
          <option value="anual">Año 2026</option>
        </select>
      </div>

      {/* Summary Indicators */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A]">
          <span className="text-xs text-slate-500 dark:text-slate-400">Tiempo promedio de cierre</span>
          <p className="mt-1.5 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            34 días
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
            Demo: -4 días vs. trimestre previo
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A]">
          <span className="text-xs text-slate-500 dark:text-slate-400">Conversión de prospectos</span>
          <p className="mt-1.5 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {Math.round(
              (leads.filter((l) => l.stage === 'Cerrado ganado').length / Math.max(1, leads.length)) *
                100,
            )}
            %
          </p>
          <span className="text-[11px] text-slate-500">De ingreso a cierre ganado</span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A]">
          <span className="text-xs text-slate-500 dark:text-slate-400">Inventario disponible</span>
          <p className="mt-1.5 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {properties.filter((p) => p.status === 'Disponible').length} inmuebles
          </p>
          <span className="text-[11px] text-slate-500">De {properties.length} en cartera</span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A]">
          <span className="text-xs text-slate-500 dark:text-slate-400">Efectividad de cobranza</span>
          <p className="mt-1.5 font-display text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {collectionRate}%
          </p>
          <span className="text-[11px] text-slate-500 tabular-nums">
            {formatMXN(paidPayments)} cobrados
          </span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 lg:col-span-6 dark:border-slate-800 dark:bg-[#0F172A]">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Ventas vs. rentas por periodo (Millones MXN · Demo)
          </h3>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesVsRentalsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.4} />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="ventas" name="Ventas (M)" fill="#1E3A8A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="rentas" name="Rentas (M)" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 lg:col-span-6 dark:border-slate-800 dark:bg-[#0F172A]">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Conversión del embudo comercial
          </h3>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={funnelStages}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.4} />
                <XAxis dataKey="etapa" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="cantidad" name="Prospectos" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advisor Performance & Top Viewed Properties */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 lg:col-span-6 dark:border-slate-800 dark:bg-[#0F172A]">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Rendimiento por asesor (Volumen M MXN · Demo)
          </h3>
          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={advisorPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.4} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="nombre" type="category" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={75} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="volumenM" name="Volumen (M MXN)" fill="#1E3A8A" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 lg:col-span-6 dark:border-slate-800 dark:bg-[#0F172A]">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Propiedades más consultadas
          </h3>
          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {topViewedProperties.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                    {p.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {p.city} · {formatMXN(p.priceMXN)}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200 tabular-nums">
                  {p.viewsCount} vistas
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
