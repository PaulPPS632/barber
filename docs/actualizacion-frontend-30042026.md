# Actualización Frontend – Panel Administrativo
**Fecha**: 30/04/2026  
**Scope**: Nuevas features del backend que deben reflejarse en el panel admin.

---

## Índice

1. [Modelos y tipos TypeScript](#1-modelos-y-tipos-typescript)
2. [Barbería – campos nuevos](#2-barbería--campos-nuevos)
3. [Servicios – imágenes](#3-servicios--imágenes)
4. [Citas – barbero asignado y notas](#4-citas--barbero-asignado-y-notas)
5. [Staff – perfil y disponibilidad](#5-staff--perfil-y-disponibilidad)
6. [Micrositio](#6-micrositio)

---

## 1. Modelos y tipos TypeScript

Pegar en un archivo compartido de tipos, ej. `types/api.ts`.

```typescript
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
```

---

## 2. Barbería – campos nuevos

### Qué cambió
El formulario de crear/editar barbería ahora soporta:
- **Datos legales**: `ruc`, `razonSocial`
- **Contacto y ubicación**: `telefono`, `direccion`, `latitud`, `longitud`
- **Branding**: `logoKey` (se sube al bucket y se guarda solo el key)
- **Redes sociales**: array `redesSociales[]` — en PUT **reemplaza por completo**

### Endpoints

```
GET    /barberias                  → Barberia[]   (incluye redesSociales)
GET    /barberias/:id              → Barberia     (incluye redesSociales)
POST   /barberias                  → Barberia     (crea barbería + micrositio automáticamente)
PUT    /barberias/:id              → { ok: true }
DELETE /barberias/:id              → { ok: true }
GET    /barberias/public/:id       → vista reducida pública (sin tokens Meta)
```

### Notas de implementación

- Al crear una barbería, el backend ya crea el `Micrositio` con configuración mínima. No hay que hacer nada extra en el frontend.
- Para el **logo**: subir el archivo al bucket, obtener el `key` resultante y enviarlo en el campo `logoKey`. El componente `<Image>` del frontend construye la URL completa: `${CDN_BASE_URL}/${logoKey}`.
- Para **redes sociales**: manejar como un array editable en el formulario. Al hacer PUT, enviar el array completo (no solo los cambios).
- Para **coordenadas GPS**: se puede integrar un mapa (ej. Mapbox / Google Maps) donde el usuario hace click y se capturan `latitud` y `longitud` automáticamente, o permitir ingreso manual.

### Ejemplo fetch

```typescript
// Crear barbería
const res = await fetch("/barberias", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    slug: "barberia-perez",
    nombre: "Barbería Pérez",
    metaPhoneId: "...",
    metaAccessToken: "...",
    metaAppSecret: "...",
    ruc: "20123456789",
    razonSocial: "Barbería Pérez S.A.C.",
    telefono: "51987654321",
    direccion: "Av. Larco 123, Miraflores",
    latitud: -12.1191479,
    longitud: -77.0301895,
    logoKey: "barberias/perez-logo.webp",
    redesSociales: [
      { plataforma: "instagram", url: "https://instagram.com/barberiaperez" },
      { plataforma: "tiktok", url: "https://tiktok.com/@barberiaperez" },
    ],
  } satisfies CreateBarberiaPayload),
});
const barberia: Barberia = await res.json();
```

---

## 3. Servicios – imágenes

### Qué cambió
Cada servicio puede tener **una o más imágenes** (`imagenes[]`). El campo `key` referencia la ubicación en el bucket; el dominio base del CDN se construye en el frontend.

### Endpoints

```
GET    /barberias/:barberiaId/servicios          → Servicio[]  (incluye imagenes[])
GET    /barberias/:barberiaId/servicios/:id      → Servicio    (incluye imagenes[])
POST   /barberias/:barberiaId/servicios          → Servicio
PUT    /barberias/:barberiaId/servicios/:id      → { ok: true }
DELETE /barberias/:barberiaId/servicios/:id      → { ok: true }
```

> ⚠️ Si en el PUT se envía `imagenes`, el backend **reemplaza por completo** la lista. Si no se envía el campo, las imágenes existentes se conservan.

### Notas de implementación

- Para subir imágenes: subir cada archivo al bucket, obtener su `key`, armar el array `[{ key, orden }]` y enviarlo junto al payload del servicio.
- El orden se usa para mostrar la imagen principal (orden `0`) primero.

### Ejemplo fetch

```typescript
// Crear servicio con imágenes
const res = await fetch(`/barberias/${barberiaId}/servicios`, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nombre: "Corte Mullet",
    precio: 35,
    duracionMinutos: 45,
    imagenes: [
      { key: "servicios/mullet-1.webp", orden: 0 },
      { key: "servicios/mullet-2.webp", orden: 1 },
    ],
  } satisfies CreateServicioPayload),
});
```

---

## 4. Citas – barbero asignado y notas

### Qué cambió
- **`staffId`** (opcional): ID del `User` con rol `staff`. Si se envía, el backend valida disponibilidad y solapamiento. El frontend debe manejar los errores `FUERA_DE_HORARIO` y `HORARIO_OCUPADO`.
- **`notas`** (opcional): texto libre para observaciones como "corte mullet".
- El listado acepta query param `?staffId=` para filtrar la agenda de un barbero.

### Endpoints

```
GET    /barberias/:barberiaId/citas                        → Cita[]
GET    /barberias/:barberiaId/citas?estado=pendiente       → Cita[]  (filtrado)
GET    /barberias/:barberiaId/citas?staffId=<userId>       → Cita[]  (agenda de un barbero)
GET    /barberias/:barberiaId/citas/:id                    → Cita
POST   /barberias/:barberiaId/citas                        → Cita    | CitaValidationError (422)
PUT    /barberias/:barberiaId/citas/:id                    → { ok: true } | CitaValidationError (422)
DELETE /barberias/:barberiaId/citas/:id                    → { ok: true }
```

### Errores de validación (HTTP 422)

```typescript
// Cuando se envía staffId y falla la validación:
// { error: "El barbero no tiene disponibilidad...", code: "FUERA_DE_HORARIO" }
// { error: "El barbero ya tiene una cita...",       code: "HORARIO_OCUPADO"  }

async function crearCita(payload: CreateCitaPayload): Promise<Cita> {
  const res = await fetch(`/barberias/${barberiaId}/citas`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.status === 422) {
    const err: CitaValidationError = await res.json();
    if (err.code === "FUERA_DE_HORARIO") {
      throw new Error("El barbero no trabaja en ese horario.");
    }
    if (err.code === "HORARIO_OCUPADO") {
      throw new Error("El barbero ya tiene una cita en ese horario.");
    }
  }

  if (!res.ok) throw new Error("Error al crear la cita.");
  return res.json();
}
```

### Notas de implementación

- En el formulario de nueva cita, agregar un `<select>` de barbero (opcional) que cargue los miembros del staff con `staffProfile.activo === true`.
- Al seleccionar un barbero, opcionalmente mostrar su disponibilidad semanal (`StaffDisponibilidad`) para guiar al usuario en la selección de horario.
- Agregar campo `notas` como `<textarea>` opcional.

---

## 5. Staff – perfil y disponibilidad

### Qué cambió
- El listado de staff ahora incluye `staffProfile` con `bio`, `especialidad`, `avatarKey` y `activo`.
- Nueva tabla `StaffDisponibilidad` para manejar los bloques horarios semanales de cada barbero.

### Endpoints (existentes actualizados)

```
GET    /barberias/:barberiaId/staff                        → StaffMember[]  (incluye staffProfile)
POST   /barberias/:barberiaId/staff/invite                 → { ok: true, message: string }
GET    /barberias/:barberiaId/staff/invitations            → StaffInvitation[]
DELETE /barberias/:barberiaId/staff/invitations/:id        → { ok: true }
```

### Endpoints de disponibilidad

✅ Endpoints implementados. Todos requieren `auth` + rol `admin`.

```
GET    /barberias/:barberiaId/staff/:staffId/disponibilidad     → StaffDisponibilidad[]
POST   /barberias/:barberiaId/staff/:staffId/disponibilidad     → StaffDisponibilidad
PUT    /barberias/:barberiaId/staff/:staffId/disponibilidad/:id → StaffDisponibilidad
DELETE /barberias/:barberiaId/staff/:staffId/disponibilidad/:id → { ok: true }
```

### Ejemplo fetch – disponibilidad

```typescript
// Listar bloques
const res = await fetch(`/barberias/${barberiaId}/staff/${staffId}/disponibilidad`, {
  credentials: "include",
});
const bloques: StaffDisponibilidad[] = await res.json();

// Crear bloque (lunes 09:00–18:00)
await fetch(`/barberias/${barberiaId}/staff/${staffId}/disponibilidad`, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ diaSemana: 1, horaInicio: "09:00", horaFin: "18:00", activo: true }),
});

// Actualizar
await fetch(`/barberias/${barberiaId}/staff/${staffId}/disponibilidad/${bloqueId}`, {
  method: "PUT",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ horaFin: "17:00" }),
});

// Eliminar
await fetch(`/barberias/${barberiaId}/staff/${staffId}/disponibilidad/${bloqueId}`, {
  method: "DELETE",
  credentials: "include",
});
```

### Notas de implementación

- En la vista de perfil de un barbero, agregar formulario para editar `bio`, `especialidad` y subir foto de perfil (`avatarKey`).
- La disponibilidad semanal se puede presentar como una grilla de días (lunes–domingo) con bloques de horario editables por día.
- `diaSemana` usa la convención JavaScript: `0` = domingo, `1` = lunes, …, `6` = sábado. Se recomienda mapear a nombres al mostrar.

```typescript
const DIAS: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};
```

### Ejemplo fetch – listar staff con perfil

```typescript
const res = await fetch(`/barberias/${barberiaId}/staff`, {
  credentials: "include",
});
const staff: StaffMember[] = await res.json();

// Filtrar solo barberos activos para el selector de citas
const activos = staff.filter(s => s.staffProfile?.activo !== false);
```

---

## 6. Micrositio

### Qué cambió
Cada barbería tiene un **micrositio** (mini landing pública). Se crea automáticamente al registrar la barbería con `publicado: false`. El admin lo configura y publica desde el panel.

### Endpoints

```
// ── Panel admin (requiere auth) ──────────────────────────────────────────────
GET    /barberias/:barberiaId/micrositio                         → Micrositio
PUT    /barberias/:barberiaId/micrositio                         → Micrositio

// Portadas
POST   /barberias/:barberiaId/micrositio/portadas                → MicrositioPortada
PUT    /barberias/:barberiaId/micrositio/portadas/:portadaId     → MicrositioPortada
DELETE /barberias/:barberiaId/micrositio/portadas/:portadaId     → 204

// Publicaciones (embeds TikTok / YouTube)
POST   /barberias/:barberiaId/micrositio/publicaciones           → MicrositioPublicacion
PUT    /barberias/:barberiaId/micrositio/publicaciones/:pubId    → MicrositioPublicacion
DELETE /barberias/:barberiaId/micrositio/publicaciones/:pubId    → 204

// Galería de fotos
POST   /barberias/:barberiaId/micrositio/galeria                 → MicrositioGaleria
PUT    /barberias/:barberiaId/micrositio/galeria/:galeriaId      → MicrositioGaleria
DELETE /barberias/:barberiaId/micrositio/galeria/:galeriaId      → 204

// FAQs
POST   /barberias/:barberiaId/micrositio/faqs                    → MicrositioFAQ
PUT    /barberias/:barberiaId/micrositio/faqs/:faqId             → MicrositioFAQ
DELETE /barberias/:barberiaId/micrositio/faqs/:faqId             → 204

// Testimonios
POST   /barberias/:barberiaId/micrositio/testimonios             → MicrositioTestimonio
PUT    /barberias/:barberiaId/micrositio/testimonios/:testId     → MicrositioTestimonio
DELETE /barberias/:barberiaId/micrositio/testimonios/:testId     → 204

// ── Vista pública (sin auth) ─────────────────────────────────────────────────
GET    /barberias/:barberiaId/micrositio/public                  → Micrositio + barberia | 404
```

### Notas de implementación

#### Sección de configuración general
Formulario con:
- `plantilla`: selector visual con preview (opciones: `CLASICO`, `MODERNO`, `MINIMAL`)
- `publicado`: toggle switch — cuando se activa, el micrositio es visible en `/barberias/:id/micrositio/public`
- `colorPrimario` / `colorSecundario`: color pickers (hex)
- `fuente`: input o selector de Google Fonts
- `seoTitle` / `seoDescription`: campos de texto para SEO

#### Portadas
- Subir imágenes al bucket → guardar `key`
- `tipo`: `HERO` (imagen principal a pantalla completa) o `BANNER` (banner secundario)
- `orden`: controlar con drag & drop o flechas

#### Publicaciones embebidas
- El usuario pega la URL de un TikTok o YouTube
- El frontend detecta automáticamente el `tipo` según el dominio:

```typescript
function detectTipo(url: string): TipoPublicacion {
  if (url.includes("tiktok.com")) return "TIKTOK";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "YOUTUBE";
  throw new Error("URL no soportada");
}
```

- Para embeber:
  - **YouTube**: usar `https://www.youtube.com/embed/<videoId>` en un `<iframe>`
  - **TikTok**: usar el script de embed oficial de TikTok con el `data-video-id`

#### Galería
- Grid de imágenes subidas al bucket
- `orden` editable con drag & drop

#### FAQs
- Lista de preguntas/respuestas editables inline o en modal
- `orden` editable para controlar el orden de aparición

#### Testimonios
- Formulario: `nombreCliente`, `texto`, `rating` (1–5 estrellas), `fecha`
- Se muestran ordenados por fecha descendente

### Ejemplo fetch – publicar micrositio

```typescript
const res = await fetch(`/barberias/${barberiaId}/micrositio`, {
  method: "PUT",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    publicado: true,
    seoTitle: "Barbería Pérez – Cortes modernos en Miraflores",
    seoDescription: "Especialistas en degradados, fades y cortes clásicos.",
    colorPrimario: "#1A1A2E",
    colorSecundario: "#E94560",
    fuente: "Inter",
    plantilla: "MODERNO",
  } satisfies UpdateMicrositioPayload),
});
const micrositio: Micrositio = await res.json();
```

### Ejemplo fetch – agregar video de TikTok

```typescript
const res = await fetch(`/barberias/${barberiaId}/micrositio/publicaciones`, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    tipo: "TIKTOK",
    url: "https://www.tiktok.com/@barberiaperez/video/7123456789",
    titulo: "Corte fade con diseño",
    orden: 0,
  } satisfies CreatePublicacionPayload),
});
```

### Vista pública `/micrositio/public`
La respuesta incluye además de `Micrositio` los datos de la barbería:

```typescript
interface MicrositioPublico extends Micrositio {
  barberia: {
    nombre: string;
    slug: string;
    logoKey: string | null;
    direccion: string | null;
    telefono: string | null;
    latitud: number | null;
    longitud: number | null;
    redesSociales: RedSocial[];
    servicios: (Servicio & { imagenes: ServicioImagen[] })[];
  };
}
```

---

## Resumen de cambios por sección del panel

| Sección | Cambios requeridos |
|---|---|
| **Formulario Barbería** | Agregar campos legales, ubicación, logo y redes sociales |
| **Formulario Servicio** | Agregar uploader de imágenes con ordenamiento |
| **Formulario Cita** | Agregar selector de barbero, campo notas, manejo de errores 422 |
| **Vista de Citas / Agenda** | Filtro por `staffId`, mostrar barbero asignado y notas en tarjeta |
| **Perfil de Staff** | Mostrar/editar `StaffProfile` (bio, especialidad, avatarKey) |
| **Disponibilidad de Staff** | Grilla semanal por barbero (pendiente implementación backend) |
| **Micrositio** | Sección nueva completa: config, portadas, publicaciones, galería, FAQs, testimonios |
