import React, { useMemo, useState } from 'react';
import {
  Clock,
  Mail,
  MessageSquarePlus,
  Phone,
  Plus,
  Sliders,
} from 'lucide-react';
import type {
  Advisor,
  Lead,
  PipelineStage,
  Property,
  RoleId,
  RolePermissionsMatrix,
} from '../../types/crm';
import { PIPELINE_STAGES } from '../../data/mockData';
import { formatMXN, hasPermission, scopeLeadsByRole } from '../../utils/crmLogic';
import {
  DEFAULT_LEAD_CARD_CONFIG,
  LeadCard,
  type LeadCardConfig,
} from '../ui/LeadCard';
import { StatusBadge } from '../ui/StatusBadge';
import { Drawer, Modal, SearchInput } from '../ui/Primitives';

export interface PipelineViewProps {
  leads: Lead[];
  properties: Property[];
  advisors: Advisor[];
  activeRole: RoleId;
  activeAdvisor: Advisor;
  rolePermissions: RolePermissionsMatrix;
  onMoveStage: (leadId: string, newStage: PipelineStage, lossReason?: string) => void;
  onAddNote: (leadId: string, text: string) => void;
  onAssignAdvisor: (leadId: string, advisorId: string) => void;
  onCreateLead: (lead: Omit<Lead, 'id' | 'notes' | 'history' | 'avatarInitials' | 'avatarColor'>) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  leads,
  properties,
  advisors,
  activeRole,
  activeAdvisor,
  rolePermissions,
  onMoveStage,
  onAddNote,
  onAssignAdvisor,
  onCreateLead,
}) => {
  const [search, setSearch] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [lossPrompt, setLossPrompt] = useState<{ leadId: string; reason: string } | null>(null);
  const [showCardConfig, setShowCardConfig] = useState(false);
  const [cardConfig, setCardConfig] = useState<Required<LeadCardConfig>>(DEFAULT_LEAD_CARD_CONFIG);
  const [newLeadOpen, setNewLeadOpen] = useState(false);

  const canCreate = hasPermission(rolePermissions, activeRole, 'prospectos', 'create');
  const canAssign = hasPermission(rolePermissions, activeRole, 'prospectos', 'assign');

  const scopedLeads = useMemo(() => {
    const byRole = scopeLeadsByRole(leads, activeRole, activeAdvisor.id);
    const q = search.trim().toLowerCase();
    if (!q) return byRole;
    return byRole.filter((l) => {
      const prop = properties.find((p) => p.id === l.propertyId);
      return (
        l.name.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        (prop?.title.toLowerCase().includes(q) ?? false)
      );
    });
  }, [leads, activeRole, activeAdvisor.id, search, properties]);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) ?? null;

  const handleStageRequest = (leadId: string, stage: PipelineStage) => {
    if (stage === 'Perdido') {
      setLossPrompt({ leadId, reason: '' });
      return;
    }
    onMoveStage(leadId, stage);
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar prospecto, teléfono o inmueble..."
            ariaLabel="Buscar prospectos"
            className="w-full sm:w-80"
          />
          <button
            type="button"
            onClick={() => setShowCardConfig((v) => !v)}
            aria-expanded={showCardConfig}
            className="inline-flex h-9.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Sliders className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Personalizar tarjetas</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            <strong className="text-slate-900 dark:text-white">{scopedLeads.length}</strong> prospectos
          </span>
          {canCreate && (
            <button
              type="button"
              onClick={() => setNewLeadOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-3.5 text-xs font-semibold text-white hover:bg-[#172554] dark:bg-blue-600 dark:hover:bg-blue-500 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Nuevo prospecto</span>
            </button>
          )}
        </div>
      </div>

      {/* LeadCard Customizer */}
      {showCardConfig && (
        <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
          <p className="mb-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
            Campos visibles en el componente reutilizable LeadCard:
          </p>
          <div className="flex flex-wrap gap-3">
            {(
              [
                ['showAvatar', 'Avatar'],
                ['showPhone', 'Teléfono'],
                ['showProperty', 'Propiedad de interés'],
                ['showAdvisor', 'Asesor asignado'],
                ['showLastContact', 'Último contacto'],
                ['showPotentialValue', 'Valor potencial'],
                ['showFollowUp', 'Indicador seguimiento'],
              ] as [keyof LeadCardConfig, string][]
            ).map(([key, label]) => (
              <label key={key} className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={cardConfig[key]}
                  onChange={() =>
                    setCardConfig((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                  className="h-3.5 w-3.5 rounded border-slate-300 accent-[#1E3A8A]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Board (PipelineColumn + LeadCard) */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const columnLeads = scopedLeads.filter((l) => l.stage === stage);
          const columnTotal = columnLeads.reduce((sum, l) => sum + l.potentialValueMXN, 0);
          const isOver = dragOverStage === stage;

          return (
            <section
              key={stage}
              data-testid={`pipeline-column-${stage}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage);
              }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverStage(null);
                const id = draggedLeadId || e.dataTransfer.getData('text/plain');
                if (id) handleStageRequest(id, stage);
                setDraggedLeadId(null);
              }}
              className={`flex w-[300px] shrink-0 flex-col rounded-xl border p-3 transition-colors ${
                isOver
                  ? 'border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30'
                  : 'border-slate-200/80 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/60'
              }`}
            >
              {/* PipelineColumn Header */}
              <div className="mb-3 flex items-center justify-between gap-2 px-1">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{stage}</h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                    {formatMXN(columnTotal, true)}
                  </p>
                </div>
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 text-xs font-bold text-slate-700 shadow-2xs dark:bg-slate-800 dark:text-slate-200 tabular-nums">
                  {columnLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-1 flex-col gap-2.5">
                {columnLeads.length === 0 ? (
                  <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300/80 text-xs text-slate-400 dark:border-slate-700">
                    Arrastra un prospecto aquí
                  </div>
                ) : (
                  columnLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      property={properties.find((p) => p.id === lead.propertyId)}
                      advisor={advisors.find((a) => a.id === lead.advisorId)}
                      config={cardConfig}
                      stages={PIPELINE_STAGES}
                      onDragStart={(e, id) => {
                        setDraggedLeadId(id);
                        e.dataTransfer.setData('text/plain', id);
                      }}
                      onOpenDetail={(l) => setSelectedLeadId(l.id)}
                      onMoveStage={handleStageRequest}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Lead Detail Drawer */}
      <Drawer
        open={Boolean(selectedLead)}
        onClose={() => setSelectedLeadId(null)}
        title={selectedLead?.name ?? ''}
        subtitle={selectedLead ? `${selectedLead.stage} · ${selectedLead.source}` : ''}
      >
        {selectedLead && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Valor potencial
                </span>
                <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatMXN(selectedLead.potentialValueMXN)}
                </p>
              </div>
              <StatusBadge status={selectedLead.followUpStatus} size="md" />
            </div>

            <div className="space-y-2 text-xs">
              <p className="flex items-center gap-2 text-slate-700 dark:text-slate-200 tabular-nums">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{selectedLead.phone}</span>
              </p>
              <p className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{selectedLead.email}</span>
              </p>
            </div>

            {/* Stage & Advisor Controls */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Etapa actual
                </span>
                <select
                  value={selectedLead.stage}
                  onChange={(e) =>
                    handleStageRequest(selectedLead.id, e.target.value as PipelineStage)
                  }
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {PIPELINE_STAGES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Asesor asignado
                </span>
                <select
                  disabled={!canAssign}
                  value={selectedLead.advisorId}
                  onChange={(e) => onAssignAdvisor(selectedLead.id, e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {advisors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Add Note */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!noteText.trim()) return;
                onAddNote(selectedLead.id, noteText.trim());
                setNoteText('');
              }}
              className="space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800"
            >
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                  <MessageSquarePlus className="h-3.5 w-3.5 text-[#1E3A8A] dark:text-blue-400" />
                  <span>Registrar nota de seguimiento</span>
                </span>
                <textarea
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Ej. Llamada realizada, enviamos corrida financiera..."
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
              <button
                type="submit"
                className="h-8.5 rounded-lg bg-[#1E3A8A] px-3.5 text-xs font-semibold text-white hover:bg-[#172554] dark:bg-blue-600"
              >
                Guardar nota
              </button>
            </form>

            {/* Notes List */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Notas</h4>
              {selectedLead.notes.map((n) => (
                <div
                  key={n.id}
                  className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {n.author}
                    </span>
                    <span className="tabular-nums">{n.date}</span>
                  </div>
                  <p className="mt-1 text-slate-700 dark:text-slate-200">{n.text}</p>
                </div>
              ))}
            </div>

            {/* History */}
            <div className="space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Historial comercial</span>
              </h4>
              <ul className="space-y-2">
                {selectedLead.history.map((h) => (
                  <li key={h.id} className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-mono text-[11px] text-slate-400">{h.date}</span> —{' '}
                    {h.event}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Drawer>

      {/* Loss Reason Modal */}
      {lossPrompt && (
        <Modal
          open={Boolean(lossPrompt)}
          onClose={() => setLossPrompt(null)}
          title="Registrar motivo de pérdida"
          subtitle="Documenta por qué la oportunidad no avanzó para alimentar la analítica comercial."
          size="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!lossPrompt.reason.trim()) return;
              onMoveStage(lossPrompt.leadId, 'Perdido', lossPrompt.reason.trim());
              setLossPrompt(null);
            }}
            className="space-y-4"
          >
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Motivo principal
              </span>
              <select
                value={lossPrompt.reason}
                onChange={(e) => setLossPrompt({ ...lossPrompt, reason: e.target.value })}
                className="h-9.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="">Selecciona un motivo...</option>
                <option value="Presupuesto fuera de rango">Presupuesto fuera de rango</option>
                <option value="Crédito hipotecario no aprobado">Crédito hipotecario no aprobado</option>
                <option value="Compró con otra inmobiliaria">Compró con otra inmobiliaria</option>
                <option value="Cambio de planes o ubicación">Cambio de planes o ubicación</option>
                <option value="Sin respuesta tras 5 intentos">Sin respuesta tras 5 intentos</option>
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLossPrompt(null)}
                className="h-9 rounded-lg border border-slate-200 px-3.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!lossPrompt.reason.trim()}
                className="h-9 rounded-lg bg-rose-600 px-3.5 text-xs font-semibold text-white disabled:opacity-40"
              >
                Confirmar pérdida
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* New Lead Modal */}
      {newLeadOpen && (
        <NewLeadModal
          properties={properties}
          advisors={advisors}
          defaultAdvisorId={activeAdvisor.id}
          onClose={() => setNewLeadOpen(false)}
          onSubmit={(data) => {
            onCreateLead(data);
            setNewLeadOpen(false);
          }}
        />
      )}
    </div>
  );
};

const NewLeadModal: React.FC<{
  properties: Property[];
  advisors: Advisor[];
  defaultAdvisorId: string;
  onClose: () => void;
  onSubmit: (data: Omit<Lead, 'id' | 'notes' | 'history' | 'avatarInitials' | 'avatarColor'>) => void;
}> = ({ properties, advisors, defaultAdvisorId, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? '');
  const [advisorId, setAdvisorId] = useState(defaultAdvisorId);
  const [source, setSource] = useState<Lead['source']>('WhatsApp');

  const selectedProp = properties.find((p) => p.id === propertyId);

  return (
    <Modal open onClose={onClose} title="Registrar nuevo prospecto" size="md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !phone.trim()) return;
          onSubmit({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || 'prospecto@correo.mx',
            source,
            propertyId,
            advisorId,
            stage: 'Nuevo',
            lastContactDate: new Date().toISOString().slice(0, 10),
            potentialValueMXN: selectedProp?.priceMXN ?? 5000000,
            followUpStatus: 'Seguimiento hoy',
          });
        }}
        className="space-y-3.5"
      >
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Nombre completo *</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Ricardo Morales"
            className="h-9.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium">Teléfono *</span>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+52 664 000 0000"
              className="h-9.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium">Canal de origen</span>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as Lead['source'])}
              className="h-9.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="WhatsApp">WhatsApp</option>
              <option value="Inmuebles24">Inmuebles24</option>
              <option value="Instagram">Instagram</option>
              <option value="Referido">Referido</option>
              <option value="Sitio web">Sitio web</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Correo electrónico</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cliente@empresa.mx"
            className="h-9.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Propiedad de interés</span>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="h-9.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({formatMXN(p.priceMXN, true)})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Asesor responsable</span>
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
            Crear prospecto
          </button>
        </div>
      </form>
    </Modal>
  );
};
