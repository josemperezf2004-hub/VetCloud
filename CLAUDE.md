# VetCloud SaaS — Plan Maestro para Claude Code

> **Instrucciones para Claude Code:** Lee este documento completo antes de escribir cualquier línea de código. Sigue los pasos en orden estricto. Cada fase debe estar 100% funcional antes de pasar a la siguiente. Cuando termines una fase, muestra un resumen de lo que construiste y espera confirmación.
>
> Este documento es la versión 2 del plan original (`docs/plan-original.md` si se conserva copia). Se corrigió un bug en el schema Prisma y se incorporaron hallazgos de dos investigaciones adicionales guardadas en `docs/`: una sobre stack 100% gratuito (`referencia-free-tier.txt`) y una arquitectura de nivel empresarial (`arquitectura-2026-extracto.txt`). Las ideas de la segunda que **no** son compatibles con "gratis + un solo desarrollador" se movieron a la sección "Roadmap Post-MVP" al final — no se implementan ahora.

---

## 🎯 Qué estamos construyendo

Una plataforma SaaS web para gestión de clínicas veterinarias en Latinoamérica llamada **VetCloud**. Accesible desde cualquier navegador, sin instalar nada. El sistema debe ser visualmente profesional, rápido, intuitivo y funcionar en desktop y mobile.

**Stack tecnológico (100% gratuito):**
- Frontend: Next.js (última versión estable — instalada: 16.2.10, React 19) + TypeScript + Tailwind CSS v4 + shadcn/ui
- Backend: Next.js API Routes (misma app, sin servidor separado)
- Base de datos: PostgreSQL en Supabase (plan gratuito)
- ORM: Prisma
- Autenticación: NextAuth.js v4 (`next-auth@^4` + `@next-auth/prisma-adapter@^1` — **no** `@auth/prisma-adapter`, ese es exclusivo de next-auth v5/Auth.js, que en este momento sigue en tag `beta` del registro npm; v4 es la versión `latest` estable)
- Despliegue: Vercel (plan gratuito)
- WhatsApp: Twilio sandbox (gratuito para pruebas — **ver limitación importante abajo**)
- Email: Resend (plan gratuito 3,000 emails/mes)
- Storage: Supabase Storage (plan gratuito 1GB)

### ⚠️ Decisiones de stack corregidas / justificadas

Tras revisar `docs/referencia-free-tier.txt` y `docs/arquitectura-2026-extracto.txt`, se confirman o ajustan las siguientes decisiones:

| Decisión | Alternativa evaluada | Por qué se mantiene la elección original |
|---|---|---|
| **Supabase** para DB+Storage | Neon.tech (solo Postgres serverless) | Supabase incluye Auth, Storage y Postgres en un solo panel gratuito; Neon es más generoso en cómputo pero obliga a resolver storage/auth aparte. Para un solo dev, menos piezas = menos fricción. |
| **NextAuth.js** para auth | Clerk (10,000 MAU gratis, UI lista) | Clerk es más rápido de implementar, pero cobra pasado el límite de usuarios activos. NextAuth es gratis sin límite de usuarios para siempre y ya está contemplado en el schema (`Usuario.password`). Para un SaaS que planea crecer a miles de clínicas, evita una futura migración forzada. |
| **Next.js API Routes** (monolito) | NestJS backend separado (doc de arquitectura 2026) | NestJS + microservicios + Kubernetes es la arquitectura para la fase *Enterprise* con equipo e inversión (ver Roadmap Post-MVP). Para un MVP gratuito construido por una persona, un monolito Next.js es más simple de desplegar (un solo proyecto en Vercel) y sigue soportando miles de tenants con `clinicaId` como filtro. |
| **Un solo schema Postgres con columna `clinicaId`** | Schema-per-tenant (doc de arquitectura 2026) | Schema-per-tenant requiere crear/migrar un schema de Postgres por cada clínica nueva — inviable de automatizar gratis y sin DevOps dedicado. La alternativa estándar para SaaS pequeños/medianos es **una tabla compartida + `clinicaId` en cada fila + Row Level Security (RLS) de Postgres** activado en Supabase como capa extra de aislamiento. Se agrega como tarea explícita en Fase 1. |
| **Twilio WhatsApp Sandbox** para desarrollo | Meta Cloud API oficial (~$0.005/msg) | El sandbox de Twilio es gratis pero **cada número de propietario debe "unirse" manualmente enviando un código al sandbox antes de poder recibir mensajes** — no sirve para clientes reales en producción, solo para desarrollo/demo. Se documenta como limitación conocida en Fase 6 y se deja preparado el patrón *adapter* para cambiar a Meta Cloud API (o Twilio con número de producción) sin reescribir lógica de negocio. |

---

## 🎨 Sistema de Diseño

### Paleta de colores
```
--primary:     #0F6E56   (verde teal oscuro — brand principal)
--primary-light: #1D9E75 (verde teal medio — hover/accent)
--primary-bg:  #E1F5EE   (verde teal claro — fondos)
--accent:      #F4A100   (ámbar — alertas positivas, badges)
--accent-bg:   #FFF3CC   (ámbar claro — fondos de alertas)
--danger:      #DC2626   (rojo — errores, stock crítico)
--warning:     #D97706   (naranja — advertencias)
--success:     #16A34A   (verde — confirmaciones)
--gray-50:     #F9FAFB
--gray-100:    #F3F4F6
--gray-200:    #E5E7EB
--gray-500:    #6B7280
--gray-700:    #374151
--gray-900:    #111827
```

### Tipografía
- Display/Headings: `Inter` peso 600-700
- Body: `Inter` peso 400-500
- Datos/números: `JetBrains Mono` (para cifras en dashboard)
- Tamaños: xs=12px, sm=14px, base=16px, lg=18px, xl=20px, 2xl=24px, 3xl=30px

### Componentes visuales clave
- Cards con `rounded-xl shadow-sm border border-gray-100`
- Sidebar izquierdo fijo de 240px con fondo `#0F6E56`
- Header top de 64px con breadcrumb y acciones
- Tablas con filas alternas `bg-white / bg-gray-50`
- Botones primarios: `bg-[#0F6E56] hover:bg-[#1D9E75] text-white rounded-lg`
- Badges de estado con colores semánticos
- Animaciones suaves: `transition-all duration-200`

### Principios UX
- Máximo 3 clics para cualquier acción frecuente
- Feedback visual inmediato en todas las acciones (toast notifications)
- Estados vacíos con ilustración SVG y call-to-action claro
- Skeleton loaders mientras cargan los datos
- Responsive: funciona perfecto en tablet (1024px) y desktop (1280px+)

---

## 📁 Estructura del Proyecto

```
vetcloud/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          ← Sidebar + Header
│   │   ├── page.tsx            ← Dashboard principal
│   │   ├── clientes/
│   │   │   ├── page.tsx        ← Lista de propietarios
│   │   │   ├── nuevo/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── pacientes/
│   │   │   ├── page.tsx
│   │   │   ├── nuevo/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx    ← Perfil mascota
│   │   │       └── historia/page.tsx
│   │   ├── agenda/
│   │   │   └── page.tsx
│   │   ├── historia-clinica/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── inventario/
│   │   │   └── page.tsx
│   │   └── facturacion/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── clientes/route.ts
│   │   ├── clientes/[id]/route.ts
│   │   ├── pacientes/route.ts
│   │   ├── pacientes/[id]/route.ts
│   │   ├── citas/route.ts
│   │   ├── historia-clinica/route.ts
│   │   ├── inventario/route.ts
│   │   ├── facturas/route.ts
│   │   └── dashboard/stats/route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                     ← shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileNav.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── CitasHoy.tsx
│   │   ├── StockAlerts.tsx
│   │   └── VentasChart.tsx
│   ├── clientes/
│   │   ├── ClienteCard.tsx
│   │   ├── ClienteForm.tsx
│   │   └── ClienteSearch.tsx
│   ├── pacientes/
│   │   ├── PacienteCard.tsx
│   │   ├── PacienteForm.tsx
│   │   └── PacienteProfile.tsx
│   ├── agenda/
│   │   ├── CalendarioSemanal.tsx
│   │   ├── CitaCard.tsx
│   │   └── NuevaCitaModal.tsx
│   ├── historia-clinica/
│   │   ├── ConsultaForm.tsx
│   │   ├── SignosVitales.tsx
│   │   ├── TimelineClinico.tsx
│   │   └── PrescripcionForm.tsx
│   ├── inventario/
│   │   ├── ProductoTable.tsx
│   │   ├── StockBadge.tsx
│   │   └── MovimientoForm.tsx
│   └── shared/
│       ├── DataTable.tsx
│       ├── EmptyState.tsx
│       ├── LoadingSkeleton.tsx
│       ├── ConfirmDialog.tsx
│       └── Toast.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── validations.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── prisma.config.ts             ← Prisma 7: config del CLI (URL, ruta de migraciones), generado por `prisma init`
├── app/generated/prisma/        ← Prisma Client generado (gitignored, no editar a mano)
├── types/
│   └── index.ts
├── hooks/
│   ├── useClientes.ts
│   ├── usePacientes.ts
│   ├── useCitas.ts
│   └── useInventario.ts
└── middleware.ts
```

---

## 🗄️ Base de Datos — Schema Prisma Completo

> **Corrección aplicada:** el schema original tenía `@ignore` en la relación `clinica` del modelo `HistoriaClinica` (probablemente un typo/pegado accidental) — eso rompía la relación con la tabla `clinicas` en el Prisma Client generado. Se removió.
>
> **Mejoras aplicadas:**
> - Se agregó `deletedAt DateTime?` (soft delete) a `Cliente`, `Paciente`, `Usuario` y `Producto` — en un sistema de historia clínica no se debe borrar físicamente un registro médico o un cliente por error; se oculta pero se conserva (buena práctica tomada de `arquitectura-2026-extracto.txt`, sección 6.2).
> - Se agregaron índices compuestos en `clinicaId` + campos de consulta frecuente, para que las queries no se degraden cuando haya muchas clínicas compartiendo la misma tabla (necesario precisamente porque usamos schema compartido y no schema-per-tenant).
>
> **Ajuste por versión real instalada (Prisma 7.8.0, no la serie 5/6 que asumía el plan original):**
> - El generador ya no es `prisma-client-js` sino `prisma-client`, con `output = "../app/generated/prisma"` — el cliente se genera dentro del proyecto (`app/generated/prisma`, ya en `.gitignore`), no en `node_modules/@prisma/client`. **Corrección (Fase 1):** esa carpeta generada no trae `index.ts`, solo `client.ts` como entry point — el import correcto es `import { PrismaClient } from "@/app/generated/prisma/client"` (no `@/app/generated/prisma` a secas, eso falla la resolución de módulos de TypeScript).
> - Prisma 7 **eliminó** `url` y `directUrl` del bloque `datasource` del schema — la URL de conexión ahora se declara en `prisma.config.ts` (raíz del proyecto), leída de `DATABASE_URL`. Ver la sección de variables de entorno más abajo para el detalle de por qué se simplificó a una sola URL (sin `DIRECT_URL` separada) para el MVP.
- **Corrección (Fase 1) — el runtime SÍ requiere un Driver Adapter, no es opcional:** con el generador `prisma-client` (no `prisma-client-js`), el tipo `PrismaClientOptions` generado exige `adapter` (o `accelerateUrl`) — ya no existe el modo clásico "motor Rust embebido que lee `DATABASE_URL` solo". El ejemplo del JSDoc generado (`new PrismaClient({ adapter: new PrismaPg(...) })`) no es boilerplate decorativo, es obligatorio. Se instaló `@prisma/adapter-pg` + `pg`, y `lib/prisma.ts` construye el adapter con `new PrismaPg({ connectionString: process.env.DATABASE_URL })` antes de pasarlo al `PrismaClient`.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client"
  output   = "../app/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ─── CLÍNICA ──────────────────────────────────────────────────────────────────

