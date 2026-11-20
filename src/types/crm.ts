export type RoleId = 'administrador' | 'asesor';

export type ModuleId =
  | 'dashboard'
  | 'propiedades'
  | 'prospectos'
  | 'agenda'
  | 'rentas'
  | 'expedientes'
  | 'mensajeria'
  | 'reportes'
  | 'roles'
  | 'configuracion';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'assign';

export interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  assign: boolean;
}

export type RolePermissionsMatrix = Record<RoleId, Record<ModuleId, ModulePermission>>;

export interface RoleDefinition {
  id: RoleId;
  name: string;
  description: string;
  scopeLabel: string;
}

export interface Advisor {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: RoleId;
  specialty: string;
  zone: string;
  avatarInitials: string;
  avatarColor: string;
  active: boolean;
  closedDealsQuarter: number;
  monthlyVolumeMXN: number;
}

export type PropertyType = 'Casa' | 'Departamento' | 'Terreno' | 'Local';
export type OperationType = 'Venta' | 'Renta';
export type PropertyStatus =
  | 'Disponible'
  | 'Apartada'
  | 'En negociación'
  | 'Vendida'
  | 'Rentada'
  | 'Borrador';

export interface PropertyActivity {
  id: string;
  date: string;
  author: string;
  description: string;
}

export interface Property {
  id: string;
  code: string;
  title: string;
  type: PropertyType;
  operation: OperationType;
  priceMXN: number;
  city: string;
  neighborhood: string;
  address: string;
  areaM2: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  status: PropertyStatus;
  advisorId: string;
  tags: string[];
  images: string[];
  description: string;
  amenities: string[];
  viewsCount: number;
  createdAt: string;
  coordinates: { lat: number; lng: number };
  activities: PropertyActivity[];
}

export type PipelineStage =
  | 'Nuevo'
  | 'Contactado'
  | 'Visita agendada'
  | 'Visita realizada'
  | 'Oferta'
  | 'Cerrado ganado'
  | 'Perdido';

export interface LeadNote {
  id: string;
  date: string;
  author: string;
  text: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarInitials: string;
  avatarColor: string;
  source: 'WhatsApp' | 'Inmuebles24' | 'Instagram' | 'Referido' | 'Sitio web';
  propertyId: string;
  advisorId: string;
  stage: PipelineStage;
  lastContactDate: string;
  potentialValueMXN: number;
  followUpStatus: 'Al día' | 'Seguimiento hoy' | 'Atrasado';
  lossReason?: string;
  notes: LeadNote[];
  history: { id: string; date: string; event: string }[];
}

export type VisitStatus =
  | 'Pendiente'
  | 'Aprobada'
  | 'Tentativa'
  | 'En curso'
  | 'Retrasada'
  | 'Completada'
  | 'Cancelada'
  | 'Reprogramada'
  | 'No se presentó'
  | 'Rechazada';

export interface Visit {
  id: string;
  propertyId: string;
  leadId: string;
  advisorId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMin: number;
  status: VisitStatus;
  notes: string;
}

export type ContractStatus = 'Vigente' | 'Por vencer' | 'Vencido' | 'Renovado';
export type PaymentStatus = 'Pagado' | 'Pendiente' | 'Atrasado';

export interface RentalContract {
  id: string;
  propertyId: string;
  tenantName: string;
  tenantPhone: string;
  advisorId: string;
  startDate: string;
  endDate: string;
  monthlyRentMXN: number;
  paymentDay: number;
  status: ContractStatus;
}

export interface RentPayment {
  id: string;
  contractId: string;
  period: string;
  dueDate: string;
  paidDate?: string;
  amountMXN: number;
  status: PaymentStatus;
  method?: string;
}

export type DossierScope = 'Propiedad' | 'Cliente';
export type DocumentStatus = 'Aprobado' | 'En revisión' | 'Pendiente' | 'Rechazado';

export interface DossierDocument {
  id: string;
  name: string;
  category: 'Contrato' | 'Identificación' | 'Comprobante' | 'Adicional';
  status: DocumentStatus;
  uploadedAt: string;
  responsible: string;
  fileSize: string;
}

export interface Dossier {
  id: string;
  scope: DossierScope;
  title: string;
  relatedName: string;
  advisorId: string;
  updatedAt: string;
  documents: DossierDocument[];
}

export type ChannelType = 'WhatsApp' | 'Instagram' | 'Messenger' | 'Correo';

export interface ChatMessage {
  id: string;
  sender: 'contact' | 'advisor' | 'ai';
  text: string;
  timestamp: string;
  status: 'enviado' | 'entregado' | 'leido';
}

export interface Conversation {
  id: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  avatarInitials: string;
  avatarColor: string;
  channel: ChannelType;
  propertyId: string;
  advisorId: string;
  aiActive: boolean;
  unreadCount: number;
  lastMessageTime: string;
  messages: ChatMessage[];
  internalNotes: string[];
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: 'success' | 'info' | 'warning' | 'error';
}
