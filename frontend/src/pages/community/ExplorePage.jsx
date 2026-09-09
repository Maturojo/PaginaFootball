import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Search, Compass, TrendingUp, Users, Sparkles, Loader2, Calendar } from 'lucide-react';
import api from '../../api';
import PostCard from './PostCard';

export default function ExplorePage() {
  const { onOpenAuth } = useOutletContext() || {};
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('popular'); // 'popular' | 'users' | 'search'

  const [topPosts, setTopPosts] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [recommendedProfiles, setRecommendedProfiles] = useState([]);

  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/social/explore')
      .then((r) => {
        if (r.data.topPosts) setTopPosts(r.data.topPosts);
        if (r.data.trendingTags) setTrendingTags(r.data.trendingTags);
        if (r.data.recommendedProfiles) setRecommendedProfiles(r.data.recommendedProfiles);
      })
      .catch((err) => console.error('Error en explore:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setActiveTab('search');

    try {
      const { data } = await api.get('/social/posts', {
        params: { search: query.trim() },
      });
      setSearchResults(data.posts || []);
    } catch (err) {
      console.error('Error en búsqueda:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleTagClick = (tag) => {
    setQuery(`#${tag}`);
    setSearching(true);
    setActiveTab('search');
    api.get('/social/posts', { params: { tag } })
      .then((r) => setSearchResults(r.data.posts || []))
      .catch(() => {})
      .finally(() => setSearching(false));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Barra de búsqueda superior */}
      <div className="rounded-3xl bg-secondary border border-accent/20 p-4 sm:p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Compass size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Explorar la Comunidad</h1>
            <p className="text-xs text-white/50">
              Descubre nuevas jugadas, atletas y tendencias de la liga
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por jugadas, #hashtags o temas..."
            className="w-full rounded-2xl bg-primary/80 border border-white/10 pl-11 pr-24 py-3 text-sm text-white placeholder-white/40 focus:border-accent focus:outline-none shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-accent px-4 py-1.5 text-xs font-bold text-white hover:bg-accent-light transition"
          >
            Buscar
          </button>
        </form>

        {/* Nube de etiquetas destacadas */}
        {trendingTags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-white/40 flex items-center gap-1">
              <TrendingUp size={13} />
              Tendencias:
            </span>
            {trendingTags.map((t) => (
              <button
                key={t.tag}
                onClick={() => handleTagClick(t.tag)}
                className="rounded-full bg-primary/60 border border-white/10 hover:border-accent/40 px-3 py-1 text-xs font-semibold text-white/70 hover:text-accent transition"
              >
                #{t.tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-accent/20 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('popular')}
          className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'popular'
              ? 'border-accent text-accent'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Sparkles size={14} />
          <span>Destacados</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-accent text-accent'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Users size={14} />
          <span>Miembros ({recommendedProfiles.length})</span>
        </button>

        {searchResults.length > 0 && (
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'border-accent text-accent'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Search size={14} />
            <span>Resultados ({searchResults.length})</span>
          </button>
        )}
      </div>

      {/* Contenido según tab */}
      {loading || searching ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-accent" />
        </div>
      ) : activeTab === 'search' ? (
        searchResults.length === 0 ? (
          <div className="rounded-2xl bg-secondary/60 border border-accent/20 p-12 text-center text-white/50 text-xs">
            No se encontraron publicaciones para "{query}".
          </div>
        ) : (
          <div className="space-y-4">
            {searchResults.map((post) => (
              <PostCard key={post._id} post={post} onOpenAuth={onOpenAuth} />
            ))}
          </div>
        )
      ) : activeTab === 'users' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedProfiles.map((p) => (
            <Link
              key={p._id}
              to={`/comunidad/perfil/${p.username}`}
              className="rounded-2xl bg-secondary border border-accent/20 p-5 flex flex-col items-center text-center hover:border-accent transition group"
            >
              <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-accent/30 group-hover:border-accent transition mb-3">
                {p.avatar ? (
                  <img src={p.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-accent/20 flex items-center justify-center text-accent font-black text-xl">
                    {p.username ? p.username[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <h3 className="font-extrabold text-sm text-white group-hover:text-accent-light transition">
                {p.displayName}
              </h3>
              <p className="text-xs text-accent">@{p.username}</p>
              {p.bio && (
                <p className="text-[11px] text-white/60 mt-2 line-clamp-2">{p.bio}</p>
              )}
              {p.jugadorRef && (
                <span className="mt-3 text-[10px] font-bold bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 rounded-full px-2.5 py-0.5">
                  🏈 Atleta Oficial
                </span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {topPosts.length === 0 ? (
            <div className="rounded-2xl bg-secondary/60 border border-accent/20 p-12 text-center text-white/50 text-xs">
              Aún no hay publicaciones destacadas.
            </div>
          ) : (
            topPosts.map((post) => (
              <PostCard key={post._id} post={post} onOpenAuth={onOpenAuth} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
