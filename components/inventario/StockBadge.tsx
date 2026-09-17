import { XCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function StockBadge({
  stockActual,
  stockMinimo,
}: {
  stockActual: number;
  stockMinimo: number;
}) {
  if (stockActual <= 0) {
    return (
      <Badge className="gap-1 bg-[#DC2626]/10 text-[#DC2626]">
        <XCircle className="size-3" />
        Sin stock
      </Badge>
    );
  }

  if (stockActual <= stockMinimo) {
    return (
      <Badge className="gap-1 bg-[#D97706]/10 text-[#D97706]">
        <AlertTriangle className="size-3" />
        Stock bajo
      </Badge>
    );
  }

  return (
    <Badge className="gap-1 bg-[#16A34A]/10 text-[#16A34A]">
      <CheckCircle2 className="size-3" />
      OK
    </Badge>
  );
}
