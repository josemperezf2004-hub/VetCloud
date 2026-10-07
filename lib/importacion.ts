import ExcelJS from "exceljs";

import { prisma } from "@/lib/prisma";
import {
  ESPECIES,
  SEXOS,
  CATEGORIAS_PRODUCTO,
  clienteImportRowSchema,
  pacienteImportRowSchema,
  productoImportRowSchema,
  type ClienteImportRow,
  type PacienteImportRow,
  type ProductoImportRow,
} from "@/lib/validations";

export const ENTIDADES_IMPORTABLES = ["clientes", "pacientes", "productos"] as const;
export type EntidadImportable = (typeof ENTIDADES_IMPORTABLES)[number];

// Guardrail simple contra archivos abusivos — a esta escala (onboarding de
// una clínica) 500 filas es más que suficiente; un archivo más grande se
// rechaza de entrada con un mensaje claro en vez de tardar minutos.
const MAX_FILAS = 500;
// El timeout default de las transacciones interactivas de Prisma 7 es 5s —
// no alcanza para cientos de inserts secuenciales dentro de una sola tx.
const IMPORT_TX_TIMEOUT_MS = 60_000;

export type FilaError = { filaExcel: number; mensaje: string };
type ResultadoImport = { ok: true; creados: number } | { ok: false; errores: FilaError[] };

type ColumnaDef = {
  header: string;
  key: string;
  requerido: boolean;
  ejemplo: string | number;
  opciones?: readonly string[];
};

const COLUMNAS: Record<EntidadImportable, ColumnaDef[]> = {
  clientes: [
    { header: "Nombre*", key: "nombre", requerido: true, ejemplo: "Juan" },
    { header: "Apellido*", key: "apellido", requerido: true, ejemplo: "Pérez" },
    { header: "Teléfono*", key: "telefono", requerido: true, ejemplo: "0991234567" },
    { header: "WhatsApp", key: "whatsapp", requerido: false, ejemplo: "0991234567" },
    { header: "Email", key: "email", requerido: false, ejemplo: "juan@example.com" },
    { header: "Cédula", key: "cedula", requerido: false, ejemplo: "0102030405" },
    { header: "Dirección", key: "direccion", requerido: false, ejemplo: "Av. Siempre Viva 123" },
    { header: "Notas", key: "notas", requerido: false, ejemplo: "" },
  ],
  pacientes: [
    { header: "Teléfono del propietario*", key: "telefonoPropietario", requerido: true, ejemplo: "0991234567" },
    { header: "Nombre de la mascota*", key: "nombre", requerido: true, ejemplo: "Rex" },
    { header: "Especie*", key: "especie", requerido: true, ejemplo: "PERRO", opciones: ESPECIES },
    { header: "Raza", key: "raza", requerido: false, ejemplo: "Labrador" },
    { header: "Color", key: "color", requerido: false, ejemplo: "Café" },
    { header: "Sexo*", key: "sexo", requerido: true, ejemplo: "MACHO", opciones: SEXOS },
    { header: "Fecha de nacimiento", key: "fechaNacimiento", requerido: false, ejemplo: "2022-05-01" },
    { header: "Peso (kg)", key: "peso", requerido: false, ejemplo: 12.5 },
    { header: "Chip ID", key: "chipId", requerido: false, ejemplo: "" },
    { header: "Alergias", key: "alergias", requerido: false, ejemplo: "" },
    { header: "Condiciones crónicas", key: "condiciones", requerido: false, ejemplo: "" },
    { header: "Esterilizado (SI/NO)", key: "esterilizado", requerido: false, ejemplo: "NO", opciones: ["SI", "NO"] },
    { header: "Notas", key: "notas", requerido: false, ejemplo: "" },
  ],
  productos: [
    { header: "Nombre*", key: "nombre", requerido: true, ejemplo: "Amoxicilina 500mg" },
    { header: "SKU", key: "sku", requerido: false, ejemplo: "" },
    { header: "Categoría*", key: "categoria", requerido: true, ejemplo: "MEDICAMENTO", opciones: CATEGORIAS_PRODUCTO },
    { header: "Descripción", key: "descripcion", requerido: false, ejemplo: "" },
    { header: "Unidad", key: "unidad", requerido: false, ejemplo: "unidad" },
    { header: "Precio de venta*", key: "precioVenta", requerido: true, ejemplo: 5.5 },
    { header: "Precio de costo", key: "precioCosto", requerido: false, ejemplo: 3 },
    { header: "Stock inicial", key: "stockInicial", requerido: false, ejemplo: 0 },
    { header: "Stock mínimo", key: "stockMinimo", requerido: false, ejemplo: 5 },
  ],
};

const NOMBRE_HOJA: Record<EntidadImportable, string> = {
  clientes: "Clientes",
  pacientes: "Pacientes",
  productos: "Productos",
};

