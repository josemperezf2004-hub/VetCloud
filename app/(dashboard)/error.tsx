"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <div className="flex size-14 items-center justify-center rounded-full bg-[#FEE2E2] text-[#DC2626]">
        <AlertTriangle className="size-7" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-900">Algo salió mal</p>
        <p className="max-w-md text-sm text-gray-500">
          {error.message || "Ocurrió un error inesperado al cargar esta página."}
        </p>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <Button
          onClick={() => reset()}
          className="bg-[#0F6E56] hover:bg-[#1D9E75] text-white"
        >
          <RotateCw className="size-4" />
          Reintentar
        </Button>
        <Link href="/" className="text-sm font-medium text-[#0F6E56] hover:underline">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
