import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileEdit,
  PauseCircle,
  RefreshCw,
  XCircle,
} from 'lucide-react';

export type BadgeTone = 'emerald' | 'blue' | 'amber' | 'rose' | 'slate' | 'indigo';

const STATUS_TONE_MAP: Record<string, BadgeTone> = {
  // Propiedades
  Disponible: 'emerald',
  Apartada: 'amber',
  'En negociación': 'blue',
  Vendida: 'indigo',
  Rentada: 'emerald',
  Borrador: 'slate',

  // Visitas (10 estados)
  Pendiente: 'amber',
  Aprobada: 'emerald',
  Tentativa: 'slate',
  'En curso': 'blue',
  Retrasada: 'amber',
  Completada: 'emerald',
  Cancelada: 'rose',
  Reprogramada: 'indigo',
  'No se presentó': 'rose',
  Rechazada: 'rose',

  // Contratos y Cobranza
  Vigente: 'emerald',
  'Por vencer': 'amber',
  Vencido: 'rose',
  Renovado: 'blue',
  Pagado: 'emerald',
  Atrasado: 'rose',

  // Documentos y Seguimiento
  Aprobado: 'emerald',
  'En revisión': 'blue',
  Rechazado: 'rose',
  'Al día': 'emerald',
  'Seguimiento hoy': 'amber',
};

const TONE_CLASSES: Record<BadgeTone, string> = {
  emerald:
    'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70',
  blue:
    'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/70',
  amber:
    'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70',
  rose:
    'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/70',
  indigo:
    'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/70',
  slate:
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

function renderStatusIcon(tone: BadgeTone, label: string) {
  const cls = 'w-3 h-3 shrink-0';
  if (label === 'Reprogramada') return <RefreshCw className={cls} aria-hidden="true" />;
  if (label === 'Borrador') return <FileEdit className={cls} aria-hidden="true" />;
  if (label === 'Tentativa') return <PauseCircle className={cls} aria-hidden="true" />;
  switch (tone) {
    case 'emerald':
    case 'indigo':
      return <CheckCircle2 className={cls} aria-hidden="true" />;
    case 'amber':
      return <Clock className={cls} aria-hidden="true" />;
    case 'rose':
      return <XCircle className={cls} aria-hidden="true" />;
    case 'blue':
      return <AlertCircle className={cls} aria-hidden="true" />;
    default:
      return null;
  }
}

export interface StatusBadgeProps {
  status: string;
  tone?: BadgeTone;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  tone,
  size = 'sm',
  showIcon = true,
  className = '',
}) => {
  const resolvedTone = tone ?? STATUS_TONE_MAP[status] ?? 'slate';
  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold tracking-wide whitespace-nowrap shrink-0 ${paddingClass} ${TONE_CLASSES[resolvedTone]} ${className}`}
    >
      {showIcon && renderStatusIcon(resolvedTone, status)}
      <span>{status}</span>
    </span>
  );
};