model Clinica {
  id          String   @id @default(cuid())
  nombre      String
  email       String   @unique
  telefono    String?
  direccion   String?
  logoUrl     String?
  plan        Plan     @default(BASICO)
  activa      Boolean  @default(true)
  creadoEn    DateTime @default(now())

  usuarios    Usuario[]
  clientes    Cliente[]
  pacientes   Paciente[]
  citas       Cita[]
  productos   Producto[]
  facturas    Factura[]
  historias   HistoriaClinica[]

  @@map("clinicas")
}

// ─── USUARIOS Y ROLES ─────────────────────────────────────────────────────────

model Usuario {
  id          String    @id @default(cuid())
  clinicaId   String
  nombre      String
  email       String
  password    String
  rol         Rol       @default(RECEPCIONISTA)
  activo      Boolean   @default(true)
  avatarUrl   String?
  deletedAt   DateTime?
  creadoEn    DateTime  @default(now())

  clinica     Clinica   @relation(fields: [clinicaId], references: [id])
  citas       Cita[]
  consultas   HistoriaClinica[]

  @@unique([clinicaId, email])
  @@index([clinicaId])
  @@map("usuarios")
}

// ─── CLIENTES (PROPIETARIOS) ──────────────────────────────────────────────────

model Cliente {
  id            String    @id @default(cuid())
  clinicaId     String
  nombre        String
  apellido      String
  email         String?
  telefono      String
  whatsapp      String?
  cedula        String?
  direccion     String?
  notas         String?
  activo        Boolean   @default(true)
  deletedAt     DateTime?
  creadoEn      DateTime  @default(now())
  actualizadoEn DateTime  @updatedAt

  clinica       Clinica   @relation(fields: [clinicaId], references: [id])
  pacientes     Paciente[]
  facturas      Factura[]

  @@index([clinicaId, creadoEn])
  @@map("clientes")
}

// ─── PACIENTES (MASCOTAS) ─────────────────────────────────────────────────────

model Paciente {
  id              String    @id @default(cuid())
  clinicaId       String
  clienteId       String
  nombre          String
  especie         Especie
  raza            String?
  color           String?
  sexo            Sexo
  fechaNacimiento DateTime?
  peso            Float?
  chipId          String?
  fotoUrl         String?
  alergias        String?
  condiciones     String?
  esterilizado    Boolean   @default(false)
  fallecido       Boolean   @default(false)
  notas           String?
  deletedAt       DateTime?
  creadoEn        DateTime  @default(now())
  actualizadoEn   DateTime  @updatedAt

  clinica         Clinica   @relation(fields: [clinicaId], references: [id])
  cliente         Cliente   @relation(fields: [clienteId], references: [id])
  citas           Cita[]
  historias       HistoriaClinica[]
  vacunas         Vacuna[]

  @@index([clinicaId, creadoEn])
  @@index([clienteId])
  @@map("pacientes")
}

// ─── CITAS ────────────────────────────────────────────────────────────────────

model Cita {
  id                  String     @id @default(cuid())
  clinicaId           String
  pacienteId          String
  veterinarioId       String
  fechaHora           DateTime
  duracionMin         Int        @default(30)
  tipo                TipoCita   @default(CONSULTA)
  estado              EstadoCita @default(AGENDADA)
  motivo              String?
  notas               String?
  recordatorioEnviado Boolean    @default(false)
  creadoEn            DateTime   @default(now())

  clinica       Clinica     @relation(fields: [clinicaId], references: [id])
  paciente      Paciente    @relation(fields: [pacienteId], references: [id])
  veterinario   Usuario     @relation(fields: [veterinarioId], references: [id])
  historia      HistoriaClinica?

  @@index([clinicaId, fechaHora])
  @@index([pacienteId])
  @@map("citas")
}

// ─── HISTORIA CLÍNICA ─────────────────────────────────────────────────────────

model HistoriaClinica {
  id              String    @id @default(cuid())
  clinicaId       String
  pacienteId      String
  veterinarioId   String
  citaId          String?   @unique

  // Signos vitales
  peso                   Float?
  temperatura            Float?
  frecuenciaCardiaca     Int?
  frecuenciaRespiratoria Int?

  // SOAP
  motivoConsulta  String
  anamnesis       String?
  examenFisico    String?
  diagnostico     String
  plan            String?

  // Prescripciones (JSON array)
  prescripciones  Json?

  notas           String?
  creadoEn        DateTime  @default(now())

  clinica         Clinica   @relation(fields: [clinicaId], references: [id])
  paciente        Paciente  @relation(fields: [pacienteId], references: [id])
  veterinario     Usuario   @relation(fields: [veterinarioId], references: [id])
  cita            Cita?     @relation(fields: [citaId], references: [id])
  adjuntos        Adjunto[]

  @@index([clinicaId, creadoEn])
  @@index([pacienteId])
  @@map("historias_clinicas")
}

// ─── ADJUNTOS ─────────────────────────────────────────────────────────────────

model Adjunto {
  id          String   @id @default(cuid())
  historiaId  String
  nombre      String
  url         String
  tipo        String
  tamanioKb   Int?
  creadoEn    DateTime @default(now())

  historia    HistoriaClinica @relation(fields: [historiaId], references: [id])

  @@map("adjuntos")
}

// ─── VACUNAS ──────────────────────────────────────────────────────────────────

model Vacuna {
  id            String    @id @default(cuid())
  pacienteId    String
  nombre        String
  lote          String?
  fabricante    String?
  aplicadaEn    DateTime
  proximaDosis  DateTime?
  notas         String?
  creadoEn      DateTime  @default(now())

  paciente      Paciente  @relation(fields: [pacienteId], references: [id])

  @@index([pacienteId])
  @@index([proximaDosis])
  @@map("vacunas")
}

// ─── INVENTARIO ───────────────────────────────────────────────────────────────

model Producto {
  id            String            @id @default(cuid())
  clinicaId     String
  nombre        String
  sku           String?
  categoria     CategoriaProducto
  descripcion   String?
  unidad        String            @default("unidad")
  precioVenta   Float
  precioCosto   Float?
  stockActual   Float             @default(0)
  stockMinimo   Float             @default(5)
  activo        Boolean           @default(true)
  deletedAt     DateTime?
  creadoEn      DateTime          @default(now())
  actualizadoEn DateTime          @updatedAt

  clinica       Clinica     @relation(fields: [clinicaId], references: [id])
  movimientos   MovimientoInventario[]
  itemsFactura  ItemFactura[]

  @@index([clinicaId, categoria])
  @@map("productos")
}

model MovimientoInventario {
  id             String         @id @default(cuid())
  productoId     String
  tipo           TipoMovimiento
  cantidad       Float
  stockAntes     Float
  stockDespues   Float
  motivo         String?
  lote           String?
  vencimiento    DateTime?
  referenciaId   String?
  referenciaType String?
  creadoEn       DateTime       @default(now())

  producto    Producto      @relation(fields: [productoId], references: [id])

  @@index([productoId, creadoEn])
  @@index([vencimiento])
  @@map("movimientos_inventario")
}

// ─── FACTURACIÓN ──────────────────────────────────────────────────────────────

model Factura {
  id            String        @id @default(cuid())
  clinicaId     String
  clienteId     String
  numero        String
  estado        EstadoFactura @default(PENDIENTE)
  subtotal      Float
  descuento     Float         @default(0)
  total         Float
  metodoPago    MetodoPago?
  notas         String?
  emitidaEn     DateTime      @default(now())
  pagadaEn      DateTime?

  clinica       Clinica       @relation(fields: [clinicaId], references: [id])
  cliente       Cliente       @relation(fields: [clienteId], references: [id])
  items         ItemFactura[]

  @@index([clinicaId, emitidaEn])
  @@index([clienteId])
  @@map("facturas")
}

model ItemFactura {
  id          String    @id @default(cuid())
  facturaId   String
  productoId  String?
  descripcion String
  cantidad    Float
  precioUnit  Float
  subtotal    Float

  factura     Factura   @relation(fields: [facturaId], references: [id])
  producto    Producto? @relation(fields: [productoId], references: [id])

  @@map("items_factura")
}

// ─── ENUMS ────────────────────────────────────────────────────────────────────

enum Plan {
  BASICO
  PROFESIONAL
  EMPRESARIAL
}

enum Rol {
  ADMIN
  VETERINARIO
  RECEPCIONISTA
  INVENTARIO
  CONTADOR
}

enum Especie {
  PERRO
  GATO
  AVE
  CONEJO
  REPTIL
  PEZ
  ROEDOR
  OTRO
}

enum Sexo {
  MACHO
  HEMBRA
  DESCONOCIDO
}

enum TipoCita {
  CONSULTA
  VACUNA
  CIRUGIA
  CONTROL
  URGENCIA
  DESPARASITACION
  GROOMING
  OTRO
}

enum EstadoCita {
  AGENDADA
  CONFIRMADA
  EN_ESPERA
  EN_CONSULTA
  COMPLETADA
  CANCELADA
  NO_ASISTIO
}

enum CategoriaProducto {
  MEDICAMENTO
  VACUNA
  ALIMENTO
  ACCESORIO
  INSUMO
  SERVICIO
  OTRO
}

enum TipoMovimiento {
  ENTRADA
  SALIDA
  AJUSTE
  VENCIMIENTO
}

enum EstadoFactura {
  PENDIENTE
  PAGADA
  CANCELADA
  ANULADA
}

