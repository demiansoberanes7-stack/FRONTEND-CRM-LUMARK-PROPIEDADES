/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useMemo, useState } from 'react';
import type {
  Advisor,
  Conversation,
  Dossier,
  DossierDocument,
  Lead,
  ModuleId,
  PermissionAction,
  PipelineStage,
  Property,
  RentalContract,
  RentPayment,
  RoleId,
  RolePermissionsMatrix,
  ToastItem,
  Visit,
  VisitStatus,
} from './types/crm';
import {
  INITIAL_ADVISORS,
  INITIAL_CONTRACTS,
  INITIAL_CONVERSATIONS,
  INITIAL_DOSSIERS,
  INITIAL_LEADS,
  INITIAL_PAYMENTS,
  INITIAL_PROPERTIES,
  INITIAL_ROLE_PERMISSIONS,
  INITIAL_VISITS,
} from './data/mockData';
import { getVisibleModules, hasPermission, moveLeadStage } from './utils/crmLogic';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/modules/DashboardView';
import { PropertiesView } from './components/modules/PropertiesView';
import { PipelineView } from './components/modules/PipelineView';
import { AgendaView } from './components/modules/AgendaView';
import { RentalsView } from './components/modules/RentalsView';
import { DossiersView } from './components/modules/DossiersView';
import { MessagingView } from './components/modules/MessagingView';
import { ReportsView } from './components/modules/ReportsView';
import { RolesAdminView } from './components/modules/RolesAdminView';
import { SettingsView } from './components/modules/SettingsView';
import { ToastNotifications } from './components/ui/Primitives';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Role & Permissions state
  const [activeRole, setActiveRole] = useState<RoleId>('administrador');
  const [advisors, setAdvisors] = useState<Advisor[]>(INITIAL_ADVISORS);
  const [activeAdvisorId, setActiveAdvisorId] = useState<string>('adv-carlos');
  const [rolePermissions, setRolePermissions] = useState<RolePermissionsMatrix>(
    INITIAL_ROLE_PERMISSIONS,
  );
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');

  // CRM Domain state
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [visits, setVisits] = useState<Visit[]>(INITIAL_VISITS);
  const [contracts] = useState<RentalContract[]>(INITIAL_CONTRACTS);
  const [payments, setPayments] = useState<RentPayment[]>(INITIAL_PAYMENTS);
  const [dossiers, setDossiers] = useState<Dossier[]>(INITIAL_DOSSIERS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);

  // Property Detail & Form Modal state (shared with Header CTA)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyFormOpen, setPropertyFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = (
    title: string,
    description?: string,
    tone: ToastItem['tone'] = 'success',
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, description, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  };

  // Sync dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const visibleModules = useMemo(
    () => getVisibleModules(rolePermissions, activeRole),
    [rolePermissions, activeRole],
  );

  // Ensure activeModule is always accessible when role or permissions change
  useEffect(() => {
    if (!visibleModules.includes(activeModule)) {
      setActiveModule(visibleModules[0] ?? 'dashboard');
    }
  }, [visibleModules, activeModule]);

  const activeUser = useMemo(() => {
    if (activeRole === 'administrador') {
      return advisors.find((a) => a.role === 'administrador') ?? advisors[0];
    }
    return advisors.find((a) => a.id === activeAdvisorId) ?? advisors[1] ?? advisors[0];
  }, [activeRole, advisors, activeAdvisorId]);

  const canCreateProperty = hasPermission(rolePermissions, activeRole, 'propiedades', 'create');

  const unreadMessagesCount = useMemo(
    () =>
      conversations
        .filter((c) => (activeRole === 'administrador' ? true : c.advisorId === activeUser.id))
        .reduce((acc, c) => acc + c.unreadCount, 0),
    [conversations, activeRole, activeUser.id],
  );

  const handleRoleSwitch = (nextRole: RoleId) => {
    setActiveRole(nextRole);
    pushToast(
      `Vista cambiada a ${nextRole === 'administrador' ? 'Administrador' : 'Asesor Inmobiliario'}`,
      nextRole === 'administrador'
        ? 'Acceso completo al inventario, equipo, reportes y configuración.'
        : 'Navegación y registros filtrados a tu cartera asignada.',
      'info',
    );
  };

  const handleSaveProperty = (
    data: Omit<Property, 'id' | 'createdAt' | 'viewsCount' | 'activities'>,
    existingId?: string,
  ) => {
    const today = new Date().toISOString().slice(0, 10);
    if (existingId) {
      setProperties((prev) =>
        prev.map((p) =>
          p.id === existingId
            ? {
                ...p,
                ...data,
                activities: [
                  {
                    id: `act-${Date.now()}`,
                    date: today,
                    author: activeUser.name,
                    description: 'Ficha comercial actualizada.',
                  },
                  ...p.activities,
                ],
              }
            : p,
        ),
      );
      pushToast('Propiedad actualizada', data.title);
    } else {
      const newProp: Property = {
        ...data,
        id: `prop-${Date.now()}`,
        createdAt: today,
        viewsCount: 1,
        activities: [
          {
            id: `act-${Date.now()}`,
            date: today,
            author: activeUser.name,
            description: 'Propiedad dada de alta en catálogo.',
          },
        ],
      };
      setProperties((prev) => [newProp, ...prev]);
      pushToast('Propiedad registrada', `${newProp.title} agregada al catálogo.`);
    }
    setPropertyFormOpen(false);
    setEditingProperty(null);
  };

  const handleTogglePermission = (
    role: RoleId,
    mod: ModuleId,
    action: PermissionAction,
  ) => {
    setRolePermissions((prev) => {
      const current = prev[role][mod][action];
      return {
        ...prev,
        [role]: {
          ...prev[role],
          [mod]: {
            ...prev[role][mod],
            [action]: !current,
          },
        },
      };
    });
    pushToast('Permiso actualizado', `${role} · ${mod} (${action})`, 'info');
  };

  const handleAssignUserRole = (advisorId: string, newRole: RoleId) => {
    setAdvisors((prev) =>
      prev.map((a) => (a.id === advisorId ? { ...a, role: newRole } : a)),
    );
    const target = advisors.find((a) => a.id === advisorId);
    pushToast('Rol actualizado', `${target?.name ?? 'Usuario'} ahora es ${newRole}.`);
  };

  const handleResetDemo = () => {
    setAdvisors(INITIAL_ADVISORS);
    setRolePermissions(INITIAL_ROLE_PERMISSIONS);
    setProperties(INITIAL_PROPERTIES);
    setLeads(INITIAL_LEADS);
    setVisits(INITIAL_VISITS);
    setPayments(INITIAL_PAYMENTS);
    setDossiers(INITIAL_DOSSIERS);
    setConversations(INITIAL_CONVERSATIONS);
    pushToast('Datos de demostración restaurados', undefined, 'info');
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0F172A] dark:bg-[#090D16] dark:text-[#F8FAFC]">
      <Sidebar
        activeModule={activeModule}
        visibleModules={visibleModules}
        onSelectModule={setActiveModule}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        activeRole={activeRole}
        onChangeRole={handleRoleSwitch}
        advisors={advisors}
        activeAdvisorId={activeUser.id}
        onChangeAdvisor={setActiveAdvisorId}
        unreadMessagesCount={unreadMessagesCount}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          activeModule={activeModule}
          activeRole={activeRole}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          canCreateProperty={canCreateProperty}
          onNewProperty={() => {
            setActiveModule('propiedades');
            setEditingProperty(null);
            setPropertyFormOpen(true);
          }}
        />

        <main className="flex-1 p-4 sm:p-6">
          {activeModule === 'dashboard' && (
            <DashboardView
              activeRole={activeRole}
              activeAdvisor={activeUser}
              advisors={advisors}
              properties={properties}
              leads={leads}
              visits={visits}
              contracts={contracts}
              payments={payments}
              onNavigate={setActiveModule}
              onSelectProperty={(p) => {
                setActiveModule('propiedades');
                setSelectedProperty(p);
              }}
            />
          )}

          {activeModule === 'propiedades' && (
            <PropertiesView
              properties={properties}
              advisors={advisors}
              leads={leads}
              visits={visits}
              activeRole={activeRole}
              activeAdvisorId={activeUser.id}
              rolePermissions={rolePermissions}
              selectedProperty={selectedProperty}
              onSelectProperty={setSelectedProperty}
              formModalOpen={propertyFormOpen}
              editingProperty={editingProperty}
              onOpenCreateForm={() => {
                setEditingProperty(null);
                setPropertyFormOpen(true);
              }}
              onOpenEditForm={(prop) => {
                setEditingProperty(prop);
                setPropertyFormOpen(true);
              }}
              onCloseFormModal={() => {
                setPropertyFormOpen(false);
                setEditingProperty(null);
              }}
              onSaveProperty={handleSaveProperty}
              onNotify={(title, desc) => pushToast(title, desc, 'info')}
            />
          )}

          {activeModule === 'prospectos' && (
            <PipelineView
              leads={leads}
              properties={properties}
              advisors={advisors}
              activeRole={activeRole}
              activeAdvisor={activeUser}
              rolePermissions={rolePermissions}
              onMoveStage={(leadId, newStage: PipelineStage, lossReason?: string) => {
                setLeads((prev) =>
                  moveLeadStage(prev, leadId, newStage, activeUser.name, lossReason),
                );
                pushToast(`Prospecto movido a ${newStage}`);
              }}
              onAddNote={(leadId, text) => {
                const today = new Date().toISOString().slice(0, 10);
                setLeads((prev) =>
                  prev.map((l) =>
                    l.id === leadId
                      ? {
                          ...l,
                          lastContactDate: today,
                          notes: [
                            { id: `n-${Date.now()}`, date: today, author: activeUser.name, text },
                            ...l.notes,
                          ],
                        }
                      : l,
                  ),
                );
                pushToast('Nota registrada en prospecto');
              }}
              onAssignAdvisor={(leadId, advisorId) => {
                setLeads((prev) =>
                  prev.map((l) => (l.id === leadId ? { ...l, advisorId } : l)),
                );
                pushToast('Asesor reasignado');
              }}
              onCreateLead={(data) => {
                const initials = data.name
                  .split(' ')
                  .slice(0, 2)
                  .map((s) => s[0]?.toUpperCase() ?? '')
                  .join('');
                const created: Lead = {
                  ...data,
                  id: `lead-${Date.now()}`,
                  avatarInitials: initials || 'PR',
                  avatarColor: '#1E3A8A',
                  notes: [],
                  history: [
                    {
                      id: `h-${Date.now()}`,
                      date: data.lastContactDate,
                      event: `Prospecto creado por ${activeUser.name}`,
                    },
                  ],
                };
                setLeads((prev) => [created, ...prev]);
                pushToast('Prospecto agregado', created.name);
              }}
            />
          )}

          {activeModule === 'agenda' && (
            <AgendaView
              visits={visits}
              properties={properties}
              leads={leads}
              advisors={advisors}
              activeRole={activeRole}
              activeAdvisorId={activeUser.id}
              onUpdateVisitStatus={(visitId, status: VisitStatus) => {
                setVisits((prev) =>
                  prev.map((v) => (v.id === visitId ? { ...v, status } : v)),
                );
                pushToast('Estado de visita actualizado', status);
              }}
              onCreateVisit={(visit) => {
                setVisits((prev) => [{ ...visit, id: `vis-${Date.now()}` }, ...prev]);
                pushToast('Visita agendada', `${visit.date} a las ${visit.time}`);
              }}
            />
          )}

          {activeModule === 'rentas' && (
            <RentalsView
              contracts={contracts}
              payments={payments}
              properties={properties}
              activeRole={activeRole}
              activeAdvisorId={activeUser.id}
              onMarkPaymentPaid={(paymentId) => {
                const today = new Date().toISOString().slice(0, 10);
                setPayments((prev) =>
                  prev.map((p) =>
                    p.id === paymentId
                      ? { ...p, status: 'Pagado', paidDate: today, method: 'Transferencia SPEI' }
                      : p,
                  ),
                );
                pushToast('Pago registrado correctamente');
              }}
            />
          )}

          {activeModule === 'expedientes' && (
            <DossiersView
              dossiers={dossiers}
              activeRole={activeRole}
              activeAdvisorId={activeUser.id}
              onUpdateDocumentStatus={(dossierId, docId, status) => {
                setDossiers((prev) =>
                  prev.map((d) =>
                    d.id === dossierId
                      ? {
                          ...d,
                          documents: d.documents.map((doc) =>
                            doc.id === docId ? { ...doc, status } : doc,
                          ),
                        }
                      : d,
                  ),
                );
                pushToast('Documento actualizado', `Estatus: ${status}`);
              }}
              onAddDocument={(dossierId, doc: Omit<DossierDocument, 'id'>) => {
                setDossiers((prev) =>
                  prev.map((d) =>
                    d.id === dossierId
                      ? {
                          ...d,
                          updatedAt: new Date().toISOString().slice(0, 10),
                          documents: [...d.documents, { ...doc, id: `doc-${Date.now()}` }],
                        }
                      : d,
                  ),
                );
                pushToast('Documento agregado al expediente', doc.name);
              }}
            />
          )}

          {activeModule === 'mensajeria' && (
            <MessagingView
              conversations={conversations}
              properties={properties}
              advisors={advisors}
              activeRole={activeRole}
              activeAdvisorId={activeUser.id}
              onSendMessage={(convId, text) => {
                const now = new Date();
                const ts = `${String(now.getHours()).padStart(2, '0')}:${String(
                  now.getMinutes(),
                ).padStart(2, '0')}`;
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === convId
                      ? {
                          ...c,
                          unreadCount: 0,
                          lastMessageTime: ts,
                          messages: [
                            ...c.messages,
                            {
                              id: `msg-${Date.now()}`,
                              sender: 'advisor',
                              text,
                              timestamp: ts,
                              status: 'entregado',
                            },
                          ],
                        }
                      : c,
                  ),
                );
              }}
              onAddInternalNote={(convId, note) => {
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === convId
                      ? { ...c, internalNotes: [...c.internalNotes, note] }
                      : c,
                  ),
                );
                pushToast('Nota interna guardada');
              }}
              onTransferConversation={(convId, newAdvisorId) => {
                const target = advisors.find((a) => a.id === newAdvisorId);
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === convId ? { ...c, advisorId: newAdvisorId } : c,
                  ),
                );
                pushToast('Conversación transferida', `Asignada a ${target?.name ?? 'asesor'}`);
              }}
              onToggleAI={(convId) => {
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === convId ? { ...c, aiActive: !c.aiActive } : c,
                  ),
                );
                pushToast('Estado de Agente IA actualizado', undefined, 'info');
              }}
              onSelectProperty={(p) => {
                setActiveModule('propiedades');
                setSelectedProperty(p);
              }}
            />
          )}

          {activeModule === 'reportes' && (
            <ReportsView
              properties={properties}
              leads={leads}
              advisors={advisors}
              payments={payments}
            />
          )}

          {activeModule === 'roles' && (
            <RolesAdminView
              advisors={advisors}
              rolePermissions={rolePermissions}
              onAssignUserRole={handleAssignUserRole}
              onToggleUserActive={(advisorId) => {
                setAdvisors((prev) =>
                  prev.map((a) => (a.id === advisorId ? { ...a, active: !a.active } : a)),
                );
                pushToast('Estado de usuario actualizado', undefined, 'info');
              }}
              onTogglePermission={handleTogglePermission}
              onResetPermissions={() => {
                setRolePermissions(INITIAL_ROLE_PERMISSIONS);
                pushToast('Matriz de permisos restaurada');
              }}
            />
          )}

          {activeModule === 'configuracion' && (
            <SettingsView
              theme={theme}
              onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              onResetDemo={handleResetDemo}
              onSaveSettings={(name) =>
                pushToast('Configuración guardada', `${name} actualizada en prototipo.`)
              }
            />
          )}
        </main>
      </div>

      <ToastNotifications
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
