import { Skeleton } from "@/components/ui/skeleton";

export default function PacientesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-40" />
      </div>

      <Skeleton className="h-9 w-full sm:w-96" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
