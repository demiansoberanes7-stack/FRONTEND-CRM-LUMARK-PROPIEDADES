import React, { useMemo, useState } from 'react';
import {
  Bath,
  BedDouble,
  Building2,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  LayoutGrid,
  MapPin,
  Maximize2,
  Plus,
  SlidersHorizontal,
  Table as TableIcon,
  Users,
} from 'lucide-react';
import type {
  Advisor,
  Lead,
  OperationType,
  Property,
  PropertyStatus,
  PropertyType,
  RoleId,
  RolePermissionsMatrix,
  Visit,
} from '../../types/crm';
import {
  IMG_CASA_TIJUANA,
  IMG_DEPTO_PLAYAS,
  IMG_INTERIOR_ENSENADA,
  IMG_LOCAL_MEXICALI,
  IMG_TERRENO_ROSARITO,
} from '../../data/mockData';
import {
  canEditProperty,
  filterProperties,
  formatMXN,
  hasPermission,
  type PropertyFilterCriteria,
} from '../../utils/crmLogic';
import {
  DEFAULT_PROPERTY_CARD_CONFIG,
  PropertyCard,
  type PropertyCardConfig,
} from '../ui/PropertyCard';
import { PropertyGallery } from '../ui/PropertyGallery';
import { StatusBadge } from '../ui/StatusBadge';
import {
  DataTable,
  DropdownSelect,
  EmptyState,
  FilterPanel,
  Modal,
  SearchInput,
  type ColumnDef,
} from '../ui/Primitives';

export interface PropertiesViewProps {
  properties: Property[];
  advisors: Advisor[];
  leads: Lead[];
  visits: Visit[];
  activeRole: RoleId;
  activeAdvisorId: string;
  rolePermissions: RolePermissionsMatrix;
  selectedProperty: Property | null;
  onSelectProperty: (prop: Property | null) => void;
  formModalOpen: boolean;
  editingProperty: Property | null;
  onOpenCreateForm: () => void;
  onOpenEditForm: (prop: Property) => void;
  onCloseFormModal: () => void;
  onSaveProperty: (propData: Omit<Property, 'id' | 'createdAt' | 'viewsCount' | 'activities'>, existingId?: string) => void;
  onNotify: (title: string, description?: string) => void;
}

const DEFAULT_FILTERS: PropertyFilterCriteria = {
  query: '',
  operation: 'Todas',
  type: 'Todos',
  city: 'Todas',
  neighborhood: 'Todas',
  status: 'Todos',
  advisorId: 'Todos',
  sortBy: 'recent',
};

const PAGE_SIZE = 6;

