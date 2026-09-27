import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerClinicaSchema = z.object({
  clinicaNombre: z.string().min(2, "Ingresa el nombre de la clínica"),
  clinicaEmail: z.string().email("Email de clínica inválido"),
  clinicaTelefono: z.string().optional(),
  adminNombre: z.string().min(2, "Ingresa tu nombre"),
  adminEmail: z.string().email("Email inválido"),
  adminPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type RegisterClinicaInput = z.infer<typeof registerClinicaSchema>;

export const recuperarPasswordSchema = z.object({
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
});

export type RecuperarPasswordInput = z.infer<typeof recuperarPasswordSchema>;

export const restablecerPasswordSchema = z.object({
  token: z.string().min(1, "Token inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type RestablecerPasswordInput = z.infer<typeof restablecerPasswordSchema>;

export const clienteSchema = z.object({
  nombre: z.string().min(2, "Ingresa el nombre"),
  apellido: z.string().min(2, "Ingresa el apellido"),
  telefono: z.string().min(7, "Ingresa un teléfono válido"),
  whatsapp: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  cedula: z.string().optional().or(z.literal("")),
  direccion: z.string().optional().or(z.literal("")),
  notas: z.string().optional().or(z.literal("")),
});

export type ClienteInput = z.infer<typeof clienteSchema>;

export const ESPECIES = [
  "PERRO",
  "GATO",
  "AVE",
  "CONEJO",
  "REPTIL",
  "PEZ",
  "ROEDOR",
  "OTRO",
] as const;

export const SEXOS = ["MACHO", "HEMBRA", "DESCONOCIDO"] as const;

export const pacienteSchema = z.object({
  clienteId: z.string().min(1, "Selecciona un propietario"),
  nombre: z.string().min(1, "Ingresa el nombre de la mascota"),
  especie: z.enum(ESPECIES, { message: "Selecciona una especie" }),
  raza: z.string().optional().or(z.literal("")),
  color: z.string().optional().or(z.literal("")),
  sexo: z.enum(SEXOS, { message: "Selecciona el sexo" }),
  fechaNacimiento: z.string().optional().or(z.literal("")),
  peso: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || !isNaN(Number(v)), "Peso inválido"),
  chipId: z.string().optional().or(z.literal("")),
  fotoUrl: z.string().optional().or(z.literal("")),
  alergias: z.string().optional().or(z.literal("")),
  condiciones: z.string().optional().or(z.literal("")),
  esterilizado: z.boolean(),
  notas: z.string().optional().or(z.literal("")),
});

export type PacienteInput = z.infer<typeof pacienteSchema>;

export const vacunaSchema = z.object({
  nombre: z.string().min(1, "Ingresa el nombre de la vacuna"),
  lote: z.string().optional().or(z.literal("")),
  fabricante: z.string().optional().or(z.literal("")),
  aplicadaEn: z.string().min(1, "Ingresa la fecha de aplicación"),
  proximaDosis: z.string().optional().or(z.literal("")),
  notas: z.string().optional().or(z.literal("")),
});

export type VacunaInput = z.infer<typeof vacunaSchema>;

export const TIPOS_CITA = [
  "CONSULTA",
  "VACUNA",
  "CIRUGIA",
  "CONTROL",
  "URGENCIA",
  "DESPARASITACION",
  "GROOMING",
  "OTRO",
] as const;

export const ESTADOS_CITA = [
  "AGENDADA",
  "CONFIRMADA",
  "EN_ESPERA",
  "EN_CONSULTA",
  "COMPLETADA",
  "CANCELADA",
  "NO_ASISTIO",
] as const;

export const citaSchema = z.object({
  pacienteId: z.string().min(1, "Selecciona una mascota"),
  veterinarioId: z.string().min(1, "Selecciona un veterinario"),
  fechaHora: z
    .string()
    .min(1, "Selecciona fecha y hora")
    .refine((v) => !isNaN(Date.parse(v)), "Fecha u hora inválida"),
  duracionMin: z
    .number({ message: "Duración inválida" })
    .int()
    .min(5, "Mínimo 5 minutos")
    .max(480, "Máximo 8 horas"),
  tipo: z.enum(TIPOS_CITA, { message: "Selecciona un tipo de cita" }),
  motivo: z.string().optional().or(z.literal("")),
  notas: z.string().optional().or(z.literal("")),
});

export type CitaInput = z.infer<typeof citaSchema>;

export const citaEditSchema = citaSchema.extend({
  estado: z.enum(ESTADOS_CITA).optional(),
});

export type CitaEditInput = z.infer<typeof citaEditSchema>;

export const citaEstadoSchema = z.object({
  estado: z.enum(ESTADOS_CITA, { message: "Estado inválido" }),
});

export type CitaEstadoInput = z.infer<typeof citaEstadoSchema>;

// La "cantidad" no viene en el enunciado original del plan (que solo pedía
// dosis/frecuencia/días de tratamiento, datos de cómo el propietario administra
// el medicamento en casa) — pero sin ella es imposible descontar del inventario
// real, que es un requisito explícito de esta fase. Se agrega como el único
// campo numérico obligatorio de la prescripción.
export const prescripcionItemSchema = z.object({
  productoId: z.string().min(1, "Selecciona un producto"),
  productoNombre: z.string().min(1),
  cantidad: z
    .number({ message: "Ingresa la cantidad" })
    .positive("La cantidad debe ser mayor a 0"),
  dosis: z.string().optional().or(z.literal("")),
  frecuencia: z.string().optional().or(z.literal("")),
  diasTratamiento: z.string().optional().or(z.literal("")),
  notas: z.string().optional().or(z.literal("")),
});

export type PrescripcionItemInput = z.infer<typeof prescripcionItemSchema>;

export const consultaSchema = z.object({
  pacienteId: z.string().min(1, "Paciente requerido"),
  citaId: z.string().optional().or(z.literal("")),
  peso: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || !isNaN(Number(v)), "Peso inválido"),
  temperatura: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || !isNaN(Number(v)), "Temperatura inválida"),
  frecuenciaCardiaca: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || !isNaN(Number(v)), "FC inválida"),
  frecuenciaRespiratoria: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || !isNaN(Number(v)), "FR inválida"),
  motivoConsulta: z.string().min(1, "Ingresa el motivo de la consulta"),
  anamnesis: z.string().optional().or(z.literal("")),
  examenFisico: z.string().optional().or(z.literal("")),
  diagnostico: z.string().min(1, "Ingresa el diagnóstico"),
  plan: z.string().optional().or(z.literal("")),
  prescripciones: z.array(prescripcionItemSchema),
  notas: z.string().optional().or(z.literal("")),
});

