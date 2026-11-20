import React from 'react';
import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Home,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import type { Advisor, ModuleId, RoleId } from '../../types/crm';
import { MODULE_METADATA } from '../../data/mockData';

const MODULE_ICONS: Record<ModuleId, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  propiedades: Building2,
  prospectos: Users,
  agenda: CalendarDays,
  rentas: Receipt,
  expedientes: FolderKanban,
  mensajeria: MessageSquare,
  reportes: BarChart3,
  roles: ShieldCheck,
  configuracion: Settings,
};

export interface SidebarProps {
  activeModule: ModuleId;
  visibleModules: ModuleId[];
  onSelectModule: (mod: ModuleId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  activeRole: RoleId;
  onChangeRole: (role: RoleId) => void;
  advisors: Advisor[];
  activeAdvisorId: string;
  onChangeAdvisor: (advisorId: string) => void;
  unreadMessagesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  visibleModules,
  onSelectModule,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  activeRole,
  onChangeRole,
  advisors,
  activeAdvisorId,
  onChangeAdvisor,
  unreadMessagesCount,
}) => {
  const activeAdvisor = advisors.find((a) => a.id === activeAdvisorId) ?? advisors[0];
  const asesorList = advisors.filter((a) => a.role === 'asesor');

  const navContent = (isMobile: boolean) => {
    const showLabels = isMobile || !collapsed;

    return (
      <div className="flex h-full flex-col justify-between bg-white text-slate-700 dark:bg-[#0F172A] dark:text-slate-300">
        {/* Brand header */}
        <div>
          <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-4 dark:border-slate-800">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1E3A8A] text-white">
                <Home className="h-4.5 w-4.5" aria-hidden="true" />
              </div>
              {showLabels && (
                <div className="min-w-0">
                  <span className="block truncate font-display text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                    LUMARK
                  </span>
                  <span className="block truncate text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                    PROPIEDADES
                  </span>
                </div>
              )}
            </div>

            {isMobile ? (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Cerrar menú lateral"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
                className="hidden h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:flex dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {collapsed ? (
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
            )}
          </div>

          {/* Navigation links */}
          <nav aria-label="Navegación principal" className="space-y-1 p-3">
            {visibleModules.map((mod) => {
              const Icon = MODULE_ICONS[mod];
              const isActive = activeModule === mod;
              const meta = MODULE_METADATA[mod];

              return (
                <button
                  key={mod}
                  type="button"
                  onClick={() => {
                    onSelectModule(mod);
                    if (isMobile) onCloseMobile();
                  }}
                  title={!showLabels ? meta.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#1E3A8A] text-white dark:bg-blue-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
                  } ${!showLabels ? 'justify-center px-2' : ''}`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {showLabels && (
                    <span className="flex-1 truncate whitespace-nowrap">{meta.label}</span>
                  )}
                  {showLabels && mod === 'mensajeria' && unreadMessagesCount > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-100 text-[#1E3A8A] dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Role & Demo Switcher */}
        <div className="border-t border-slate-200/80 p-3 dark:border-slate-800">
          {showLabels ? (
            <div className="space-y-2.5 rounded-xl border border-slate-200/80 bg-slate-50/90 p-3 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Selector de Rol (Demo)
                </span>
              </div>

              <div
                role="group"
                aria-label="Cambiar rol de demostración"
                className="grid grid-cols-2 gap-1 rounded-lg bg-slate-200/70 p-0.5 dark:bg-slate-800"
              >
                <button
                  type="button"
                  onClick={() => onChangeRole('administrador')}
                  className={`rounded-md py-1.5 text-[11px] font-semibold transition-colors whitespace-nowrap ${
                    activeRole === 'administrador'
                      ? 'bg-white text-[#1E3A8A] shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Administrador
                </button>
                <button
                  type="button"
                  onClick={() => onChangeRole('asesor')}
                  className={`rounded-md py-1.5 text-[11px] font-semibold transition-colors whitespace-nowrap ${
                    activeRole === 'asesor'
                      ? 'bg-white text-[#1E3A8A] shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Asesor
                </button>
              </div>

              {activeRole === 'asesor' && asesorList.length > 0 && (
                <label className="block">
                  <span className="mb-1 block text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    Perfil activo de asesor
                  </span>
                  <select
                    aria-label="Seleccionar perfil de asesor"
                    value={activeAdvisorId}
                    onChange={(e) => onChangeAdvisor(e.target.value)}
                    className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    {asesorList.map((adv) => (
                      <option key={adv.id} value={adv.id}>
                        {adv.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div className="flex items-center gap-2.5 pt-1">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: activeAdvisor?.avatarColor ?? '#1E3A8A' }}
                >
                  {activeAdvisor?.avatarInitials ?? 'LM'}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                    {activeAdvisor?.name}
                  </p>
                  <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                    {activeRole === 'administrador' ? 'Administrador General' : 'Asesor Inmobiliario'}
                  </p>
                </div>
              </div>

              <p className="border-t border-slate-200/70 pt-2 text-[10px] text-slate-400 dark:border-slate-800">
                Desarrollado por ZORRO TECH
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onChangeRole(activeRole === 'administrador' ? 'asesor' : 'administrador')}
              title={`Rol actual: ${activeRole === 'administrador' ? 'Administrador' : 'Asesor'} (clic para cambiar)`}
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: activeAdvisor?.avatarColor ?? '#1E3A8A' }}
            >
              {activeAdvisor?.avatarInitials ?? 'LM'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-slate-200/80 transition-all duration-200 lg:block dark:border-slate-800 ${
          collapsed ? 'w-[72px]' : 'w-[252px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{navContent(false)}</div>
      </aside>

      {/* Mobile drawer sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 h-full w-72 border-r border-slate-200 dark:border-slate-800">
            {navContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
