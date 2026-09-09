import { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import {
  UserPlus,
  UserCheck,
  Edit3,
  Bookmark,
  Grid,
  Calendar,
  ExternalLink,
  Shield,
  Loader2,
  AlertCircle,
  Sparkles,
  Trash2,
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/useAuth';
import PostCard from './PostCard';
import HighlightsBar from './HighlightsBar';
import HighlightViewerModal from './HighlightViewerModal';
import CreateHighlightModal from './CreateHighlightModal';
import EditProfileModal from './EditProfileModal';

export default function UserProfilePage() {
  const { username } = useParams();
  const { user, profile: authProfile, isAuthenticated, updateProfile } = useAuth();
  const { onOpenAuth } = useOutletContext() || {};

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'saved'
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Seguimiento
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Modales
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [highlights, setHighlights] = useState([]);
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const [createHighlightOpen, setCreateHighlightOpen] = useState(false);

  const isSelf = Boolean(
    isAuthenticated &&
      (user?.id === profile?.user?._id ||
        authProfile?.username?.toLowerCase() === username?.toLowerCase())
  );

  // Cargar Perfil Social
  useEffect(() => {
    setLoading(true);
    setError('');

    api.get(`/social/profiles/${username}`)
      .then((r) => {
        setProfile(r.data);
        setIsFollowing(r.data.isFollowing || false);
        setFollowersCount(r.data.followersCount || 0);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Perfil no encontrado');
      })
      .finally(() => setLoading(false));

    // Cargar highlights de este usuario
    api.get(`/social/highlights/${username}`)
      .then((r) => setHighlights(r.data))
      .catch(() => {});
  }, [username]);

  // Cargar Publicaciones del Usuario
  useEffect(() => {
    if (!profile) return;
    setLoadingPosts(true);

    api.get('/social/posts', { params: { username } })
      .then((r) => setPosts(r.data.posts || []))
      .catch(() => {})
      .finally(() => setLoadingPosts(false));

    if (isSelf) {
      api.get(`/social/profiles/${username}/saved`)
        .then((r) => setSavedPosts(r.data || []))
        .catch(() => {});
    }
  }, [profile, username, isSelf]);

  // Toggle Follow
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    const prevFollowing = isFollowing;
    const prevCount = followersCount;

    setIsFollowing(!prevFollowing);
    setFollowersCount(prevFollowing ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const targetUserId = profile.user?._id || profile.user;
      const { data } = await api.post(`/social/follow/${targetUserId}`);
      setIsFollowing(data.following);
      setFollowersCount(data.followersCount);
    } catch (err) {
      setIsFollowing(prevFollowing);
      setFollowersCount(prevCount);
    }
  };

  const [unlinking, setUnlinking] = useState(false);

  const handleUnlinkPlayer = async () => {
    if (!window.confirm('¿Seguro que deseas desvincular tu ficha deportiva de este perfil social?')) return;
    setUnlinking(true);
    try {
      await api.post('/social/unlink-player');
      setProfile((prev) => ({ ...prev, jugadorRef: null }));
      updateProfile({ jugadorRef: null });
    } catch (err) {
      alert('Error al desvincular jugador');
    } finally {
      setUnlinking(false);
    }
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
    setSavedPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-accent">
        <Loader2 size={36} className="animate-spin" />
        <p className="text-xs text-white/50">Cargando perfil...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl bg-secondary/80 border border-accent/20 p-12 text-center max-w-md mx-auto">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15 text-red-400">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-lg font-bold text-white">Perfil no encontrado</h2>
        <p className="text-xs text-white/50 mt-1">
          No pudimos encontrar a @{username} en la comunidad.
        </p>
        <Link
          to="/comunidad"
          className="mt-4 inline-flex rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white hover:bg-accent-light"
        >
          Volver a la Comunidad
        </Link>
      </div>
    );
  }

  const jugador = profile.jugadorRef;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabecera del Perfil (Banner y Avatar) */}
      <div className="rounded-3xl bg-secondary border border-accent/20 overflow-hidden shadow-xl">
        {/* Banner de Portada */}
        <div className="relative h-44 sm:h-56 bg-gradient-to-r from-secondary via-primary to-secondary">
          {profile.banner ? (
            <img src={profile.banner} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-primary to-secondary" />
          )}
        </div>

        {/* Información del Perfil */}
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
            {/* Avatar */}
            <div className="relative">
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-4 border-secondary bg-primary shadow-2xl">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent/20 text-accent font-black text-3xl">
                    {profile.username ? profile.username[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            </div>

            {/* Acciones: Seguir o Editar */}
            <div className="flex items-center gap-2">
              {isSelf ? (
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-full bg-accent/15 border border-accent/30 px-4 py-2 text-xs font-extrabold text-accent hover:bg-accent hover:text-white transition"
                >
                  <Edit3 size={14} />
                  <span>Editar Perfil</span>
                </button>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-extrabold uppercase tracking-wider transition ${
                    isFollowing
                      ? 'bg-white/10 text-white hover:bg-red-500/20 hover:text-red-300'
                      : 'bg-accent text-white hover:bg-accent-light shadow-lg shadow-accent/20'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={14} />
                      <span>Siguiendo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      <span>Seguir</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Nombre, @username y bio */}
          <div className="space-y-2">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <span>{profile.displayName}</span>
                {profile.isVerified && (
                  <span className="text-xs text-accent" title="Verificado">
                    ✓
                  </span>
                )}
              </h1>
              <p className="text-sm font-semibold text-accent">@{profile.username}</p>
            </div>

            {profile.bio && (
              <p className="text-xs text-white/80 leading-relaxed max-w-2xl whitespace-pre-line">
                {profile.bio}
              </p>
            )}

            {/* Métricas de la red social */}
            <div className="flex items-center gap-6 pt-2 text-xs text-white/60">
              <div>
                <span className="font-extrabold text-white text-sm mr-1">
                  {profile.postsCount || posts.length}
                </span>
                <span>publicaciones</span>
              </div>
              <div>
                <span className="font-extrabold text-white text-sm mr-1">
                  {followersCount}
                </span>
                <span>seguidores</span>
              </div>
              <div>
                <span className="font-extrabold text-white text-sm mr-1">
                  {profile.followingCount || 0}
                </span>
                <span>siguiendo</span>
              </div>
            </div>

            {/* ============================================================ */}
            {/* PUENTE RESPETUOSO CON FOOTBALL CORE (NO DUPLICA ESTADÍSTICAS) */}
            {/* Si el usuario está vinculado a un atleta de la liga, muestra */}
            {/* el botón oficial para ir a su ficha en Jugadores */}
            {/* ============================================================ */}
            {jugador && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-primary/60 border border-accent/30 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/15 text-yellow-400 text-xl flex-shrink-0">
                      🏈
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        Atleta oficial de la Liga: <span className="text-yellow-400">{jugador.nombre}</span> #{jugador.numero || '-'}
                      </p>
                      <p className="text-[11px] text-white/50">
                        {jugador.equipo} · {jugador.posicion || 'Jugador'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                    <Link
                      to={`/jugadores?nombre=${encodeURIComponent(jugador.nombre)}&jugadorId=${jugador._id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white hover:bg-accent-light transition shadow-md shadow-accent/20"
                    >
                      <span>Ver ficha deportiva oficial</span>
                      <ExternalLink size={13} />
                    </Link>

                    {isSelf && (
                      <button
                        onClick={handleUnlinkPlayer}
                        disabled={unlinking}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-500/15 border border-red-500/30 px-3.5 py-2 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                        title="Desvincular ficha deportiva"
                      >
                        <Trash2 size={13} />
                        <span>{unlinking ? 'Desvinculando...' : 'Desvincular'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!jugador && isSelf && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-primary/40 border border-dashed border-accent/30 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent text-xl flex-shrink-0">
                      🏈
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">¿Eres atleta de la Liga?</p>
                      <p className="text-[11px] text-white/50">
                        Vincula tu cuenta a tu ficha deportiva oficial para que la comunidad pueda conocer tu equipo y estadísticas.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent/20 border border-accent/40 px-4 py-2 text-xs font-bold text-accent hover:bg-accent hover:text-white transition flex-shrink-0"
                  >
                    <span>Vincular mi Ficha</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historias Destacadas del Usuario */}
      {highlights.length > 0 && (
        <div className="rounded-3xl bg-secondary border border-accent/20 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-accent mb-3 flex items-center gap-1.5">
            <Sparkles size={13} />
            <span>Destacados de @{profile.username}</span>
          </p>
          <HighlightsBar
            highlights={highlights}
            onSelectHighlight={setSelectedHighlight}
            onOpenCreateHighlight={() => setCreateHighlightOpen(true)}
            showAddButton={isSelf}
          />
        </div>
      )}

      {/* Pestañas de Contenido */}
      <div className="border-b border-accent/20 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'posts'
              ? 'border-accent text-accent'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Grid size={15} />
          <span>Publicaciones ({posts.length})</span>
        </button>

        {isSelf && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'saved'
                ? 'border-accent text-accent'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Bookmark size={15} />
            <span>Guardados ({savedPosts.length})</span>
          </button>
        )}
      </div>

      {/* Feed de Publicaciones del Usuario */}
      {loadingPosts ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-accent" />
        </div>
      ) : activeTab === 'posts' ? (
        posts.length === 0 ? (
          <div className="rounded-2xl bg-secondary/60 border border-accent/20 p-10 text-center text-white/40 text-xs">
            @{profile.username} aún no ha realizado publicaciones.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostDeleted={handlePostDeleted}
                onOpenAuth={onOpenAuth}
              />
            ))}
          </div>
        )
      ) : (
        savedPosts.length === 0 ? (
          <div className="rounded-2xl bg-secondary/60 border border-accent/20 p-10 text-center text-white/40 text-xs">
            No tienes publicaciones guardadas en favoritos.
          </div>
        ) : (
          <div className="space-y-4">
            {savedPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostDeleted={handlePostDeleted}
                onOpenAuth={onOpenAuth}
              />
            ))}
          </div>
        )
      )}

      {/* Modales */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        currentProfile={profile}
        onProfileUpdated={(updated) => setProfile(updated)}
      />

      {selectedHighlight && (
        <HighlightViewerModal
          highlight={selectedHighlight}
          onClose={() => setSelectedHighlight(null)}
        />
      )}

      <CreateHighlightModal
        isOpen={createHighlightOpen}
        onClose={() => setCreateHighlightOpen(false)}
        onHighlightCreated={(newH) => setHighlights((prev) => [newH, ...prev])}
      />
    </div>
  );
}
