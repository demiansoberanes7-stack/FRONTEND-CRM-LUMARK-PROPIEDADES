import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, User } from 'lucide-react';
import type {
  Advisor,
  Lead,
  Property,
  RoleId,
  Visit,
  VisitStatus,
} from '../../types/crm';
import { VISIT_STATUSES } from '../../data/mockData';
import { scopeVisitsByRole } from '../../utils/crmLogic';
import { StatusBadge } from '../ui/StatusBadge';
import { Drawer, Modal, Tabs } from '../ui/Primitives';

export interface AgendaViewProps {
  visits: Visit[];
  properties: Property[];
  leads: Lead[];
  advisors: Advisor[];
  activeRole: RoleId;
  activeAdvisorId: string;
  onUpdateVisitStatus: (visitId: string, status: VisitStatus) => void;
  onCreateVisit: (visit: Omit<Visit, 'id'>) => void;
}

const AVAILABLE_SLOTS = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00'];

export const AgendaView: React.FC<AgendaViewProps> = ({
  visits,
  properties,
  leads,
  advisors,
  activeRole,
  activeAdvisorId,
  onUpdateVisitStatus,
  onCreateVisit,
}) => {
  const [viewTab, setViewTab] = useState<'mes' | 'semana' | 'dia' | 'lista'>('mes');
  const [selectedDate, setSelectedDate] = useState('2026-11-20');
  const [statusFilter, setStatusFilter] = useState<'Todos' | VisitStatus>('Todos');
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const scopedVisits = useMemo(() => {
    const base = scopeVisitsByRole(visits, activeRole, activeAdvisorId);
    if (statusFilter === 'Todos') return base;
    return base.filter((v) => v.status === statusFilter);
  }, [visits, activeRole, activeAdvisorId, statusFilter]);

  const selectedVisit = visits.find((v) => v.id === selectedVisitId) ?? null;

  // November 2026 calendar days (Nov 1 2026 is Sunday)
  const novemberDays = Array.from({ length: 30 }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    return `2026-11-${day}`;
  });

  // Week of Nov 16 - Nov 22, 2026
  const weekDays = [
    '2026-11-16',
    '2026-11-17',
    '2026-11-18',
    '2026-11-19',
    '2026-11-20',
    '2026-11-21',
    '2026-11-22',
  ];

  const dayVisits = scopedVisits
    .filter((v) => v.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const occupiedSlots = new Set(dayVisits.map((v) => v.time));

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            activeTab={viewTab}
            onChange={setViewTab}
            tabs={[
              { id: 'mes', label: 'Mensual' },
              { id: 'semana', label: 'Semanal' },
              { id: 'dia', label: 'Diaria' },
              { id: 'lista', label: 'Listado', count: scopedVisits.length },
            ]}
          />

          <select
            aria-label="Filtrar por estado de visita"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'Todos' | VisitStatus)}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="Todos">Todos los estados ({visits.length})</option>
            {VISIT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-3.5 text-xs font-semibold text-white hover:bg-[#172554] dark:bg-blue-600 whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Agendar visita</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Main Calendar / List Area */}
        <div className="lg:col-span-8">
          {viewTab === 'mes' && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Noviembre 2026
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Selecciona un día para ver horarios
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => (
                  <div key={d} className="py-1.5">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {novemberDays.map((dateStr) => {
                  const items = scopedVisits.filter((v) => v.date === dateStr);
                  const isSelected = selectedDate === dateStr;
                  const dayNum = Number(dateStr.slice(-2));

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setSelectedDate(dateStr)}
                      className={`flex min-h-[78px] flex-col items-start justify-between rounded-lg border p-2 text-left transition-colors ${
                        isSelected
                          ? 'border-[#1E3A8A] bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/30'
                          : 'border-slate-200/70 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                      }`}
                    >
                      <span
                        className={`text-xs font-semibold tabular-nums ${
                          isSelected
                            ? 'text-[#1E3A8A] dark:text-blue-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {dayNum}
                      </span>
                      <div className="w-full space-y-1">
                        {items.slice(0, 2).map((v) => (
                          <div
                            key={v.id}
                            className="truncate rounded bg-[#1E3A8A]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#1E3A8A] dark:bg-blue-500/20 dark:text-blue-300 tabular-nums"
                          >
                            {v.time} · {v.status}
                          </div>
                        ))}
                        {items.length > 2 && (
                          <span className="block text-[10px] text-slate-400 tabular-nums">
                            +{items.length - 2} más
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {viewTab === 'semana' && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A]">
              <h2 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">
                Semana del 16 al 22 de noviembre 2026
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
                {weekDays.map((d) => {
                  const items = scopedVisits
                    .filter((v) => v.date === d)
                    .sort((a, b) => a.time.localeCompare(b.time));
                  return (
                    <div
                      key={d}
                      className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-900/50"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedDate(d)}
                        className="mb-2 block w-full text-left text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums"
                      >
                        {d.slice(5)}
                      </button>
                      <div className="space-y-2">
                        {items.length === 0 ? (
                          <p className="text-[11px] text-slate-400">Libre</p>
                        ) : (
                          items.map((v) => {
                            const prop = properties.find((p) => p.id === v.propertyId);
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => setSelectedVisitId(v.id)}
                                className="w-full rounded-md border border-slate-200 bg-white p-2 text-left text-[11px] hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900"
                              >
                                <span className="font-bold text-[#1E3A8A] dark:text-blue-400 tabular-nums">
                                  {v.time}
                                </span>
                                <p className="mt-0.5 truncate font-medium text-slate-800 dark:text-slate-200">
                                  {prop?.title}
                                </p>
                                <span className="mt-1 inline-block text-[10px] text-slate-500">
                                  {v.status}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewTab === 'dia' && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                  Agenda del día · {selectedDate}
                </h2>
                <input
                  type="date"
                  aria-label="Seleccionar fecha"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2.5">
                {dayVisits.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-500">
                    No hay visitas registradas para esta fecha.
                  </p>
                ) : (
                  dayVisits.map((v) => {
                    const prop = properties.find((p) => p.id === v.propertyId);
                    const lead = leads.find((l) => l.id === v.leadId);
                    const adv = advisors.find((a) => a.id === v.advisorId);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVisitId(v.id)}
                        className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200/80 p-3.5 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                      >
                        <div className="flex items-center gap-3.5">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-bold text-slate-900 dark:bg-slate-800 dark:text-white tabular-nums">
                            {v.time}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                              {prop?.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Prospecto: {lead?.name} · Asesor: {adv?.name}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={v.status} />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {viewTab === 'lista' && (
            <div className="space-y-2.5 rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A]">
              <h2 className="mb-2 text-sm font-bold text-slate-900 dark:text-white">
                Listado completo de visitas ({scopedVisits.length})
              </h2>
              {scopedVisits.map((v) => {
                const prop = properties.find((p) => p.id === v.propertyId);
                const lead = leads.find((l) => l.id === v.leadId);
                const adv = advisors.find((a) => a.id === v.advisorId);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVisitId(v.id)}
                    className="flex w-full flex-col justify-between gap-2 rounded-xl border border-slate-200/70 p-3.5 text-left transition-colors hover:bg-slate-50 sm:flex-row sm:items-center dark:border-slate-800 dark:hover:bg-slate-900"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {prop?.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        {v.date} · {v.time} ({v.durationMin} min) · {lead?.name} · {adv?.name}
                      </p>
                    </div>
                    <StatusBadge status={v.status} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Day Schedule + Available Slots */}
        <div className="space-y-5 lg:col-span-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A]">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
              <CalendarIcon className="h-4 w-4 text-[#1E3A8A] dark:text-blue-400" />
              <span>Citas del {selectedDate}</span>
            </h3>
            <div className="mt-3 space-y-2.5">
              {dayVisits.length === 0 ? (
                <p className="text-xs text-slate-500">Sin citas agendadas para este día.</p>
              ) : (
                dayVisits.map((v) => {
                  const prop = properties.find((p) => p.id === v.propertyId);
                  const lead = leads.find((l) => l.id === v.leadId);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVisitId(v.id)}
                      className="w-full rounded-lg border border-slate-200/70 p-3 text-left hover:border-blue-400 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#1E3A8A] dark:text-blue-400 tabular-nums">
                          {v.time}
                        </span>
                        <StatusBadge status={v.status} />
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">
                        {prop?.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {lead?.name}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A]">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Clock className="h-4 w-4 text-[#059669]" />
              <span>Horarios disponibles ({selectedDate})</span>
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {AVAILABLE_SLOTS.map((slot) => {
                const busy = occupiedSlots.has(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={busy}
                    onClick={() => setCreateOpen(true)}
                    className={`h-8 rounded-lg border text-xs font-semibold tabular-nums transition-colors ${
                      busy
                        ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through dark:border-slate-800 dark:bg-slate-900'
                        : 'border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Visit Detail Drawer */}
      <Drawer
        open={Boolean(selectedVisit)}
        onClose={() => setSelectedVisitId(null)}
        title="Ficha de visita inmobiliaria"
        subtitle={selectedVisit ? `${selectedVisit.date} · ${selectedVisit.time}` : ''}
      >
        {selectedVisit && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Estatus actual</span>
              <StatusBadge status={selectedVisit.status} size="md" />
            </div>

            <div className="rounded-xl border border-slate-200/80 p-3.5 text-xs space-y-2 dark:border-slate-800">
              <p className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <MapPin className="h-4 w-4 text-[#1E3A8A] dark:text-blue-400" />
                <span>
                  {properties.find((p) => p.id === selectedVisit.propertyId)?.title}
                </span>
              </p>
              <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <User className="h-4 w-4 text-slate-400" />
                <span>
                  Prospecto: {leads.find((l) => l.id === selectedVisit.leadId)?.name}
                </span>
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Asesor: {advisors.find((a) => a.id === selectedVisit.advisorId)?.name}
              </p>
              <p className="pt-1 text-slate-500 dark:text-slate-400">{selectedVisit.notes}</p>
            </div>

            <div>
              <span className="mb-2 block text-xs font-semibold text-slate-900 dark:text-white">
                Cambiar estado de la visita
              </span>
              <div className="grid grid-cols-2 gap-2">
                {VISIT_STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onUpdateVisitStatus(selectedVisit.id, st)}
                    className={`h-8 rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                      selectedVisit.status === st
                        ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white dark:border-blue-500 dark:bg-blue-600'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* New Visit Modal */}
      {createOpen && (
        <CreateVisitModal
          defaultDate={selectedDate}
          properties={properties}
          leads={leads}
          advisors={advisors}
          defaultAdvisorId={activeAdvisorId}
          onClose={() => setCreateOpen(false)}
          onSubmit={(v) => {
            onCreateVisit(v);
            setCreateOpen(false);
          }}
        />
      )}
    </div>
  );
};

const CreateVisitModal: React.FC<{
  defaultDate: string;
  properties: Property[];
  leads: Lead[];
  advisors: Advisor[];
  defaultAdvisorId: string;
  onClose: () => void;
  onSubmit: (visit: Omit<Visit, 'id'>) => void;
}> = ({ defaultDate, properties, leads, advisors, defaultAdvisorId, onClose, onSubmit }) => {
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? '');
  const [leadId, setLeadId] = useState(leads[0]?.id ?? '');
  const [advisorId, setAdvisorId] = useState(defaultAdvisorId);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('12:00');
  const [status, setStatus] = useState<VisitStatus>('Pendiente');
  const [notes, setNotes] = useState('');

  return (
    <Modal open onClose={onClose} title="Agendar nueva visita" size="md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            propertyId,
            leadId,
            advisorId,
            date,
            time,
            durationMin: 45,
            status,
            notes: notes.trim() || 'Visita coordinada desde agenda CRM.',
          });
        }}
        className="space-y-3.5"
      >
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Propiedad</span>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="h-9.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Prospecto</span>
          <select
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            className="h-9.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Asesor</span>
          <select
            value={advisorId}
            onChange={(e) => setAdvisorId(e.target.value)}
            className="h-9.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {advisors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          <label className="block">
            <span className="mb-1 block text-xs font-medium">Fecha</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9.5 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium">Hora</span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-9.5 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium">Estado inicial</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VisitStatus)}
              className="h-9.5 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {VISIT_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Notas</span>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instrucciones de acceso o comentarios..."
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-slate-200 px-3.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="h-9 rounded-lg bg-[#1E3A8A] px-3.5 text-xs font-semibold text-white dark:bg-blue-600"
          >
            Guardar visita
          </button>
        </div>
      </form>
    </Modal>
  );
};
