import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, FileText, Wallet } from 'lucide-react';
import type {
  Property,
  RentalContract,
  RentPayment,
  RoleId,
} from '../../types/crm';
import { formatMXN, scopeContractsByRole } from '../../utils/crmLogic';
import { StatusBadge } from '../ui/StatusBadge';
import { DataTable, Tabs, type ColumnDef } from '../ui/Primitives';

export interface RentalsViewProps {
  contracts: RentalContract[];
  payments: RentPayment[];
  properties: Property[];
  activeRole: RoleId;
  activeAdvisorId: string;
  onMarkPaymentPaid: (paymentId: string) => void;
}

export const RentalsView: React.FC<RentalsViewProps> = ({
  contracts,
  payments,
  properties,
  activeRole,
  activeAdvisorId,
  onMarkPaymentPaid,
}) => {
  const [tab, setTab] = useState<'contratos' | 'cobranza'>('contratos');

  const scopedContracts = useMemo(
    () => scopeContractsByRole(contracts, activeRole, activeAdvisorId),
    [contracts, activeRole, activeAdvisorId],
  );
  const contractIds = useMemo(
    () => new Set(scopedContracts.map((c) => c.id)),
    [scopedContracts],
  );
  const scopedPayments = useMemo(
    () => payments.filter((p) => contractIds.has(p.contractId)),
    [payments, contractIds],
  );

  const totalMonthlyIncome = scopedContracts
    .filter((c) => c.status === 'Vigente' || c.status === 'Renovado' || c.status === 'Por vencer')
    .reduce((sum, c) => sum + c.monthlyRentMXN, 0);

  const paidTotal = scopedPayments
    .filter((p) => p.status === 'Pagado')
    .reduce((sum, p) => sum + p.amountMXN, 0);

  const pendingTotal = scopedPayments
    .filter((p) => p.status === 'Pendiente')
    .reduce((sum, p) => sum + p.amountMXN, 0);

  const overdueTotal = scopedPayments
    .filter((p) => p.status === 'Atrasado')
    .reduce((sum, p) => sum + p.amountMXN, 0);

  const expiringCount = scopedContracts.filter((c) => c.status === 'Por vencer').length;

  const contractColumns: ColumnDef<RentalContract>[] = [
    {
      key: 'property',
      header: 'Propiedad',
      render: (c) => {
        const prop = properties.find((p) => p.id === c.propertyId);
        return (
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              {prop?.title ?? 'Inmueble'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {prop?.neighborhood}, {prop?.city}
            </p>
          </div>
        );
      },
    },
    {
      key: 'tenant',
      header: 'Inquilino',
      render: (c) => (
        <div>
          <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{c.tenantName}</p>
          <p className="text-[11px] text-slate-500 tabular-nums">{c.tenantPhone}</p>
        </div>
      ),
    },
    {
      key: 'start',
      header: 'Inicio',
      render: (c) => <span className="text-xs tabular-nums">{c.startDate}</span>,
    },
    {
      key: 'end',
      header: 'Finalización',
      render: (c) => <span className="text-xs tabular-nums">{c.endDate}</span>,
    },
    {
      key: 'amount',
      header: 'Importe mensual',
      align: 'right',
      render: (c) => (
        <span className="text-xs font-bold text-slate-900 dark:text-white">
          {formatMXN(c.monthlyRentMXN)}
        </span>
      ),
    },
    {
      key: 'day',
      header: 'Día de pago',
      align: 'right',
      render: (c) => <span className="text-xs tabular-nums">Día {c.paymentDay}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (c) => <StatusBadge status={c.status} />,
    },
  ];

  const paymentColumns: ColumnDef<RentPayment>[] = [
    {
      key: 'contract',
      header: 'Propiedad e Inquilino',
      render: (pay) => {
        const c = contracts.find((ct) => ct.id === pay.contractId);
        const prop = properties.find((p) => p.id === c?.propertyId);
        return (
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              {prop?.title ?? 'Inmueble'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{c?.tenantName}</p>
          </div>
        );
      },
    },
    {
      key: 'period',
      header: 'Periodo',
      render: (pay) => <span className="text-xs font-medium">{pay.period}</span>,
    },
    {
      key: 'due',
      header: 'Vencimiento',
      render: (pay) => <span className="text-xs tabular-nums">{pay.dueDate}</span>,
    },
    {
      key: 'amount',
      header: 'Importe',
      align: 'right',
      render: (pay) => (
        <span className="text-xs font-bold text-slate-900 dark:text-white">
          {formatMXN(pay.amountMXN)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado de pago',
      render: (pay) => <StatusBadge status={pay.status} />,
    },
    {
      key: 'action',
      header: 'Cobranza',
      align: 'right',
      render: (pay) =>
        pay.status === 'Pagado' ? (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {pay.method} · {pay.paidDate}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onMarkPaymentPaid(pay.id)}
            className="h-7.5 rounded-lg bg-[#059669] px-2.5 text-[11px] font-semibold text-white hover:bg-emerald-700"
          >
            Registrar pago
          </button>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* KPI Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Ingresos mensuales contratados</span>
            <Wallet className="h-4 w-4 text-[#1E3A8A] dark:text-blue-400" />
          </div>
          <p className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatMXN(totalMonthlyIncome)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 tabular-nums">
            {scopedContracts.length} contratos activos · {expiringCount} por vencer
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Pagos recibidos</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 font-display text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {formatMXN(paidTotal)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Conciliados en periodo</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Pagos pendientes</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 font-display text-xl font-bold text-amber-700 dark:text-amber-400 tabular-nums">
            {formatMXN(pendingTotal)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Dentro de fecha de corte</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Rentas atrasadas</span>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 font-display text-xl font-bold text-rose-700 dark:text-rose-400 tabular-nums">
            {formatMXN(overdueTotal)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Requiere seguimiento</p>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex items-center justify-between">
        <Tabs
          activeTab={tab}
          onChange={setTab}
          tabs={[
            { id: 'contratos', label: 'Tabla de contratos', count: scopedContracts.length },
            { id: 'cobranza', label: 'Control de cobranza', count: scopedPayments.length },
          ]}
        />
        <span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:inline-flex">
          <FileText className="h-3.5 w-3.5" />
          Cifras en pesos mexicanos (MXN)
        </span>
      </div>

      {tab === 'contratos' ? (
        <DataTable columns={contractColumns} rows={scopedContracts} keyExtractor={(c) => c.id} />
      ) : (
        <DataTable columns={paymentColumns} rows={scopedPayments} keyExtractor={(p) => p.id} />
      )}
    </div>
  );
};