const IMAGE_PRESETS: Record<PropertyType, string[]> = {
  Casa: [IMG_CASA_TIJUANA, IMG_INTERIOR_ENSENADA, IMG_DEPTO_PLAYAS, IMG_TERRENO_ROSARITO],
  Departamento: [IMG_DEPTO_PLAYAS, IMG_INTERIOR_ENSENADA, IMG_CASA_TIJUANA, IMG_LOCAL_MEXICALI],
  Terreno: [IMG_TERRENO_ROSARITO, IMG_DEPTO_PLAYAS, IMG_CASA_TIJUANA, IMG_INTERIOR_ENSENADA],
  Local: [IMG_LOCAL_MEXICALI, IMG_INTERIOR_ENSENADA, IMG_CASA_TIJUANA, IMG_DEPTO_PLAYAS],
};

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  properties,
  advisors,
  leads,
  visits,
  activeRole,
  activeAdvisorId,
  rolePermissions,
  selectedProperty,
  onSelectProperty,
  formModalOpen,
  editingProperty,
  onOpenCreateForm,
  onOpenEditForm,
  onCloseFormModal,
  onSaveProperty,
  onNotify,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showFilters, setShowFilters] = useState(true);
  const [showCardConfig, setShowCardConfig] = useState(false);
  const [cardConfig, setCardConfig] = useState<Required<PropertyCardConfig>>(DEFAULT_PROPERTY_CARD_CONFIG);
  const [filters, setFilters] = useState<PropertyFilterCriteria>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});

  const canCreate = hasPermission(rolePermissions, activeRole, 'propiedades', 'create');

  const cities = useMemo(
    () => Array.from(new Set(properties.map((p) => p.city))).sort(),
    [properties],
  );
  const neighborhoods = useMemo(() => {
    const base =
      filters.city === 'Todas'
        ? properties
        : properties.filter((p) => p.city === filters.city);
    return Array.from(new Set(base.map((p) => p.neighborhood))).sort();
  }, [properties, filters.city]);

  const filtered = useMemo(
    () => filterProperties(properties, filters, activeRole, activeAdvisorId),
    [properties, filters, activeRole, activeAdvisorId],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleToggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = !prev[id];
      onNotify(next ? 'Propiedad guardada' : 'Propiedad removida de guardados');
      return { ...prev, [id]: next };
    });
  };

  const updateFilter = <K extends keyof PropertyFilterCriteria>(
    key: K,
    val: PropertyFilterCriteria[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: val,
      ...(key === 'city' ? { neighborhood: 'Todas' } : {}),
    }));
    setPage(1);
  };

  const tableColumns: ColumnDef<Property>[] = [
    {
      key: 'title',
      header: 'Propiedad',
      render: (prop) => (
        <div className="flex items-center gap-3">
          <img
            src={prop.images[0]}
            alt={prop.title}
            referrerPolicy="no-referrer"
            className="h-10 w-14 shrink-0 rounded-md object-cover bg-slate-100"
          />
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => onSelectProperty(prop)}
              className="text-left text-xs font-semibold text-slate-900 hover:text-[#1E3A8A] dark:text-white dark:hover:text-blue-400"
            >
              {prop.title}
            </button>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {prop.code} · {prop.type}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'operation',
      header: 'Operación',
      render: (prop) => (
        <span className="text-xs font-semibold text-[#1E3A8A] dark:text-blue-400">
          {prop.operation}
        </span>
      ),
    },
    {
      key: 'location',
      header: 'Ubicación',
      render: (prop) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {prop.neighborhood}, {prop.city}
        </span>
      ),
    },
    {
      key: 'area',
      header: 'Superficie',
      align: 'right',
      render: (prop) => <span className="text-xs font-medium">{prop.areaM2} m²</span>,
    },
    {
      key: 'price',
      header: 'Precio',
      align: 'right',
      render: (prop) => (
        <span className="text-xs font-bold text-slate-900 dark:text-white">
          {formatMXN(prop.priceMXN)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estatus',
      render: (prop) => <StatusBadge status={prop.status} />,
    },
    {
      key: 'advisor',
      header: 'Asesor',
      render: (prop) => {
        const adv = advisors.find((a) => a.id === prop.advisorId);
        return <span className="text-xs text-slate-600 dark:text-slate-300">{adv?.name ?? '—'}</span>;
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (prop) => {
        const editable = canEditProperty(prop, activeRole, activeAdvisorId, rolePermissions);
        return (
          <div className="inline-flex items-center justify-end gap-1.5">
            {editable && (
              <button
                type="button"
                onClick={() => onOpenEditForm(prop)}
                aria-label={`Editar ${prop.title}`}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Edit3 className="h-3 w-3" aria-hidden="true" />
                <span>Editar</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onSelectProperty(prop)}
              aria-label={`Ver ficha de ${prop.title}`}
              className="inline-flex h-7 items-center gap-1 rounded-md bg-[#1E3A8A] px-2 text-[11px] font-medium text-white hover:bg-[#172554] dark:bg-blue-600"
            >
              <Eye className="h-3 w-3" aria-hidden="true" />
              <span>Ver</span>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Toolbar */}
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <SearchInput
            value={filters.query}
            onChange={(q) => updateFilter('query', q)}
            placeholder="Buscar por título, código, ciudad o colonia..."
            ariaLabel="Buscar propiedades"
            className="w-full sm:w-72"
          />

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className={`inline-flex h-9.5 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors whitespace-nowrap ${
              showFilters
                ? 'border-[#1E3A8A]/30 bg-blue-50/70 text-[#1E3A8A] dark:border-blue-500/40 dark:bg-blue-950/40 dark:text-blue-300'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Filtros</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCardConfig((v) => !v)}
            aria-expanded={showCardConfig}
            className="inline-flex h-9.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap"
          >
            <span>Personalizar tarjetas</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div
            role="group"
            aria-label="Cambiar vista de propiedades"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 dark:border-slate-700 dark:bg-slate-800"
          >
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              aria-label="Vista de tarjetas"
              aria-pressed={viewMode === 'cards'}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tarjetas</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label="Vista de tabla"
              aria-pressed={viewMode === 'table'}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tabla</span>
            </button>
          </div>

          {canCreate && (
            <button
              type="button"
              onClick={onOpenCreateForm}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-3.5 text-xs font-semibold text-white transition-colors hover:bg-[#172554] dark:bg-blue-600 dark:hover:bg-blue-500 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Registrar propiedad</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Configurator (demonstrates configurable PropertyCard) */}
      {showCardConfig && (
        <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
          <p className="mb-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
            Campos visibles en el componente reutilizable PropertyCard:
          </p>
          <div className="flex flex-wrap gap-3">
            {(
              [
                ['showImage', 'Fotografía'],
                ['showPrice', 'Precio MXN'],
                ['showType', 'Tipo de inmueble'],
                ['showOperation', 'Operación'],
                ['showLocation', 'Ubicación'],
                ['showSpecs', 'Superficie y recámaras'],
                ['showStatus', 'Estatus'],
                ['showAdvisor', 'Asesor'],
                ['showTags', 'Etiquetas'],
                ['showQuickActions', 'Acciones rápidas'],
              ] as [keyof PropertyCardConfig, string][]
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

      {/* Advanced Filters */}
      {showFilters && (
        <FilterPanel
          onReset={() => {
            setFilters(DEFAULT_FILTERS);
            setPage(1);
          }}
        >
          <DropdownSelect
            label="Operación"
            value={filters.operation}
            onChange={(v) => updateFilter('operation', v as 'Todas' | OperationType)}
            options={[
              { value: 'Todas', label: 'Venta y Renta' },
              { value: 'Venta', label: 'Venta' },
              { value: 'Renta', label: 'Renta' },
            ]}
          />
          <DropdownSelect
            label="Tipo de inmueble"
            value={filters.type}
            onChange={(v) => updateFilter('type', v as 'Todos' | PropertyType)}
            options={[
              { value: 'Todos', label: 'Todos los tipos' },
              { value: 'Casa', label: 'Casa' },
              { value: 'Departamento', label: 'Departamento' },
              { value: 'Terreno', label: 'Terreno' },
              { value: 'Local', label: 'Local comercial' },
            ]}
          />
          <DropdownSelect
            label="Ciudad"
            value={filters.city}
            onChange={(v) => updateFilter('city', v)}
            options={[
              { value: 'Todas', label: 'Todas las ciudades' },
              ...cities.map((c) => ({ value: c, label: c })),
            ]}
          />
          <DropdownSelect
            label="Colonia"
            value={filters.neighborhood}
            onChange={(v) => updateFilter('neighborhood', v)}
            options={[
              { value: 'Todas', label: 'Todas las colonias' },
              ...neighborhoods.map((n) => ({ value: n, label: n })),
            ]}
          />
          <DropdownSelect
            label="Estatus"
            value={filters.status}
            onChange={(v) => updateFilter('status', v as 'Todos' | PropertyStatus)}
            options={[
              { value: 'Todos', label: 'Todos los estatus' },
              { value: 'Disponible', label: 'Disponible' },
              { value: 'Apartada', label: 'Apartada' },
              { value: 'En negociación', label: 'En negociación' },
              { value: 'Vendida', label: 'Vendida' },
              { value: 'Rentada', label: 'Rentada' },
              { value: 'Borrador', label: 'Borrador' },
            ]}
          />
          <DropdownSelect
            label="Asesor / Orden"
            value={filters.advisorId}
            onChange={(v) => updateFilter('advisorId', v)}
            options={[
              { value: 'Todos', label: 'Todos los asesores' },
              ...advisors.map((a) => ({ value: a.id, label: a.name })),
            ]}
          />

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Precio mínimo (MXN)
            </span>
            <input
              type="number"
              min={0}
              placeholder="Ej. 30000"
              value={filters.minPrice ?? ''}
              onChange={(e) =>
                updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)
              }
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs tabular-nums focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-[#090D16] dark:text-slate-100"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Precio máximo (MXN)
            </span>
            <input
              type="number"
              min={0}
              placeholder="Ej. 15000000"
              value={filters.maxPrice ?? ''}
              onChange={(e) =>
                updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)
              }
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs tabular-nums focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-[#090D16] dark:text-slate-100"
            />
          </label>

          <DropdownSelect
            label="Ordenar por"
            value={filters.sortBy}
            onChange={(v) => updateFilter('sortBy', v as PropertyFilterCriteria['sortBy'])}
            options={[
              { value: 'recent', label: 'Más recientes' },
              { value: 'price-desc', label: 'Mayor precio' },
              { value: 'price-asc', label: 'Menor precio' },
              { value: 'area-desc', label: 'Mayor superficie' },
            ]}
          />
        </FilterPanel>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="tabular-nums">
          Mostrando <strong className="text-slate-900 dark:text-white">{paginated.length}</strong> de{' '}
          <strong className="text-slate-900 dark:text-white">{filtered.length}</strong> inmuebles
        </span>
        {activeRole === 'asesor' && (
          <span>Visualizando catálogo activo y tus propiedades asignadas</span>
        )}
      </div>

      {/* Catalog Content */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="Sin propiedades coincidentes"
          description="Ningún inmueble coincide con los criterios seleccionados. Limpia los filtros o registra una nueva propiedad."
          actionLabel="Restablecer filtros"
          onAction={() => setFilters(DEFAULT_FILTERS)}
        />
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {paginated.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              advisor={advisors.find((a) => a.id === prop.advisorId)}
              config={cardConfig}
              canEdit={canEditProperty(prop, activeRole, activeAdvisorId, rolePermissions)}
              isBookmarked={Boolean(bookmarks[prop.id])}
              onSelect={onSelectProperty}
              onEdit={onOpenEditForm}
              onBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={tableColumns}
          rows={paginated}
          keyExtractor={(p) => p.id}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200/80 pt-4 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Página {safePage} de {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Página anterior"
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Anterior</span>
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Página siguiente"
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <span>Siguiente</span>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Property Detail Modal */}
      {selectedProperty && (
        <Modal
          open={Boolean(selectedProperty)}
          onClose={() => onSelectProperty(null)}
          title={selectedProperty.title}
          subtitle={`${selectedProperty.code} · ${selectedProperty.type} en ${selectedProperty.operation} · ${selectedProperty.neighborhood}, ${selectedProperty.city}`}
          size="xl"
        >
          <PropertyDetailContent
            property={selectedProperty}
            advisor={advisors.find((a) => a.id === selectedProperty.advisorId)}
            relatedLeads={leads.filter((l) => l.propertyId === selectedProperty.id)}
            relatedVisits={visits.filter((v) => v.propertyId === selectedProperty.id)}
            canEdit={canEditProperty(selectedProperty, activeRole, activeAdvisorId, rolePermissions)}
            onEdit={() => {
              const target = selectedProperty;
              onSelectProperty(null);
              onOpenEditForm(target);
            }}
          />
        </Modal>
      )}

      {/* Property Create / Edit Modal */}
      {formModalOpen && (
        <Modal
          open={formModalOpen}
          onClose={onCloseFormModal}
          title={editingProperty ? `Editar ${editingProperty.title}` : 'Registrar nueva propiedad'}
          subtitle="Completa la ficha comercial del inmueble (datos de demostración en MXN)."
          size="lg"
        >
          <PropertyForm
            initial={editingProperty}
            advisors={advisors}
            defaultAdvisorId={activeRole === 'asesor' ? activeAdvisorId : 'adv-carlos'}
            onCancel={onCloseFormModal}
            onSave={onSaveProperty}
          />
        </Modal>
      )}
    </div>
  );
};

/* -------------------- Property Detail Subview -------------------- */
const PropertyDetailContent: React.FC<{
  property: Property;
  advisor?: Advisor;
  relatedLeads: Lead[];
  relatedVisits: Visit[];
  canEdit: boolean;
  onEdit: () => void;
}> = ({ property, advisor, relatedLeads, relatedVisits, canEdit, onEdit }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <PropertyGallery images={property.images} title={property.title} />
      </div>

      <div className="flex flex-col justify-between space-y-4 lg:col-span-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StatusBadge status={property.status} size="md" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
              {property.viewsCount} visualizaciones
            </span>
          </div>

          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {formatMXN(property.priceMXN)}
              {property.operation === 'Renta' && (
                <span className="ml-1 text-sm font-normal text-slate-500">/ mes</span>
              )}
            </p>
            <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <span>{property.address}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60 tabular-nums">
            <div className="flex items-center gap-2 text-xs">
              <Maximize2 className="h-4 w-4 text-[#1E3A8A] dark:text-blue-400" aria-hidden="true" />
              <span><strong>{property.areaM2} m²</strong> superficie</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <BedDouble className="h-4 w-4 text-[#1E3A8A] dark:text-blue-400" aria-hidden="true" />
              <span><strong>{property.bedrooms}</strong> recámaras</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Bath className="h-4 w-4 text-[#1E3A8A] dark:text-blue-400" aria-hidden="true" />
              <span><strong>{property.bathrooms}</strong> baños</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Car className="h-4 w-4 text-[#1E3A8A] dark:text-blue-400" aria-hidden="true" />
              <span><strong>{property.parking}</strong> estacionamientos</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Descripción</h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {property.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Características</h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {property.amenities.join(' · ')}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 dark:border-slate-800">
          {advisor && (
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: advisor.avatarColor }}
              >
                {advisor.avatarInitials}
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {advisor.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Asesor responsable</p>
              </div>
            </div>
          )}

          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-3 text-xs font-semibold text-white hover:bg-[#172554] dark:bg-blue-600"
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Editar ficha</span>
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Map preview + Related Leads + Visits + Activity */}
    <div className="grid grid-cols-1 gap-4 border-t border-slate-200 pt-5 md:grid-cols-3 dark:border-slate-800">
      <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
          <MapPin className="h-3.5 w-3.5 text-[#1E3A8A] dark:text-blue-400" aria-hidden="true" />
          <span>Ubicación geográfica</span>
        </h4>
        <div className="mt-2.5 flex h-28 flex-col justify-between rounded-lg bg-gradient-to-br from-slate-100 to-blue-50 p-3 dark:from-slate-800 dark:to-slate-900">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {property.neighborhood}, {property.city}
          </span>
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            Lat {property.coordinates.lat.toFixed(4)} · Lng {property.coordinates.lng.toFixed(4)}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
          <Users className="h-3.5 w-3.5 text-[#1E3A8A] dark:text-blue-400" aria-hidden="true" />
          <span>Prospectos interesados ({relatedLeads.length})</span>
        </h4>
        <ul className="mt-2.5 space-y-2">
          {relatedLeads.length === 0 ? (
            <li className="text-xs text-slate-500">Sin prospectos asociados aún.</li>
          ) : (
            relatedLeads.map((l) => (
              <li key={l.id} className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                  {l.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{l.stage}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
          <Calendar className="h-3.5 w-3.5 text-[#1E3A8A] dark:text-blue-400" aria-hidden="true" />
          <span>Visitas y actividad ({relatedVisits.length})</span>
        </h4>
        <ul className="mt-2.5 space-y-2">
          {relatedVisits.slice(0, 2).map((v) => (
            <li key={v.id} className="flex items-center justify-between text-xs tabular-nums">
              <span className="text-slate-700 dark:text-slate-300">
                {v.date} · {v.time}
              </span>
              <StatusBadge status={v.status} />
            </li>
          ))}
          {property.activities.slice(0, 2).map((act) => (
            <li key={act.id} className="text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">{act.date}:</span>{' '}
              {act.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

/* -------------------- Property Create / Edit Form -------------------- */
const PropertyForm: React.FC<{
  initial: Property | null;
  advisors: Advisor[];
  defaultAdvisorId: string;
  onCancel: () => void;
  onSave: (
    data: Omit<Property, 'id' | 'createdAt' | 'viewsCount' | 'activities'>,
    existingId?: string,
  ) => void;
}> = ({ initial, advisors, defaultAdvisorId, onCancel, onSave }) => {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [code, setCode] = useState(initial?.code ?? `LMK-BC-${Math.floor(200 + Math.random() * 700)}`);
  const [type, setType] = useState<PropertyType>(initial?.type ?? 'Casa');
  const [operation, setOperation] = useState<OperationType>(initial?.operation ?? 'Venta');
  const [priceMXN, setPriceMXN] = useState(String(initial?.priceMXN ?? ''));
  const [city, setCity] = useState(initial?.city ?? 'Tijuana');
  const [neighborhood, setNeighborhood] = useState(initial?.neighborhood ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [areaM2, setAreaM2] = useState(String(initial?.areaM2 ?? '220'));
  const [bedrooms, setBedrooms] = useState(String(initial?.bedrooms ?? '3'));
  const [bathrooms, setBathrooms] = useState(String(initial?.bathrooms ?? '2.5'));
  const [parking, setParking] = useState(String(initial?.parking ?? '2'));
  const [status, setStatus] = useState<PropertyStatus>(initial?.status ?? 'Disponible');
  const [advisorId, setAdvisorId] = useState(initial?.advisorId ?? defaultAdvisorId);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !neighborhood.trim() || !priceMXN || Number(priceMXN) <= 0) {
      setError('Completa título, colonia y un precio válido en MXN.');
      return;
    }

    onSave(
      {
        code: code.trim() || 'LMK-NEW',
        title: title.trim(),
        type,
        operation,
        priceMXN: Number(priceMXN),
        city: city.trim(),
        neighborhood: neighborhood.trim(),
        address: address.trim() || `${neighborhood.trim()}, ${city.trim()}, B.C.`,
        areaM2: Number(areaM2) || 150,
        bedrooms: Number(bedrooms) || 0,
        bathrooms: Number(bathrooms) || 0,
        parking: Number(parking) || 0,
        status,
        advisorId,
        tags: [operation, city.trim(), status],
        images: initial?.images ?? IMAGE_PRESETS[type],
        description:
          description.trim() ||
          `${type} en ${operation.toLowerCase()} ubicado en ${neighborhood.trim()}, ${city.trim()}.`,
        amenities: initial?.amenities ?? ['Seguridad', 'Escrituración lista', 'Excelente ubicación'],
        coordinates: initial?.coordinates ?? { lat: 32.5149, lng: -117.0382 },
      },
      initial?.id,
    );
  };

  const inputCls =
    'h-9.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 dark:border-slate-700 dark:bg-[#090D16] dark:text-slate-100';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Título del inmueble *
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Residencia Vista Bahía"
            className={inputCls}
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Código interno
          </span>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={`${inputCls} font-mono`}
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Precio (MXN) *
          </span>
          <input
            type="number"
            min={1000}
            value={priceMXN}
            onChange={(e) => setPriceMXN(e.target.value)}
            placeholder="Ej. 6500000"
            className={`${inputCls} tabular-nums`}
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Tipo de propiedad
          </span>
          <select value={type} onChange={(e) => setType(e.target.value as PropertyType)} className={inputCls}>
            <option value="Casa">Casa</option>
            <option value="Departamento">Departamento</option>
            <option value="Terreno">Terreno</option>
            <option value="Local">Local</option>
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Operación
          </span>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value as OperationType)}
            className={inputCls}
          >
            <option value="Venta">Venta</option>
            <option value="Renta">Renta</option>
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Ciudad
          </span>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={inputCls}>
            <option value="Tijuana">Tijuana</option>
            <option value="Playas de Tijuana">Playas de Tijuana</option>
            <option value="Rosarito">Rosarito</option>
            <option value="Ensenada">Ensenada</option>
            <option value="Mexicali">Mexicali</option>
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Colonia *
          </span>
          <input
            type="text"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Ej. Zona Río"
            className={inputCls}
          />
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Dirección completa
          </span>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Calle, número y código postal"
            className={inputCls}
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Superficie (m²)
          </span>
          <input type="number" value={areaM2} onChange={(e) => setAreaM2(e.target.value)} className={inputCls} />
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Estatus
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PropertyStatus)}
            className={inputCls}
          >
            <option value="Disponible">Disponible</option>
            <option value="Apartada">Apartada</option>
            <option value="En negociación">En negociación</option>
            <option value="Vendida">Vendida</option>
            <option value="Rentada">Rentada</option>
            <option value="Borrador">Borrador</option>
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Recámaras / Baños / Est.
          </span>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" aria-label="Recámaras" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className={inputCls} />
            <input type="number" step="0.5" aria-label="Baños" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className={inputCls} />
            <input type="number" aria-label="Estacionamientos" value={parking} onChange={(e) => setParking(e.target.value)} className={inputCls} />
          </div>
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Asesor responsable
          </span>
          <select value={advisorId} onChange={(e) => setAdvisorId(e.target.value)} className={inputCls}>
            {advisors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Descripción comercial
          </span>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe acabados, amenidades y entorno..."
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-[#090D16] dark:text-slate-100"
          />
        </label>
      </div>

      <div className="flex justify-end gap-2.5 border-t border-slate-200 pt-4 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="h-9 rounded-lg bg-[#1E3A8A] px-4 text-xs font-semibold text-white hover:bg-[#172554] dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          {initial ? 'Guardar cambios' : 'Publicar propiedad'}
        </button>
      </div>
    </form>
  );
};