export type ConsultaInput = z.infer<typeof consultaSchema>;

// Editar una consulta ya guardada no puede volver a tocar prescripciones/inventario
// (ya se descontó stock en el momento de crearla; corregir un movimiento se hace
// desde Inventario en la Fase 7) — el PUT solo permite corregir el texto clínico.
export const consultaEditSchema = consultaSchema.omit({
  pacienteId: true,
  citaId: true,
  prescripciones: true,
});

export type ConsultaEditInput = z.infer<typeof consultaEditSchema>;

export const CATEGORIAS_PRODUCTO = [
  "MEDICAMENTO",
  "VACUNA",
  "ALIMENTO",
  "ACCESORIO",
  "EQUIPO",
  "INSUMO",
  "SERVICIO",
  "OTRO",
] as const;

// `stockInicial` solo aplica al crear un producto (carga inicial de inventario);
// el endpoint de edición usa `productoEditSchema`, que la omite — el stock ya
// existente solo se corrige registrando un movimiento, nunca escribiendo el
// campo directo, para no perder el rastro de auditoría en MovimientoInventario.
export const productoSchema = z.object({
  nombre: z.string().min(2, "Ingresa el nombre"),
  sku: z.string().optional().or(z.literal("")),
  categoria: z.enum(CATEGORIAS_PRODUCTO, { message: "Selecciona una categoría" }),
  descripcion: z.string().optional().or(z.literal("")),
  unidad: z.string().min(1, "Ingresa la unidad"),
  precioVenta: z
    .number({ message: "Ingresa el precio de venta" })
    .nonnegative("El precio no puede ser negativo"),
  precioCosto: z
    .number()
    .nonnegative("El costo no puede ser negativo")
    .optional(),
  stockInicial: z
    .number()
    .nonnegative("El stock inicial no puede ser negativo")
    .optional(),
  stockMinimo: z
    .number({ message: "Ingresa el stock mínimo" })
    .nonnegative("El stock mínimo no puede ser negativo"),
});

export type ProductoInput = z.infer<typeof productoSchema>;

export const productoEditSchema = productoSchema.omit({ stockInicial: true });

export type ProductoEditInput = z.infer<typeof productoEditSchema>;

// El schema no define semántica de "ajuste" (¿delta o valor absoluto?) y el
// plan de esta fase solo exige registrar entradas de stock — se deja AJUSTE
// fuera del formulario manual en vez de inventar un comportamiento, y se
// admite también SALIDA porque es el complemento simétrico e igual de
// inequívoco (resta la cantidad indicada).
export const TIPOS_MOVIMIENTO_MANUAL = ["ENTRADA", "SALIDA"] as const;

