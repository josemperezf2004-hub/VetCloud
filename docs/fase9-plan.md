# Fase 9 — Pulido final y despliegue: estado y plan

> Documento de trabajo para revisar el avance de la Fase 9 y lo que falta. No reemplaza a `CLAUDE.md` (que sigue siendo la fuente de verdad del proyecto) — es un resumen de esta etapa puntual.

---

## 1. Ya completado y verificado en esta sesión

Verificado con `npx tsc --noEmit`, `npm run lint` y `npm run build` limpios después de cada bloque.

### 1.1 EmptyState compartido
- `components/shared/EmptyState.tsx` — ícono + título + descripción + CTA opcional.
- Aplicado en los listados de Clientes, Pacientes, Inventario y Facturación (antes mostraban un simple texto centrado).
- Se agregó además un **índice nuevo de Historia Clínica** (`app/(dashboard)/historia-clinica/page.tsx` + `lib/historia-clinica.ts::listarHistoriasClinica`) porque el link del sidebar a `/historia-clinica` no tenía página real desde la Fase 6 (daba 404) — se aprovechó para darle también su EmptyState.

### 1.2 Navegación mobile
- El `Sidebar` (`components/layout/Sidebar.tsx`) es `hidden md:flex` desde la Fase 1 — por debajo de 768px no había ninguna forma de navegar entre secciones.
- Se creó `components/layout/nav-items.ts` (constantes compartidas, sin `"use client"`) y `components/layout/MobileNav.tsx` (un drawer con `Dialog` de shadcn, ya que no había un componente `Sheet` instalado), disparado desde un botón hamburguesa en `Header.tsx`.

### 1.3 Auditoría de aislamiento por `clinicaId` — **sin hallazgos**
Se revisó cada query de Prisma en `app/api/**/route.ts` y en todos los `lib/*.ts`. Resultado: todas las mutaciones validan que el recurso pertenece a `session.user.clinicaId` antes de leer/escribir (patrón "check-then-act"), todos los `create` escriben `clinicaId` desde la sesión (nunca desde el body del cliente), y no hay IDOR. Único punto opcional de defensa-en-profundidad (no es una fuga real): `lib/facturas.ts::getBorradorDesdeConsulta` podría agregar `clinicaId` explícito a un `producto.findMany` que hoy depende transitivamente de una validación previa.

### 1.4 Auditoría de responsive (768px / 375px) + fixes aplicados

