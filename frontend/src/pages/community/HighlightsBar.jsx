import { Plus } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

export default function HighlightsBar({
  highlights = [],
  onSelectHighlight,
  onOpenCreateHighlight,
  showAddButton = true,
}) {
  const { profile, isAuthenticated } = useAuth();

  if (highlights.length === 0 && !showAddButton) return null;

  return (
    <div className="rounded-2xl bg-secondary/70 border border-accent/20 p-3 sm:p-4 mb-5 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-4 min-w-max">
        {/* Botón para crear historia destacada si es usuario autenticado */}
        {showAddButton && isAuthenticated && (
          <button
            onClick={onOpenCreateHighlight}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-accent/50 bg-accent/10 group-hover:border-accent group-hover:bg-accent/20 transition">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover opacity-60 group-hover:opacity-100 transition"
                />
              ) : (
                <Plus size={22} className="text-accent" />
              )}
              <div className="absolute bottom-0 right-0 rounded-full bg-accent p-1 text-white shadow-md">
                <Plus size={10} strokeWidth={3} />
              </div>
            </div>
            <span className="text-[11px] font-bold text-white/70 group-hover:text-accent-light transition">
              Destacar
            </span>
          </button>
        )}

        {/* Lista de círculos de historias destacadas */}
        {highlights.map((h) => {
          const author = h.authorProfile || {};
          return (
            <button
              key={h._id}
              onClick={() => onSelectHighlight(h)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="relative h-16 w-16 rounded-full p-0.5 bg-gradient-to-tr from-accent to-accent-light shadow-md shadow-accent/20 group-hover:scale-105 transition-transform">
                <div className="h-full w-full rounded-full bg-secondary p-0.5 overflow-hidden">
                  <img
                    src={h.cover || h.items?.[0]?.mediaUrl}
                    alt={h.title}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="max-w-[70px] truncate text-[11px] font-bold text-white/80 group-hover:text-accent-light transition text-center">
                {h.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
