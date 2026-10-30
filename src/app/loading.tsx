export default function Loading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-8 lg:px-8" aria-busy="true" aria-label="Cargando">
      <div className="h-10 w-64 animate-pulse bg-sand" />
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <div className="aspect-square animate-pulse bg-sand" />
            <div className="mt-3 h-3.5 w-3/4 animate-pulse bg-sand" />
            <div className="mt-2 h-3.5 w-1/3 animate-pulse bg-sand" />
          </div>
        ))}
      </div>
    </div>
  );
}