| Hallazgo | Severidad | Archivo | Fix aplicado |
|---|---|---|---|
| Header de Clientes se desborda en mobile (buscador de ancho fijo + botón, sin `flex-wrap`) | HIGH | `app/(dashboard)/clientes/page.tsx`, `components/clientes/BuscadorClientes.tsx` | `flex-wrap` en el contenedor + buscador `w-full sm:w-72` |
| Header de Inventario se desborda peor (3 elementos, sin `flex-wrap`) | HIGH | `app/(dashboard)/inventario/page.tsx`, `components/inventario/BuscadorProductos.tsx` | Igual patrón, buscador `w-full sm:w-64` |
| Tabs de categoría sin scroll, se desbordan | HIGH | `components/inventario/CategoriaTabs.tsx` | `overflow-x-auto` + `shrink-0 whitespace-nowrap` en cada tab |
| Calendario semanal (7 columnas) ilegible/intocable en mobile | HIGH | `components/agenda/CalendarioSemanal.tsx` | Envuelto en `overflow-x-auto` + `min-w-[640px]` interno, en vez de comprimir columnas |
| Grid de items de factura sin fallback mobile | MEDIUM | `components/facturacion/FacturaItemsForm.tsx` | `grid-cols-1 sm:grid-cols-3` (antes `grid-cols-3` fijo) |
| Tabla de items en detalle de factura era HTML crudo, sin scroll de respaldo | MEDIUM | `app/(dashboard)/facturacion/[id]/page.tsx` | Migrada al componente `Table` compartido (`components/ui/table.tsx`, que ya trae `overflow-x-auto` incorporado) |
| Grid de 6 stats del dashboard nunca colapsaba a 1 columna | MEDIUM | `app/(dashboard)/page.tsx` | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6` |
| Tooltip del gráfico de ingresos solo con hover (inalcanzable por touch) | MEDIUM | `components/dashboard/EvolucionIngresos.tsx` | Se agregó `onClick` para alternar el tooltip, además del hover |
| Buscador de Historia Clínica con ancho fijo | LOW | `components/historia-clinica/BuscadorHistorias.tsx` | `w-full sm:w-72` (consistencia) |

Confirmado que **no** son un problema: los anchos de los `Dialog` (`sm:max-w-lg` etc. degradan bien por debajo de `sm`), el resto de los grids de stats (ya colapsaban bien), y cualquier tabla que ya usara el componente `Table` compartido (viene con scroll horizontal de fábrica).

---

## 2. Pendiente — plan concreto

### 2.1 `loading.tsx` por ruta
Ya existe `app/(dashboard)/loading.tsx` (Fase 2) como referencia de patrón (`Skeleton` de `components/ui/skeleton.tsx` imitando el layout real). Crear el mismo tipo de archivo — sin lógica, server component simple — solo en el nivel de listado de cada módulo (no en `nueva/` ni `[id]/`):

- `app/(dashboard)/clientes/loading.tsx`
- `app/(dashboard)/pacientes/loading.tsx`
- `app/(dashboard)/agenda/loading.tsx`
- `app/(dashboard)/historia-clinica/loading.tsx`
- `app/(dashboard)/inventario/loading.tsx`
- `app/(dashboard)/facturacion/loading.tsx`

Cada uno imita a grandes rasgos su página real (título + barra de filtros/búsqueda + tabla o grid de cards, o stat cards donde aplique).

### 2.2 `error.tsx`
Convención de Next.js App Router: Client Component (`"use client"`), recibe `{ error, reset }`. Un solo `app/(dashboard)/error.tsx` alcanza (cubre cualquier error de render dentro del dashboard); no hace falta un `global-error.tsx` de raíz (eso es solo para errores catastróficos del layout raíz, sin antecedente de necesitarlo aquí).

Contenido: mensaje claro + botón "Reintentar" (`reset()`) con el estilo de marca + link "Volver al inicio", `console.error(error)` en un `useEffect` (no hay servicio de logging externo en el stack). No se agrega `not-found.tsx` custom — el fallback de Next.js ya cubre eso y no hay antecedente de necesitarlo.

### 2.3 Seed de datos (`prisma/seed.ts`)
Prisma 7 configura el seed en `prisma.config.ts` (campo `migrations.seed`, un comando shell), no en `package.json` como en versiones anteriores. Ni `tsx` ni `ts-node` están instalados todavía.

1. `npm install -D tsx`
2. Agregar `seed: "tsx prisma/seed.ts"` al bloque `migrations` de `prisma.config.ts`.
3. Escribir `prisma/seed.ts` reusando la lógica de negocio ya existente en vez de reinventarla:
   - `crearProducto` (`lib/inventario.ts`) para los 20 productos — varios a propósito con stock por debajo del mínimo, para que la alerta del dashboard tenga datos.
   - `crearConsulta` (`lib/historia-clinica.ts`) para las 5 consultas, al menos una con prescripción real.
   - `crearFactura` (`lib/facturas.ts`) para un par de facturas de ejemplo.
   - El resto (Clinica, 2 veterinarios + admin, 10 propietarios, 15 mascotas, 20 citas) con `prisma.create`/`createMany` directo. Contraseña del admin hasheada con `bcryptjs` igual que `lib/auth.ts`, impresa por consola al final para poder loguearse.
   - Nombres de ejemplo hand-written en español (sin agregar `faker` como dependencia nueva).
4. Correr con `npx prisma db seed` contra la base de desarrollo real (no se corre automático contra producción).

### 2.4 Despliegue — con paradas de confirmación

No hay `.git` todavía en el proyecto, ni `gh` ni `vercel` CLI instalados. El `.gitignore` ya está correcto (excluye `.env*`, `node_modules`, `.next`, `app/generated/prisma`).

1. `git init` + commit inicial — local y reversible, no requiere permiso previo.
2. ⏸ **Confirmar con el usuario**: ¿ya existe un repo vacío en GitHub, o hay que crear uno? No se toca su cuenta de GitHub sin que lo pida explícitamente.
3. `git remote add origin <url>` + push, una vez haya URL real.
4. ⏸ **Confirmar con el usuario**: ¿conectar el repo desde el dashboard de Vercel (recomendado, auto-deploy en cada push) o `vercel --prod` por CLI (requiere login interactivo del usuario)?
5. Variables de entorno a cargar en Vercel: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, y **`NEXTAUTH_URL` apuntando a la URL real de producción** (no `localhost`) — fácil de olvidar y rompe el login si se deja el valor local.
6. Verificación final: login real contra la URL pública, revisar que no haya errores de consola.

---

## 3. Verificación de todo lo anterior

- `tsc` / `lint` / `build` limpios (ya rutina en cada fase).
- Navegar cada ruta nueva de `loading.tsx` para confirmar que el skeleton se ve razonable.
- Forzar un error de prueba para confirmar que `error.tsx` lo captura y "Reintentar" funciona, luego revertir.
- Correr el seed contra la base real y confirmar en la UI que aparecen los datos (incluida la alerta de stock bajo) y que se puede iniciar sesión con el admin de prueba.
- El despliegue se verifica con el login real en la URL de producción (paso 6 de la sección 2.4).
