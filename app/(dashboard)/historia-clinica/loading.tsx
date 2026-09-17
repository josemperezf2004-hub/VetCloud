import { Skeleton } from "@/components/ui/skeleton";

export default function HistoriaClinicaLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-9 w-full sm:w-72" />
      </div>

      <div className="space-y-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
