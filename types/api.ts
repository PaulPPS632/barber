// ─────────────────────────────────────────────────────────────────────────────
// ENUMS (espejo del schema Prisma)
// ─────────────────────────────────────────────────────────────────────────────

export type PlantillaMicrositio = "CLASICO" | "MODERNO" | "MINIMAL";
export type TipoPortada         = "HERO" | "BANNER";
export type TipoPublicacion     = "TIKTOK" | "YOUTUBE";
export type EstadoCita          = "pendiente" | "confirmada" | "cancelada";
export type Role                = "superadmin" | "admin" | "staff" | "customer";
export type PlataformaRed       =
  | "facebook" | "instagram" | "tiktok"
  | "youtube"  | "twitter"   | "whatsapp" | "web";

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  role: Role;
  barberiaId: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// BARBERÍA
// ─────────────────────────────────────────────────────────────────────────────

export interface RedSocial {
  id: number;
  plataforma: PlataformaRed;
  url: string;
  barberiaId: number;
}

export interface Barberia {
  id: number;
  slug: string;
  nombre: string;
  metaPhoneId: string;
  aiSystemPrompt?: string | null;
  timezone: string;
  // Datos legales
  ruc?: string | null;
  razonSocial?: string | null;
  // Contacto
  telefono?: string | null;
  direccion?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  // Branding
  logoKey?: string | null;
  createdAt: string;
  updatedAt: string;
  redesSociales: RedSocial[];
}

export interface CreateBarberiaPayload {
  slug: string;
  nombre: string;
  metaPhoneId: string;
  metaAccessToken: string;
  metaAppSecret: string;
  aiSystemPrompt?: string;
  timezone?: string;
  ruc?: string;
  razonSocial?: string;
  telefono?: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
  logoKey?: string;
  redesSociales?: { plataforma: PlataformaRed; url: string }[];
}

export type UpdateBarberiaPayload = Partial<CreateBarberiaPayload>;

// ─────────────────────────────────────────────────────────────────────────────
// SERVICIO
// ─────────────────────────────────────────────────────────────────────────────

export interface ServicioImagen {
  id: number;
  key: string;
  orden: number;
  servicioId: number;
}

export interface Servicio {
  id: number;
  nombre: string;
  precio: string; // Decimal viene como string desde Prisma
  duracionMinutos: number;
  barberiaId: number;
  imagenes: ServicioImagen[];
}

export interface CreateServicioPayload {
  nombre: string;
  precio: number;
  duracionMinutos: number;
  imagenes?: { key: string; orden?: number }[];
}

export type UpdateServicioPayload = Partial<CreateServicioPayload>;

// ─────────────────────────────────────────────────────────────────────────────
// STAFF
// ─────────────────────────────────────────────────────────────────────────────

export interface StaffProfile {
  bio?: string | null;
  especialidad?: string | null;
  avatarKey?: string | null;
  activo: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  staffProfile: StaffProfile | null;
}

export interface StaffDisponibilidad {
  id: number;
  /** 0 = domingo … 6 = sábado */
  diaSemana: number;
  horaInicio: string; // "HH:mm"
  horaFin: string;    // "HH:mm"
  activo: boolean;
  userId: string;
  barberiaId: number;
}

export interface CreateDisponibilidadPayload {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  activo?: boolean;
}

export interface StaffInvitation {
  id: number;
  email: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: string;
  createdAt: string;
  acceptedBy?: { id: string; name: string; email: string } | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CITA
// ─────────────────────────────────────────────────────────────────────────────

export interface Cita {
  id: number;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  estado: EstadoCita;
  notas?: string | null;
  barberiaId: number;
  clienteId: number;
  servicioId: number;
  staffId?: string | null;
  cliente: { id: number; telefono: string; nombre?: string | null };
  servicio: { id: number; nombre: string; precio: string; duracionMinutos: number };
  staff?: { id: string; name: string } | null;
}

export interface CreateCitaPayload {
  clienteId: number;
  servicioId: number;
  fechaHoraInicio: string; // ISO 8601
  fechaHoraFin: string;
  staffId?: string;
  notas?: string;
}

export interface UpdateCitaPayload {
  estado?: EstadoCita;
  fechaHoraInicio?: string;
  fechaHoraFin?: string;
  servicioId?: number;
  staffId?: string | null;
  notas?: string;
}

/** Error tipado devuelto cuando se envía staffId */
export interface CitaValidationError {
  error: string;
  code: "FUERA_DE_HORARIO" | "HORARIO_OCUPADO";
}

// ─────────────────────────────────────────────────────────────────────────────
// MICROSITIO
// ─────────────────────────────────────────────────────────────────────────────

export interface MicrositioPortada {
  id: number;
  key: string;
  tipo: TipoPortada;
  orden: number;
  altText?: string | null;
}

export interface MicrositioPublicacion {
  id: number;
  tipo: TipoPublicacion;
  url: string;
  titulo?: string | null;
  orden: number;
}

export interface MicrositioGaleria {
  id: number;
  key: string;
  orden: number;
  altText?: string | null;
}

export interface MicrositioFAQ {
  id: number;
  pregunta: string;
  respuesta: string;
  orden: number;
}

export interface MicrositioTestimonio {
  id: number;
  nombreCliente: string;
  texto: string;
  rating: number;
  fecha: string;
}

export interface Micrositio {
  id: number;
  barberiaId: number;
  plantilla: PlantillaMicrositio;
  publicado: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  colorPrimario?: string | null;
  colorSecundario?: string | null;
  fuente?: string | null;
  portadas: MicrositioPortada[];
  publicaciones: MicrositioPublicacion[];
  galeria: MicrositioGaleria[];
  faqs: MicrositioFAQ[];
  testimonios: MicrositioTestimonio[];
}

export interface UpdateMicrositioPayload {
  plantilla?: PlantillaMicrositio;
  publicado?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  fuente?: string;
}

export interface CreatePortadaPayload {
  key: string;
  tipo?: TipoPortada;
  orden?: number;
  altText?: string;
}

export interface CreatePublicacionPayload {
  tipo: TipoPublicacion;
  url: string;
  titulo?: string;
  orden?: number;
}

export interface CreateGaleriaPayload {
  key: string;
  orden?: number;
  altText?: string;
}

export interface CreateFaqPayload {
  pregunta: string;
  respuesta: string;
  orden?: number;
}

export interface CreateTestimonioPayload {
  nombreCliente: string;
  texto: string;
  rating: number;
  fecha?: string;
}