export const movimientoSchema = z.object({
  productoId: z.string().min(1, "Selecciona un producto"),
  tipo: z.enum(TIPOS_MOVIMIENTO_MANUAL, {
    message: "Selecciona el tipo de movimiento",
  }),
  cantidad: z
    .number({ message: "Ingresa la cantidad" })
    .positive("La cantidad debe ser mayor a 0"),
  lote: z.string().optional().or(z.literal("")),
  vencimiento: z.string().optional().or(z.literal("")),
  costo: z.number().nonnegative("El costo no puede ser negativo").optional(),
  motivo: z.string().optional().or(z.literal("")),
});

export type MovimientoInput = z.infer<typeof movimientoSchema>;

export const METODOS_PAGO = ["EFECTIVO", "TARJETA", "TRANSFERENCIA", "QR", "OTRO"] as const;

export const ESTADOS_FACTURA = ["PENDIENTE", "PAGADA", "CANCELADA", "ANULADA"] as const;

// `productoId` es opcional a propósito: un item de factura puede ser un
// producto real del inventario (para trazabilidad) o un cargo libre como
// "Consulta veterinaria" que no existe como Producto — la factura no debe
// forzar a crear un producto de inventario solo para poder cobrar un servicio.
export const facturaItemSchema = z.object({
  productoId: z.string().optional().or(z.literal("")),
  descripcion: z.string().min(1, "Ingresa una descripción"),
  cantidad: z
    .number({ message: "Ingresa la cantidad" })
    .positive("La cantidad debe ser mayor a 0"),
  precioUnit: z
    .number({ message: "Ingresa el precio unitario" })
    .nonnegative("El precio no puede ser negativo"),
});

export type FacturaItemInput = z.infer<typeof facturaItemSchema>;

export const facturaSchema = z.object({
  clienteId: z.string().min(1, "Selecciona un propietario"),
  items: z.array(facturaItemSchema).min(1, "Agrega al menos un item"),
  descuento: z.number().nonnegative("El descuento no puede ser negativo"),
  notas: z.string().optional().or(z.literal("")),
});

export type FacturaInput = z.infer<typeof facturaSchema>;

// El estado solo se cambia por dos vías controladas, nunca con un PUT
// genérico de "estado libre": registrar el pago (PENDIENTE -> PAGADA, exige
// método de pago) o anular/cancelar. Pasar a PAGADA sin método de pago, o
// "reabrir" una factura ya pagada, no son casos que el checklist de esta
// fase pida — se dejan fuera para no inventar semántica de reversión.
export const facturaPagoSchema = z.object({
  metodoPago: z.enum(METODOS_PAGO, { message: "Selecciona el método de pago" }),
});

export type FacturaPagoInput = z.infer<typeof facturaPagoSchema>;

export const facturaCancelacionSchema = z.object({
  estado: z.enum(["CANCELADA", "ANULADA"], { message: "Estado inválido" }),
});

export type FacturaCancelacionInput = z.infer<typeof facturaCancelacionSchema>;

export const clinicaConfigSchema = z.object({
  nombre: z.string().min(2, "Ingresa el nombre de la clínica"),
  telefono: z.string().optional().or(z.literal("")),
  direccion: z.string().optional().or(z.literal("")),
});

export type ClinicaConfigInput = z.infer<typeof clinicaConfigSchema>;

// La contraseña es opcional: solo se actualiza si el usuario escribe una
// nueva. Vacía u omitida significa "no cambiar la contraseña actual".
export const cuentaConfigSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre"),
  nuevaPassword: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || v.length >= 8,
      "La contraseña debe tener al menos 8 caracteres"
    ),
});

export type CuentaConfigInput = z.infer<typeof cuentaConfigSchema>;

// ─── IMPORTACIÓN MASIVA (EXCEL) ─────────────────────────────────────────────
// A diferencia de los schemas de arriba (que asumen un <input> ya tipado como
// string), estas filas vienen de celdas de Excel: pueden llegar como string,
// number, boolean, Date, un objeto richText, o null/undefined (celda vacía).
// z.preprocess normaliza cada celda antes de validar. Reusa ESPECIES/SEXOS/
// CATEGORIAS_PRODUCTO de arriba como única fuente de verdad de los enums, en
// vez de duplicar las listas.

