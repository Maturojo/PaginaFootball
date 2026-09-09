import { useState, useRef } from 'react';
import { X, Image, Video, Loader2, Plus, Trash2 } from 'lucide-react';
import api from '../../api';

export default function CreateHighlightModal({ isOpen, onClose, onHighlightCreated }) {
  const [title, setTitle] = useState('');
  const [cover, setCover] = useState('');
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await api.post('/social/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setItems((prev) => [
          ...prev,
          {
            mediaUrl: data.url,
            mediaType: data.type,
            caption: '',
          },
        ]);

        if (!cover) {
          setCover(data.url);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir archivo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const updateCaption = (index, val) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, caption: val } : item))
    );
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || items.length === 0) return;

    setSubmitting(true);
    setError('');

    try {
      const { data } = await api.post('/social/highlights', {
        title: title.trim(),
        cover: cover || items[0]?.mediaUrl,
        items,
      });

      if (onHighlightCreated) onHighlightCreated(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear historia destacada');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-secondary p-6 text-white shadow-2xl border border-accent/30 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-black mb-1">Nueva Historia Destacada</h2>
        <p className="text-xs text-white/50 mb-5">
          Agrupa tus mejores jugadas, momentos y entrenamientos en tu perfil.
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/15 border border-red-500/30 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1">
              Título del Destacado
            </label>
            <input
              type="text"
              required
              maxLength={40}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej: Touchdowns 2025, Entrenamientos..."
              className="w-full rounded-xl bg-primary/70 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                Momentos / Clips ({items.length})
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,video/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1 text-xs font-bold text-accent hover:text-accent-light"
              >
                {uploading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                <span>Subir fotos/videos</span>
              </button>
            </div>

            {items.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-white/15 hover:border-accent/50 rounded-2xl p-8 text-center transition bg-primary/30"
              >
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Image size={20} />
                </div>
                <p className="text-xs font-bold text-white">Haz clic para subir fotos o clips</p>
                <p className="text-[11px] text-white/40 mt-1">Formatos JPG, PNG, MP4 hasta 35MB</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-primary/60 rounded-xl p-2.5 border border-white/10"
                  >
                    <div className="h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                      {item.mediaType === 'video' ? (
                        <video src={item.mediaUrl} className="w-full h-full object-cover" />
                      ) : (
                        <img src={item.mediaUrl} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={item.caption}
                        onChange={(e) => updateCaption(idx, e.target.value)}
                        placeholder="Descripción o jugada (opcional)"
                        className="w-full rounded-lg bg-secondary/80 border border-white/10 px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:border-accent focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1.5 text-white/40 hover:text-red-400 transition"
                      title="Quitar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              disabled={submitting || items.length === 0 || !title.trim()}
              className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-accent-light disabled:opacity-40"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Guardar Destacado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
