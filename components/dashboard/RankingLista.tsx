export function RankingLista({
  titulo,
  items,
  emptyMessage,
  sufijo = "",
}: {
  titulo: string;
  items: { nombre: string; cantidad: number }[];
  emptyMessage: string;
  sufijo?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">{titulo}</h2>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <li
              key={item.nombre}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2 text-gray-700">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[10px] font-semibold text-[#0F6E56]">
                  {i + 1}
                </span>
                <span className="truncate">{item.nombre}</span>
              </span>
              <span className="shrink-0 font-mono text-gray-500">
                {item.cantidad}
                {sufijo}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
