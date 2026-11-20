import type {
  Advisor,
  Conversation,
  Dossier,
  Lead,
  ModuleId,
  OperationType,
  PermissionAction,
  PipelineStage,
  Property,
  PropertyStatus,
  PropertyType,
  RentalContract,
  RentPayment,
  RoleId,
  RolePermissionsMatrix,
  Visit,
} from '../types/crm';

export interface PropertyFilterCriteria {
  query: string;
  operation: 'Todas' | OperationType;
  type: 'Todos' | PropertyType;
  city: string;
  neighborhood: string;
  status: 'Todos' | PropertyStatus;
  advisorId: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: 'recent' | 'price-asc' | 'price-desc' | 'area-desc';
}

export function formatMXN(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2).replace(/\.00$/, '')}M MXN`;
    }
    if (amount >= 1_000) {
      return `$${Math.round(amount / 1_000)}k MXN`;
    }
  }
  const formatted = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `$${formatted} MXN`;
}

export function hasPermission(
  matrix: RolePermissionsMatrix,
  role: RoleId,
  module: ModuleId,
  action: PermissionAction = 'view',
): boolean {
  const roleEntry = matrix[role];
  if (!roleEntry) return false;
  const modPerm = roleEntry[module];
  if (!modPerm) return false;
  return Boolean(modPerm[action]);
}

export function getVisibleModules(
  matrix: RolePermissionsMatrix,
  role: RoleId,
): ModuleId[] {
  const order: ModuleId[] = [
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
  return order.filter((mod) => hasPermission(matrix, role, mod, 'view'));
}

export function canEditProperty(
  property: Property,
  role: RoleId,
  activeAdvisorId: string,
  matrix: RolePermissionsMatrix,
): boolean {
  if (!hasPermission(matrix, role, 'propiedades', 'edit')) return false;
  if (role === 'administrador') return true;
  return property.advisorId === activeAdvisorId;
}

export function filterProperties(
  properties: Property[],
  filters: PropertyFilterCriteria,
  role: RoleId,
  activeAdvisorId: string,
): Property[] {
  const q = filters.query.trim().toLowerCase();

  const filtered = properties.filter((prop) => {
    // Role-based visibility: Asesor sees active inventory + own assigned properties (including drafts)
    if (role === 'asesor') {
      const isOwn = prop.advisorId === activeAdvisorId;
      const isActiveMarket = prop.status !== 'Borrador';
      if (!isOwn && !isActiveMarket) return false;
    }

    if (filters.operation !== 'Todas' && prop.operation !== filters.operation) return false;
    if (filters.type !== 'Todos' && prop.type !== filters.type) return false;
    if (filters.city !== 'Todas' && prop.city !== filters.city) return false;
    if (filters.neighborhood !== 'Todas' && prop.neighborhood !== filters.neighborhood) return false;
    if (filters.status !== 'Todos' && prop.status !== filters.status) return false;
    if (filters.advisorId !== 'Todos' && prop.advisorId !== filters.advisorId) return false;
    if (typeof filters.minPrice === 'number' && !Number.isNaN(filters.minPrice) && prop.priceMXN < filters.minPrice) {
      return false;
    }
    if (typeof filters.maxPrice === 'number' && !Number.isNaN(filters.maxPrice) && prop.priceMXN > filters.maxPrice) {
      return false;
    }

    if (q) {
      const haystack = `${prop.code} ${prop.title} ${prop.city} ${prop.neighborhood} ${prop.address} ${prop.type}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-asc':
        return a.priceMXN - b.priceMXN;
      case 'price-desc':
        return b.priceMXN - a.priceMXN;
      case 'area-desc':
        return b.areaM2 - a.areaM2;
      case 'recent':
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });

  return sorted;
}

export function scopeLeadsByRole(
  leads: Lead[],
  role: RoleId,
  activeAdvisorId: string,
): Lead[] {
  if (role === 'administrador') return leads;
  return leads.filter((lead) => lead.advisorId === activeAdvisorId);
}

export function scopeVisitsByRole(
  visits: Visit[],
  role: RoleId,
  activeAdvisorId: string,
): Visit[] {
  if (role === 'administrador') return visits;
  return visits.filter((visit) => visit.advisorId === activeAdvisorId);
}

export function scopeConversationsByRole(
  conversations: Conversation[],
  role: RoleId,
  activeAdvisorId: string,
): Conversation[] {
  if (role === 'administrador') return conversations;
  return conversations.filter((conv) => conv.advisorId === activeAdvisorId);
}

export function scopeContractsByRole(
  contracts: RentalContract[],
  role: RoleId,
  activeAdvisorId: string,
): RentalContract[] {
  if (role === 'administrador') return contracts;
  return contracts.filter((c) => c.advisorId === activeAdvisorId);
}

