"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PREGUNTAS = [
  {
    pregunta: "¿Cómo registro un nuevo cliente y su mascota?",
    respuesta:
      "En Clientes, botón \"Nuevo propietario\". Desde el detalle del cliente ya creado, usa \"Agregar mascota\" para registrar a su paciente.",
  },
  {
    pregunta: "¿Cómo agendo una cita?",
    respuesta:
      "En Agenda, haz clic en un espacio vacío del calendario o usa el botón \"Nueva cita\". El sistema avisa si el veterinario ya tiene otra cita en ese horario.",
  },
  {
    pregunta: "¿Cómo registro una consulta (historia clínica)?",
    respuesta:
      "Desde el perfil de la mascota, botón \"Nueva consulta\". Si agregas una prescripción, el stock del producto se descuenta automáticamente del Inventario.",
  },
  {
    pregunta: "¿Cómo cobro una consulta en Caja?",
    respuesta:
      "Desde el detalle de la consulta puedes generar el recibo con los productos prescritos ya cargados; agrega ahí mismo cargos adicionales (como la consulta) antes de guardarlo.",
  },
  {
    pregunta: "¿Qué significa \"Stock bajo\"?",
    respuesta:
      "Que el stock actual del producto llegó a su mínimo configurado. No aplica a Equipos ni Servicios: esas categorías no se consumen ni se reponen como el resto del inventario.",
  },
  {
    pregunta: "¿Cómo registro el mantenimiento de un equipo?",
    respuesta:
      "En Inventario, pestaña Equipos, usa el ícono de llave en la fila del equipo para registrar la fecha realizada y la próxima fecha programada.",
  },
  {
    pregunta: "¿Dónde cambio mi contraseña o los datos de la clínica?",
    respuesta: "En Configuración puedes actualizar los datos de la clínica y de tu propia cuenta, incluida la contraseña.",
  },
  {
    pregunta: "¿Qué pasa si no pago la suscripción a tiempo?",
    respuesta:
      "El acceso se bloquea hasta confirmar el pago. En Suscripción encuentras los datos de la cuenta para la transferencia y la fecha de vencimiento.",
  },
];

export function PreguntasFrecuentesDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        title="Preguntas frecuentes"
        onClick={() => setOpen(true)}
      >
        <HelpCircle className="size-5 text-gray-500" />
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="size-4" />
            Preguntas frecuentes
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {PREGUNTAS.map((item) => (
            <div key={item.pregunta}>
              <p className="text-sm font-medium text-gray-900">{item.pregunta}</p>
              <p className="mt-1 text-sm text-gray-500">{item.respuesta}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
