import React from 'react';
import { Menu, Moon, Plus, Sun } from 'lucide-react';
import type { ModuleId, RoleId } from '../../types/crm';
import { MODULE_METADATA } from '../../data/mockData';

export interface HeaderProps {
  activeModule: ModuleId;
  activeRole: RoleId;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenMobileNav: () => void;
  canCreateProperty: boolean;
  onNewProperty: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  activeRole,
  theme,
  onToggleTheme,
  onOpenMobileNav,
  canCreateProperty,
  onNewProperty,
}) => {
  const currentMeta = MODULE_METADATA[activeModule];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-sm sm:px-6 dark:border-slate-800 dark:bg-[#0F172A]/95">
      {/* Zone 1: Breadcrumbs + Mobile menu trigger */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Abrir menú de navegación"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Menu className="h-4.5 w-4.5" aria-hidden="true" />
        </button>

        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-xs sm:text-sm">
          <span className="hidden font-medium text-slate-500 sm:inline dark:text-slate-400 whitespace-nowrap">
            Lumark Propiedades
          </span>
          <span className="hidden text-slate-300 sm:inline dark:text-slate-600" aria-hidden="true">
            /
          </span>
          <h1 className="truncate font-display text-sm font-semibold text-slate-900 sm:text-base dark:text-white">
            {currentMeta.label}
          </h1>
          <span className="hidden text-slate-300 md:inline dark:text-slate-600" aria-hidden="true">
            ·
          </span>
          <span className="hidden text-xs font-medium text-slate-500 md:inline dark:text-slate-400 whitespace-nowrap">
            {activeRole === 'administrador' ? 'Vista Administrador' : 'Vista Asesor'}
          </span>
        </nav>
      </div>

      {/* Zone 2: Controls (Theme toggle + Primary Action) */}
      <div className="flex shrink-0 items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
              <span className="hidden sm:inline">Modo claro</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-slate-600" aria-hidden="true" />
              <span className="hidden sm:inline">Modo oscuro</span>
            </>
          )}
        </button>

        {canCreateProperty && (
          <button
            type="button"
            onClick={onNewProperty}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-3.5 text-xs font-semibold text-white transition-colors hover:bg-[#172554] dark:bg-blue-600 dark:hover:bg-blue-500 whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Nueva propiedad</span>
          </button>
        )}
      </div>
    </header>
  );
};
