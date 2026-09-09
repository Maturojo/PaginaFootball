import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useOutletContext, Link } from 'react-router-dom';
import { Sparkles, Users, Filter, X, Loader2, Calendar, TrendingUp } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/useAuth';
import PostCard from './PostCard';
import CreatePostWidget from './CreatePostWidget';
import HighlightsBar from './HighlightsBar';
import HighlightViewerModal from './HighlightViewerModal';
import CreateHighlightModal from './CreateHighlightModal';

export default function CommunityFeed() {
  const { user, isAuthenticated } = useAuth();
  const { onOpenAuth } = useOutletContext() || {};
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('forYou'); // 'forYou' | 'following'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Highlights
  const [highlights, setHighlights] = useState([]);
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const [createHighlightOpen, setCreateHighlightOpen] = useState(false);

  // Sidebar info
  const [trendingTags, setTrendingTags] = useState([]);
  const [recommendedProfiles, setRecommendedProfiles] = useState([]);

  // Filtros desde query params (ej. ?partidoId=..., ?teamId=..., ?tag=...)
  const filterPartido = searchParams.get('partidoId') || '';
  const filterTeam = searchParams.get('teamId') || '';
  const filterJugador = searchParams.get('jugadorId') || '';
  const filterTag = searchParams.get('tag') || '';

  // Cargar Highlights del Feed
  useEffect(() => {
    api.get('/social/highlights-feed')
      .then((r) => setHighlights(r.data))
      .catch(() => {});

    api.get('/social/explore')
      .then((r) => {
        if (r.data.trendingTags) setTrendingTags(r.data.trendingTags);
        if (r.data.recommendedProfiles) setRecommendedProfiles(r.data.recommendedProfiles);
      })
      .catch(() => {});
  }, []);

  // Cargar Posts
  const fetchPosts = useCallback(
    async (pageNum = 1, append = false) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = {
          page: pageNum,
          limit: 10,
          tab: activeTab,
        };
        if (filterPartido) params.relatedPartido = filterPartido;
        if (filterTeam) params.relatedTeam = filterTeam;
        if (filterJugador) params.relatedJugador = filterJugador;
        if (filterTag) params.tag = filterTag;

        const { data } = await api.get('/social/posts', { params });

        setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts));
        setHasMore(data.hasMore);
        setPage(data.page);
      } catch (err) {
        console.error('Error al cargar posts:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeTab, filterPartido, filterTeam, filterJugador, filterTag]
  );

  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handleTagClick = (tag) => {
    setSearchParams({ tag });
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(filterPartido || filterTeam || filterJugador || filterTag);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Principal (Feed) */}
      <div className="lg:col-span-2 space-y-5">
        {/* Barra de Historias Destacadas (Highlights) */}
        <HighlightsBar
          highlights={highlights}
          onSelectHighlight={setSelectedHighlight}
          onOpenCreateHighlight={() => setCreateHighlightOpen(true)}
          showAddButton={isAuthenticated}
        />

        {/* Widget para crear publicación */}
        <CreatePostWidget
          onPostCreated={handlePostCreated}
          onOpenAuth={onOpenAuth}
        />

        {/* Barra de Tabs y Filtros */}
        <div className="flex items-center justify-between border-b border-accent/20 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('forYou')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === 'forYou'
                  ? 'bg-accent text-white shadow-md shadow-accent/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles size={13} />
              Para ti
            </button>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  if (onOpenAuth) onOpenAuth();
                  return;
                }
                setActiveTab('following');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === 'following'
                  ? 'bg-accent text-white shadow-md shadow-accent/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users size={13} />
              Siguiendo
            </button>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-1.5 bg-accent/15 border border-accent/30 rounded-full px-3 py-1 text-xs text-accent">
              <Filter size={11} />
              <span className="font-semibold">
                Filtro: {filterTag ? `#${filterTag}` : 'Contenido relacionado'}
              </span>
              <button
                onClick={clearFilters}
                className="hover:text-white transition ml-1"
                title="Quitar filtro"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Lista de Publicaciones */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={32} className="animate-spin text-accent" />
            <p className="text-xs text-white/50">Cargando publicaciones de la comunidad...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl bg-secondary/60 border border-accent/20 p-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent text-2xl">
              🏈
            </div>
            <h3 className="font-bold text-white text-base">No hay publicaciones para mostrar</h3>
            <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'No se encontraron publicaciones con el filtro actual.'
                : activeTab === 'following'
                ? 'Aún no sigues a ningún atleta o usuario. ¡Explora la comunidad y sigue perfiles!'
                : '¡Sé el primero en compartir una jugada, foto o reflexión de la liga!'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent/20 border border-accent/40 px-4 py-2 text-xs font-bold text-accent hover:bg-accent hover:text-white transition"
              >
                Quitar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostDeleted={handlePostDeleted}
                onTagClick={handleTagClick}
                onOpenAuth={onOpenAuth}
              />
            ))}

            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={() => fetchPosts(page + 1, true)}
                  disabled={loadingMore}
                  className="rounded-full bg-secondary border border-accent/30 px-6 py-2.5 text-xs font-bold text-accent hover:bg-accent hover:text-white transition disabled:opacity-50"
                >
                  {loadingMore ? 'Cargando más...' : 'Cargar más publicaciones'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Columna Lateral (Tendencias y Enlaces Deportivos) */}
      <div className="hidden lg:block space-y-5">
        {/* Tendencias en la Liga */}
        {trendingTags.length > 0 && (
          <div className="rounded-2xl bg-secondary border border-accent/20 p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3 text-accent font-extrabold text-xs uppercase tracking-wider">
              <TrendingUp size={15} />
              <span>Tendencias de la Liga</span>
            </div>
            <div className="space-y-2">
              {trendingTags.map((item) => (
                <button
                  key={item.tag}
                  onClick={() => handleTagClick(item.tag)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-primary/50 transition text-left group"
                >
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-accent transition">
                      #{item.tag}
                    </p>
                    <p className="text-[10px] text-white/40">{item.count} publicaciones</p>
                  </div>
                  <span className="text-[10px] text-accent/60 group-hover:text-accent">↗</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comunidad / Atletas sugeridos */}
        {recommendedProfiles.length > 0 && (
          <div className="rounded-2xl bg-secondary border border-accent/20 p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3 text-accent font-extrabold text-xs uppercase tracking-wider">
              <Users size={15} />
              <span>Miembros de la Comunidad</span>
            </div>
            <div className="space-y-3">
              {recommendedProfiles.map((p) => (
                <Link
                  key={p._id}
                  to={`/comunidad/perfil/${p.username}`}
                  className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-primary/50 transition group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {p.avatar ? (
                      <img
                        src={p.avatar}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover border border-accent/30"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                        {p.username ? p.username[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate group-hover:text-accent-light transition">
                        {p.displayName}
                      </p>
                      <p className="text-[10px] text-white/40 truncate">@{p.username}</p>
                    </div>
                  </div>
                  {p.jugadorRef && (
                    <span className="text-[9px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded px-1.5 py-0.5 whitespace-nowrap">
                      Atleta
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Enlace de regreso respetuoso a Football Core */}
        <div className="rounded-2xl bg-primary/40 border border-white/10 p-4 text-xs text-white/50 space-y-2">
          <p className="font-bold text-white/80">Estadísticas y Competencia Oficial</p>
          <p className="text-[11px] leading-relaxed">
            Las tablas de posiciones, líderes históricos y el fixture oficial continúan en el sistema
            deportivo de la liga.
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            <Link
              to="/fixture"
              className="font-bold text-accent hover:underline text-[11px]"
            >
              → Ver Partidos
            </Link>
            <span>•</span>
            <Link
              to="/estadisticas"
              className="font-bold text-accent hover:underline text-[11px]"
            >
              → Ver Posiciones
            </Link>
            <span>•</span>
            <Link
              to="/jugadores"
              className="font-bold text-accent hover:underline text-[11px]"
            >
              → Ver Atletas
            </Link>
          </div>
        </div>
      </div>

      {/* Visor de Historias Destacadas */}
      {selectedHighlight && (
        <HighlightViewerModal
          highlight={selectedHighlight}
          onClose={() => setSelectedHighlight(null)}
        />
      )}

      {/* Modal para Crear Historia Destacada */}
      <CreateHighlightModal
        isOpen={createHighlightOpen}
        onClose={() => setCreateHighlightOpen(false)}
        onHighlightCreated={(newH) => setHighlights((prev) => [newH, ...prev])}
      />
    </div>
  );
}
