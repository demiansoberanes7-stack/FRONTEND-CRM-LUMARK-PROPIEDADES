import React, { useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Info,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import type { ToastItem } from '../../types/crm';

/* -------------------- SearchInput -------------------- */
export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  ariaLabel = 'Buscar',
  className = '',
}) => (
  <div className={`relative ${className}`}>
    <Search
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      aria-hidden="true"
    />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className="h-9.5 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 dark:border-slate-700 dark:bg-[#090D16] dark:text-slate-100"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        aria-label="Limpiar búsqueda"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    )}
  </div>
);

/* -------------------- Tabs -------------------- */
export interface TabOption<T extends string> {
  id: T;
  label: string;
  count?: number;
}

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className = '',
}: {
  tabs: TabOption<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={`inline-flex flex-wrap items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              active
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`tabular-nums text-[11px] ${
                  active ? 'text-[#1E3A8A] dark:text-blue-400' : 'text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------- Modal -------------------- */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  size = 'lg',
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const widthClass =
    size === 'md' ? 'max-w-lg' : size === 'xl' ? 'max-w-5xl' : 'max-w-3xl';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className={`relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0F172A] ${widthClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

/* -------------------- Drawer -------------------- */
export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0F172A]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <h2 id="drawer-title" className="truncate text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

/* -------------------- DataTable -------------------- */
export interface ColumnDef<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  render: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  keyExtractor,
  emptyMessage = 'No se encontraron registros.',
}: {
  columns: ColumnDef<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#0F172A]">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 whitespace-nowrap ${
                  col.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {rows.map((row) => (
            <tr
              key={keyExtractor(row)}
              className="transition-colors hover:bg-slate-50/80 dark:hover:bg-[#131B2E]"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 align-middle text-slate-700 dark:text-slate-200 ${
                    col.align === 'right' ? 'text-right tabular-nums' : 'text-left'
                  }`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------- EmptyState & LoadingState -------------------- */
export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ icon, title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-[#0F172A]">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      {icon}
    </div>
    <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
    <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-4 inline-flex h-9 items-center rounded-lg bg-[#1E3A8A] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#172554] dark:bg-blue-600 dark:hover:bg-blue-500"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export const LoadingState: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="space-y-3" aria-busy="true" aria-label="Cargando información">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="h-14 w-full animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
      />
    ))}
  </div>
);

/* -------------------- ToastNotifications -------------------- */
export const ToastNotifications: React.FC<{
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[60] flex max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => {
        const icon =
          toast.tone === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : toast.tone === 'warning' ? (
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          ) : toast.tone === 'error' ? (
            <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          ) : (
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          );

        return (
          <div
            key={toast.id}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mt-0.5 shrink-0">{icon}</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Cerrar notificación"
              className="rounded p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

/* -------------------- ConfirmationDialog -------------------- */
export const ConfirmationDialog: React.FC<{
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  onConfirm,
  onCancel,
}) => (
  <Modal open={open} onClose={onCancel} title={title} size="md">
    <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
    <div className="mt-5 flex justify-end gap-2.5">
      <button
        type="button"
        onClick={onCancel}
        className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className={`h-9 rounded-lg px-4 text-xs font-semibold text-white transition-colors ${
          destructive
            ? 'bg-rose-600 hover:bg-rose-700'
            : 'bg-[#1E3A8A] hover:bg-[#172554] dark:bg-blue-600 dark:hover:bg-blue-500'
        }`}
      >
        {confirmLabel}
      </button>
    </div>
  </Modal>
);

/* -------------------- Dropdown & FilterPanel -------------------- */
export const DropdownSelect: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}> = ({ label, value, options, onChange, className = '' }) => (
  <label className={`flex flex-col gap-1 ${className}`}>
    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</span>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full appearance-none rounded-lg border border-slate-300 bg-white pl-3 pr-8 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 dark:border-slate-700 dark:bg-[#090D16] dark:text-slate-100"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
    </div>
  </label>
);

export const FilterPanel: React.FC<{
  children: React.ReactNode;
  onReset?: () => void;
}> = ({ children, onReset }) => (
  <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-[#0F172A]">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      {children}
    </div>
    {onReset && (
      <div className="mt-3 flex justify-end border-t border-slate-100 pt-2.5 dark:border-slate-800">
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-[#1E3A8A] hover:underline dark:text-blue-400"
        >
          Restablecer filtros
        </button>
      </div>
    )}
  </div>
);
