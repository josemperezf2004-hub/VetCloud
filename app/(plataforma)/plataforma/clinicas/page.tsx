import { format } from "date-fns";
import { es } from "date-fns/locale";

import { listarClinicasPlataforma } from "@/lib/plataforma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClinicaAcciones } from "@/components/plataforma/ClinicaAcciones";

export default async function ClinicasPlataformaPage() {
  const clinicas = await listarClinicasPlataforma();

  function estadoDe(clinica: (typeof clinicas)[number]) {
    if (!clinica.suscripcionVenceEn)
      return { label: "Nunca pagó", className: "bg-gray-100 text-gray-600" };
    if (!clinica.activa)
      return { label: "Desactivada", className: "bg-[#DC2626]/10 text-[#DC2626]" };
    if (clinica.suscripcionVenceEn < new Date())
      return { label: "Vencida", className: "bg-[#D97706]/10 text-[#D97706]" };
    return { label: "Al día", className: "bg-[#16A34A]/10 text-[#16A34A]" };
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Clínicas</h1>
        <p className="text-sm text-gray-500">
          Confirmá pagos de mensualidad para activar el acceso de cada clínica.
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clínica</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Usuarios</TableHead>
              <TableHead>Vence</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clinicas.map((clinica) => {
              const estado = estadoDe(clinica);
              return (
                <TableRow key={clinica.id}>
                  <TableCell className="font-medium text-gray-900">
                    {clinica.nombre}
                  </TableCell>
                  <TableCell className="text-gray-500">{clinica.email}</TableCell>
                  <TableCell className="text-gray-500">
                    {clinica._count.usuarios}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {clinica.suscripcionVenceEn
                      ? format(clinica.suscripcionVenceEn, "d MMM yyyy", { locale: es })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={estado.className}>{estado.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ClinicaAcciones clinicaId={clinica.id} activa={clinica.activa} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
