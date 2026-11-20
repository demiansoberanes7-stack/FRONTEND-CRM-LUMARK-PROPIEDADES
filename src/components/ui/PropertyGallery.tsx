import React, { useState } from 'react';
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react';

export interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, title }) => {
  const gallery = images.slice(0, 4);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  if (gallery.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-900">
        <Building2 className="h-10 w-10" aria-hidden="true" />
        <span className="mt-2 text-sm">Sin fotografías disponibles</span>
      </div>
    );
  }

  const currentSrc = gallery[activeIndex] ?? gallery[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
        {!failed[activeIndex] ? (
          <img
            src={currentSrc}
            alt={`${title} - Fotografía ${activeIndex + 1}`}
            referrerPolicy="no-referrer"
            onError={() => setFailed((prev) => ({ ...prev, [activeIndex]: true }))}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-500">
            <Building2 className="h-10 w-10" aria-hidden="true" />
            <span className="text-sm font-medium">{title}</span>
          </div>
        )}

        {gallery.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Fotografía anterior"
              onClick={() => setActiveIndex((prev) => (prev - 1 + gallery.length) % gallery.length)}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/60 text-white backdrop-blur-sm transition-colors hover:bg-slate-950/85"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Siguiente fotografía"
              onClick={() => setActiveIndex((prev) => (prev + 1) % gallery.length)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/60 text-white backdrop-blur-sm transition-colors hover:bg-slate-950/85"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}

        <div className="absolute bottom-3 right-3 rounded-lg bg-slate-950/70 px-2.5 py-1 text-xs font-medium text-white tabular-nums backdrop-blur-sm">
          {activeIndex + 1} / {gallery.length}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {gallery.map((src, idx) => (
          <button
            key={`${src}-${idx}`}
            type="button"
            aria-label={`Seleccionar foto ${idx + 1}`}
            onClick={() => setActiveIndex(idx)}
            className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all ${
              activeIndex === idx
                ? 'border-[#1E3A8A] ring-2 ring-blue-500/20 dark:border-blue-500'
                : 'border-transparent opacity-75 hover:opacity-100'
            }`}
          >
            {!failed[idx] ? (
              <img
                src={src}
                alt={`Miniatura ${idx + 1} de ${title}`}
                referrerPolicy="no-referrer"
                onError={() => setFailed((prev) => ({ ...prev, [idx]: true }))}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-800">
                <Building2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
