import React, { useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';

export interface SettingsViewProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onResetDemo: () => void;
  onSaveSettings: (agencyName: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onToggleTheme,
  onResetDemo,
  onSaveSettings,
}) => {
  const [agencyName, setAgencyName] = useState('LUMARK PROPIEDADES');
  const [officeCity, setOfficeCity] = useState('Tijuana, Baja California');
  const [currency] = useState('MXN — Peso Mexicano');

  return (
    <div className="max-w-3xl space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSaveSettings(agencyName);
        }}
        className="rounded-xl border border-slate-200/80 bg-white p-5 space-y-4 dark:border-slate-800 dark:bg-[#0F172A]"
      >
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Configuración general de la inmobiliaria
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Parámetros generales del espacio de trabajo administrado por ZORRO TECH.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Nombre comercial
            </span>
            <input
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="h-9.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Sede principal
            </span>
            <input
              value={officeCity}
              onChange={(e) => setOfficeCity(e.target.value)}
              className="h-9.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Moneda predeterminada
            </span>
            <input
              disabled
              value={currency}
              className="h-9.5 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={onToggleTheme}
              className="h-9.5 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Tema actual: {theme === 'dark' ? 'Modo oscuro' : 'Modo claro'} (cambiar)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onResetDemo}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Restaurar datos de demostración</span>
          </button>

          <button
            type="submit"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-4 text-xs font-semibold text-white hover:bg-[#172554] dark:bg-blue-600"
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Guardar configuración</span>
          </button>
        </div>
      </form>
    </div>
  );
};
