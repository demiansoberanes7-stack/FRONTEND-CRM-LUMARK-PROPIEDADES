import React from 'react';
import {
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Home,
  KeyRound,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  Advisor,
  Lead,
  ModuleId,
  Property,
  RentalContract,
  RentPayment,
  RoleId,
  Visit,
} from '../../types/crm';
import { LEAD_EVOLUTION_SERIES, MONTHLY_SALES_SERIES } from '../../data/mockData';
import { calculateDashboardSummary, formatMXN } from '../../utils/crmLogic';
import { StatusBadge } from '../ui/StatusBadge';

export interface DashboardViewProps {
  activeRole: RoleId;
  activeAdvisor: Advisor;
  advisors: Advisor[];
  properties: Property[];
  leads: Lead[];
  visits: Visit[];
  contracts: RentalContract[];
  payments: RentPayment[];
  onNavigate: (mod: ModuleId) => void;
  onSelectProperty: (prop: Property) => void;
}

const PIE_COLORS = ['#059669', '#2563EB', '#F59E0B', '#1E3A8A', '#64748B'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeRole,
  activeAdvisor,
  advisors,
  properties,
  leads,
  visits,
  contracts,
  payments,
  onNavigate,
  onSelectProperty,
}) => {
  const summary = calculateDashboardSummary({
    properties,
    leads,
    visits,
    payments,
    contracts,
    advisors,
    role: activeRole,
    activeAdvisorId: activeAdvisor.id,
  });

  const scopedProps =
    activeRole === 'administrador'
      ? properties
      : properties.filter((p) => p.advisorId === activeAdvisor.id);

  const statusDistribution = [
    { name: 'Disponible', value: scopedProps.filter((p) => p.status === 'Disponible').length },
    { name: 'En negociación', value: scopedProps.filter((p) => p.status === 'En negociación' || p.status === 'Apartada').length },
    { name: 'Rentada', value: scopedProps.filter((p) => p.status === 'Rentada').length },
    { name: 'Vendida', value: scopedProps.filter((p) => p.status === 'Vendida').length },
  ].filter((item) => item.value > 0);

  const upcomingVisits = visits
    .filter((v) =>
      activeRole === 'administrador' ? true : v.advisorId === activeAdvisor.id,
    )
    .filter((v) => v.status !== 'Cancelada' && v.status !== 'Rechazada')
    .slice(0, 5);

  const recentActivities = scopedProps
    .flatMap((prop) =>
      prop.activities.map((act) => ({
        ...act,
        propertyTitle: prop.title,
        property: prop,
      })),
    )
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const kpiCards = [
    {
      label: 'Propiedades activas',
      value: String(summary.activeProperties),
      sub: `${scopedProps.length} en cartera`,
      icon: Building2,
      action: () => onNavigate('propiedades'),
    },
    {
      label: 'Vendidas / Rentadas',
      value: `${summary.soldProperties} / ${summary.rentedProperties}`,
      sub: 'Operaciones colocadas',
      icon: Home,
      action: () => onNavigate('propiedades'),
    },
    {
      label: 'Prospectos nuevos',
      value: String(summary.newLeadsCount),
      sub: `${formatMXN(summary.pipelinePotentialMXN, true)} potencial`,
      icon: UserPlus,
      action: () => onNavigate('prospectos'),
    },
    {
      label: 'Visitas programadas',
      value: String(summary.scheduledVisitsCount),
      sub: 'Próximos 7 días',
      icon: Calendar,
      action: () => onNavigate('agenda'),
    },
    {
      label: 'Operaciones cerradas',
      value: String(summary.closedDealsCount),
      sub: activeRole === 'administrador' ? 'Cierres equipo Q4' : 'Tus cierres Q4',
      icon: CheckCircle2,
      action: () => onNavigate('prospectos'),
    },
    {
      label: 'Cobranza recibida',
      value: formatMXN(summary.collectionTotalMXN, true),
      sub: `${formatMXN(summary.pendingCollectionMXN, true)} por cobrar`,
      icon: DollarSign,
      action: () => onNavigate('rentas'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Saludo personalizado + resumen de actividad */}
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-5 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-[#0F172A]">
        <div>
          <p className="text-xs font-semibold text-[#1E3A8A] dark:text-blue-400">
            {activeRole === 'administrador'
              ? 'Dirección Comercial · Vista Global'
              : `Portafolio Personal · ${activeAdvisor.zone}`}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
            Hola, {activeAdvisor.name.split(' ')[0]}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {activeRole === 'administrador'
              ? `Supervisas ${properties.length} inmuebles en Baja California, ${leads.length} prospectos activos y ${contracts.length} contratos de renta.`
              : `Tienes ${summary.activeProperties} inmuebles activos asignados, ${summary.scheduledVisitsCount} visitas en agenda y ${summary.newLeadsCount} prospectos por contactar.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('prospectos')}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
          >
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Ir al Pipeline</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('agenda')}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-3.5 text-xs font-semibold text-white transition-colors hover:bg-[#172554] dark:bg-blue-600 dark:hover:bg-blue-500 whitespace-nowrap"
          >
            <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Ver Agenda</span>
          </button>
        </div>
      </section>

      {/* KPI Grid */}
      <section aria-label="Indicadores principales" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <button
              key={kpi.label}
              type="button"
              onClick={kpi.action}
              className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 text-left transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-[#0F172A] dark:hover:border-slate-700"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {kpi.label}
                </span>
                <Icon className="h-4 w-4 text-slate-400 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-400" aria-hidden="true" />
              </div>
              <div className="mt-3">
                <p className="font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {kpi.value}
                </p>
                <p className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                  <span>{kpi.sub}</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                </p>
              </div>
            </button>
          );
        })}
      </section>

      {/* Charts Row */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Ventas por mes */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 lg:col-span-5 dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {activeRole === 'administrador' ? 'Ventas y rentas por mes' : 'Rendimiento comercial mensual'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Volumen colocado en millones MXN (datos demo)
              </p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_SALES_SERIES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.4} />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`$${value ?? 0}M MXN`, 'Volumen']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="ventasMXN" name="Ventas" fill="#2563EB" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="rentasMXN" name="Rentas" fill="#059669" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evolución de prospectos */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 lg:col-span-4 dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Evolución de prospectos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nuevos leads vs. calificados y visitas
            </p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={LEAD_EVOLUTION_SERIES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.4} />
                <XAxis dataKey="semana" interval={0} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="nuevos"
                  name="Nuevos"
                  stroke="#2563EB"
                  fill="#2563EB"
                  fillOpacity={0.14}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="visitas"
                  name="Visitas"
                  stroke="#059669"
                  fill="#059669"
                  fillOpacity={0.16}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución por estatus */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 lg:col-span-3 dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Propiedades por estatus
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribución de inventario
            </p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={44}
                  outerRadius={68}
                  paddingAngle={3}
                  isAnimationActive={false}
                >
                  {statusDistribution.map((entry, idx) => (
                    <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5">
            {statusDistribution.map((entry, idx) => (
              <li key={entry.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  {entry.name}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                  {entry.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bottom Row: Activity, Upcoming Visits, Advisor Ranking */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Próximas visitas */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 lg:col-span-4 dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Próximas visitas
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('agenda')}
              className="text-xs font-semibold text-[#1E3A8A] hover:underline dark:text-blue-400"
            >
              Abrir agenda
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {upcomingVisits.map((visit) => {
              const prop = properties.find((p) => p.id === visit.propertyId);
              const lead = leads.find((l) => l.id === visit.leadId);
              return (
                <div key={visit.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {prop?.title ?? 'Inmueble'}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      {visit.date} · {visit.time} · {lead?.name ?? 'Prospecto'}
                    </p>
                  </div>
                  <StatusBadge status={visit.status} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 lg:col-span-4 dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Actividad reciente
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('propiedades')}
              className="text-xs font-semibold text-[#1E3A8A] hover:underline dark:text-blue-400"
            >
              Ver catálogo
            </button>
          </div>
          <div className="space-y-3">
            {recentActivities.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectProperty(item.property)}
                className="block w-full rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-left transition-colors hover:border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-800"
              >
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {item.propertyTitle}
                  </span>
                  <span className="shrink-0">{item.date}</span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Ranking de asesores */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 lg:col-span-4 dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Ranking de asesores
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cierres y volumen trimestral
            </p>
          </div>

          <div className="space-y-3">
            {summary.advisorRanking.map((row, idx) => {
              const isMe = row.advisor.id === activeAdvisor.id;
              return (
                <div
                  key={row.advisor.id}
                  className={`flex items-center justify-between gap-2.5 rounded-lg p-2 ${
                    isMe
                      ? 'bg-blue-50/70 dark:bg-blue-950/30'
                      : 'bg-slate-50/60 dark:bg-slate-900/50'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="w-4 text-xs font-bold text-slate-400 tabular-nums">
                      #{idx + 1}
                    </span>
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: row.advisor.avatarColor }}
                    >
                      {row.advisor.avatarInitials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                        {row.advisor.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        {row.closedCount} cierres
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatMXN(row.volumeMXN, true)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
