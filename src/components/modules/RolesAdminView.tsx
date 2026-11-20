import React, { useState } from 'react';
import { Check, Lock, ShieldCheck, UserCog } from 'lucide-react';
import type {
  Advisor,
  ModuleId,
  PermissionAction,
  RoleId,
  RolePermissionsMatrix,
} from '../../types/crm';
import { MODULE_METADATA, ROLE_DEFINITIONS } from '../../data/mockData';

export interface RolesAdminViewProps {
  advisors: Advisor[];
  rolePermissions: RolePermissionsMatrix;
  onAssignUserRole: (advisorId: string, newRole: RoleId) => void;
  onToggleUserActive: (advisorId: string) => void;
  onTogglePermission: (role: RoleId, module: ModuleId, action: PermissionAction) => void;
  onResetPermissions: () => void;
}

const ACTIONS: { id: PermissionAction; label: string }[] = [
  { id: 'view', label: 'Ver' },
  { id: 'create', label: 'Crear' },
  { id: 'edit', label: 'Editar' },
  { id: 'delete', label: 'Eliminar' },
  { id: 'assign', label: 'Asignar' },
];

const MODULE_LIST: ModuleId[] = [
  'dashboard',
  'propiedades',
  'prospectos',
  'agenda',
  'rentas',
  'expedientes',
  'mensajeria',
  'reportes',
  'roles',
  'configuracion',
];

export const RolesAdminView: React.FC<RolesAdminViewProps> = ({
  advisors,
  rolePermissions,
  onAssignUserRole,
  onToggleUserActive,
  onTogglePermission,
  onResetPermissions,
}) => {
  const [selectedRoleTab, setSelectedRoleTab] = useState<RoleId>('asesor');

  return (
    <div className="space-y-6">
      {/* Role Summaries */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ROLE_DEFINITIONS.map((roleDef) => {
          const membersCount = advisors.filter((a) => a.role === roleDef.id).length;
          const visibleModsCount = MODULE_LIST.filter(
            (m) => rolePermissions[roleDef.id][m]?.view,
          ).length;

          return (
            <div
              key={roleDef.id}
              className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-[#0F172A]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-blue-500/15 dark:text-blue-400">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {roleDef.name}
                    </h2>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {roleDef.scopeLabel} · {membersCount} usuarios · {visibleModsCount} módulos visibles
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRoleTab(roleDef.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    selectedRoleTab === roleDef.id
                      ? 'bg-[#1E3A8A] text-white dark:bg-blue-600'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  Configurar permisos
                </button>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {roleDef.description}
              </p>
            </div>
          );
        })}
      </section>

      {/* Team Role Assignment Table */}
      <section className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
              <UserCog className="h-4.5 w-4.5 text-[#1E3A8A] dark:text-blue-400" aria-hidden="true" />
              <span>Asignación de roles por integrante</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Asigna el rol de Administrador o Asesor y controla el acceso operativo de cada usuario.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-3 pr-4">Integrante</th>
                <th className="px-4 py-3">Zona / Especialidad</th>
                <th className="px-4 py-3">Rol asignado</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {advisors.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {member.avatarInitials}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {member.zone}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {member.specialty}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={`Rol de ${member.name}`}
                      value={member.role}
                      onChange={(e) => onAssignUserRole(member.id, e.target.value as RoleId)}
                      className="h-8.5 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      <option value="administrador">Administrador</option>
                      <option value="asesor">Asesor Inmobiliario</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onToggleUserActive(member.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        member.active
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <span>{member.active ? 'Activo' : 'Suspendido'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Granular Permissions Matrix */}
      <section className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Matriz de permisos del rol:{' '}
              <span className="text-[#1E3A8A] dark:text-blue-400">
                {selectedRoleTab === 'administrador' ? 'Administrador' : 'Asesor Inmobiliario'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Activa o desactiva la visibilidad y acciones por módulo. Al cambiar al rol Asesor en la barra lateral verás estos cambios aplicados de inmediato.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetPermissions}
            className="h-8.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            Restaurar valores por defecto
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-3 pr-4">Módulo del sistema</th>
                {ACTIONS.map((act) => (
                  <th key={act.id} className="px-4 py-3 text-center">
                    {act.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MODULE_LIST.map((mod) => {
                const modPerms = rolePermissions[selectedRoleTab][mod];
                const isProtectedAdminRoles =
                  selectedRoleTab === 'administrador' && mod === 'roles';

                return (
                  <tr key={mod} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                    <td className="py-3 pr-4">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {MODULE_METADATA[mod].label}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {MODULE_METADATA[mod].description}
                      </p>
                    </td>
                    {ACTIONS.map((act) => {
                      const enabled = modPerms?.[act.id] ?? false;
                      const locked = isProtectedAdminRoles && act.id === 'view';
                      return (
                        <td key={act.id} className="px-4 py-3 text-center">
                          <button
                            type="button"
                            disabled={locked}
                            aria-label={`${act.label} en ${MODULE_METADATA[mod].label} para ${selectedRoleTab}`}
                            aria-pressed={enabled}
                            onClick={() => onTogglePermission(selectedRoleTab, mod, act.id)}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${
                              locked
                                ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800'
                                : enabled
                                  ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white dark:border-blue-600 dark:bg-blue-600'
                                  : 'border-slate-300 bg-white text-transparent hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900'
                            }`}
                          >
                            {locked ? (
                              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : (
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
