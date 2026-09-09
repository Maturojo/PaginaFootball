import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Trash2,
  Flag,
  Calendar,
  Shield,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  Check,
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/useAuth';
import ReportModal from './ReportModal';
import { teamSlug } from '../../utils/teamLogo.js';

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days}d`;
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

export default function PostCard({ post, onPostDeleted, onTagClick, onOpenAuth }) {
  const { user, profile, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [hasLiked, setHasLiked] = useState(post.hasLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [hasSaved, setHasSaved] = useState(post.hasSaved || false);
  const [savesCount, setSavesCount] = useState(post.savesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const authorProfile = post.authorProfile || {};
  const isAuthor = user?.id && (post.author?._id === user.id || post.author === user.id);
  const canDelete = isAuthor || isAdmin;

  // Toggle Like
  const handleLike = async () => {
    if (!isAuthenticated) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    // Optimistic UI
    const prevLiked = hasLiked;
    const prevCount = likesCount;
    setHasLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const { data } = await api.post(`/social/posts/${post._id}/like`);
      setHasLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (err) {
      setHasLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  // Toggle Save
  const handleSave = async () => {
    if (!isAuthenticated) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    const prevSaved = hasSaved;
    setHasSaved(!prevSaved);
    try {
      const { data } = await api.post(`/social/posts/${post._id}/save`);
      setHasSaved(data.saved);
      setSavesCount(data.savesCount);
    } catch (err) {
      setHasSaved(prevSaved);
    }
  };

  // Toggle Comments
  const handleToggleComments = async () => {
    const nextOpen = !commentsOpen;
    setCommentsOpen(nextOpen);
    if (nextOpen && comments.length === 0) {
      setLoadingComments(true);
      try {
        const { data } = await api.get(`/social/posts/${post._id}/comments`);
        setComments(data);
      } catch (err) {
        console.error('Error al cargar comentarios:', err);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  // Submit Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;
    if (!isAuthenticated) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    setSubmittingComment(true);
    try {
      const { data } = await api.post(`/social/posts/${post._id}/comments`, {
        content: newComment,
      });
      setComments((prev) => [...prev, data]);
      setCommentsCount((prev) => prev + 1);
      setNewComment('');
    } catch (err) {
      console.error('Error al publicar comentario:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/social/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setCommentsCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error al eliminar comentario:', err);
    }
  };

  // Delete Post
  const handleDeletePost = async () => {
    if (!window.confirm('¿Seguro que deseas eliminar esta publicación?')) return;
    setDeleting(true);
    try {
      await api.delete(`/social/posts/${post._id}`);
      if (onPostDeleted) onPostDeleted(post._id);
    } catch (err) {
      alert('Error al eliminar publicación');
      setDeleting(false);
    }
  };

  // Share Link
  const handleShare = () => {
    const url = `${window.location.origin}/comunidad?post=${post._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Formatear texto con hashtags y menciones clickeables
  const renderFormattedContent = (content) => {
    if (!content) return null;
    const parts = content.split(/([@#][a-zA-Z0-9._]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        const tag = part.slice(1);
        return (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              if (onTagClick) onTagClick(tag);
            }}
            className="font-bold text-accent hover:underline inline"
          >
            {part}
          </button>
        );
      }
      if (part.startsWith('@')) {
        const username = part.slice(1);
        return (
          <Link
            key={i}
            to={`/comunidad/perfil/${username}`}
            className="font-bold text-accent-light hover:underline inline"
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  const mediaList = post.media || [];
  const currentMedia = mediaList[mediaIndex];

  return (
    <article className="rounded-2xl bg-secondary border border-accent/20 overflow-hidden shadow-lg hover:border-accent/35 transition-all">
      {/* Header del post */}
      <div className="flex items-center justify-between p-4 pb-3">
        <Link
          to={`/comunidad/perfil/${authorProfile.username || 'usuario'}`}
          className="flex items-center gap-3 group"
        >
          {authorProfile.avatar ? (
            <img
              src={authorProfile.avatar}
              alt={authorProfile.displayName}
              className="h-11 w-11 rounded-full object-cover border-2 border-accent/30 group-hover:border-accent transition"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/20 text-accent font-black text-base border-2 border-accent/30 group-hover:border-accent transition">
              {authorProfile.username ? authorProfile.username[0].toUpperCase() : 'U'}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white truncate group-hover:text-accent-light transition">
                {authorProfile.displayName || 'Usuario de la Liga'}
              </span>
              {authorProfile.isVerified && (
                <span className="text-xs text-accent" title="Atleta verificado">
                  ✓
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span>@{authorProfile.username || 'usuario'}</span>
              <span>•</span>
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </Link>

        {/* Menú de opciones */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition"
            aria-label="Opciones"
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-1 w-44 rounded-xl bg-primary border border-white/10 p-1 shadow-2xl z-20 animate-fadeIn"
              onClick={() => setMenuOpen(false)}
            >
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white text-left"
              >
                <Share2 size={14} />
                <span>Copiar enlace</span>
              </button>

              <button
                onClick={() => setReportModalOpen(true)}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-yellow-400 hover:bg-yellow-400/10 text-left"
              >
                <Flag size={14} />
                <span>Reportar</span>
              </button>

              {canDelete && (
                <button
                  onClick={handleDeletePost}
                  disabled={deleting}
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 text-left border-t border-white/5 mt-1"
                >
                  <Trash2 size={14} />
                  <span>{deleting ? 'Eliminando...' : 'Eliminar post'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Badges de Relación con Football Core (Puentes de integración respetuosos) */}
      {(post.relatedPartido || post.relatedTeam || post.relatedJugador) && (
        <div className="px-4 pb-2.5 flex flex-wrap gap-2">
          {post.relatedPartido && (
            <Link
              to="/fixture"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 border border-accent/30 px-3 py-1 text-xs font-bold text-accent-light hover:bg-accent hover:text-white transition"
              title="Ver ficha oficial de este partido en Fixture"
            >
              <Calendar size={12} />
              <span>
                Partido: {post.relatedPartido.equipoLocal} vs {post.relatedPartido.equipoVisitante}
              </span>
            </Link>
          )}

          {post.relatedTeam && (
            <Link
              to={`/equipos/${teamSlug(post.relatedTeam.nombre)}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-1 text-xs font-bold text-blue-300 hover:bg-blue-500 hover:text-white transition"
              title="Ver página oficial del equipo"
            >
              <Shield size={12} />
              <span>Equipo: {post.relatedTeam.nombre}</span>
            </Link>
          )}

          {post.relatedJugador && (
            <Link
              to="/jugadores"
              className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 px-3 py-1 text-xs font-bold text-yellow-300 hover:bg-yellow-500 hover:text-white transition"
              title="Ver estadísticas oficiales del jugador en Jugadores"
            >
              <UserIcon size={12} />
              <span>Atleta: {post.relatedJugador.nombre}</span>
            </Link>
          )}
        </div>
      )}

      {/* Contenido de texto */}
      {post.content && (
        <div className="px-4 py-2 text-sm text-white/90 whitespace-pre-line leading-relaxed">
          {renderFormattedContent(post.content)}
        </div>
      )}

      {/* Visor multimedia */}
      {mediaList.length > 0 && (
        <div className="relative mt-2 bg-black/40 border-y border-white/5 overflow-hidden flex items-center justify-center max-h-[480px]">
          {currentMedia?.type === 'video' ? (
            <video
              src={currentMedia.url}
              controls
              playsInline
              className="w-full max-h-[480px] object-contain bg-black"
            />
          ) : (
            <img
              src={currentMedia?.url}
              alt={currentMedia?.caption || 'Imagen de la publicación'}
              className="w-full max-h-[480px] object-cover sm:object-contain bg-black"
            />
          )}

          {/* Carrusel navegadores */}
          {mediaList.length > 1 && (
            <>
              {mediaIndex > 0 && (
                <button
                  onClick={() => setMediaIndex(mediaIndex - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition"
                  aria-label="Anterior"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              {mediaIndex < mediaList.length - 1 && (
                <button
                  onClick={() => setMediaIndex(mediaIndex + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition"
                  aria-label="Siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              )}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 px-2 py-1 rounded-full">
                {mediaList.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${
                      i === mediaIndex ? 'bg-accent w-4' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {currentMedia?.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6 text-xs text-white/90">
              {currentMedia.caption}
            </div>
          )}
        </div>
      )}

      {/* Barra de interacciones */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-white/5">
        <div className="flex items-center gap-5">
          {/* Like button */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-red-400 transition group"
          >
            <Heart
              size={19}
              className={`transition transform group-hover:scale-110 ${
                hasLiked ? 'fill-red-500 text-red-500' : 'text-white/60'
              }`}
            />
            <span className={hasLiked ? 'text-red-400' : ''}>{likesCount}</span>
          </button>

          {/* Comment button */}
          <button
            onClick={handleToggleComments}
            className="flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-accent-light transition"
          >
            <MessageCircle size={19} className="text-white/60 hover:text-accent" />
            <span>{commentsCount}</span>
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-accent-light transition"
            title="Compartir publicación"
          >
            {copied ? (
              <Check size={18} className="text-green-400" />
            ) : (
              <Share2 size={18} className="text-white/60" />
            )}
            <span className="hidden sm:inline">{copied ? '¡Copiado!' : 'Compartir'}</span>
          </button>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="p-1 rounded-full text-white/60 hover:text-accent transition"
          title={hasSaved ? 'Guardado' : 'Guardar publicación'}
        >
          <Bookmark
            size={19}
            className={hasSaved ? 'fill-accent text-accent' : 'text-white/60'}
          />
        </button>
      </div>

      {/* Sección desplegable de Comentarios */}
      {commentsOpen && (
        <div className="border-t border-white/5 bg-primary/40 px-4 py-3">
          {loadingComments ? (
            <div className="flex justify-center py-4">
              <Loader2 size={20} className="animate-spin text-accent" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-xs text-white/40 py-3">
              Aún no hay comentarios. ¡Sé el primero en comentar!
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {comments.map((comment) => {
                const cProfile = comment.authorProfile || {};
                const isCommentAuthor = user?.id && comment.author?._id === user.id;
                return (
                  <div key={comment._id} className="flex gap-2.5 text-xs group">
                    <Link
                      to={`/comunidad/perfil/${cProfile.username || 'usuario'}`}
                      className="flex-shrink-0"
                    >
                      {cProfile.avatar ? (
                        <img
                          src={cProfile.avatar}
                          alt=""
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-accent font-bold">
                          {cProfile.username ? cProfile.username[0].toUpperCase() : 'U'}
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 bg-secondary/80 rounded-xl p-2.5 border border-white/5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Link
                          to={`/comunidad/perfil/${cProfile.username || 'usuario'}`}
                          className="font-bold text-white hover:text-accent"
                        >
                          @{cProfile.username || 'usuario'}
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/30">
                            {timeAgo(comment.createdAt)}
                          </span>
                          {(isCommentAuthor || isAdmin) && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-white/30 hover:text-red-400 transition"
                              title="Borrar comentario"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-white/80 leading-relaxed whitespace-pre-line">
                        {renderFormattedContent(comment.content)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Formulario de nuevo comentario */}
          <form onSubmit={handleAddComment} className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                isAuthenticated ? 'Escribe un comentario...' : 'Inicia sesión para comentar'
              }
              disabled={!isAuthenticated || submittingComment}
              className="flex-1 rounded-xl bg-secondary border border-white/10 px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-accent focus:outline-none disabled:opacity-50"
            />
            {isAuthenticated ? (
              <button
                type="submit"
                disabled={!newComment.trim() || submittingComment}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white hover:bg-accent-light disabled:opacity-40 transition flex-shrink-0"
              >
                {submittingComment ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="rounded-xl bg-accent/20 border border-accent/40 px-3 py-1.5 text-xs font-bold text-accent hover:bg-accent hover:text-white transition"
              >
                Ingresar
              </button>
            )}
          </form>
        </div>
      )}

      {/* Modal de Reporte */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        postId={post._id}
      />
    </article>
  );
}
