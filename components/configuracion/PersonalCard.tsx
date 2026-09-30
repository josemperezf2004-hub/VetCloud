"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { invitarUsuarioSchema, type InvitarUsuarioInput, ROLES_STAFF } from "@/lib/validations";
import { ROL_LABELS } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type PersonaPersonal = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  pendiente: boolean;
};

type PersonalCardProps = {
  initialPersonal: PersonaPersonal[];
  initialActivos: number;
  maxActivos: number;
};

export function PersonalCard({ initialPersonal, initialActivos, maxActivos }: PersonalCardProps) {
  const router = useRouter();
  const [personal, setPersonal] = useState<PersonaPersonal[]>(initialPersonal);
  const [activos, setActivos] = useState(initialActivos);
  const [enviando, setEnviando] = useState(false);
  const [accionId, setAccionId] = useState<string | null>(null);

  const form = useForm<InvitarUsuarioInput>({
    resolver: zodResolver(invitarUsuarioSchema),
    defaultValues: { nombre: "", email: "", rol: "RECEPCIONISTA" },
  });

  async function recargar() {
    const res = await fetch("/api/configuracion/personal");
    if (!res.ok) return;
    const data = await res.json();
    setPersonal(data.personal);
    setActivos(data.activos);
  }

  async function handleInvitar(values: InvitarUsuarioInput) {
    setEnviando(true);
    try {
      const res = await fetch("/api/configuracion/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error("No se pudo enviar la invitación", { description: data.error });
        return;
      }

      toast.success(`Invitación enviada a ${values.email}`);
      form.reset({ nombre: "", email: "", rol: "RECEPCIONISTA" });
      await recargar();
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  async function handleAccion(id: string, body: Record<string, unknown>, mensajeOk: string) {
    setAccionId(id);
    try {
      const res = await fetch(`/api/configuracion/personal/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error("No se pudo aplicar el cambio", { description: data.error });
        return;
      }

      toast.success(mensajeOk);
      await recargar();
    } finally {
      setAccionId(null);
    }
  }

  const alcanzoTope = activos >= maxActivos;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-gray-500">
          {activos} de {maxActivos} usuarios activos.
        </p>
      </div>

      {personal.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {personal.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.nombre}</TableCell>
                <TableCell className="text-gray-500">{p.email}</TableCell>
                <TableCell>{ROL_LABELS[p.rol] ?? p.rol}</TableCell>
                <TableCell>
                  {p.pendiente ? (
                    <Badge variant="outline">Invitación pendiente</Badge>
                  ) : p.activo ? (
                    <Badge variant="secondary">Activo</Badge>
                  ) : (
                    <Badge variant="destructive">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {p.pendiente && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={accionId === p.id}
                        onClick={() =>
                          handleAccion(p.id, { reenviarInvitacion: true }, "Invitación reenviada")
                        }
                      >
                        <Mail className="size-3.5" />
                        Reenviar
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={accionId === p.id || (!p.activo && alcanzoTope)}
                      onClick={() =>
                        handleAccion(
                          p.id,
                          { activo: !p.activo },
                          p.activo ? "Usuario desactivado" : "Usuario reactivado"
                        )
                      }
                    >
                      {p.activo ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleInvitar)} className="space-y-4 border-t border-gray-100 pt-5">
          <h3 className="text-sm font-medium text-gray-900">Invitar a alguien del equipo</h3>

          {alcanzoTope && (
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
              Ya alcanzaste el máximo de {maxActivos} usuarios activos. Desactiva a alguien para invitar a otra
              persona.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="María Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="maria@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="rol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ROLES_STAFF.map((rol) => (
                      <SelectItem key={rol} value={rol}>
                        {ROL_LABELS[rol] ?? rol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={enviando || alcanzoTope}
            className="bg-[#0F6E56] hover:bg-[#1D9E75] text-white"
          >
            {enviando && <Loader2 className="size-4 animate-spin" />}
            Enviar invitación
          </Button>
        </form>
      </Form>
    </div>
  );
}
