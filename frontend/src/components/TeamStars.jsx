export default function TeamStars({ campeonatos = [], compact = false }) {
  if (!campeonatos.length) return null;

  return (
    <div className={`flex flex-col items-center ${compact ? 'gap-1' : 'gap-2'}`}>
      <div className="flex flex-wrap items-center justify-center gap-1">
        {campeonatos.map(titulo => (
          <span key={titulo} title={titulo} className={`${compact ? 'text-lg' : 'text-2xl'} text-yellow-300 drop-shadow`}>
            ★
          </span>
        ))}
      </div>
      <p className={`${compact ? 'text-[11px]' : 'text-xs'} text-yellow-200/80 font-bold uppercase tracking-wide`}>
        {campeonatos.length} {campeonatos.length === 1 ? 'campeonato' : 'campeonatos'}
      </p>
    </div>
  );
}
