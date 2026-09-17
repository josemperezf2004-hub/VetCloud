import "dotenv/config";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { crearProducto } from "@/lib/inventario";
import { crearConsulta } from "@/lib/historia-clinica";
import { crearFactura } from "@/lib/facturas";
import type { ProductoInput } from "@/lib/validations";

const NOMBRES = [
  "María", "Carlos", "Ana", "Luis", "Sofía", "Diego", "Valentina", "Andrés",
  "Camila", "Javier",
];
const APELLIDOS = [
  "González", "Rodríguez", "Pérez", "López", "Martínez", "Sánchez", "Ramírez",
  "Torres", "Flores", "Rivera",
];

const NOMBRES_MASCOTAS = [
  "Rex", "Luna", "Max", "Bella", "Toby", "Nala", "Simón", "Kira", "Rocky",
  "Mia", "Thor", "Coco", "Zeus", "Lola", "Duque",
] as const;
const ESPECIES_MASCOTAS = [
  "PERRO", "GATO", "PERRO", "GATO", "AVE", "PERRO", "CONEJO", "GATO", "PERRO",
  "GATO", "PERRO", "GATO", "PERRO", "CONEJO", "GATO",
] as const;

const TIPOS_CITA_SEED = ["CONSULTA", "VACUNA", "CONTROL", "DESPARASITACION"] as const;

// 20 productos veterinarios realistas. Los marcados con stock < stockMinimo
// (Amoxicilina, Vacuna Rábica, Alimento Gato, Guantes de nitrilo,
// Desparasitante oral — 5 en total) están así a propósito, para que la
// alerta de "stock crítico" del dashboard tenga datos que mostrar apenas se
// corre el seed. Los servicios (categoría SERVICIO) llevan stock alto y
// mínimo en 0 porque no se controlan como inventario físico.
const PRODUCTOS_SEED: ProductoInput[] = [
  { nombre: "Amoxicilina 500mg", categoria: "MEDICAMENTO", unidad: "caja", precioVenta: 12.5, stockInicial: 3, stockMinimo: 5 },
  { nombre: "Meloxicam 1.5mg/ml", categoria: "MEDICAMENTO", unidad: "frasco", precioVenta: 15, stockInicial: 20, stockMinimo: 5 },
  { nombre: "Antiparasitario Frontline", categoria: "MEDICAMENTO", unidad: "pipeta", precioVenta: 18, stockInicial: 30, stockMinimo: 10 },
  { nombre: "Desparasitante oral", categoria: "MEDICAMENTO", unidad: "tableta", precioVenta: 3, stockInicial: 4, stockMinimo: 10 },
  { nombre: "Vacuna Rábica", categoria: "VACUNA", unidad: "dosis", precioVenta: 8, stockInicial: 2, stockMinimo: 10 },
  { nombre: "Vacuna Polivalente (Séxtuple)", categoria: "VACUNA", unidad: "dosis", precioVenta: 14, stockInicial: 25, stockMinimo: 10 },
  { nombre: "Vacuna Triple Felina", categoria: "VACUNA", unidad: "dosis", precioVenta: 13, stockInicial: 15, stockMinimo: 8 },
  { nombre: "Alimento Premium Perro Adulto 15kg", categoria: "ALIMENTO", unidad: "saco", precioVenta: 45, stockInicial: 10, stockMinimo: 3 },
  { nombre: "Alimento Premium Gato Adulto 7.5kg", categoria: "ALIMENTO", unidad: "saco", precioVenta: 35, stockInicial: 1, stockMinimo: 3 },
  { nombre: "Alimento Cachorro 3kg", categoria: "ALIMENTO", unidad: "saco", precioVenta: 20, stockInicial: 12, stockMinimo: 4 },
  { nombre: "Correa reforzada", categoria: "ACCESORIO", unidad: "unidad", precioVenta: 8, stockInicial: 20, stockMinimo: 5 },
  { nombre: "Colonia para mascotas", categoria: "ACCESORIO", unidad: "unidad", precioVenta: 6.5, stockInicial: 15, stockMinimo: 5 },
  { nombre: "Collar isabelino", categoria: "ACCESORIO", unidad: "unidad", precioVenta: 5, stockInicial: 10, stockMinimo: 3 },
  { nombre: "Jeringa 5ml", categoria: "INSUMO", unidad: "unidad", precioVenta: 0.5, stockInicial: 200, stockMinimo: 50 },
  { nombre: "Guantes de nitrilo (caja)", categoria: "INSUMO", unidad: "caja", precioVenta: 7, stockInicial: 0, stockMinimo: 5 },
  { nombre: "Gasas estériles", categoria: "INSUMO", unidad: "paquete", precioVenta: 3, stockInicial: 40, stockMinimo: 10 },
  { nombre: "Suero fisiológico 500ml", categoria: "INSUMO", unidad: "frasco", precioVenta: 4.5, stockInicial: 25, stockMinimo: 8 },
  { nombre: "Baño y peluquería", categoria: "SERVICIO", unidad: "servicio", precioVenta: 15, stockInicial: 999, stockMinimo: 0 },
  { nombre: "Estética completa", categoria: "SERVICIO", unidad: "servicio", precioVenta: 25, stockInicial: 999, stockMinimo: 0 },
  { nombre: "Shampoo medicado", categoria: "OTRO", unidad: "frasco", precioVenta: 9, stockInicial: 18, stockMinimo: 5 },
];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

