import { useState, useEffect, useRef } from 'react';
import {
  Image,
  Video,
  Calendar,
  Shield,
  User as UserIcon,
  X,
  Loader2,
  Send,
  Sparkles,
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/useAuth';

export default function CreatePostWidget({ onPostCreated, onOpenAuth }) {
  const { user, profile, isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [mediaList, setMediaList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Selector de entidades deportivas de Football Core (opcional)
  const [showEntitySelectors, setShowEntitySelectors] = useState(false);
  const [partidos, setPartidos] = useState([]);
  const [teams, setTeams] = useState([]);
  const [jugadores, setJugadores] = useState([]);

  const [selectedPartido, setSelectedPartido] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedJugador, setSelectedJugador] = useState('');

  const fileInputRef = useRef(null);

  // Cargar entidades de Football Core solo si se abren los selectores
  useEffect(() => {
    if (!showEntitySelectors) return;
    if (teams.length === 0) {
      api.get('/teams').then((r) => setTeams(r.data)).catch(() => {});
    }
    if (partidos.length === 0) {
      api.get('/partidos').then((r) => setPartidos(r.data)).catch(() => {});
    }
    if (jugadores.length === 0) {
      api.get('/jugadores').then((r) => setJugadores(r.data)).catch(() => {});
    }
  }, [showEntitySelectors, teams.length, partidos.length, jugadores.length]);

  // Manejar subida de archivos (imágenes o videos)
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      for (const file of files) {
        if (file.size > 35 * 1024 * 1024) {
          setError(`El archivo ${file.name} excede el límite de 35MB`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const { data } = await api.post('/social/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setMediaList((prev) => [
          ...prev,
          {
            url: data.url,
            type: data.type,
            caption: '',
          },
        ]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir archivo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index) => {
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && mediaList.length === 0) return;
    if (!isAuthenticated) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        content: content.trim(),
        media: mediaList,
        relatedPartido: selectedPartido || undefined,
        relatedTeam: selectedTeam || undefined,
        relatedJugador: selectedJugador || undefined,
      };

      const { data } = await api.post('/social/posts', payload);
      setContent('');
      setMediaList([]);
      setSelectedPartido('');
      setSelectedTeam('');
      setSelectedJugador('');
      setShowEntitySelectors(false);

      if (onPostCreated) onPostCreated(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al publicar');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl bg-secondary/80 border border-accent/20 p-5 text-center shadow-lg">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent text-xl">
          🏈
        </div>
        <h3 className="font-bold text-white text-base">Únete a la conversación</h3>
        <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
          Inicia sesión o crea tu perfil para publicar fotos, videos y debatir sobre los partidos de la liga.
        </p>
        <button
          onClick={onOpenAuth}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-accent-light"
        >
          <span>Ingresar / Registrarme</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-secondary border border-accent/20 p-4 shadow-lg">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          {/* Avatar autor */}
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt=""
              className="h-10 w-10 rounded-full object-cover border border-accent/40 flex-shrink-0"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent font-bold flex-shrink-0">
              {profile?.username ? profile.username[0].toUpperCase() : 'U'}
            </div>
          )}

          {/* Área de texto */}
          <div className="flex-1 min-w-0">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="¿Qué está pasando en la liga? Usa #hashtags o menciona @usuarios..."
              rows={3}
              maxLength={2000}
              className="w-full resize-none rounded-xl bg-primary/60 border border-white/10 p-3 text-sm text-white placeholder-white/40 focus:border-accent focus:outline-none transition leading-relaxed"
            />

            {error && (
              <p className="mt-1 text-xs text-red-400">{error}</p>
            )}

            {/* Previsualización de medios adjuntos */}
            {mediaList.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {mediaList.map((m, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/50">
                    {m.type === 'video' ? (
                      <video src={m.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white hover:bg-red-500 transition"
                      aria-label="Quitar archivo"
                    >
                      <X size={13} />
                    </button>
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                      {m.type}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Selector de relación con Football Core (opcional y desacoplado) */}
            {showEntitySelectors && (
              <div className="mt-3 rounded-xl bg-primary/40 border border-white/10 p-3 space-y-2 animate-fadeIn">
                <p className="text-[11px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                  <Sparkles size={12} />
                  Vincular a contenido deportivo existente (opcional)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Selector Partido */}
                  <div>
                    <label className="block text-[10px] text-white/50 mb-1">Partido relacionado</label>
                    <select
                      value={selectedPartido}
                      onChange={(e) => setSelectedPartido(e.target.value)}
                      className="w-full rounded-lg bg-secondary border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-accent focus:outline-none"
                    >
                      <option value="">Ninguno</option>
                      {partidos.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.equipoLocal} vs {p.equipoVisitante} ({p.jornada || p.categoria})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selector Equipo */}
                  <div>
                    <label className="block text-[10px] text-white/50 mb-1">Equipo relacionado</label>
                    <select
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className="w-full rounded-lg bg-secondary border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-accent focus:outline-none"
                    >
                      <option value="">Ninguno</option>
                      {teams.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selector Jugador */}
                  <div>
                    <label className="block text-[10px] text-white/50 mb-1">Jugador relacionado</label>
                    <select
                      value={selectedJugador}
                      onChange={(e) => setSelectedJugador(e.target.value)}
                      className="w-full rounded-lg bg-secondary border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-accent focus:outline-none"
                    >
                      <option value="">Ninguno</option>
                      {jugadores.map((j) => (
                        <option key={j._id} value={j._id}>
                          {j.nombre} ({j.equipo})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Acciones de la barra inferior */}
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-1">
                {/* Input oculto de archivos */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white transition"
                  title="Adjuntar foto o video"
                >
                  <Image size={16} className="text-accent" />
                  <span className="hidden sm:inline">Foto / Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowEntitySelectors(!showEntitySelectors)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                    showEntitySelectors || selectedPartido || selectedTeam || selectedJugador
                      ? 'bg-accent/20 text-accent font-bold'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                  title="Vincular a un partido, equipo o jugador de la liga"
                >
                  <Calendar size={16} />
                  <span className="hidden sm:inline">Vincular Deporte</span>
                </button>

                {uploading && (
                  <span className="flex items-center gap-1 text-[11px] text-accent animate-pulse ml-2">
                    <Loader2 size={13} className="animate-spin" />
                    Subiendo archivo...
                  </span>
                )}
              </div>

              {/* Botón Publicar */}
              <button
                type="submit"
                disabled={(!content.trim() && mediaList.length === 0) || submitting || uploading}
                className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Publicar</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
