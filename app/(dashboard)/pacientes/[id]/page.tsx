import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  Dog,
  Cat,
  Bird,
  Rabbit,
  Fish,
  Squirrel,
  Turtle,
  PawPrint,
  Stethoscope,
  AlertTriangle,
  HeartPulse,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getPacienteDetalle } from "@/lib/pacientes";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PacienteAcciones } from "@/components/pacientes/PacienteAcciones";
import { RegistrarVacunaDialog } from "@/components/pacientes/RegistrarVacunaDialog";
import { VacunaAcciones } from "@/components/pacientes/VacunaAcciones";
import { TimelineClinico } from "@/components/historia-clinica/TimelineClinico";

const ESPECIE_ICONO: Record<string, typeof Dog> = {
  PERRO: Dog,
  GATO: Cat,
  AVE: Bird,
  CONEJO: Rabbit,
  REPTIL: Turtle,
  PEZ: Fish,
  ROEDOR: Squirrel,
  OTRO: PawPrint,
};

const ESPECIE_LABEL: Record<string, string> = {
  PERRO: "Perro",
  GATO: "Gato",
  AVE: "Ave",
  CONEJO: "Conejo",
  REPTIL: "Reptil",
  PEZ: "Pez",
  ROEDOR: "Roedor",
  OTRO: "Otro",
};

function calcularEdad(fechaNacimiento: Date | null): string | null {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  let meses =
    (hoy.getFullYear() - fechaNacimiento.getFullYear()) * 12 +
    (hoy.getMonth() - fechaNacimiento.getMonth());
  if (hoy.getDate() < fechaNacimiento.getDate()) meses--;
  if (meses < 0) meses = 0;

  const años = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;

  if (años === 0) {
    return `${mesesRestantes} ${mesesRestantes === 1 ? "mes" : "meses"}`;
  }
  if (mesesRestantes === 0) {
    return `${años} ${años === 1 ? "año" : "años"}`;
  }
  return `${años} ${años === 1 ? "año" : "años"}, ${mesesRestantes} ${mesesRestantes === 1 ? "mes" : "meses"}`;
}

