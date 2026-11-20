import React, { useMemo, useState } from 'react';
import {
  Bot,
  Check,
  CheckCheck,
  Instagram,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
  UserCheck,
} from 'lucide-react';
import type {
  Advisor,
  ChannelType,
  Conversation,
  Property,
  RoleId,
} from '../../types/crm';
import { QUICK_REPLIES } from '../../data/mockData';
import { formatMXN, scopeConversationsByRole } from '../../utils/crmLogic';
import { StatusBadge } from '../ui/StatusBadge';
import { SearchInput } from '../ui/Primitives';

export interface MessagingViewProps {
  conversations: Conversation[];
  properties: Property[];
  advisors: Advisor[];
  activeRole: RoleId;
  activeAdvisorId: string;
  onSendMessage: (convId: string, text: string) => void;
  onAddInternalNote: (convId: string, note: string) => void;
  onTransferConversation: (convId: string, newAdvisorId: string) => void;
  onToggleAI: (convId: string) => void;
  onSelectProperty: (prop: Property) => void;
}

function renderChannelBadge(channel: ChannelType) {
  switch (channel) {
    case 'WhatsApp':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
          <MessageCircle className="h-3 w-3" aria-hidden="true" />
          WhatsApp
        </span>
      );
    case 'Instagram':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-700 dark:text-pink-400">
          <Instagram className="h-3 w-3" aria-hidden="true" />
          Instagram
        </span>
      );
    case 'Messenger':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
          <MessageSquare className="h-3 w-3" aria-hidden="true" />
          Messenger
        </span>
      );
    case 'Correo':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <Mail className="h-3 w-3" aria-hidden="true" />
          Correo
        </span>
      );
  }
}

