"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { EntidadImportable } from "@/lib/importacion";

type FilaError = { filaExcel: number; mensaje: string };

const TITULOS: Record<EntidadImportable, string> = {
  clientes: "Clientes",
  pacientes: "Pacientes",
  productos: "Productos",
};

function ImportarTab({ entidad }: { entidad: EntidadImportable }) {
  const router = useRouter();
  const [archivo, setArchivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState<FilaError[] | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!archivo) return;

    setLoading(true);
    setErrores(null);
    try {
      const formData = new FormData();
      formData.append("entidad", entidad);
      formData.append("archivo", archivo);

      const res = await fetch("/api/configuracion/importar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (Array.isArray(data.filas)) {
          setErrores(data.filas);
        } else {
          toast.error("No se pudo importar el archivo", { description: data.error });
        }
        return;
      }

      toast.success(`Se importaron ${data.creados} registros`);
      setArchivo(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={`/api/configuracion/importar/plantilla?entidad=${entidad}`}
          download
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-gray-200 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Download className="size-4" />
          Descargar plantilla
        </a>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => {
            setArchivo(e.target.files?.[0] ?? null);
            setErrores(null);
          }}
          className="text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
        />
        <Button
          type="submit"
          disabled={!archivo || loading}
          className="bg-[#0F6E56] hover:bg-[#1D9E75] text-white"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Importar
        </Button>
      </form>

      <p className="text-xs text-gray-500">
        Completa la plantilla y súbela aquí. Si una fila tiene un error, no se importa nada — revisa la lista de
        errores, corrige el archivo y vuelve a subirlo. El sistema no detecta filas duplicadas, así que revisa tu
        archivo antes de subirlo.
      </p>

      {errores && errores.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-lg bg-[#DC2626]/10 p-3 text-sm text-[#DC2626]">
            No se importó ningún registro. Corrige los errores en tu archivo y vuelve a subirlo.
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fila</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errores.map((error, i) => (
                <TableRow key={i}>
                  <TableCell>{error.filaExcel > 0 ? error.filaExcel : "-"}</TableCell>
                  <TableCell>{error.mensaje}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export function ImportarDatosCard() {
  return (
    <Tabs defaultValue="clientes">
      <TabsList>
        <TabsTrigger value="clientes">{TITULOS.clientes}</TabsTrigger>
        <TabsTrigger value="pacientes">{TITULOS.pacientes}</TabsTrigger>
        <TabsTrigger value="productos">{TITULOS.productos}</TabsTrigger>
      </TabsList>

      <TabsContent value="clientes" className="pt-4">
        <ImportarTab entidad="clientes" />
      </TabsContent>
      <TabsContent value="pacientes" className="pt-4">
        <p className="mb-3 text-xs text-gray-500">
          Los propietarios deben existir primero — importa el archivo de Clientes antes si son nuevos.
        </p>
        <ImportarTab entidad="pacientes" />
      </TabsContent>
      <TabsContent value="productos" className="pt-4">
        <ImportarTab entidad="productos" />
      </TabsContent>
    </Tabs>
  );
}