function normalizarCelda(valor: unknown): unknown {
  if (valor === null || valor === undefined) return undefined;
  if (valor instanceof Date) return valor;
  if (typeof valor === "object") {
    if ("richText" in valor) {
      const texto = (valor as { richText: { text: string }[] }).richText
        .map((r) => r.text)
        .join("")
        .trim();
      return texto === "" ? undefined : texto;
    }
    if ("text" in valor) {
      const texto = String((valor as { text: unknown }).text).trim();
      return texto === "" ? undefined : texto;
    }
    return undefined;
  }
  if (typeof valor === "string") {
    const texto = valor.trim();
    return texto === "" ? undefined : texto;
  }
  return valor;
}

function celdaANumero(valor: unknown): unknown {
  const normalizado = normalizarCelda(valor);
  if (normalizado === undefined) return undefined;
  if (typeof normalizado === "number") return normalizado;
  const parsed = Number(String(normalizado).replace(",", "."));
  return Number.isNaN(parsed) ? normalizado : parsed;
}

const celdaTextoOpcional = z.preprocess(normalizarCelda, z.string().optional());

function celdaEnum<T extends readonly [string, ...string[]]>(valores: T, label: string) {
  return z.preprocess((valor) => {
    const normalizado = normalizarCelda(valor);
    return typeof normalizado === "string" ? normalizado.toUpperCase() : normalizado;
  }, z.enum(valores, { message: `${label} inválida (usa: ${valores.join(", ")})` }));
}

const celdaBooleanoSiNo = z.preprocess((valor) => {
  const normalizado = normalizarCelda(valor);
  if (normalizado === undefined) return false;
  if (typeof normalizado === "boolean") return normalizado;
  return ["SI", "SÍ", "1", "TRUE", "X"].includes(String(normalizado).toUpperCase());
}, z.boolean());

const celdaNumeroOpcional = z.preprocess(
  celdaANumero,
  z.number("Debe ser un número").nonnegative("No puede ser negativo").optional()
);

export const clienteImportRowSchema = z.object({
  nombre: z.preprocess(normalizarCelda, z.string("Falta el nombre").min(2, "El nombre es muy corto")),
  apellido: z.preprocess(normalizarCelda, z.string("Falta el apellido").min(2, "El apellido es muy corto")),
  telefono: z.preprocess(normalizarCelda, z.string("Falta el teléfono").min(7, "Teléfono inválido")),
  whatsapp: celdaTextoOpcional,
  email: z.preprocess(normalizarCelda, z.string().email("Email inválido").optional()),
  cedula: celdaTextoOpcional,
  direccion: celdaTextoOpcional,
  notas: celdaTextoOpcional,
});

export type ClienteImportRow = z.infer<typeof clienteImportRowSchema>;

export const pacienteImportRowSchema = z.object({
  telefonoPropietario: z.preprocess(
    normalizarCelda,
    z.string("Falta el teléfono del propietario").min(7, "Teléfono del propietario inválido")
  ),
  nombre: z.preprocess(normalizarCelda, z.string("Falta el nombre de la mascota").min(1, "Falta el nombre de la mascota")),
  especie: celdaEnum(ESPECIES, "Especie"),
  raza: celdaTextoOpcional,
  color: celdaTextoOpcional,
  sexo: celdaEnum(SEXOS, "Sexo"),
  fechaNacimiento: z.preprocess((valor) => {
    const normalizado = normalizarCelda(valor);
    if (normalizado === undefined) return undefined;
    return normalizado instanceof Date ? normalizado.toISOString() : String(normalizado);
  }, z.string().optional()),
  peso: celdaNumeroOpcional,
  chipId: celdaTextoOpcional,
  alergias: celdaTextoOpcional,
  condiciones: celdaTextoOpcional,
  esterilizado: celdaBooleanoSiNo,
  notas: celdaTextoOpcional,
});

export type PacienteImportRow = z.infer<typeof pacienteImportRowSchema>;

export const productoImportRowSchema = z.object({
  nombre: z.preprocess(normalizarCelda, z.string("Falta el nombre").min(2, "El nombre es muy corto")),
  sku: celdaTextoOpcional,
  categoria: celdaEnum(CATEGORIAS_PRODUCTO, "Categoría"),
  descripcion: celdaTextoOpcional,
  unidad: z.preprocess((valor) => normalizarCelda(valor) ?? "unidad", z.string().min(1)),
  precioVenta: z.preprocess(
    celdaANumero,
    z.number("Falta el precio de venta").nonnegative("El precio no puede ser negativo")
  ),
  precioCosto: celdaNumeroOpcional,
  stockInicial: celdaNumeroOpcional,
  stockMinimo: z.preprocess(
    celdaANumero,
    z.number("Debe ser un número").nonnegative("El stock mínimo no puede ser negativo").default(5)
  ),
});

export type ProductoImportRow = z.infer<typeof productoImportRowSchema>;