export function scopeDossiersByRole(
  dossiers: Dossier[],
  role: RoleId,
  activeAdvisorId: string,
): Dossier[] {
  if (role === 'administrador') return dossiers;
  return dossiers.filter((d) => d.advisorId === activeAdvisorId);
}

export function moveLeadStage(
  leads: Lead[],
  leadId: string,
  newStage: PipelineStage,
  authorName: string,
  lossReason?: string,
): Lead[] {
  const today = new Date().toISOString().slice(0, 10);
  return leads.map((lead) => {
    if (lead.id !== leadId) return lead;
    const reasonText = newStage === 'Perdido' && lossReason ? ` (Motivo: ${lossReason})` : '';
    return {
      ...lead,
      stage: newStage,
      lastContactDate: today,
      lossReason: newStage === 'Perdido' ? lossReason : undefined,
      history: [
        {
          id: `hist-${Date.now()}`,
          date: today,
          event: `${authorName} movio el prospecto de ${lead.stage} a ${newStage}${reasonText}`,
        },
        ...lead.history,
      ],
    };
  });
}

export function calculateDossierCompleteness(dossier: Dossier): {
  approved: number;
  total: number;
  percentage: number;
} {
  const total = dossier.documents.length;
  if (total === 0) return { approved: 0, total: 0, percentage: 0 };
  const approved = dossier.documents.filter((d) => d.status === 'Aprobado').length;
  return {
    approved,
    total,
    percentage: Math.round((approved / total) * 100),
  };
}

export interface DashboardSummary {
  activeProperties: number;
  soldProperties: number;
  rentedProperties: number;
  newLeadsCount: number;
  scheduledVisitsCount: number;
  closedDealsCount: number;
  collectionTotalMXN: number;
  pendingCollectionMXN: number;
  pipelinePotentialMXN: number;
  advisorRanking: { advisor: Advisor; closedCount: number; volumeMXN: number }[];
}

export function calculateDashboardSummary(params: {
  properties: Property[];
  leads: Lead[];
  visits: Visit[];
  payments: RentPayment[];
  contracts: RentalContract[];
  advisors: Advisor[];
  role: RoleId;
  activeAdvisorId: string;
}): DashboardSummary {
  const { properties, leads, visits, payments, contracts, advisors, role, activeAdvisorId } = params;

  const visibleProps =
    role === 'administrador'
      ? properties
      : properties.filter((p) => p.advisorId === activeAdvisorId);
  const scopedLeads = scopeLeadsByRole(leads, role, activeAdvisorId);
  const scopedVisits = scopeVisitsByRole(visits, role, activeAdvisorId);
  const scopedContracts = scopeContractsByRole(contracts, role, activeAdvisorId);
  const scopedContractIds = new Set(scopedContracts.map((c) => c.id));
  const scopedPayments = payments.filter((p) => scopedContractIds.has(p.contractId));

  const activeProperties = visibleProps.filter(
    (p) => p.status === 'Disponible' || p.status === 'Apartada' || p.status === 'En negociación',
  ).length;
  const soldProperties = visibleProps.filter((p) => p.status === 'Vendida').length;
  const rentedProperties = visibleProps.filter((p) => p.status === 'Rentada').length;
  const newLeadsCount = scopedLeads.filter((l) => l.stage === 'Nuevo' || l.stage === 'Contactado').length;
  const scheduledVisitsCount = scopedVisits.filter(
    (v) =>
      v.status === 'Pendiente' ||
      v.status === 'Aprobada' ||
      v.status === 'Tentativa' ||
      v.status === 'En curso' ||
      v.status === 'Reprogramada',
  ).length;
  const closedDealsCount = scopedLeads.filter((l) => l.stage === 'Cerrado ganado').length;

  const collectionTotalMXN = scopedPayments
    .filter((p) => p.status === 'Pagado')
    .reduce((acc, p) => acc + p.amountMXN, 0);

  const pendingCollectionMXN = scopedPayments
    .filter((p) => p.status === 'Pendiente' || p.status === 'Atrasado')
    .reduce((acc, p) => acc + p.amountMXN, 0);

  const pipelinePotentialMXN = scopedLeads
    .filter((l) => l.stage !== 'Perdido')
    .reduce((acc, l) => acc + l.potentialValueMXN, 0);

  const advisorRanking = advisors
    .filter((a) => a.role === 'asesor' || a.closedDealsQuarter > 0)
    .map((advisor) => ({
      advisor,
      closedCount: advisor.closedDealsQuarter,
      volumeMXN: advisor.monthlyVolumeMXN,
    }))
    .sort((a, b) => b.volumeMXN - a.volumeMXN);

  return {
    activeProperties,
    soldProperties,
    rentedProperties,
    newLeadsCount,
    scheduledVisitsCount,
    closedDealsCount,
    collectionTotalMXN,
    pendingCollectionMXN,
    pipelinePotentialMXN,
    advisorRanking,
  };
}