export const MessagingView: React.FC<MessagingViewProps> = ({
  conversations,
  properties,
  advisors,
  activeRole,
  activeAdvisorId,
  onSendMessage,
  onAddInternalNote,
  onTransferConversation,
  onToggleAI,
  onSelectProperty,
}) => {
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<'Todos' | ChannelType>('Todos');
  const [selectedId, setSelectedId] = useState<string>(conversations[0]?.id ?? '');
  const [draft, setDraft] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [transferAdvisorId, setTransferAdvisorId] = useState('');

  const scoped = useMemo(() => {
    const byRole = scopeConversationsByRole(conversations, activeRole, activeAdvisorId);
    return byRole.filter((c) => {
      if (channelFilter !== 'Todos' && c.channel !== channelFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!c.contactName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [conversations, activeRole, activeAdvisorId, channelFilter, search]);

  const activeConv =
    scoped.find((c) => c.id === selectedId) ?? scoped[0] ?? null;

  const relatedProp = activeConv
    ? properties.find((p) => p.id === activeConv.propertyId)
    : undefined;
  const assignedAdvisor = activeConv
    ? advisors.find((a) => a.id === activeConv.advisorId)
    : undefined;

  return (
    <div className="grid min-h-[620px] grid-cols-1 overflow-hidden rounded-xl border border-slate-200/80 bg-white lg:grid-cols-12 dark:border-slate-800 dark:bg-[#0F172A]">
      {/* Column 1: Conversations List */}
      <div className="flex flex-col border-b border-slate-200/80 lg:col-span-3 lg:border-b-0 lg:border-r dark:border-slate-800">
        <div className="space-y-2.5 border-b border-slate-200/80 p-3.5 dark:border-slate-800">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar contacto..."
            ariaLabel="Buscar conversación"
          />
          <div className="flex flex-wrap gap-1">
            {(['Todos', 'WhatsApp', 'Instagram', 'Messenger', 'Correo'] as const).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setChannelFilter(ch)}
                className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                  channelFilter === ch
                    ? 'bg-[#1E3A8A] text-white dark:bg-blue-600'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
          {scoped.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-500">
              No hay conversaciones en este filtro.
            </p>
          ) : (
            scoped.map((conv) => {
              const isSelected = activeConv?.id === conv.id;
              const lastMsg = conv.messages[conv.messages.length - 1];
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedId(conv.id)}
                  className={`flex w-full items-start gap-3 p-3.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: conv.avatarColor }}
                  >
                    {conv.avatarInitials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                        {conv.contactName}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-400 tabular-nums">
                        {conv.lastMessageTime}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      {renderChannelBadge(conv.channel)}
                      {conv.unreadCount > 0 && (
                        <span className="rounded-full bg-[#1E3A8A] px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {lastMsg?.text}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Column 2: Active Conversation */}
      <div className="flex flex-col border-b border-slate-200/80 lg:col-span-6 lg:border-b-0 lg:border-r dark:border-slate-800">
        {activeConv ? (
          <>
            {/* Conversation Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: activeConv.avatarColor }}
                >
                  {activeConv.avatarInitials}
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeConv.contactName}
                  </h2>
                  <div className="flex items-center gap-2">
                    {renderChannelBadge(activeConv.channel)}
                    <span className="text-[11px] text-slate-400">·</span>
                    <button
                      type="button"
                      onClick={() => onToggleAI(activeConv.id)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        activeConv.aiActive
                          ? 'border-blue-200 bg-blue-50 text-[#1E3A8A] dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                          : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <Bot className="h-3 w-3" aria-hidden="true" />
                      <span>
                        {activeConv.aiActive ? 'Agente IA activo' : 'Agente IA en pausa'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <select
                  aria-label="Seleccionar asesor para transferir"
                  value={transferAdvisorId || activeConv.advisorId}
                  onChange={(e) => setTransferAdvisorId(e.target.value)}
                  className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {advisors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() =>
                    onTransferConversation(
                      activeConv.id,
                      transferAdvisorId || activeConv.advisorId,
                    )
                  }
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap"
                >
                  <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Transferir a asesor</span>
                </button>
              </div>
            </div>

            {/* Message Bubbles */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4 dark:bg-[#090D16]/60">
              {activeConv.messages.map((msg) => {
                const isOutbound = msg.sender === 'advisor' || msg.sender === 'ai';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <span className="mb-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[#1E3A8A] dark:text-blue-400">
                        <Bot className="h-3 w-3" aria-hidden="true" />
                        Respuesta automática IA
                      </span>
                    )}
                    <div
                      className={`max-w-[82%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.sender === 'advisor'
                          ? 'bg-[#1E3A8A] text-white dark:bg-blue-600'
                          : msg.sender === 'ai'
                            ? 'border border-blue-200 bg-blue-50 text-slate-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-slate-100'
                            : 'border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 tabular-nums">
                      <span>{msg.timestamp}</span>
                      {isOutbound &&
                        (msg.status === 'leido' ? (
                          <CheckCheck className="h-3 w-3 text-blue-500" aria-hidden="true" />
                        ) : (
                          <Check className="h-3 w-3" aria-hidden="true" />
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Replies + Composer */}
            <div className="border-t border-slate-200/80 p-3 dark:border-slate-800">
              <div className="mb-2.5 flex gap-1.5 overflow-x-auto pb-1">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr}
                    type="button"
                    onClick={() => setDraft(qr)}
                    className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!draft.trim()) return;
                  onSendMessage(activeConv.id, draft.trim());
                  setDraft('');
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Escribe un mensaje (simulado en prototipo)..."
                  aria-label="Escribir mensaje"
                  className="h-9.5 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <button
                  type="submit"
                  className="inline-flex h-9.5 items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-3.5 text-xs font-semibold text-white hover:bg-[#172554] dark:bg-blue-600"
                >
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Enviar</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-xs text-slate-500">
            Selecciona una conversación para iniciar.
          </div>
        )}
      </div>

      {/* Column 3: Contact & Property Details + Internal Notes */}
      <div className="flex flex-col space-y-4 p-4 lg:col-span-3">
        {activeConv && (
          <>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Datos del contacto
              </h3>
              <div className="mt-2.5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-2 tabular-nums">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{activeConv.contactPhone}</span>
                </p>
                <p className="flex items-center gap-2 truncate">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{activeConv.contactEmail}</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Asesor actual:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {assignedAdvisor?.name}
                  </strong>
                </p>
              </div>
            </div>

            {relatedProp && (
              <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Propiedad de interés
                </h3>
                <div className="mt-2.5 overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <img
                    src={relatedProp.images[0]}
                    alt={relatedProp.title}
                    referrerPolicy="no-referrer"
                    className="h-24 w-full object-cover"
                  />
                  <div className="p-2.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-semibold text-[#1E3A8A] dark:text-blue-400">
                        {relatedProp.operation}
                      </span>
                      <StatusBadge status={relatedProp.status} showIcon={false} />
                    </div>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {relatedProp.title}
                    </p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatMXN(relatedProp.priceMXN)}
                    </p>
                    <button
                      type="button"
                      onClick={() => onSelectProperty(relatedProp)}
                      className="mt-2 w-full rounded-md border border-slate-200 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Abrir ficha
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Internal Notes */}
            <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Notas internas
              </h3>
              <ul className="mt-2 space-y-1.5">
                {activeConv.internalNotes.map((note, idx) => (
                  <li
                    key={idx}
                    className="rounded-lg bg-amber-50/70 p-2 text-[11px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
                  >
                    {note}
                  </li>
                ))}
              </ul>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!internalNote.trim()) return;
                  onAddInternalNote(activeConv.id, internalNote.trim());
                  setInternalNote('');
                }}
                className="mt-2.5 flex gap-1.5"
              >
                <input
                  type="text"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Agregar nota privada..."
                  className="h-8 flex-1 rounded-lg border border-slate-300 bg-white px-2.5 text-[11px] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <button
                  type="submit"
                  className="h-8 rounded-lg bg-slate-800 px-2.5 text-[11px] font-semibold text-white dark:bg-slate-700"
                >
                  Guardar
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
