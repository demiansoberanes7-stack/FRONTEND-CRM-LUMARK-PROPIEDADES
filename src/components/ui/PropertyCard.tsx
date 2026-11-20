import React, { useState } from 'react';
import {
  Bath,
  BedDouble,
  Bookmark,
  Building2,
  Car,
  Edit3,
  Eye,
  MapPin,
  Maximize2,
} from 'lucide-react';
import type { Advisor, Property } from '../../types/crm';
import { formatMXN } from '../../utils/crmLogic';
import { StatusBadge } from './StatusBadge';

export interface PropertyCardConfig {
  showImage?: boolean;
  showPrice?: boolean;
  showType?: boolean;
  showOperation?: boolean;
  showLocation?: boolean;
  showSpecs?: boolean;
  showStatus?: boolean;
  showAdvisor?: boolean;
  showTags?: boolean;
  showQuickActions?: boolean;
}

export const DEFAULT_PROPERTY_CARD_CONFIG: Required<PropertyCardConfig> = {
  showImage: true,
  showPrice: true,
  showType: true,
  showOperation: true,
  showLocation: true,
  showSpecs: true,
  showStatus: true,
  showAdvisor: true,
  showTags: true,
  showQuickActions: true,
};

export interface PropertyCardProps {
  property: Property;
  advisor?: Advisor;
  variant?: 'grid' | 'compact';
  config?: PropertyCardConfig;
  canEdit?: boolean;
  isBookmarked?: boolean;
  onSelect?: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onBookmark?: (propertyId: string) => void;
  className?: string;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  advisor,
  variant = 'grid',
  config,
  canEdit = false,
  isBookmarked = false,
  onSelect,
  onEdit,
  onBookmark,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const cfg = { ...DEFAULT_PROPERTY_CARD_CONFIG, ...config };
  const mainImage = property.images[0];
  const isCompact = variant === 'compact';

  return (
    <article
      data-testid={`property-card-${property.id}`}
      className={`group flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white transition-all duration-150 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-[#0F172A] dark:hover:border-slate-700 ${className}`}
    >
      {cfg.showImage && (
        <div className={`relative w-full overflow-hidden bg-slate-100 dark:bg-slate-900 ${isCompact ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}>
          {mainImage && !imgError ? (
            <img
              src={mainImage}
              alt={`${property.title} en ${property.neighborhood}, ${property.city}`}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200 p-4 text-slate-500 dark:from-slate-800 dark:to-slate-900 dark:text-slate-400">
              <Building2 className="h-8 w-8" aria-hidden="true" />
              <span className="text-xs font-medium text-center">{property.title}</span>
            </div>
          )}

          {/* Subtle contrast scrim for top overlay controls */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/45 to-transparent" />

          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            {cfg.showStatus && <StatusBadge status={property.status} />}
          </div>

          {onBookmark && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(property.id);
              }}
              aria-label={isBookmarked ? `Quitar ${property.title} de guardados` : `Guardar ${property.title}`}
              className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border backdrop-blur-sm transition-colors ${
                isBookmarked
                  ? 'border-blue-500 bg-[#1E3A8A] text-white'
                  : 'border-white/30 bg-slate-950/50 text-white hover:bg-slate-950/75'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      <div className={`flex flex-1 flex-col justify-between ${isCompact ? 'p-3.5' : 'p-4'}`}>
        <div>
          {(cfg.showType || cfg.showOperation) && (
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              {cfg.showType && <span>{property.type}</span>}
              {cfg.showType && cfg.showOperation && <span aria-hidden="true">·</span>}
              {cfg.showOperation && (
                <span className="text-[#1E3A8A] dark:text-blue-400 font-semibold">
                  {property.operation}
                </span>
              )}
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px] tabular-nums">{property.code}</span>
            </div>
          )}

          <h3 className="text-[15px] font-semibold leading-snug text-slate-900 dark:text-slate-100 line-clamp-1">
            {property.title}
          </h3>

          {cfg.showPrice && (
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {formatMXN(property.priceMXN)}
              </span>
              {property.operation === 'Renta' && (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">/ mes</span>
              )}
            </div>
          )}

          {cfg.showLocation && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <span className="truncate">
                {property.neighborhood}, {property.city}
              </span>
            </p>
          )}

          {cfg.showTags && property.tags.length > 0 && !isCompact && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              {property.tags.slice(0, 3).map((tag, idx) => (
                <React.Fragment key={tag}>
                  {idx > 0 && <span aria-hidden="true">·</span>}
                  <span>{tag}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3.5 border-t border-slate-100 pt-3 dark:border-slate-800/80">
          {cfg.showSpecs && (
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs font-medium text-slate-700 dark:text-slate-300 tabular-nums">
              <span className="inline-flex items-center gap-1" title="Superficie">
                <Maximize2 className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                {property.areaM2} m²
              </span>
              {property.bedrooms > 0 && (
                <span className="inline-flex items-center gap-1" title="Recámaras">
                  <BedDouble className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  {property.bedrooms} rec.
                </span>
              )}
              {property.bathrooms > 0 && (
                <span className="inline-flex items-center gap-1" title="Baños">
                  <Bath className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  {property.bathrooms} baños
                </span>
              )}
              {property.parking > 0 && (
                <span className="inline-flex items-center gap-1" title="Estacionamientos">
                  <Car className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  {property.parking} est.
                </span>
              )}
            </div>
          )}

          {(cfg.showAdvisor || cfg.showQuickActions) && (
            <div className="mt-3 flex items-center justify-between gap-2">
              {cfg.showAdvisor && advisor ? (
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: advisor.avatarColor }}
                  >
                    {advisor.avatarInitials}
                  </span>
                  <span className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">
                    {advisor.name}
                  </span>
                </div>
              ) : (
                <span />
              )}

              {cfg.showQuickActions && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {canEdit && onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(property)}
                      aria-label={`Editar ${property.title}`}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
                    >
                      <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Editar</span>
                    </button>
                  )}
                  {onSelect && (
                    <button
                      type="button"
                      onClick={() => onSelect(property)}
                      aria-label={`Ver detalle de ${property.title}`}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#1E3A8A] px-2.5 text-xs font-medium text-white transition-colors hover:bg-[#172554] dark:bg-blue-600 dark:hover:bg-blue-500 whitespace-nowrap"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Ver ficha</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
