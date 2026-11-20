import React, { useMemo, useState } from 'react';
import { CheckCircle2, Eye, FileText, FolderOpen, UploadCloud } from 'lucide-react';
import type {
  Dossier,
  DossierDocument,
  DossierScope,
  RoleId,
} from '../../types/crm';
import { calculateDossierCompleteness, scopeDossiersByRole } from '../../utils/crmLogic';
import { StatusBadge } from '../ui/StatusBadge';
import { Modal, Tabs } from '../ui/Primitives';

export interface DossiersViewProps {
  dossiers: Dossier[];
  activeRole: RoleId;
  activeAdvisorId: string;
  onUpdateDocumentStatus: (
    dossierId: string,
    docId: string,
    status: DossierDocument['status'],
  ) => void;
  onAddDocument: (
    dossierId: string,
    doc: Omit<DossierDocument, 'id'>,
  ) => void;
}

export const DossiersView: React.FC<DossiersViewProps> = ({
  dossiers,
  activeRole,
  activeAdvisorId,
  onUpdateDocumentStatus,
  onAddDocument,
}) => {
  const [scopeTab, setScopeTab] = useState<'Todos' | DossierScope>('Todos');
  const [previewDoc, setPreviewDoc] = useState<{
    dossierTitle: string;
    doc: DossierDocument;
  } | null>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

  const scopedDossiers = useMemo(() => {
    const byRole = scopeDossiersByRole(dossiers, activeRole, activeAdvisorId);
    if (scopeTab === 'Todos') return byRole;
    return byRole.filter((d) => d.scope === scopeTab);
  }, [dossiers, activeRole, activeAdvisorId, scopeTab]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-[#0F172A]">
        <Tabs
          activeTab={scopeTab}
          onChange={setScopeTab}
          tabs={[
            { id: 'Todos', label: 'Todos los expedientes', count: scopedDossiers.length },
            { id: 'Propiedad', label: 'Por propiedad' },
            { id: 'Cliente', label: 'Por cliente' },
          ]}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Documentación de demostración · Sin datos fiscales reales
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {scopedDossiers.map((dos) => {
          const stats = calculateDossierCompleteness(dos);
          return (
            <section
              key={dos.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-[#0F172A]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-blue-500/15 dark:text-blue-400">
                      <FolderOpen className="h-4.5 w-4.5" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-[#1E3A8A] dark:text-blue-400">
                        Expediente de {dos.scope}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {dos.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        Actualizado: {dos.updatedAt}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadTargetId(dos.id)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                  >
                    <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Agregar</span>
                  </button>
                </div>

                {/* Completeness bar */}
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      Completitud del expediente
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                      {stats.approved}/{stats.total} aprobados ({stats.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stats.percentage === 100 ? 'bg-emerald-600' : 'bg-[#1E3A8A] dark:bg-blue-500'
                      }`}
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Documents list */}
                <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {dos.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex flex-col justify-between gap-2 py-2.5 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                          <span className="truncate text-xs font-medium text-slate-800 dark:text-slate-200">
                            {doc.name}
                          </span>
                        </div>
                        <p className="mt-0.5 pl-5 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                          {doc.category} · {doc.uploadedAt} · {doc.responsible} · {doc.fileSize}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={doc.status} />
                        {doc.status !== 'Aprobado' && (
                          <button
                            type="button"
                            onClick={() => onUpdateDocumentStatus(dos.id, doc.id, 'Aprobado')}
                            title="Aprobar documento"
                            aria-label={`Aprobar ${doc.name}`}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setPreviewDoc({ dossierTitle: dos.title, doc })}
                          aria-label={`Vista previa de ${doc.name}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <Modal
          open
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.doc.name}
          subtitle={previewDoc.dossierTitle}
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Estado de validación</span>
              <StatusBadge status={previewDoc.doc.status} size="md" />
            </div>
            <div className="flex h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900">
              <FileText className="h-10 w-10 text-[#1E3A8A] dark:text-blue-400" />
              <p className="mt-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                Documento digital de demostración ({previewDoc.doc.fileSize})
              </p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Cargado el {previewDoc.doc.uploadedAt} por {previewDoc.doc.responsible}.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Simulation Modal */}
      {uploadTargetId && (
        <AddDocumentModal
          onClose={() => setUploadTargetId(null)}
          onSubmit={(doc) => {
            onAddDocument(uploadTargetId, doc);
            setUploadTargetId(null);
          }}
        />
      )}
    </div>
  );
};

const AddDocumentModal: React.FC<{
  onClose: () => void;
  onSubmit: (doc: Omit<DossierDocument, 'id'>) => void;
}> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DossierDocument['category']>('Adicional');

  return (
    <Modal open onClose={onClose} title="Cargar documento al expediente" size="md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onSubmit({
            name: name.trim(),
            category,
            status: 'En revisión',
            uploadedAt: new Date().toISOString().slice(0, 10),
            responsible: 'Usuario activo',
            fileSize: '1.2 MB',
          });
        }}
        className="space-y-3.5"
      >
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Nombre del documento *</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Comprobante de servicio agua"
            className="h-9.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Categoría</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as DossierDocument['category'])}
            className="h-9.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="Contrato">Contrato</option>
            <option value="Identificación">Identificación</option>
            <option value="Comprobante">Comprobante</option>
            <option value="Adicional">Adicional</option>
          </select>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-slate-200 px-3.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="h-9 rounded-lg bg-[#1E3A8A] px-3.5 text-xs font-semibold text-white dark:bg-blue-600"
          >
            Subir documento (Demo)
          </button>
        </div>
      </form>
    </Modal>
  );
};
