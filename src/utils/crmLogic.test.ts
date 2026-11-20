import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDossierCompleteness,
  canEditProperty,
  filterProperties,
  formatMXN,
  getVisibleModules,
  hasPermission,
  moveLeadStage,
  scopeLeadsByRole,
} from './crmLogic';
import {
  INITIAL_DOSSIERS,
  INITIAL_LEADS,
  INITIAL_PROPERTIES,
  INITIAL_ROLE_PERMISSIONS,
} from '../data/mockData';

test('formatMXN formats Mexican Pesos consistently', () => {
  assert.equal(formatMXN(12850000), '$12,850,000 MXN');
  assert.equal(formatMXN(68000), '$68,000 MXN');
  assert.equal(formatMXN(4600000, true), '$4.60M MXN');
});

test('RBAC permissions differentiate Administrador and Asesor roles', () => {
  assert.equal(hasPermission(INITIAL_ROLE_PERMISSIONS, 'administrador', 'roles', 'view'), true);
  assert.equal(hasPermission(INITIAL_ROLE_PERMISSIONS, 'asesor', 'roles', 'view'), false);
  assert.equal(hasPermission(INITIAL_ROLE_PERMISSIONS, 'asesor', 'reportes', 'view'), false);
  assert.equal(hasPermission(INITIAL_ROLE_PERMISSIONS, 'asesor', 'propiedades', 'edit'), true);

  const adminModules = getVisibleModules(INITIAL_ROLE_PERMISSIONS, 'administrador');
  const asesorModules = getVisibleModules(INITIAL_ROLE_PERMISSIONS, 'asesor');
  assert.ok(adminModules.includes('roles'));
  assert.ok(!asesorModules.includes('roles'));
  assert.ok(asesorModules.includes('propiedades'));
});

test('canEditProperty allows Administrador everywhere and restricts Asesor to assigned properties', () => {
  const carlosProp = INITIAL_PROPERTIES.find((p) => p.advisorId === 'adv-carlos')!;
  const valeriaProp = INITIAL_PROPERTIES.find((p) => p.advisorId === 'adv-valeria')!;

  assert.equal(
    canEditProperty(carlosProp, 'administrador', 'adv-admin', INITIAL_ROLE_PERMISSIONS),
    true,
  );
  assert.equal(
    canEditProperty(valeriaProp, 'administrador', 'adv-admin', INITIAL_ROLE_PERMISSIONS),
    true,
  );
  assert.equal(
    canEditProperty(carlosProp, 'asesor', 'adv-carlos', INITIAL_ROLE_PERMISSIONS),
    true,
  );
  assert.equal(
    canEditProperty(valeriaProp, 'asesor', 'adv-carlos', INITIAL_ROLE_PERMISSIONS),
    false,
  );
});

test('filterProperties filters by city, operation, type, and hides other advisors drafts from Asesor', () => {
  const allTijuana = filterProperties(
    INITIAL_PROPERTIES,
    {
      query: '',
      operation: 'Venta',
      type: 'Casa',
      city: 'Tijuana',
      neighborhood: 'Todas',
      status: 'Todos',
      advisorId: 'Todos',
      sortBy: 'price-desc',
    },
    'administrador',
    'adv-admin',
  );
  assert.equal(allTijuana.length, 2);
  assert.equal(allTijuana[0].id, 'prop-101');

  // Draft property belongs to adv-carlos, so adv-valeria should NOT see it
  const valeriaVisible = filterProperties(
    INITIAL_PROPERTIES,
    {
      query: 'Villa del Mar',
      operation: 'Todas',
      type: 'Todos',
      city: 'Todas',
      neighborhood: 'Todas',
      status: 'Todos',
      advisorId: 'Todos',
      sortBy: 'recent',
    },
    'asesor',
    'adv-valeria',
  );
  assert.equal(valeriaVisible.length, 0);
});

test('scopeLeadsByRole and moveLeadStage update lead pipeline state accurately', () => {
  const carlosLeads = scopeLeadsByRole(INITIAL_LEADS, 'asesor', 'adv-carlos');
  assert.ok(carlosLeads.every((l) => l.advisorId === 'adv-carlos'));

  const updated = moveLeadStage(
    INITIAL_LEADS,
    'lead-1',
    'Perdido',
    'Carlos Mendoza',
    'El comprador pausó inversión',
  );
  const moved = updated.find((l) => l.id === 'lead-1')!;
  assert.equal(moved.stage, 'Perdido');
  assert.equal(moved.lossReason, 'El comprador pausó inversión');
  assert.ok(moved.history[0].event.includes('Perdido'));
});

test('calculateDossierCompleteness returns accurate percentage', () => {
  const first = calculateDossierCompleteness(INITIAL_DOSSIERS[0]);
  assert.equal(first.approved, 3);
  assert.equal(first.total, 4);
  assert.equal(first.percentage, 75);
});