export default async function PacienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const paciente = await getPacienteDetalle(session!.user.clinicaId, id);

  if (!paciente) {
    notFound();
  }

  const Icono = ESPECIE_ICONO[paciente.especie] ?? PawPrint;
  const edad = calcularEdad(paciente.fechaNacimiento);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/pacientes"
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">{paciente.nombre}</h1>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            {paciente.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={paciente.fotoUrl}
                alt={paciente.nombre}
                className="size-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-24 items-center justify-center rounded-full bg-[#E1F5EE]">
                <Icono className="size-11 text-[#0F6E56]" strokeWidth={1.5} />
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-lg font-semibold text-gray-900">
                {paciente.nombre}
              </p>
              <p className="text-sm text-gray-500">
                {ESPECIE_LABEL[paciente.especie]}
                {paciente.raza ? ` · ${paciente.raza}` : ""}
                {edad ? ` · ${edad}` : ""}
              </p>
              <p className="text-sm text-gray-500">
                Propietario:{" "}
                <Link
                  href={`/clientes/${paciente.cliente.id}`}
                  className="font-medium text-[#0F6E56] hover:underline"
                >
                  {paciente.cliente.nombre} {paciente.cliente.apellido}
                </Link>
              </p>
              <p className="text-sm text-gray-500">
                {paciente.chipId ? `Chip: ${paciente.chipId} · ` : ""}
                {paciente.peso ? `Peso: ${paciente.peso} kg` : "Peso no registrado"}
              </p>

              {(paciente.alergias || paciente.condiciones) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {paciente.alergias && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF2F2] px-3 py-1 text-xs font-medium text-[#DC2626]">
                      <AlertTriangle className="size-3.5" />
                      Alergias: {paciente.alergias}
                    </span>
                  )}
                  {paciente.condiciones && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3CC] px-3 py-1 text-xs font-medium text-[#D97706]">
                      <HeartPulse className="size-3.5" />
                      Condición crónica: {paciente.condiciones}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Button asChild className="bg-[#0F6E56] hover:bg-[#1D9E75] text-white">
              <Link href={`/historia-clinica/nueva?pacienteId=${paciente.id}`}>
                <Stethoscope className="size-4" />
                Nueva consulta
              </Link>
            </Button>
            <PacienteAcciones
              pacienteId={paciente.id}
              nombre={paciente.nombre}
              clienteInicial={{
                id: paciente.cliente.id,
                label: `${paciente.cliente.nombre} ${paciente.cliente.apellido}`,
              }}
              defaultValues={{
                clienteId: paciente.clienteId,
                nombre: paciente.nombre,
                especie: paciente.especie,
                sexo: paciente.sexo,
                raza: paciente.raza ?? "",
                color: paciente.color ?? "",
                fechaNacimiento: paciente.fechaNacimiento
                  ? format(paciente.fechaNacimiento, "yyyy-MM-dd")
                  : "",
                peso: paciente.peso ? String(paciente.peso) : "",
                chipId: paciente.chipId ?? "",
                fotoUrl: paciente.fotoUrl ?? "",
                alergias: paciente.alergias ?? "",
                condiciones: paciente.condiciones ?? "",
                esterilizado: paciente.esterilizado,
                notas: paciente.notas ?? "",
              }}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="historia">
        <TabsList>
          <TabsTrigger value="historia">Historia</TabsTrigger>
          <TabsTrigger value="vacunas">Vacunas</TabsTrigger>
          <TabsTrigger value="citas">Citas</TabsTrigger>
          <TabsTrigger value="adjuntos">Adjuntos</TabsTrigger>
        </TabsList>

        <TabsContent value="historia">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <TimelineClinico historias={paciente.historias} />
          </div>
        </TabsContent>

        <TabsContent value="vacunas">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                Registro de vacunas
              </h2>
              <RegistrarVacunaDialog pacienteId={paciente.id} />
            </div>

            {paciente.vacunas.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">
                No hay vacunas registradas todavía.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vacuna</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Próxima dosis</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paciente.vacunas.map((v) => {
                    const vencida = v.proximaDosis && v.proximaDosis < new Date();
                    return (
                      <TableRow key={v.id}>
                        <TableCell>{v.nombre}</TableCell>
                        <TableCell>
                          {format(v.aplicadaEn, "d MMM yyyy", { locale: es })}
                        </TableCell>
                        <TableCell>
                          {v.proximaDosis
                            ? format(v.proximaDosis, "d MMM yyyy", { locale: es })
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {v.proximaDosis ? (
                            <span
                              className={
                                vencida
                                  ? "text-[#DC2626] font-medium"
                                  : "text-[#16A34A] font-medium"
                              }
                            >
                              {vencida ? "Vencida" : "Al día"}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <VacunaAcciones
                            vacunaId={v.id}
                            defaultValues={{
                              nombre: v.nombre,
                              lote: v.lote ?? "",
                              fabricante: v.fabricante ?? "",
                              aplicadaEn: format(v.aplicadaEn, "yyyy-MM-dd"),
                              proximaDosis: v.proximaDosis
                                ? format(v.proximaDosis, "yyyy-MM-dd")
                                : "",
                              notas: v.notas ?? "",
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="citas">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            {paciente.citas.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">
                No hay citas registradas. La agenda se construye en la
                siguiente fase.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Veterinario</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paciente.citas.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        {format(c.fechaHora, "d MMM yyyy, HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell>{c.tipo}</TableCell>
                      <TableCell>{c.veterinario.nombre}</TableCell>
                      <TableCell>{c.estado}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="adjuntos">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="py-10 text-center text-sm text-gray-400">
              Los adjuntos (radiografías, PDFs de laboratorio) se habilitan
              cuando conectemos almacenamiento de archivos, junto con la
              Historia Clínica.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