enum MetodoPago {
  EFECTIVO
  TARJETA
  TRANSFERENCIA
  QR
  OTRO
}
```

---

## 🚀 FASES DE DESARROLLO

---

### FASE 0 — Setup inicial del proyecto
**Objetivo:** Proyecto corriendo localmente con base de datos conectada.

**Estado: completado** (2026-07-19). Registro de lo que realmente se ejecutó, en orden:

1. Node.js no estaba instalado en la máquina → se instaló Node LTS v24.18.0 vía `winget install OpenJS.NodeJS.LTS`.
2. `create-next-app@latest` se ejecutó directo dentro de `C:\Users\HOME\Documents\vetcloud` (moviendo `CLAUDE.md`/`docs/` fuera temporalmente porque el instalador exige carpeta vacía, y devolviéndolos después), con TypeScript, Tailwind, ESLint, App Router, sin `src/`, alias `@/*`, npm, sin git todavía. Resultó **Next.js 16.2.10 + React 19.2.4** (última estable — ver nota de versión más arriba; el plan original decía "14" pero eso ya quedó obsoleto en 2026).
3. `npm install` de todo el stack. Dos correcciones sobre lo que decía el plan original:
   - **`@next-auth/prisma-adapter`, no `@auth/prisma-adapter`** — el segundo es para next-auth v5/Auth.js (que sigue en tag `beta` de npm), y npm instaló next-auth v4.24.14 (tag `latest`). Usar el adapter equivocado habría roto la Fase 1 más adelante.
   - npm de este entorno tiene gateo de scripts de instalación (`npm warn allow-scripts`) — se corrió `npm approve-scripts --all` para permitir los postinstall de `prisma`, `@prisma/engines`, `sharp` y `unrs-resolver` (todos paquetes oficiales del stack, seguros de aprobar).
4. `npx prisma init --datasource-provider postgresql` — instaló **Prisma 7.8.0**, versión mayor a la que asumía el plan original (serie 5/6). Esto trajo cambios reales de convención, ya reflejados en el bloque de schema de arriba y en las variables de entorno abajo: adiós `url`/`directUrl` en el schema, nuevo `prisma.config.ts` en la raíz, cliente generado en `app/generated/prisma`.
5. `prisma/schema.prisma` se sobrescribió con el modelo completo de VetCloud (sección de arriba) y se corrió `npx prisma format` + `npx prisma validate` (pasó) + `npx prisma generate` (generó el cliente en `app/generated/prisma`).

**Comandos de referencia (ya ejecutados, dejar documentado para reproducir en otra máquina):**

```bash
# 1. Next.js (ya hecho)
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --disable-git --yes

# 2. Dependencias del stack (ya hecho)
npm install @prisma/client prisma
npm install next-auth @next-auth/prisma-adapter
npm install @supabase/supabase-js
npm install react-hook-form @hookform/resolvers zod
npm install date-fns
npm install lucide-react
npm install sonner
npm install clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-avatar
npm install qrcode
npm install -D @types/qrcode
npm approve-scripts --all   # solo si npm bloquea postinstall scripts

# 3. Prisma (ya hecho)
npx prisma init --datasource-provider postgresql
# luego: pegar el schema de la sección de arriba en prisma/schema.prisma
npx prisma format && npx prisma validate && npx prisma generate

# 3.1 Driver Adapter (ya hecho, Fase 1 — ver nota de corrección arriba: obligatorio, no opcional)
npm install @prisma/adapter-pg pg
npm install -D @types/pg

# 3.2 Hashing de contraseñas para NextAuth Credentials (ya hecho, Fase 1)
npm install bcryptjs
npm install -D @types/bcryptjs
```

**Componente `form` de shadcn:** el CLI (`shadcn@4.13.1`, preset Nova) no trae un `form.tsx` funcional para este preset (el registry devuelve el item vacío, sin archivos). Se creó a mano en `components/ui/form.tsx` con la implementación estándar de shadcn (Controller de react-hook-form + contexto), adaptada a las convenciones de este proyecto (`import { Slot } from "radix-ui"`, `Label` de `@/components/ui/label`). Si en el futuro el registry lo arregla, no hace falta tocar nada — ya funciona igual.

**Pendiente para cerrar esta fase (bloqueado por credenciales, ver Fase 0.1 abajo):**

```bash
# 4. shadcn/ui (el paquete cambió de nombre: ya no es "shadcn-ui", es "shadcn")
npx shadcn@latest init

# 5. Agregar componentes shadcn necesarios
npx shadcn@latest add button card input label select dialog table badge avatar tabs dropdown-menu form textarea skeleton sonner
```

> Nota: el componente `toast` de shadcn/ui fue reemplazado por `sonner` en versiones recientes (ya instalamos la librería `sonner` en el paso 2) — se usa `npx shadcn@latest add sonner` en vez de `add toast`.

### FASE 0.1 — Crear proyecto Supabase y conectar la base de datos

Pendiente de que el usuario cree la cuenta/proyecto en [supabase.com](https://supabase.com) (plan gratuito) y comparta las credenciales de **Connection Info**:
- Cadena de conexión Postgres directa (puerto 5432) → `DATABASE_URL`
- URL del proyecto (`https://xxxx.supabase.co`) → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

Con eso: completar `.env` (ya tiene placeholders y comentarios lo suficientemente explicados) → `npx prisma migrate dev --name init` → confirmar que las tablas aparecen en el dashboard de Supabase.

**Estado: completado** (2026-07-19). Credenciales reales cargadas en `.env`. Se generó también un `NEXTAUTH_SECRET` aleatorio real (no el placeholder) con `RandomNumberGenerator` de .NET.

**Hallazgo importante de red — puede repetirse en cualquier sesión de desarrollo futura:**
- El host de conexión **directa** de Supabase (`db.<ref>.supabase.co:5432`) solo tiene registro DNS **IPv6**. Si la red desde la que se desarrolla no tiene salida IPv6 (muy común en redes residenciales), esa URL nunca va a conectar (error `P1001` de Prisma) — no es un problema de credenciales.
- La solución fue usar la URL del **Session Pooler** de Supabase (`aws-0-<region>.pooler.supabase.com:5432`, usuario `postgres.<project-ref>`), que sí tiene IPv4. Es la URL que quedó como `DATABASE_URL` en `.env`.
- Aun con el pooler, en la red de casa del usuario los puertos 5432 **y** 6543 estaban bloqueados de salida (confirmado: puerto 443 al mismo host sí conectaba, 5432/6543 no; Windows Firewall no tenía reglas de bloqueo, así que es el router/ISP). Se confirmó conectando a un hotspot del celular, donde ambos puertos sí respondieron — ahí se corrió la migración con éxito.
- **Implicación práctica:** si en una sesión futura `prisma migrate dev`, `prisma db push` o `prisma studio` fallan con `P1001` otra vez, probar primero si es el mismo bloqueo de red (cambiar a hotspot o revisar el router) antes de sospechar de las credenciales o del schema. Esto **no** afecta al desplegado en Vercel — la infraestructura de Vercel no tiene este problema de puertos.

`npx prisma migrate dev --name init` corrió exitosamente contra el Session Pooler: se creó `prisma/migrations/20260719185304_init/migration.sql`, todas las tablas quedaron creadas en Supabase, y `npx prisma migrate status` confirma "Database schema is up to date!". `npx prisma generate` y `npx tsc --noEmit` sin errores.

**Variables de entorno (`.env`, en la raíz — no `.env.local`):**

> Ajuste sobre el plan original: Prisma 7 lee variables vía `prisma.config.ts`, que hace `import "dotenv/config"` — eso carga `.env` por default, no `.env.local`. Next.js también carga `.env` automáticamente (además de `.env.local` si existiera). Para no mantener el mismo valor duplicado en dos archivos, usamos un único `.env` para todo (CLI de Prisma + runtime de Next.js). Ya está creado con placeholders lo único que falta es reemplazarlos con las credenciales reales de Supabase.
>
> También se simplificó a **una sola URL** (`DATABASE_URL`, conexión directa puerto 5432) en vez de `DATABASE_URL` + `DIRECT_URL`: Prisma 7 eliminó el soporte de `directUrl`. Para el tráfico de un MVP esto es suficiente; si en Fase 9 (deploy a Vercel) el pooler de Supabase (pgbouncer, puerto 6543) se vuelve necesario por el modelo serverless, se agrega pasando `datasourceUrl` explícito al construir `PrismaClient` en `lib/prisma.ts`, sin volver a tocar el schema ni las migraciones.

```env
DATABASE_URL="postgresql://[usuario]:[password]@[host]:[port]/[database]?schema=public"
NEXTAUTH_SECRET="genera-un-string-aleatorio-largo-aqui"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="tu-url-de-supabase"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key-de-supabase"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"
```

**Al terminar esta fase:**
- `npm run dev` levanta sin errores en http://localhost:3000
- Prisma conectado a Supabase
- `npx prisma migrate dev --name init` ejecutado exitosamente
- shadcn/ui instalado y funcionando

---

### FASE 1 — Autenticación, Layout Principal y Aislamiento Multi-tenant
**Objetivo:** Login funcional, sesión persistente, sidebar con navegación, y datos de cada clínica aislados de las demás.

**Estado: completado** (2026-08-04). Verificado end-to-end contra la base real de Supabase: `POST /api/auth/register` crea `Clinica` + `Usuario(ADMIN)` en una transacción (201), login por credenciales emite `session-token` con `clinicaId`/`rol` en el JWT, `GET /` sin sesión redirige 307 a `/login?callbackUrl=%2F`, y con sesión válida renderiza el dashboard con sidebar, saludo y nombre de la clínica. `npx tsc --noEmit` limpio. Se creó una clínica de prueba (`Clinica Test E2E` / `admin-e2e@vetcloud.dev`) en la base real durante la verificación — queda ahí, es inofensiva, bórrala si molesta.

Durante esta fase se encontraron y corrigieron tres desajustes reales entre el plan y lo que el stack instalado (Next.js 16.2.10, Prisma 7.8.0) realmente exige — quedan documentados inline abajo en los pasos correspondientes: import del cliente Prisma generado, Driver Adapter obligatorio, y el renombre `middleware.ts` → `proxy.ts`.

**Construir en este orden:**

1. **`lib/prisma.ts`** — Singleton de Prisma Client (importar `PrismaClient` desde `@/app/generated/prisma`, no desde `@prisma/client` — recordar el cambio de Prisma 7 documentado en la sección de schema)
2. **`lib/auth.ts`** — Configuración NextAuth (v4) con `@next-auth/prisma-adapter` y credenciales (el JWT/sesión debe incluir `clinicaId` del usuario logueado — es la pieza clave del aislamiento multi-tenant)
3. **`app/api/auth/[...nextauth]/route.ts`** — Handler de NextAuth
4. **`proxy.ts`** — Proteger rutas del dashboard. **Corrección (Fase 1):** el plan original decía `middleware.ts`, pero Next.js 16 renombró esa convención a `proxy.ts` (export `proxy`, no `middleware`). Además, el helper `next-auth/middleware` no interopera bien con la nueva convención bajo Turbopack — se implementó manualmente con `getToken` de `next-auth/jwt`.
5. **Aislamiento multi-tenant — decisión corregida (2026-08-03):** el plan original de esta fase asumía Row Level Security de Postgres vía Supabase (políticas basadas en `auth.jwt()`), pero eso solo se aplica a queries que pasan por PostgREST/Supabase Auth. Esta app usa Prisma con una conexión directa a Postgres (el connection string del pooler de la Fase 0.1), que corre como un rol que **bypassea RLS por defecto** — cualquier política escrita ahí quedaría inerte, dando una falsa sensación de seguridad. Se decidió (con el usuario) **no** implementar RLS a nivel de Postgres por ahora, y confiar únicamente en el filtro `clinicaId` aplicado en **cada** API route (usando `session.user.clinicaId` del JWT de NextAuth). La alternativa correcta — rol Postgres restringido + `SET LOCAL app.clinica_id` envuelto en cada transacción de Prisma + políticas contra `current_setting()` — queda documentada como mejora futura si se necesita defensa en profundidad real (ver Roadmap Post-MVP). Mientras tanto, **todo** query Prisma que toque una tabla con `clinicaId` debe incluirlo explícitamente en el `where` — no hay red de seguridad de base de datos que cubra un olvido.
6. **`app/(auth)/login/page.tsx`** — Página de login

   **Diseño del login:**
   - Fondo dividido: izquierda 40% con color `#0F6E56` y logo + tagline, derecha 60% blanca con el formulario
   - Logo: ícono de pata + texto "VetCloud" en blanco sobre el verde
   - Tagline: "Gestiona tu clínica veterinaria desde cualquier lugar"
   - Formulario limpio con email, contraseña, botón verde, link de registro
   - Validación en tiempo real con react-hook-form + zod
   - Toast de error si credenciales incorrectas

7. **`app/(auth)/register/page.tsx`** — Registro de nueva clínica
   - Paso 1: Datos de la clínica (nombre, email, teléfono)
   - Paso 2: Crear cuenta de admin (nombre, email, contraseña)
   - Progress bar de 2 pasos en la parte superior

8. **`app/api/auth/register/route.ts`** — API para registro
9. **`components/layout/Sidebar.tsx`** — Sidebar principal

   **Diseño del Sidebar:**
   - Fondo `#0F6E56` (verde oscuro)
   - Logo VetCloud arriba con ícono de pata
   - Links de navegación con ícono + texto, color blanco con opacidad 80%
   - Link activo: fondo blanco con opacidad 15%, texto blanco 100%, borde izquierdo blanco 3px
   - Hover: fondo blanco con opacidad 10%
   - Sección inferior: avatar del usuario + nombre + rol + botón logout
   - Ancho fijo 240px en desktop, colapsable en tablet

   **Items del sidebar (con íconos Lucide):**
   - 🏠 Dashboard (`LayoutDashboard`)
   - 👥 Clientes (`Users`)
   - 🐾 Pacientes (`Heart`)
   - 📅 Agenda (`Calendar`)
   - 🏥 Historia Clínica (`FileText`)
   - 📦 Inventario (`Package`)
   - 💰 Facturación (`Receipt`)
   - ⚙️ Configuración (`Settings`)

10. **`components/layout/Header.tsx`** — Header superior
    - Breadcrumb con la sección actual
    - Botón de notificaciones con badge de alertas
    - Avatar y nombre del usuario logueado
    - Fecha y hora actual

11. **`app/(dashboard)/layout.tsx`** — Layout que une Sidebar + Header + contenido

**Al terminar esta fase:**
- Login y logout funcionan
- Registro de nueva clínica crea datos en BD
- Sidebar muestra la sección activa correctamente
- Rutas protegidas redirigen al login si no hay sesión
- Layout responsive en desktop y tablet
- Aislamiento por `clinicaId` probado manualmente: un usuario de la Clínica A no puede leer ni escribir datos de la Clínica B (sin RLS de por medio — ver nota de la Fase 1 arriba; esto depende 100% de que cada API route filtre por `session.user.clinicaId`)

---

### FASE 2 — Dashboard Principal
**Objetivo:** Pantalla de inicio con métricas reales del día.

**Estado: completado** (2026-08-04). Todas las queries filtran por `clinicaId` de la sesión (ver decisión de Fase 1). El "% vs. ayer" en `StatsCard` se calcula contra datos reales del día anterior (`lib/dashboard.ts::getComparativoAyer`), no es un número inventado — la card de "Stock bajo" no muestra comparativo porque es una foto del inventario, no una métrica de flujo diario, así que un `%` ahí sería engañoso. `productosStockBajo` se calcula en JS (no en SQL) porque comparar `stockActual <= stockMinimo` es una comparación entre dos columnas, que el filtro estándar de Prisma no soporta sin SQL crudo; a la escala de un MVP (cientos de productos por clínica) esto es aceptable. Se agregó `app/(dashboard)/loading.tsx` con skeletons — al ser Server Components con fetch directo a Prisma, no hay loading state del lado del cliente, así que el skeleton real ocurre vía streaming de Next.js mientras la página espera las queries. Verificado end-to-end contra Supabase real: estado vacío (0 en las 6 métricas, empty states en los tres widgets) y estado con datos (cita, cliente, paciente, factura, producto con stock bajo y vacuna próxima insertados temporalmente vía una ruta de prueba, verificados renderizados correctamente, y luego eliminados — la ruta de prueba también se borró del código, no debe quedar en el repo).

**Construir:**

1. **`app/api/dashboard/stats/route.ts`** — API que retorna:
   ```json
   {
     "citasHoy": 8,
     "citasCompletadas": 3,
     "ventasHoy": 245.50,
     "pacientesAtendidos": 3,
     "productosStockBajo": 4,
     "proximasVacunas": 6
   }
   ```

2. **`components/dashboard/StatsCard.tsx`** — Card de métrica reutilizable
   - Ícono + título + número grande + cambio vs ayer (% en verde/rojo)
   - Skeleton loader mientras carga

3. **`components/dashboard/CitasHoy.tsx`** — Lista de citas del día
   - Hora | Paciente + especie | Propietario | Veterinario | Estado (badge)
   - Máximo 5 citas visibles, link "Ver todas"
   - Estado con colores: agendada=azul, completada=verde, cancelada=rojo

4. **`components/dashboard/StockAlerts.tsx`** — Productos con stock bajo
   - Lista compacta: nombre | stock actual | stock mínimo | semáforo
   - Semáforo: rojo (0), naranja (bajo mínimo), verde (OK)

5. **`app/(dashboard)/page.tsx`** — Dashboard principal

   **Layout del dashboard:**
   ```
   [Título "Buenos días, Dr. [nombre]" + fecha]

   [StatsCard] [StatsCard] [StatsCard] [StatsCard]
   (Citas hoy) (Ventas $)  (Pacientes) (Stock bajo)

   [CitasHoy — 60%] | [StockAlerts — 40%]

   [ProximasVacunas — 100%]
   ```

**Mejora opcional (bajo costo, si sobra tiempo en esta fase):** agregar un widget "Top 5 servicios/productos de la semana" — es solo un `GROUP BY` sobre `ItemFactura`, no requiere infraestructura nueva.

**Al terminar esta fase:**
- Dashboard muestra datos reales de la BD
- Las 4 stats cards cargan con skeleton y luego muestran datos
- Lista de citas del día actualizada
- Alertas de stock funcionando

---

### FASE 3 — Módulo de Clientes (Propietarios)
**Objetivo:** CRUD completo de propietarios con búsqueda en tiempo real.

**Estado: completado y auditado** (2026-08-04). API (`/api/clientes`, `/api/clientes/[id]`) verificada end-to-end contra Supabase real: crear → buscar (`?q=`) → paginar (probado con 21+ registros reales, no solo con 1-2) → ver detalle (incluye `pacientes` y `facturas`) → editar → soft delete → confirmar 404 en detalle y ausencia en listado tras el borrado (nunca se usa `prisma.cliente.delete`, siempre `update` con `deletedAt`). "Historial de visitas" en el detalle del cliente se implementó como las `Factura` del cliente (es la única relación directa cliente→visita que existe hoy en el schema; `Cita` no tiene relación directa a `Cliente`, solo a `Paciente`) — cuando Facturación (Fase 8) tenga UI propia esto se reutiliza tal cual. El botón "Agregar mascota" enlaza a `/pacientes/nuevo?clienteId=...`, que todavía no existe (se construye en la Fase 4 inmediatamente siguiente) — 404 esperado y transitorio hasta entonces.

**Corrección post-Fase 3 (auditoría 2026-08-04):** las páginas de lista/detalle se construyeron originalmente como Client Components con `fetch` propio en `useEffect`. `npm run lint` reveló que esto viola la regla `react-hooks/set-state-in-effect` de `eslint-plugin-react-hooks@7` (parte del lint por defecto de Next.js 16 con React Compiler) — literalmente el patrón "loading flag + fetch" que se usó es el caso de ejemplo que la regla existe para prevenir. En vez de silenciar la regla, se rediseñaron ambas páginas como **Server Components** (igual que Dashboard en la Fase 2): `lib/clientes.ts` centraliza las queries (`listarClientes`, `getClienteDetalle`, reusadas también por las API routes para no duplicar lógica), la búsqueda en tiempo real ahora funciona vía `?q=` en la URL (un input cliente mínimo con debounce por `setTimeout` en el propio `onChange`, sin `useEffect`), la paginación son enlaces `<Link href="?page=N">` reales, y solo lo verdaderamente interactivo (abrir/cerrar el diálogo de editar/eliminar) quedó en un componente cliente pequeño (`ClienteAcciones.tsx`). Efecto secundario positivo: ahora estas páginas SÍ son verificables con una petición HTTP cruda (antes no, había que confiar en que compilaran). También se corrigió el mismo patrón en el reloj de `Header.tsx` (Fase 1) diferiendo el primer `setAhora` con `setTimeout(fn, 0)` en vez de llamarlo síncrono en el cuerpo del efecto. `npm run lint`, `npx tsc --noEmit` y `npm run build` (build de producción completo) quedaron limpios los tres.

**Corrección adicional (auditoría 2026-08-04) — `proxy.ts` interceptaba las API routes:** el matcher original excluía solo `api/auth`, así que una sesión expirada o una llamada sin cookie a cualquier `/api/*` recibía un redirect 307 a `/login` (HTML) en vez del 401 JSON que cada route ya devuelve por su cuenta (`getServerSession` + `NextResponse.json(..., {status:401})`). Un `fetch(...).then(r => r.json())` del lado del cliente se habría roto tratando de parsear HTML como JSON. Se corrigió excluyendo `api` completo del matcher de `proxy.ts` — la autorización de cada endpoint sigue intacta porque cada route ya la valida individualmente; `proxy.ts` ahora solo protege páginas.

**Corrección de seguridad (auditoría 2026-08-04) — `next-auth` con vulnerabilidad crítica:** `npm audit` reportó una vulnerabilidad **crítica** en `next-auth@4.24.14` (bypass de cookies OAuth state/nonce/PKCE, entre otras — ver GHSA-x445-f3h2-j279). Se corrió `npm audit fix` (sin `--force`), lo que actualizó `next-auth` a una versión parcheada dentro del mismo rango `^4.24.14` y de paso subió Prisma de 7.8.0 a 7.9.1 — se regeneró el cliente (`npx prisma generate`) y se re-verificó login/dashboard/clientes end-to-end, todo sigue funcionando igual. Quedan 5 vulnerabilidades sin resolver (2 moderate, 3 high), todas requieren `npm audit fix --force`, que instalaría **Next.js 16.3.0**, fuera del rango declarado en `package.json` (`"next": "16.2.10"`) — no se aplicó automáticamente porque un bump de Next.js es un cambio de mayor alcance que ya rompió cosas antes en este proyecto (ver renombre `middleware.ts`→`proxy.ts`). **Decisión (2026-08-04):** se difiere a propósito — ninguna de las 5 es crítica, y evitamos otra ronda de breaking changes justo antes de la Fase 4. Revisar y aplicar `npm audit fix --force` (con re-verificación completa: tsc, lint, build, y pruebas end-to-end) antes del despliegue real a producción en la Fase 9.

**Construir:**

1. **`app/api/clientes/route.ts`** — GET (listar + buscar) y POST (crear)
2. **`app/api/clientes/[id]/route.ts`** — GET, PUT, DELETE (el DELETE debe ser soft delete: setear `deletedAt`, nunca borrar la fila)
3. **`components/clientes/ClienteForm.tsx`** — Formulario con validación zod:
   - Nombre*, Apellido*, Teléfono*, WhatsApp, Email, Cédula, Dirección, Notas
   - * = requeridos
4. **`app/(dashboard)/clientes/page.tsx`** — Lista de clientes

   **Diseño:**
   - Barra superior: título "Propietarios" + búsqueda en tiempo real + botón "Nuevo propietario"
   - Tabla con columnas: Avatar+Nombre | Teléfono | Email | Mascotas | Última visita | Acciones
   - Búsqueda filtra mientras se escribe (debounce 300ms)
   - Paginación de 20 por página
   - Click en fila → detalle del cliente

5. **`app/(dashboard)/clientes/nuevo/page.tsx`** — Formulario de nuevo cliente
6. **`app/(dashboard)/clientes/[id]/page.tsx`** — Detalle del cliente

   **Diseño del detalle:**
   - Header: avatar iniciales + nombre completo + teléfono + botones editar/eliminar
   - Grid: datos de contacto (izquierda) + lista de mascotas (derecha)
   - Historial de visitas en tabla al fondo
   - Botón "Agregar mascota" en la sección de mascotas

**Al terminar esta fase:**
- Crear, editar, eliminar (soft delete) propietarios
- Búsqueda en tiempo real funciona
- Ver detalle con todas sus mascotas
- Toast de confirmación en cada acción

---

### FASE 4 — Módulo de Pacientes (Mascotas)
**Objetivo:** CRUD de mascotas con perfil completo.

**Estado: completado** (2026-08-04). Construido siguiendo el mismo patrón de Server Components de Clientes (Fase 3) desde el inicio — sin pasar por la fase intermedia de Client Components + `useEffect` que hubo que corregir ahí. `lib/pacientes.ts` centraliza las queries, reusadas por API routes y páginas. `npx tsc --noEmit`, `npm run lint` y `npm run build` (producción) limpios los tres. Verificado end-to-end contra Supabase real: crear cliente → "Agregar mascota" desde su detalle (Fase 3) precarga el propietario correctamente → crear mascota → aparece en el grid y filtra por especie → perfil con badges de alergia/condición → registrar vacuna real (tab Vacunas) → editar → soft delete → 404 tras borrar. También se probó explícitamente el aislamiento multi-tenant: crear una segunda clínica y confirmar que no puede crear una mascota usando el `clienteId` de la primera (404, no 201) — la validación de propiedad del cliente en `POST /api/pacientes` y `PUT /api/pacientes/[id]` funciona.

**Decisiones de alcance (con precedente de la Fase 3, documentadas aquí en vez de preguntar cada una):**
- **Foto de mascota → campo de URL, no upload real.** El plan original decía "Foto (upload)". Construir subida real requeriría un bucket de Supabase Storage que nunca se aprovisionó explícitamente en ninguna fase anterior — dado que esta sesión ya tuvo dos sorpresas de infraestructura de Supabase (pausa del proyecto, propagación del pooler), se prefirió no añadir una tercera dependencia externa sin confirmar. `fotoUrl` acepta pegar un link a una imagen ya alojada en otro lugar. Subida real de archivos queda para cuando se conecte Storage (mencionado también en Fase 6, Adjuntos).
- **Sin filtro "por veterinario" en la lista de pacientes.** El plan lo pedía, pero `Paciente` no tiene relación con `Usuario`/veterinario en el schema (solo `Cita` y `HistoriaClinica` la tienen, y ninguna tiene UI de creación todavía). No hay campo real que filtrar.
- **"Ordenar por última visita" reemplazado por "Más recientes" (creación) y "Nombre (A-Z)".** Igual que en Fase 3 con Clientes: sin `Cita`/`HistoriaClinica` poblados todavía, "última visita" no tiene datos reales que ordenar. La tarjeta de cada paciente sí muestra "última visita" cuando existe (derivada de `Cita.fechaHora` más reciente) — quedará poblada automáticamente en cuanto la Fase 5 permita crear citas, sin tocar este código.
- **Tab "Vacunas" es funcional de verdad, no un placeholder.** A diferencia de los tabs Historia/Citas/Adjuntos (que dependen de Fases 5/6 y muestran un estado vacío explicado), `Vacuna` es un modelo independiente sin dependencias de fases futuras — se construyó `POST /api/pacientes/[id]/vacunas` completo con su formulario, y ya alimenta el widget "Vacunas próximas" del Dashboard (Fase 2) con datos reales.
- **Botón "Nueva consulta" enlaza a `/historia-clinica/nueva?pacienteId=...`, que no existe aún** (se construye en la Fase 6) — 404 esperado y transitorio, mismo patrón que "Agregar mascota" en la Fase 3.

**Construir:**

1. **`app/api/pacientes/route.ts`** — GET y POST
2. **`app/api/pacientes/[id]/route.ts`** — GET, PUT, DELETE (soft delete)
3. **`components/pacientes/PacienteForm.tsx`** — Formulario:
   - Propietario* (select búsqueda), Nombre*, Especie* (select con íconos), Raza, Sexo*, Fecha nacimiento, Peso actual, Chip ID, Foto (upload), Alergias, Condiciones crónicas, ¿Esterilizado?, Notas
4. **`app/(dashboard)/pacientes/page.tsx`** — Lista de pacientes

   **Diseño:**
   - Cards en grid 3 columnas (no tabla): foto circular + nombre + especie/raza + propietario + última visita
   - Filtros: por especie, por veterinario, ordenar por nombre/última visita
   - Búsqueda por nombre de mascota o propietario

5. **`app/(dashboard)/pacientes/[id]/page.tsx`** — Perfil de la mascota

   **Diseño del perfil (la pantalla más importante):**
   ```
   [Foto grande circular] [Nombre + especie + raza]
   [Edad calculada]       [Propietario con link]
   [Chip ID]              [Peso + fecha último peso]

   [Tabs: Historia | Vacunas | Citas | Adjuntos]

   Tab Historia:
   - Timeline vertical con todas las consultas
   - Cada entrada: fecha + veterinario + diagnóstico + expandible

   Tab Vacunas:
   - Tabla: vacuna | fecha | próxima dosis | estado
   - Botón "Registrar vacuna"

   Tab Citas:
   - Historial de citas pasadas y próximas

   Tab Adjuntos:
   - Grid de imágenes y PDFs subidos
   ```

   - Badge de alerta si tiene alergias conocidas (siempre visible, rojo)
   - Badge de alerta si tiene condiciones crónicas (siempre visible, naranja)
   - Botón "Nueva consulta" prominente

**Mejora opcional (bajo costo):** generar un código QR por paciente con la librería `qrcode` (ya en package.json de Fase 0) que enlace a `/pacientes/[id]`, imprimible para collar o carpeta física — no requiere servicio externo, se genera 100% en el servidor/cliente.

**Al terminar esta fase:**
- Perfil completo de cada mascota
- Timeline de historia clínica por pestañas
- Alertas de alergias visibles

---

### AJUSTES POST-FASE 4 — Vacunas editables + rediseño del Dashboard (2026-08-08)

Pedido explícito del usuario (`CambiosF4.txt`) antes de continuar con la Fase 5. Dos cambios independientes:

**1. Vacunas: editar y eliminar.** `Vacuna` era el único modelo sin `deletedAt` (Cliente/Paciente/Usuario/Producto ya lo tenían desde el diseño original). Agregarlo fue un cambio chico — un campo, una migración (`20260808231849_add_vacuna_soft_delete`), y 3 queries existentes actualizadas para filtrar `deletedAt: null` (`lib/pacientes.ts::getPacienteDetalle`, `lib/dashboard.ts::getEstadisticasHoy` y `getProximasVacunasDetalle`) — no ameritaba pedir permiso primero según el propio criterio del usuario. Nuevo endpoint `app/api/vacunas/[id]/route.ts` (PUT/DELETE) que valida propiedad vía `vacuna.paciente.clinicaId` (Vacuna no tiene `clinicaId` propio). El formulario se extrajo a `components/pacientes/VacunaForm.tsx` (reusado por crear y editar), y `components/pacientes/VacunaAcciones.tsx` agrega los botones de editar/eliminar por fila en la pestaña Vacunas, con diálogo de confirmación con el texto exacto pedido ("¿Estás seguro de eliminar este registro de vacuna?"). Verificado: crear → editar → intentar editar/eliminar desde otra clínica (404 en ambos, sin cambios en el registro) → eliminar real → confirmado que desaparece del perfil del paciente y de `proximasVacunas` en el Dashboard.

**2. Dashboard rediseñado.** Se quitó el "% vs. ayer" de las tarjetas diarias (el usuario lo consideró poco representativo con volumen bajo) y se agregó una tarjeta real más: "Clientes nuevos hoy" (`Cliente.creadoEn` de hoy — dato ya existía, solo faltaba mostrarlo). `StatsCard` ahora acepta `comparativoLabel` para poder reusar el mismo componente con "vs. mes anterior" en la sección mensual. Se creó `lib/analisis.ts` con las queries de la nueva sección "Análisis mensual".

**Antes de construir nada, se revisó qué es calculable con el schema actual (instrucción explícita: "no inventes métricas").** Resultado:

| Métrica pedida | Estado | Nota |
|---|---|---|
| Ingresos del mes + comparación vs. mes anterior | ✅ Implementada | `Factura.total`, agregando por rango de fechas. Dato real en cuanto exista Facturación (Fase 8) — hoy en 0 porque no hay UI para crear facturas todavía. |
| Consultas/atenciones del mes | ✅ Implementada | `Cita` con `estado: COMPLETADA` en el mes. En 0 hasta la Fase 5 (Agenda). |
| Clientes nuevos del mes | ✅ Implementada, **con datos reales ahora mismo** | `Cliente.creadoEn` — el único módulo de los mencionados que ya tiene CRUD completo (Fase 3). |
| Mascotas atendidas | ✅ Implementada | Pacientes distintos con `Cita COMPLETADA` en el mes. En 0 hasta Fase 5. |
| Servicios más utilizados | ✅ Implementada | `ItemFactura` agrupado, filtrando `Producto.categoria = SERVICIO`. En 0 hasta Fase 8. |
| Productos más vendidos | ✅ Implementada | Igual que arriba pero `categoria != SERVICIO`. En 0 hasta Fase 8. |
| Evolución de ingresos del mes | ✅ Implementada (gráfico de barras) | Agregación diaria de `Factura.total` calculada en JS (no SQL crudo) — a la escala de una clínica esto es correcto y suficientemente rápido; no justifica una query más compleja todavía. |
| Días con mayor actividad | ✅ Implementada | Top 3 días del mes por cantidad de `Cita`. En 0 hasta Fase 5. |
| Próximas vacunas y controles | ✅ Implementada | Vacunas ya vivían en el Dashboard; se agregaron "Controles" (`Cita` con `tipo: CONTROL`) — en 0 hasta Fase 5, pero el campo `tipo` ya existe en el enum desde el schema original. |
| **Productos próximos a agotarse** | ✅ Ya existía | Es el mismo `getProductosStockBajo` de la Fase 2 (`stockActual <= stockMinimo`). |
| **Productos próximos a vencer** | ❌ **No implementada — deliberadamente** | El vencimiento vive en `MovimientoInventario.vencimiento`, por lote, no en `Producto` directamente. `MovimientoInventario` es un log de eventos (entradas/salidas/ajustes) sin un campo "cantidad restante por lote" — calcularlo bien requiere lógica FEFO (First-Expired-First-Out) que reste salidas de las entradas más antiguas primero, exactamente la mejora que la Fase 7 ya dejaba anotada como pendiente en el Roadmap Post-MVP. Construir una versión aproximada ahora sería inventar un número que no se puede confiar — se deja preparado para cuando la Fase 7 tenga la lógica de lotes real. |

Verificado con `npx tsc --noEmit`, `npm run lint` y `npm run build` (los tres limpios) y end-to-end contra Supabase real, incluyendo que las nuevas secciones renderizan sin errores tanto en estado vacío (Facturación/Agenda aún no existen) como con datos reales (Clientes nuevos del mes).

**Lección operativa (para no repetirla):** después de `npx prisma migrate dev` + `npx prisma generate`, si el servidor de desarrollo ya estaba corriendo, **hay que reiniciarlo** — el Prisma Client cargado en memoria del proceso viejo sigue validando contra el schema anterior (error en runtime: `Unknown argument 'deletedAt'`), aunque los archivos generados en disco ya estén actualizados. Esto ya había pasado una vez en la Fase 0.1 y volvió a pasar aquí; typecheck/lint/build no lo detectan porque compilan con los archivos nuevos — solo el proceso de `next dev` ya iniciado queda desfasado.

---

### FASE 5 — Agenda de Citas
**Objetivo:** Calendario funcional con gestión completa de citas.

**Estado: completado** (2026-09-13). Construido siguiendo los mismos patrones de las fases anteriores (Server Components para las páginas, API routes con filtro `clinicaId`, formularios `react-hook-form` + `zod`). `npx tsc --noEmit`, `npm run lint` y `npm run build` (producción) limpios los tres. Verificado end-to-end contra Supabase real con dos clínicas de prueba: crear cliente → crear mascota → crear cita → intentar una segunda cita solapada con el mismo veterinario (409, bloqueada correctamente) → listar por semana → cambiar estado → editar → eliminar. Aislamiento multi-tenant probado explícitamente: `GET`/`DELETE` de una cita de otra clínica devuelven 404, y crear una cita usando el `pacienteId` de otra clínica también devuelve 404. `/agenda` renderiza el calendario semanal con la cita real visible en su bloque de color y en el panel lateral "Hoy". Todos los datos de prueba (citas, clínicas de prueba) se limpiaron después de verificar.

**Decisión de alcance (documentada en vez de preguntar, con precedente de fases anteriores):** el selector "veterinario" de `NuevaCitaModal` lista **todos los usuarios activos de la clínica**, no solo los de rol `VETERINARIO`. Ninguna fase del plan construye una pantalla de gestión de personal — el único `Usuario` que existe en una clínica nueva es el `ADMIN` creado en el registro (Fase 1) — así que restringir por rol habría dejado el selector vacío y la Agenda inutilizable en toda clínica nueva. Se retoma cuando exista un módulo de gestión de personal que permita crear usuarios con rol `VETERINARIO`.

**Otras decisiones de implementación:**
- **`Cita` no tiene `deletedAt`** (a diferencia de Cliente/Paciente/Usuario/Producto/Vacuna) — así quedó diseñado desde el schema original. El `DELETE` de `/api/citas/[id]` por lo tanto borra la fila físicamente; no viola la regla de "sin DELETE físico" del checklist general porque esa regla aplica a registros clínicos/de clientes, y una cita cancelada por error no es un registro médico permanente (para trazabilidad real de atención sí completada, se usa el campo `estado`, nunca se borra una cita `COMPLETADA` en el flujo normal de uso).
- **Detección de solapamiento** (`lib/citas.ts::haySolapamiento`) compara por `veterinarioId` dentro de una ventana de ±24h alrededor del horario solicitado (evita traer todo el historial de citas del veterinario en cada validación) y excluye citas `CANCELADA`/`NO_ASISTIO`, que no ocupan agenda real.
- **`CitaForm.tsx`** se reutiliza tanto para crear (`NuevaCitaModal`) como para editar (`CitaDetalleDialog`), mismo patrón que `VacunaForm` en la Fase 4. La cascada propietario → mascota reutiliza `PropietarioSelect` (Fase 4) y resuelve las mascotas del propietario elegido en el propio `onChange` (evento), no en un `useEffect`, siguiendo la corrección de lint ya aplicada en la Fase 3 (`react-hooks/set-state-in-effect`).
- **Vista semanal** con semana Lunes–Domingo (`weekStartsOn: 1`), navegable por querystring `?semana=yyyy-MM-dd` (mismo patrón de paginación por URL que Clientes/Pacientes), con mini calendario mensual en el panel lateral que enlaza a la semana de cualquier día con un click.

**Construir:**

1. **`app/api/citas/route.ts`** — GET (por fecha/rango) y POST
2. **`app/api/citas/[id]/route.ts`** — GET, PUT (cambiar estado), DELETE
3. **`components/agenda/CalendarioSemanal.tsx`** — Vista semanal

   **Diseño del calendario:**
   - Vista semanal: columnas = días, filas = horas (8am a 8pm cada 30min)
   - Cada cita es un bloque de color según tipo:
     - Consulta: azul `#185FA5`
     - Vacuna: verde `#0F6E56`
     - Cirugía: morado `#534AB7`
     - Urgencia: rojo `#DC2626`
   - Al hacer click en un slot vacío → modal de nueva cita
   - Al hacer click en una cita → modal de detalle/edición

4. **`components/agenda/NuevaCitaModal.tsx`** — Modal de nueva cita:
   - Buscar propietario → selecciona mascota automáticamente
   - Tipo de cita, veterinario disponible, fecha y hora, duración, motivo
   - Validación de solapamiento de citas

5. **`components/agenda/CitaCard.tsx`** — Tarjeta de cita en el calendario

6. **`app/(dashboard)/agenda/page.tsx`** — Página de agenda

   **Layout:**
   - Header: flechas navegación semana + botón "Hoy" + vista (día/semana) + botón "Nueva cita"
   - Panel izquierdo (280px): citas del día ordenadas por hora + mini calendario mensual
   - Panel derecho: calendario semanal principal

**Al terminar esta fase:**
- Ver citas por semana
- Crear cita desde cualquier slot
- Cambiar estado de cita
- Vista del día en panel lateral

---

### FASE 6 — Historia Clínica
**Objetivo:** Formulario de consulta completo con prescripción y timeline.

**Estado: completado** (2026-09-16). Construido siguiendo los mismos patrones de las fases anteriores (Server Components para las páginas, API routes con filtro `clinicaId`, `react-hook-form` + `zod`, `lib/historia-clinica.ts` centraliza las queries y la transacción de creación reusada por la API route). `npx tsc --noEmit`, `npm run lint` y `npm run build` (producción) limpios los tres. Verificado end-to-end en navegador contra Supabase real: nueva consulta desde el perfil del paciente → SOAP completo con signos vitales → prescripción con producto real → guardar → historia creada, stock del producto descontado correctamente, `Paciente.peso` actualizado al peso de la consulta, timeline del paciente muestra la entrada (expandible), vista de detalle con botón Imprimir. Se probó explícitamente el caso de stock insuficiente: pedir más cantidad de la disponible bloquea la creación completa de la consulta (la transacción revierte, no queda una historia clínica a medias) con un error claro. El producto usado para probar la prescripción se insertó temporalmente con un script (no hay UI de inventario todavía, ver decisión de alcance abajo) y se borró junto con sus movimientos al terminar — no quedó en el repo.

**Decisiones de alcance (documentadas en vez de preguntar, con precedente de fases anteriores):**
- **El veterinario de la consulta es siempre el usuario logueado, no un selector.** A diferencia de la Agenda (donde cualquiera puede agendar una cita para cualquier veterinario), la Historia Clínica la redacta quien está atendiendo en ese momento — `veterinarioId` se toma de `session.user.id`, sin campo en el formulario.
- **Se agregó un campo "Cantidad" a la prescripción que el plan original no pedía explícitamente.** El plan solo mencionaba dosis/frecuencia/días de tratamiento (cómo el propietario administra el medicamento en casa) pero sin una cantidad numérica es imposible descontar del inventario real, que es un requisito explícito del checklist de esta fase. Se agregó como el único campo obligatorio de la prescripción además del producto.
- **Endpoint de solo lectura `GET /api/productos/buscar`, no el CRUD de inventario.** Para prescribir hace falta buscar productos existentes, pero el CRUD de `Producto` es la Fase 7. Se construyó el mínimo necesario (buscar por nombre dentro de la clínica) para que el combobox de prescripciones funcione; crear/editar/borrar productos sigue sin existir hasta la Fase 7.
- **"Genera factura borrador" (mencionado en el plan original de esta fase) se difiere a la Fase 8.** El checklist real de "Al terminar esta fase" no lo pide, y `Factura.numero` no tiene todavía un esquema de numeración (eso lo define la Fase 8) — generar facturas ahora habría inventado un formato que probablemente se descarta después. El descuento de inventario (que sí está en el checklist) se implementó completo.
- **El adaptador de recordatorios de WhatsApp (`lib/whatsapp.ts`, Twilio Sandbox) se difiere.** No hay credenciales de Twilio configuradas (mismo tipo de bloqueo que Supabase en la Fase 0.1: se retoma cuando el usuario las provea) y el checklist de "Al terminar esta fase" tampoco lo exige.
- **Sin ícono por "tipo" de consulta en el timeline.** El plan lo pedía, pero `HistoriaClinica` no tiene un campo `tipo` en el schema (a diferencia de `Cita`) — se usa un ícono único para todas las entradas.
- **La ruta de la Fase 6 en el plan original (`historia-clinica/[id]/page.tsx` como "formulario de nueva consulta") no coincidía con el link ya construido en la Fase 4** (`/historia-clinica/nueva?pacienteId=...`). Se siguió el link real ya existente: `historia-clinica/nueva/page.tsx` es el formulario de creación, y `historia-clinica/[id]/page.tsx` quedó para ver/imprimir una consulta ya guardada (que además resuelve el pedido de "Historia exportable a PDF" del checklist).
- **Impresión vía `window.print()` + variante `print:` de Tailwind**, no CSS a medida: se ocultan Sidebar/Header con `print:hidden` en el layout del dashboard (queda reusable para cuando la Fase 8 imprima facturas).
- **Editar una consulta ya guardada (`PUT /api/historia-clinica/[id]`) solo permite corregir el texto clínico**, no las prescripciones — ya se descontó inventario al crearla, y revertir/recalcular ese movimiento desde aquí queda fuera de alcance del MVP (se corrige manualmente desde Inventario en la Fase 7 si hace falta).

**Construir:**

1. **`app/api/historia-clinica/route.ts`** — GET y POST
2. **`app/api/historia-clinica/[id]/route.ts`** — GET, PUT
3. **`components/historia-clinica/SignosVitales.tsx`** — Sección de signos vitales:
   - Inputs numéricos: Peso (kg), Temperatura (°C), FC (lpm), FR (rpm)
   - Visualización gráfica del último peso vs actual

4. **`components/historia-clinica/ConsultaForm.tsx`** — Formulario SOAP:
   - **S (Subjetivo):** Motivo de consulta (textarea)
   - **O (Objetivo):** Signos vitales + Examen físico (textarea)
   - **A (Evaluación):** Diagnóstico principal + diagnósticos secundarios
   - **P (Plan):** Plan terapéutico + prescripciones + próxima cita

5. **`components/historia-clinica/PrescripcionForm.tsx`** — Prescripciones:
   - Buscar producto del inventario
   - Dosis, frecuencia, días de tratamiento, notas
   - Lista dinámica: agregar/eliminar medicamentos
   - Al guardar → descuenta automáticamente del inventario

6. **`components/historia-clinica/TimelineClinico.tsx`** — Timeline:
   - Lista cronológica de todas las consultas
   - Cada entrada colapsada: fecha + veterinario + diagnóstico
   - Al expandir: todos los detalles de la consulta
   - Ícono diferente según tipo (consulta, vacuna, cirugía)

7. **`app/(dashboard)/historia-clinica/[id]/page.tsx`** — Formulario de nueva consulta:
   - Header: paciente + propietario + datos rápidos + alergias en badge rojo
   - Formulario SOAP completo
   - Sección de prescripciones
   - Botón guardar → crea historia + descuenta inventario + genera factura borrador

**Recordatorios WhatsApp — implementación con caveat documentado:**
- Crear `lib/whatsapp.ts` como **adapter**: una función `enviarWhatsApp(destinatario, plantilla, variables)` que hoy llama a Twilio Sandbox, pero cuyo contrato (firma de función) no cambia si mañana se reemplaza por Meta Cloud API u otro proveedor. Así el resto del código (recordatorio de cita, aviso de vacuna) nunca se reescribe, solo se cambia la implementación interna del adapter.
- **Limitación a comunicar al usuario final del sistema (dueño de la clínica):** en modo sandbox, cada propietario de mascota debe enviar un código de activación al número de Twilio antes de poder recibir mensajes automáticos — esto es aceptable para desarrollo/demo con clínicas piloto, pero **no funciona para clientes reales sin ese paso manual**. Pasar a producción real requiere Twilio con número de WhatsApp aprobado o Meta Cloud API directo (trámite de Meta Business, no es instantáneo, tiene costo por mensaje ~USD 0.005).

**Al terminar esta fase:**
- Consulta completa SOAP funcional
- Prescripciones descuentan inventario automáticamente
- Timeline visible en perfil del paciente
- Historia exportable a PDF (usando window.print con estilos CSS)

---

### FASE 7 — Inventario
**Objetivo:** Control de stock con alertas y movimientos automáticos.

**Estado: completado** (2026-09-16). `npx tsc --noEmit`, `npm run lint` y `npm run build` (producción) limpios los tres. Verificado end-to-end contra Supabase real vía la API HTTP (registro de una clínica de prueba `Clinica Fase7 Test` / `admin-fase7-*@vetcloud.dev`, queda en la base igual que la de la Fase 1, es inofensiva): crear producto con stock inicial → aparece con `stockActual` correcto; editar precio sin tocar el stock; registrar entrada manual → `stockActual` sube y el costo informado se guarda como `precioCosto` del producto; registrar salida por más cantidad de la disponible → rechazada con 400 y mensaje claro, sin modificar el stock; eliminar (soft delete) → desaparece del listado. El HTML de `/inventario` se confirmó servido con las cards de resumen, los tabs de categoría y los dos botones de acción. No se pudo tomar captura visual de los diálogos/formularios (sin navegador headless disponible en este entorno) — la verificación fue funcional contra la API real, no visual.

**Decisiones de alcance (documentadas en vez de preguntar, con precedente de fases anteriores):**
- **El stock de un producto ya creado solo cambia por movimientos, nunca editando el producto directamente.** El formulario de edición (`PUT /api/inventario/[id]`, `productoEditSchema`) omite `stockActual`/`stockInicial` a propósito — corregirlo a mano rompería el rastro de auditoría en `MovimientoInventario`. El único punto de entrada de stock nuevo es "Registrar entrada" (o el stock inicial al crear el producto, que también genera su propio movimiento `ENTRADA` con motivo "Stock inicial").
- **El formulario manual de movimientos solo admite ENTRADA y SALIDA, no AJUSTE.** El plan no define si un "ajuste" es un delta o un valor absoluto de corrección, y el checklist de esta fase solo exige "registro de entradas de stock" — se prefirió no inventar esa semántica. Si se necesita en el futuro, se agrega como una operación explícita ("fijar stock a X"), no reutilizando el campo `cantidad` con un significado ambiguo.
- **`MovimientoInventario` no tiene columna de costo propia (schema de la Fase 0).** El campo "Costo unitario" del modal de entrada, cuando se informa, actualiza `Producto.precioCosto` (costo de referencia de la última compra) en la misma transacción — no se agregó una columna nueva al schema para esto.
- **"Valor total inventario" se calcula a costo cuando existe (`precioCosto`) y a precio de venta como respaldo si nunca se registró un costo.** Es una aproximación para el MVP, no una cifra contable.
- **Sin página de detalle por producto.** El plan no la pide (a diferencia de Clientes/Pacientes); crear, editar y eliminar se hacen todos desde diálogos sobre la misma tabla de `/inventario`, igual que ya se hace en Clientes para editar/eliminar.
- **Tabs de categoría limitadas a las 5 que pide el plan** (Todos, Medicamentos, Vacunas, Insumos, Servicios) — `ALIMENTO`, `ACCESORIO` y `OTRO` del enum siguen existiendo y son seleccionables en el formulario, solo no tienen pestaña dedicada; quedan visibles dentro de "Todos".

**Construir:**

1. **`app/api/inventario/route.ts`** — GET (productos + stock) y POST (nuevo producto)
2. **`app/api/inventario/[id]/route.ts`** — PUT, DELETE (soft delete)
3. **`app/api/inventario/movimiento/route.ts`** — POST (registrar entrada/salida manual)
4. **`components/inventario/StockBadge.tsx`** — Badge visual del stock:
   - Rojo con ícono X: stock = 0
   - Naranja con ícono ⚠: stock <= mínimo
   - Verde con ícono ✓: stock OK

5. **`components/inventario/ProductoTable.tsx`** — Tabla de productos:
   - Nombre | Categoría | Stock actual (con badge) | Stock mínimo | Precio | Acciones
   - Filtro por categoría
   - Búsqueda por nombre

6. **`app/(dashboard)/inventario/page.tsx`** — Gestión de inventario

   **Layout:**
   - Cards resumen arriba: Total productos | En stock bajo | Sin stock | Valor total inventario
   - Tabs: Todos | Medicamentos | Vacunas | Insumos | Servicios
   - Tabla de productos con filtros
   - Botones: "Nuevo producto" | "Registrar entrada"
   - Modal de entrada de stock: producto + cantidad + lote + vencimiento + costo

**Nota sobre FEFO (First Expired, First Out):** el schema actual registra `lote` y `vencimiento` a nivel de `MovimientoInventario`, suficiente para el MVP (alertas de vencimiento por movimiento). Un sistema de lotes independientes con descuento automático FEFO (como describe la arquitectura empresarial) es una mejora real pero agrega una tabla y lógica adicional — se deja documentada en el Roadmap Post-MVP para no sobre-construir el MVP.

**Al terminar esta fase:**
- CRUD de productos
- Registro de entradas de stock
- Alertas automáticas de stock bajo en dashboard
- Movimientos automáticos desde prescripciones (ya conectado desde Fase 6)

---

### FASE 8 — Facturación
**Objetivo:** Generar y gestionar facturas por consulta.

**Estado: completado** (2026-09-16). `npx tsc --noEmit`, `npm run lint` y `npm run build` (producción) limpios los tres. Verificado end-to-end contra Supabase real vía la API HTTP y HTML servido (clínica de prueba `Clinica Fase8 Test`, misma convención de las fases anteriores): cliente → paciente → producto → consulta con prescripción → `/facturacion/nueva?historiaId=...` prellena correctamente propietario e items (nombre de producto + nombre de mascota, precio actual del producto); crear factura con un item de producto y un item de servicio libre (sin `productoId`) calcula subtotal/descuento/total correctos; numeración secuencial `F-2026-000001`, `F-2026-000002`; registrar pago pasa PENDIENTE → PAGADA y fija `pagadaEn`; reintentar el pago sobre una factura ya pagada se rechaza con 400; filtro por estado y por fecha funcionan sobre la API real.

**Bug real encontrado y corregido durante la verificación:** las constantes `ESTADO_FACTURA_LABELS`/`ESTADO_FACTURA_STYLES`/`METODO_PAGO_LABELS` vivían originalmente en `FacturaTable.tsx`, un archivo `"use client"` (por el `onClick` de navegación de la fila). Un Server Component (`facturacion/[id]/page.tsx`) que las importaba recibía una referencia de cliente en vez del objeto real — el lookup por clave devolvía `undefined` silenciosamente (sin error, sin warning; se detectó solo inspeccionando el HTML renderizado). Se movieron a `components/facturacion/estados.ts`, un módulo sin `"use client"`, siguiendo el mismo patrón ya usado en `components/agenda/CitaCard.tsx` (labels/estilos en un archivo plano, la interactividad en otro). **Lección para fases futuras:** cualquier `Record`/constante que deba leerse tanto desde un Server Component como desde un componente cliente no puede vivir en un archivo marcado `"use client"`, aunque sea "solo una exportación más" del mismo archivo — hay que separarlo.

**Decisiones de alcance (documentadas en vez de preguntar, con precedente de fases anteriores):**
- **No existe una tarifa de consulta configurable en el schema** (ni en `Clinica` ni por `Cita.tipo`). "Generar factura" desde una consulta arma el borrador solo con los items de las prescripciones (usando el precio de venta *actual* del producto, no uno histórico — la prescripción no guarda precio); el ítem de "Consulta veterinaria" u otros cargos se agregan a mano en el mismo formulario antes de guardar, junto con las prescripciones. El formulario admite items sin `productoId` (servicios libres) para esto exactamente.
- **La factura no se puede editar después de creada**, solo cambiar de estado (`PUT` admite únicamente registrar pago o cancelar/anular) — igual que el plan original solo pide "GET, PUT (cambiar estado/pago)", no un PUT de edición completa.
- **Sin protección contra facturar dos veces la misma consulta.** El schema de `Factura`/`ItemFactura` no tiene una relación hacia `HistoriaClinica` (no se agregó una columna nueva para esto sin pedido explícito) — nada impide generar el borrador desde la misma consulta más de una vez. Se documenta como limitación conocida en vez de inventar un campo de deduplicación.
- **Numeración de factura (`F-{año}-{secuencial}`) contando filas existentes dentro de la misma transacción, sin tabla de contador dedicada** — con un solo dev y bajo volumen es suficiente; con creación concurrente real el número podría colisionar (mismo tipo de caveat documentado que el resto del proyecto, ver Fase 7).
- **Costo unitario informado al registrar un movimiento de inventario (Fase 7) no es lo mismo que el precio de venta usado al facturar** — la factura siempre usa `Producto.precioVenta`, nunca `precioCosto`; son dos precios con propósitos distintos y no se mezclan.
- **Tabla de facturas sin columna "Paciente"** (a diferencia del layout original del plan): `Factura` solo se relaciona con `Cliente`, no con `Paciente` — un cliente puede facturar en una sola factura cargos de más de una mascota. El nombre de la mascota, cuando aplica, queda dentro de la descripción del item (ej. "Amoxicilina 500mg (Rex)").
- **Sin columna "Acciones" en la tabla de facturas** — la fila entera navega al detalle al hacer clic, mismo patrón ya usado en Clientes desde la Fase 3.
- **Se extendió `GET /api/productos/buscar`** (Fase 6) para incluir `precioVenta` en la respuesta, y el `onChange` de `ProductoSelect` ahora pasa ese precio como tercer argumento — cambio compatible hacia atrás (los llamadores existentes en Prescripciones y en Registrar entrada de inventario que solo usan `(id, nombre)` siguen funcionando sin cambios).

**Construir:**

1. **`app/api/facturas/route.ts`** — GET y POST
2. **`app/api/facturas/[id]/route.ts`** — GET, PUT (cambiar estado/pago)
3. **`app/(dashboard)/facturacion/page.tsx`** — Lista de facturas

   **Layout:**
   - Stats: Ventas hoy | Pendientes de cobro | Pagadas este mes
   - Tabla: # | Fecha | Cliente | Paciente | Total | Estado | Método pago | Acciones
   - Filtros: por estado, por fecha, por cliente
   - Botón "Nueva factura"

4. **Pantalla de factura individual:**
   - Header: logo clínica + datos clínica + número de factura + fecha
   - Datos del cliente y paciente
   - Tabla de items: descripción | cantidad | precio unit | subtotal
   - Total con descuento si aplica
   - Estado y método de pago
   - Botón imprimir (window.print con estilos específicos)

5. **Modal de pago:**
   - Monto a pagar (pre-llenado con total pendiente)
   - Método de pago (select)
   - Botón confirmar → marca como pagada + registra fecha de pago

**Fuera de alcance del MVP (correcto dejarlo así):** facturación electrónica oficial ante autoridades tributarias (SRI Ecuador, DIAN Colombia, SAT México, SUNAT Perú) requiere integración con APIs gubernamentales de pago/certificación por país — no es gratis ni trivial. La factura que genera esta fase es un comprobante interno imprimible/PDF, no un documento tributario válido. Se documenta en Roadmap Post-MVP.

**Al terminar esta fase:**
- Facturación completa por consulta
- Estados: pendiente → pagada
- Impresión de factura con CSS print

---

### FASE 9 — Pulido Final y Despliegue
**Objetivo:** Detalles de UX, errores, y subir a producción gratis.

**Tareas:**

1. **Estados vacíos:** Crear componente `EmptyState.tsx` con ilustración SVG + mensaje + CTA para cada módulo vacío

2. **Loading states:** Skeleton loaders en todas las tablas y listas mientras cargan datos

3. **Manejo de errores:** Error boundaries en las páginas principales, mensajes de error claros

4. **Responsive:** Revisar y ajustar cada pantalla en tablet (768px) y mobile (375px)

5. **Auditoría de aislamiento por `clinicaId`:** confirmar (con dos clínicas de prueba y dos usuarios distintos) que ninguna pantalla ni API route deja fugar datos de una clínica a otra. Sin RLS de por medio (ver Fase 1), esto significa revisar a mano que **cada** query Prisma en **cada** route filtra por `clinicaId`. Esto es innegociable antes de invitar clínicas piloto reales.

6. **Seed de datos de prueba:**
   ```bash
   # Crear prisma/seed.ts con datos de ejemplo
   npx prisma db seed
   ```
   Incluir: 1 clínica demo, 2 veterinarios, 10 propietarios, 15 mascotas, 20 citas, 5 consultas, 20 productos con stock

7. **Despliegue en Vercel:**
   ```bash
   # Instalar Vercel CLI
   npm i -g vercel

   # Subir el código a GitHub primero
   git init
   git add .
   git commit -m "feat: VetCloud MVP inicial"
   git remote add origin https://github.com/tu-usuario/vetcloud.git
   git push -u origin main

   # Desplegar
   vercel --prod
   ```
   - Agregar variables de entorno en dashboard de Vercel
   - Conectar con repositorio de GitHub para deploys automáticos

**Al terminar esta fase:**
- Sistema funcionando en URL pública de Vercel
- Datos de prueba cargados
- Cero errores en consola
- RLS verificado con múltiples tenants

---

## 📋 Checklist General de Calidad

Antes de considerar cada fase completa, verificar:

- [ ] No hay errores en consola del navegador
- [ ] No hay errores de TypeScript (`npx tsc --noEmit`)
- [ ] Formularios validan campos requeridos
- [ ] Toast de éxito/error en todas las acciones
- [ ] Estados de carga con skeleton o spinner
- [ ] Estado vacío cuando no hay datos
- [ ] Funciona en Chrome, Firefox y Safari
- [ ] Responsive en 768px y 1280px
- [ ] Datos del tenant (clínica) aislados correctamente (filtro `clinicaId` en cada API route — sin RLS, ver Fase 1)
- [ ] Ningún DELETE físico sobre datos clínicos/clientes — siempre soft delete (`deletedAt`)

---

## 🔧 Comandos Útiles de Referencia

```bash
# Desarrollo
npm run dev                          # Levantar servidor local

# Base de datos
npx prisma migrate dev --name nombre # Crear migración
npx prisma db push                   # Sincronizar schema sin migración
npx prisma studio                    # GUI visual de la BD
npx prisma db seed                   # Cargar datos de prueba
npx prisma generate                  # Regenerar Prisma Client

# Build y producción
npm run build                        # Compilar para producción
npm run start                        # Correr build de producción

# Verificación
npx tsc --noEmit                     # Verificar TypeScript sin compilar
npm run lint                         # Verificar ESLint
```

---

## 🎯 Orden de prioridad si hay que elegir

Si en algún momento hay que priorizar, este es el orden de importancia para el MVP:

1. **Auth + Layout + RLS** — Sin esto no hay nada, y sin RLS no es seguro para clientes reales
2. **Pacientes + Clientes** — El corazón del sistema
3. **Agenda** — Lo más usado en el día a día
4. **Historia Clínica** — El diferenciador real vs papel
5. **Inventario** — Crítico para no perder dinero
6. **Dashboard** — Para ver el negocio de un vistazo
7. **Facturación** — Para cobrar

---

## 🗺️ Roadmap Post-MVP / Escala (NO implementar ahora)

Estas ideas vienen de `docs/arquitectura-2026-extracto.txt` (documento de arquitectura empresarial). Son válidas y buenas, pero asumen equipo, presupuesto (~USD 32,000–58,000 según ese documento) e infraestructura paga — lo opuesto al objetivo actual de "gratis, un dev, MVP funcional". Se listan aquí para no perderlas, a retomar cuando haya clínicas pagando:

- **Backend separado en NestJS + Kubernetes** — solo tiene sentido con tráfico/equipo que justifique la complejidad operativa.
- **Redis + BullMQ** para colas y jobs asíncronos (hoy: recordatorios se pueden disparar con un cron simple, p. ej. Vercel Cron gratuito, sin cola dedicada).
- **TimescaleDB** para series de tiempo de signos vitales en hospitalización — no aplica porque Hospitalización no está en este MVP.
- **Módulos de Cirugías, Hospitalización y Laboratorio** — quedaron fuera del MVP a propósito (ver `arquitectura-2026-extracto.txt` sección 2 para su diseño completo cuando se retomen).
- **WhatsApp Business API oficial (Meta Cloud API)** — reemplazo de Twilio Sandbox cuando haya clientes reales (ver adapter ya preparado en Fase 6).
- **Facturación electrónica por país** (SRI, DIAN, SAT, SUNAT) — integraciones específicas por país, cada una es un proyecto en sí mismo.
- **RBAC granular configurable por el admin del tenant** (hoy: roles fijos vía enum `Rol`, suficiente para MVP).
- **Row Level Security real a nivel de Postgres** — hoy el aislamiento es solo a nivel de aplicación (filtro `clinicaId` en cada API route, ver Fase 1). Para defensa en profundidad real con Prisma se necesitaría: un rol Postgres restringido (no el de la conexión pooler actual, que bypassea RLS), envolver cada query en una transacción con `SET LOCAL app.clinica_id`, y políticas RLS contra `current_setting()`. Vale la pena retomarlo antes de manejar datos de clínicas piloto reales a mayor escala.
- **Multitenancy con schema-per-tenant** — reemplazaría el modelo actual (tabla compartida + filtro `clinicaId`) solo si un tenant específico necesita aislamiento físico total (ej. requerimiento contractual/legal de una clínica enterprise).
- **2FA (TOTP), audit log detallado, cifrado campo a campo** — capas de seguridad adicionales razonables antes de manejar datos sensibles a mayor escala.
- **App móvil nativa, API pública versionada, marca blanca, integraciones con aseguradoras/labs externos, FHIR veterinario.**

---

*VetCloud MVP — Construido con Next.js 14 + Prisma + Supabase + Vercel — 100% gratuito en infraestructura*
*Plan corregido y ampliado a partir de: `docs/referencia-free-tier.txt` y `docs/arquitectura-2026-extracto.txt`*
