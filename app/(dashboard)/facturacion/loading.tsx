import { Skeleton } from "@/components/ui/skeleton";

export default function FacturacionLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <Skeleton className="mb-3 h-9 w-full sm:w-[28rem]" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