async function main() {
  console.log("Sembrando datos de prueba...");

  // 1. Clínica — upsert por `email`, el único campo realmente @unique del
  // modelo (el enunciado original pedía "upsert por nombre", pero Clinica.nombre
  // no tiene esa restricción en el schema).
  const clinicaEmail = "demo@vetcloud.dev";
  const clinica = await prisma.clinica.upsert({
    where: { email: clinicaEmail },
    update: {},
    create: {
      nombre: "Clínica VetCloud Demo",
      email: clinicaEmail,
      telefono: "0991234567",
      direccion: "Av. Amazonas 123, Quito",
    },
  });

  // 2. Usuarios: 1 admin + 2 veterinarios
  const passwordPlano = "Demo1234!";
  const passwordHash = await bcrypt.hash(passwordPlano, 10);
  const adminEmail = "admin@vetcloud.com";

  await prisma.usuario.upsert({
    where: { clinicaId_email: { clinicaId: clinica.id, email: adminEmail } },
    update: {},
    create: {
      clinicaId: clinica.id,
      nombre: "Admin Demo",
      email: adminEmail,
      password: passwordHash,
      rol: "ADMIN",
    },
  });

  const vetsData = [
    { nombre: "Dra. Lucía Fernández", email: "lucia.fernandez@vetcloud.dev" },
    { nombre: "Dr. Martín Suárez", email: "martin.suarez@vetcloud.dev" },
  ];
  const veterinarios: Awaited<ReturnType<typeof prisma.usuario.upsert>>[] = [];
  for (const v of vetsData) {
    veterinarios.push(
      await prisma.usuario.upsert({
        where: { clinicaId_email: { clinicaId: clinica.id, email: v.email } },
        update: {},
        create: {
          clinicaId: clinica.id,
          nombre: v.nombre,
          email: v.email,
          password: passwordHash,
          rol: "VETERINARIO",
        },
      })
    );
  }

  // Idempotencia: si ya se corrió el seed antes sobre esta misma base, no
  // duplicar clientes/mascotas/citas/productos/consultas/facturas — solo
  // asegura que la clínica y los 3 usuarios existan (upsert de arriba).
  const clientesExistentes = await prisma.cliente.count({ where: { clinicaId: clinica.id } });
  if (clientesExistentes > 0) {
    console.log("Ya existen datos de seed para esta clínica — no se duplican.");
    console.log(`✅ Seed completo. Admin: ${adminEmail} / Pass: ${passwordPlano}`);
    return;
  }

  // 3. 10 propietarios
  await prisma.cliente.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      clinicaId: clinica.id,
      nombre: pick(NOMBRES, i),
      apellido: pick(APELLIDOS, i + 3),
      telefono: `09${String(10000000 + i).padStart(8, "0")}`,
      email: `${pick(NOMBRES, i).toLowerCase()}.${pick(APELLIDOS, i + 3).toLowerCase()}@ejemplo.com`,
    })),
  });
  const clientes = await prisma.cliente.findMany({
    where: { clinicaId: clinica.id },
    orderBy: { creadoEn: "asc" },
  });

  // 4. 15 mascotas, repartidas entre los propietarios
  await prisma.paciente.createMany({
    data: Array.from({ length: 15 }, (_, i) => ({
      clinicaId: clinica.id,
      clienteId: pick(clientes, i).id,
      nombre: NOMBRES_MASCOTAS[i],
      especie: ESPECIES_MASCOTAS[i],
      sexo: i % 2 === 0 ? "MACHO" : "HEMBRA",
      esterilizado: i % 3 === 0,
      peso: 3 + (i % 10) * 2,
    })),
  });
  const pacientes = await prisma.paciente.findMany({
    where: { clinicaId: clinica.id },
    orderBy: { creadoEn: "asc" },
  });

  // 5. 20 citas — mezcla de pasadas (completadas) y futuras (agendadas/confirmadas)
  const hoy = new Date();
  await prisma.cita.createMany({
    data: Array.from({ length: 20 }, (_, i) => {
      const offsetDias = i - 10;
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + offsetDias);
      fecha.setHours(9 + (i % 8), i % 2 === 0 ? 0 : 30, 0, 0);

      return {
        clinicaId: clinica.id,
        pacienteId: pick(pacientes, i).id,
        veterinarioId: pick(veterinarios, i).id,
        fechaHora: fecha,
        tipo: pick(TIPOS_CITA_SEED, i),
        estado: offsetDias < 0 ? ("COMPLETADA" as const) : i % 2 === 0 ? ("AGENDADA" as const) : ("CONFIRMADA" as const),
        motivo: "Control de rutina",
      };
    }),
  });

  // 6. 20 productos (con crearProducto — genera también el movimiento de
  // stock inicial, igual que hace la UI de Inventario)
  for (const producto of PRODUCTOS_SEED) {
    await crearProducto(clinica.id, producto);
  }
  const productos = await prisma.producto.findMany({ where: { clinicaId: clinica.id } });
  const amoxicilina = productos.find((p) => p.nombre === "Amoxicilina 500mg")!;

  // 7. 5 consultas (con crearConsulta — la primera con una prescripción real,
  // que descuenta inventario igual que en la Fase 6)
  for (let i = 0; i < 5; i++) {
    const paciente = pick(pacientes, i);
    const veterinario = pick(veterinarios, i);
    await crearConsulta(clinica.id, veterinario.id, {
      pacienteId: paciente.id,
      peso: "8.5",
      temperatura: "38.5",
      motivoConsulta: "Chequeo general",
      diagnostico: "Paciente sano, sin hallazgos relevantes",
      plan: "Control en 6 meses",
      prescripciones:
        i === 0
          ? [
              {
                productoId: amoxicilina.id,
                productoNombre: amoxicilina.nombre,
                cantidad: 1,
                dosis: "1 tableta",
                frecuencia: "Cada 12 horas",
                diasTratamiento: "5 días",
              },
            ]
          : [],
    });
  }

  // 8. 2 facturas (con crearFactura — numeración F-{año}-{secuencial} real)
  for (let i = 0; i < 2; i++) {
    await crearFactura(clinica.id, {
      clienteId: pick(clientes, i).id,
      items: [{ descripcion: "Consulta veterinaria", cantidad: 1, precioUnit: 20 }],
      descuento: 0,
    });
  }

  console.log(`✅ Seed completo. Admin: ${adminEmail} / Pass: ${passwordPlano}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
