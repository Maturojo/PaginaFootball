import { useState, useEffect, useRef } from 'react';
import { X, Image, Loader2, Link as LinkIcon, User as UserIcon, Search, Check, Trash2 } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/useAuth';
import { mergePlayers, FALLBACK_PLAYERS } from '../../data/players.js';

export default function EditProfileModal({ isOpen, onClose, currentProfile, onProfileUpdated }) {
  const { updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(currentProfile?.displayName || '');
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [avatar, setAvatar] = useState(currentProfile?.avatar || '');
  const [banner, setBanner] = useState(currentProfile?.banner || '');
  const [selectedJugadorRef, setSelectedJugadorRef] = useState(
    currentProfile?.jugadorRef?._id || currentProfile?.jugadorRef?.nombre || ''
  );

  const [jugadores, setJugadores] = useState([]);
  const [playerSearch, setPlayerSearch] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(currentProfile?.displayName || '');
      setBio(currentProfile?.bio || '');
      setAvatar(currentProfile?.avatar || '');
      setBanner(currentProfile?.banner || '');
      setSelectedJugadorRef(
        currentProfile?.jugadorRef?._id || currentProfile?.jugadorRef?.nombre || ''
      );

      // Cargar lista completa de atletas de la liga (API + Fallbacks unificados)
      api.get('/jugadores')
        .then((r) => setJugadores(mergePlayers(r.data)))
        .catch(() => setJugadores(FALLBACK_PLAYERS));
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;

  const handleUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'avatar') setUploadingAvatar(true);
    else setUploadingBanner(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/social/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (type === 'avatar') setAvatar(data.url);
      else setBanner(data.url);
    } catch (err) {
      setError('Error al subir imagen');
    } finally {
      if (type === 'avatar') setUploadingAvatar(false);
      else setUploadingBanner(false);
    }
  };

  const selectedPlayerObj = jugadores.find(
    (j) => j._id === selectedJugadorRef || j.nombre === selectedJugadorRef || j._id === currentProfile?.jugadorRef?._id
  );

  const filteredPlayers = jugadores.filter((j) => {
    if (!playerSearch.trim()) return true;
    const term = playerSearch.toLowerCase();
    return (
      j.nombre.toLowerCase().includes(term) ||
      j.equipo.toLowerCase().includes(term) ||
      (j.posicion && j.posicion.toLowerCase().includes(term)) ||
      String(j.numero || '').includes(term)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // 1. Guardar datos de perfil social
      await api.put('/social/profiles/me', {
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatar,
        banner,
      });

      // 2. Vincular o desvincular atleta deportivo
      let finalProfile = null;
      if (selectedJugadorRef && selectedPlayerObj) {
        const { data: linkRes } = await api.post('/social/link-player', {
          jugadorId: selectedPlayerObj._id?.startsWith('fallback-') ? undefined : selectedPlayerObj._id,
          jugadorNombre: selectedPlayerObj.nombre,
          equipo: selectedPlayerObj.equipo,
          posicion: selectedPlayerObj.posicion,
          numero: selectedPlayerObj.numero,
        });
        finalProfile = linkRes.profile;
      } else {
        const { data: linkRes } = await api.post('/social/link-player', {
          jugadorId: null,
        });
        finalProfile = linkRes.profile;
      }

      updateProfile(finalProfile);
      if (onProfileUpdated) onProfileUpdated(finalProfile);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar perfil');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-secondary p-6 text-white shadow-2xl border border-accent/30 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-black mb-1">Editar Perfil Social</h2>
        <p className="text-xs text-white/50 mb-5">
          Personaliza tu perfil y vincula tu ficha deportiva oficial de la liga.
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/15 border border-red-500/30 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Banner y Avatar */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
              Fotos de perfil y portada
            </label>
            <div className="relative rounded-2xl overflow-hidden bg-primary/60 border border-white/10 h-28 flex items-center justify-center">
              {banner ? (
                <img src={banner} alt="Portada" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-white/40">Sin foto de portada</span>
              )}
              <input
                type="file"
                ref={bannerInputRef}
                onChange={(e) => handleUpload(e, 'banner')}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                disabled={uploadingBanner}
                className="absolute top-2 right-2 rounded-xl bg-black/75 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-black transition flex items-center gap-1.5 shadow"
              >
                {uploadingBanner ? <Loader2 size={12} className="animate-spin" /> : <Image size={12} />}
                <span>Cambiar Portada</span>
              </button>
            </div>

            {/* Avatar picker */}
            <div className="flex items-center gap-4 mt-3">
              <div className="relative h-16 w-16 rounded-full overflow-hidden bg-accent/20 border-2 border-accent flex-shrink-0 shadow-lg">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-accent font-black text-xl">
                    👤
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={(e) => handleUpload(e, 'avatar')}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="rounded-xl border border-white/15 bg-primary/70 px-3 py-1.5 text-xs font-bold text-white hover:border-accent transition flex items-center gap-1.5"
              >
                {uploadingAvatar ? <Loader2 size={13} className="animate-spin" /> : <Image size={13} />}
                <span>Cambiar Foto</span>
              </button>
            </div>
          </div>

          {/* Nombre visible */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1">
              Nombre visible
            </label>
            <input
              type="text"
              required
              maxLength={60}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl bg-primary/70 border border-white/10 px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none"
            />
          </div>

          {/* Biografía */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1">
              Biografía (máx. 300 caracteres)
            </label>
            <textarea
              rows={3}
              maxLength={300}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntale a la comunidad sobre ti, tu equipo o tu pasión por el football..."
              className="w-full resize-none rounded-xl bg-primary/70 border border-white/10 p-3 text-sm text-white placeholder-white/30 focus:border-accent focus:outline-none"
            />
            <p className="text-right text-[10px] text-white/40 mt-0.5">{bio.length}/300</p>
          </div>

          {/* ============================================================ */}
          {/* SECCIÓN VINCULACIÓN DE FICHA DEPORTIVA OFICIAL                */}
          {/* ============================================================ */}
          <div className="rounded-2xl bg-primary/60 border border-accent/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-wider">
                <LinkIcon size={14} />
                <span>Vincular con Ficha de Jugador</span>
              </div>
              {selectedPlayerObj && (
                <button
                  type="button"
                  onClick={() => setSelectedJugadorRef('')}
                  className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 font-semibold"
                >
                  <Trash2 size={12} />
                  <span>Desvincular</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-white/50 leading-relaxed">
              Si juegas en algún equipo de la Liga Football MDP, vincula tu cuenta a tu atleta.
              Esto mostrará el botón oficial <strong>"Ver ficha deportiva"</strong> en tu perfil social
              y un enlace hacia tu cuenta en la sección de jugadores.
            </p>

            {/* Atleta actualmente seleccionado */}
            {selectedPlayerObj ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-accent/15 border border-accent/40">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white font-bold text-xs">
                    #{selectedPlayerObj.numero || '0'}
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-white leading-tight">
                      {selectedPlayerObj.nombre}
                    </p>
                    <p className="text-[10px] text-accent-light">
                      {selectedPlayerObj.equipo} · {selectedPlayerObj.posicion || 'Jugador'}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-green-400">
                  <Check size={14} /> Vinculado
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-white/40">
                Sin ficha deportiva vinculada actualmente.
              </div>
            )}

            {/* Buscador de jugadores */}
            <div>
              <div className="relative mb-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  placeholder="Buscar jugador por nombre o equipo..."
                  className="w-full rounded-xl bg-secondary border border-white/10 pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:border-accent focus:outline-none"
                />
              </div>

              {/* Lista seleccionable de atletas */}
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {filteredPlayers.slice(0, 25).map((j) => {
                  const isSelected = selectedJugadorRef === j._id || selectedJugadorRef === j.nombre;
                  return (
                    <button
                      key={j._id || j.nombre}
                      type="button"
                      onClick={() => setSelectedJugadorRef(j._id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition ${
                        isSelected
                          ? 'bg-accent text-white font-bold'
                          : 'hover:bg-secondary text-white/80'
                      }`}
                    >
                      <span className="truncate">
                        {j.numero ? `#${j.numero} ` : ''}{j.nombre} ({j.equipo})
                      </span>
                      <span className="text-[10px] opacity-70 ml-2 flex-shrink-0">
                        {j.posicion || 'Atleta'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 justify-end pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-white/60 hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-accent-light disabled:opacity-50"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
