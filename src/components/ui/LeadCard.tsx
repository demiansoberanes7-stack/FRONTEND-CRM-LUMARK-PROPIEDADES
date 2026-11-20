import React from 'react';
import {
  ArrowRightLeft,
  Building,
  CalendarClock,
  Phone,
  UserCheck,
} from 'lucide-react';
import type { Advisor, Lead, PipelineStage, Property } from '../../types/crm';
import { formatMXN } from '../../utils/crmLogic';
import { StatusBadge } from './StatusBadge';

export interface LeadCardConfig {
  showAvatar?: boolean;
  showPhone?: boolean;
  showProperty?: boolean;
  showAdvisor?: boolean;
  showLastContact?: boolean;
  showPotentialValue?: boolean;
  showFollowUp?: boolean;
}

export const DEFAULT_LEAD_CARD_CONFIG: Required<LeadCardConfig> = {
  showAvatar: true,
  showPhone: true,
  showProperty: true,
  showAdvisor: true,
  showLastContact: true,
  showPotentialValue: true,
  showFollowUp: true,
};

export interface LeadCardProps {
  lead: Lead;
  property?: Property;
  advisor?: Advisor;
  variant?: 'kanban' | 'list';
  config?: LeadCardConfig;
  stages?: PipelineStage[];
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLElement>, leadId: string) => void;
  onOpenDetail?: (lead: Lead) => void;
  onMoveStage?: (leadId: string, stage: PipelineStage) => void;
  className?: string;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  property,
  advisor,
  variant = 'kanban',
  config,
  stages,
  draggable = true,
  onDragStart,
  onOpenDetail,
  onMoveStage,
  className = '',
}) => {
  const cfg = { ...DEFAULT_LEAD_CARD_CONFIG, ...config };
  const isList = variant === 'list';

  return (
    <article
      data-testid={`lead-card-${lead.id}`}
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, lead.id)}
      className={`rounded-xl border border-slate-200/80 bg-white p-3.5 transition-all duration-150 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-[#0F172A] dark:hover:border-slate-700 ${
        draggable ? 'cursor-grab active:cursor-grabbing' : ''
      } ${className}`}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          {cfg.showAvatar && (
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: lead.avatarColor }}
              aria-hidden="true"
            >
              {lead.avatarInitials}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => onOpenDetail?.(lead)}
              className="block max-w-full truncate text-left text-sm font-semibold text-slate-900 hover:text-[#1E3A8A] dark:text-slate-100 dark:hover:text-blue-400"
            >
              {lead.name}
            </button>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {lead.source}
              </span>
              {cfg.showFollowUp && (
                <StatusBadge status={lead.followUpStatus} showIcon={false} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-2.5 ${isList ? 'grid grid-cols-2 gap-2' : 'space-y-1.5'}`}>
        {cfg.showPhone && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="truncate">{lead.phone}</span>
          </div>
        )}

        {cfg.showProperty && property && (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200">
            <Building className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="truncate font-medium">{property.title}</span>
          </div>
        )}

        {cfg.showAdvisor && advisor && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <UserCheck className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="truncate">{advisor.name}</span>
          </div>
        )}

        {cfg.showLastContact && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            <CalendarClock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span>Último contacto: {lead.lastContactDate}</span>
          </div>
        )}
      </div>

      {lead.lossReason && lead.stage === 'Perdido' && (
        <p className="mt-2 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          Motivo: {lead.lossReason}
        </p>
      )}

      <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5 dark:border-slate-800/80">
        <div className="flex items-center justify-between gap-2">
          {cfg.showPotentialValue ? (
            <span className="whitespace-nowrap text-xs font-bold text-slate-900 dark:text-white tabular-nums">
              {formatMXN(lead.potentialValueMXN, true)}
            </span>
          ) : (
            <span />
          )}

          {onOpenDetail && (
            <button
              type="button"
              onClick={() => onOpenDetail(lead)}
              aria-label={`Abrir detalle de ${lead.name}`}
              className="h-7 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
            >
              Detalle
            </button>
          )}
        </div>

        {onMoveStage && stages && (
          <label className="flex w-full items-center gap-1.5">
            <span className="sr-only">Mover etapa de {lead.name}</span>
            <ArrowRightLeft className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
            <select
              aria-label={`Etapa de ${lead.name}`}
              value={lead.stage}
              onChange={(e) => onMoveStage(lead.id, e.target.value as PipelineStage)}
              className="h-7 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] font-medium text-slate-700 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {stages.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </article>
  );
};