// Columnas que son "números que empiezan en 0" (teléfonos, cédula) — si la
// celda queda en formato General/Número, Excel interpreta lo que se escribe
// como un número real y borra el 0 inicial apenas se sale de la celda
// (0991234567 -> 991234567). Forzar formato de texto ("@") evita esto de
// raíz; lib/validations.ts además restaura el 0 si de todos modos llega
// como número (plantillas viejas ya descargadas antes de este fix).
const COLUMNAS_TEXTO_FORZADO = new Set(["telefono", "telefonoPropietario", "whatsapp", "cedula"]);

export async function generarPlantilla(entidad: EntidadImportable): Promise<Buffer> {
  const columnas = COLUMNAS[entidad];
  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet(NOMBRE_HOJA[entidad]);

  hoja.columns = columnas.map((c) => ({
    header: c.header,
    key: c.key,
    width: Math.max(c.header.length + 2, 16),
  }));

  const headerRow = hoja.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE1F5EE" } };
  hoja.views = [{ state: "frozen", ySplit: 1 }];

  columnas.forEach((columna, index) => {
    const colNumero = index + 1;
    const forzarTexto = COLUMNAS_TEXTO_FORZADO.has(columna.key);
    if (!columna.opciones && !forzarTexto) return;
    for (let fila = 2; fila <= MAX_FILAS + 1; fila++) {
      const celda = hoja.getCell(fila, colNumero);
      if (columna.opciones) {
        celda.dataValidation = {
          type: "list",
          allowBlank: !columna.requerido,
          formulae: [`"${columna.opciones.join(",")}"`],
        };
      }
      if (forzarTexto) {
        celda.numFmt = "@";
      }
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function contarColumnasEncabezado(headerRow: ExcelJS.Row): number {
  const MAX_COLUMNAS_A_REVISAR = 30;
  let ultimaConValor = 0;
  for (let i = 1; i <= MAX_COLUMNAS_A_REVISAR; i++) {
    const valor = headerRow.getCell(i).value;
    if (valor !== null && valor !== undefined && String(valor).trim() !== "") {
      ultimaConValor = i;
    }
  }
  return ultimaConValor;
}

async function leerFilas(
  entidad: EntidadImportable,
  buffer: Buffer
): Promise<{ filaExcel: number; valores: unknown[] }[]> {
  const columnas = COLUMNAS[entidad];
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  const hoja = workbook.worksheets[0];
  if (!hoja) {
    throw new Error("El archivo no tiene ninguna hoja de cálculo");
  }

  const columnasEncontradas = contarColumnasEncabezado(hoja.getRow(1));
  if (columnasEncontradas !== columnas.length) {
    throw new Error("Formato de archivo inesperado — descarga la plantilla de nuevo");
  }

  const filas: { filaExcel: number; valores: unknown[] }[] = [];
  hoja.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const valores = columnas.map((_, i) => row.getCell(i + 1).value);
    const vacia = valores.every((v) => v === null || v === undefined || String(v).trim() === "");
    if (!vacia) filas.push({ filaExcel: rowNumber, valores });
  });

  return filas;
}

function filaAObjeto(entidad: EntidadImportable, valores: unknown[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  COLUMNAS[entidad].forEach((columna, i) => {
    obj[columna.key] = valores[i];
  });
  return obj;
}

function validarYMapear<T>(
  entidad: EntidadImportable,
  filas: { filaExcel: number; valores: unknown[] }[],
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: { issues: { message: string }[] } } }
): { filas: (T & { filaExcel: number })[]; errores: FilaError[] } {
  if (filas.length === 0) {
    return { filas: [], errores: [{ filaExcel: 0, mensaje: "El archivo no tiene filas para importar" }] };
  }
  if (filas.length > MAX_FILAS) {
    return {
      filas: [],
      errores: [{ filaExcel: 0, mensaje: `El archivo tiene más de ${MAX_FILAS} filas — dividilo en partes más chicas` }],
    };
  }

  const errores: FilaError[] = [];
  const validas: (T & { filaExcel: number })[] = [];
  for (const fila of filas) {
    const parsed = schema.safeParse(filaAObjeto(entidad, fila.valores));
    if (!parsed.success) {
      errores.push({ filaExcel: fila.filaExcel, mensaje: parsed.error?.issues[0]?.message ?? "Datos inválidos" });
    } else {
      validas.push({ ...(parsed.data as T), filaExcel: fila.filaExcel });
    }
  }
  return { filas: validas, errores };
}

export async function importarClientes(clinicaId: string, buffer: Buffer): Promise<ResultadoImport> {
  const filasCrudas = await leerFilas("clientes", buffer);
  const { filas, errores } = validarYMapear<ClienteImportRow>(
    "clientes",
    filasCrudas,
    clienteImportRowSchema
  );
  if (errores.length) return { ok: false, errores };

  const creados = await prisma.$transaction(
    async (tx) => {
      let n = 0;
      for (const fila of filas) {
        await tx.cliente.create({
          data: {
            clinicaId,
            nombre: fila.nombre,
            apellido: fila.apellido,
            telefono: fila.telefono,
            whatsapp: fila.whatsapp ?? null,
            email: fila.email ?? null,
            cedula: fila.cedula ?? null,
            direccion: fila.direccion ?? null,
            notas: fila.notas ?? null,
          },
        });
        n++;
      }
      return n;
    },
    { timeout: IMPORT_TX_TIMEOUT_MS }
  );

  return { ok: true, creados };
}

export async function importarPacientes(clinicaId: string, buffer: Buffer): Promise<ResultadoImport> {
  const filasCrudas = await leerFilas("pacientes", buffer);
  const { filas, errores } = validarYMapear<PacienteImportRow>(
    "pacientes",
    filasCrudas,
    pacienteImportRowSchema
  );
  if (errores.length) return { ok: false, errores };

  // Pre-validación fuera de la transacción: resuelve TODOS los teléfonos de
  // una vez (un solo query) para poder devolver la lista completa de filas
  // con propietario no encontrado/ambiguo, no solo la primera que falle.
  const telefonos = [...new Set(filas.map((f) => f.telefonoPropietario))];
  const clientes = await prisma.cliente.findMany({
    where: { clinicaId, deletedAt: null, telefono: { in: telefonos } },
    select: { id: true, telefono: true },
  });
  const clientesPorTelefono = new Map<string, string[]>();
  for (const cliente of clientes) {
    const lista = clientesPorTelefono.get(cliente.telefono) ?? [];
    lista.push(cliente.id);
    clientesPorTelefono.set(cliente.telefono, lista);
  }

  const erroresFk: FilaError[] = [];
  for (const fila of filas) {
    const coincidencias = clientesPorTelefono.get(fila.telefonoPropietario) ?? [];
    if (coincidencias.length === 0) {
      erroresFk.push({
        filaExcel: fila.filaExcel,
        mensaje: `Propietario no encontrado con el teléfono ${fila.telefonoPropietario}`,
      });
    } else if (coincidencias.length > 1) {
      erroresFk.push({
        filaExcel: fila.filaExcel,
        mensaje: `El teléfono ${fila.telefonoPropietario} coincide con más de un propietario, no se puede determinar cuál`,
      });
    }
  }
  if (erroresFk.length) return { ok: false, errores: erroresFk };

  const creados = await prisma.$transaction(
    async (tx) => {
      let n = 0;
      for (const fila of filas) {
        // Re-chequeo defensivo dentro de la tx (mismo idiom que
        // app/api/pacientes/route.ts) por si el cliente fue borrado entre la
        // pre-validación de arriba y este punto.
        const cliente = await tx.cliente.findFirst({
          where: { telefono: fila.telefonoPropietario, clinicaId, deletedAt: null },
        });
        if (!cliente) {
          throw new Error(`Fila ${fila.filaExcel}: Propietario no encontrado`);
        }

        await tx.paciente.create({
          data: {
            clinicaId,
            clienteId: cliente.id,
            nombre: fila.nombre,
            especie: fila.especie,
            sexo: fila.sexo,
            raza: fila.raza ?? null,
            color: fila.color ?? null,
            fechaNacimiento: fila.fechaNacimiento ? new Date(fila.fechaNacimiento) : null,
            peso: fila.peso ?? null,
            chipId: fila.chipId ?? null,
            alergias: fila.alergias ?? null,
            condiciones: fila.condiciones ?? null,
            esterilizado: fila.esterilizado,
            notas: fila.notas ?? null,
          },
        });
        n++;
      }
      return n;
    },
    { timeout: IMPORT_TX_TIMEOUT_MS }
  );

  return { ok: true, creados };
}

export async function importarProductos(clinicaId: string, buffer: Buffer): Promise<ResultadoImport> {
  const filasCrudas = await leerFilas("productos", buffer);
  const { filas, errores } = validarYMapear<ProductoImportRow>(
    "productos",
    filasCrudas,
    productoImportRowSchema
  );
  if (errores.length) return { ok: false, errores };

  const creados = await prisma.$transaction(
    async (tx) => {
      let n = 0;
      for (const fila of filas) {
        const stockInicial = fila.stockInicial ?? 0;
        const producto = await tx.producto.create({
          data: {
            clinicaId,
            nombre: fila.nombre,
            sku: fila.sku ?? null,
            categoria: fila.categoria,
            descripcion: fila.descripcion ?? null,
            unidad: fila.unidad,
            precioVenta: fila.precioVenta,
            precioCosto: fila.precioCosto ?? null,
            stockActual: stockInicial,
            stockMinimo: fila.stockMinimo,
          },
        });

        // Misma invariante que lib/inventario.ts::crearProducto: toda unidad
        // de stock que exista siempre tiene un movimiento que la explique.
        if (stockInicial > 0) {
          await tx.movimientoInventario.create({
            data: {
              productoId: producto.id,
              tipo: "ENTRADA",
              cantidad: stockInicial,
              stockAntes: 0,
              stockDespues: stockInicial,
              motivo: "Carga inicial (importación)",
            },
          });
        }
        n++;
      }
      return n;
    },
    { timeout: IMPORT_TX_TIMEOUT_MS }
  );

  return { ok: true, creados };
}
