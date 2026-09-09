import { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../../api';

export default function ReportModal({ isOpen, onClose, postId, commentId }) {
  const [reason, setReason] = useState('inapropiado');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/social/report', {
        postId: postId || undefined,
        commentId: commentId || undefined,
        reason,
        description,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl bg-secondary p-6 text-white shadow-2xl border border-accent/30"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-400">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Reportar Contenido</h3>
            <p className="text-xs text-white/50">Ayúdanos a mantener una comunidad sana y deportiva</p>
          </div>
        </div>

        {submitted ? (
          <div className="rounded-xl bg-green-500/15 border border-green-500/30 p-4 text-center text-green-400 text-sm">
            ✓ Reporte enviado correctamente. Nuestro equipo lo revisará a la brevedad.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-500/15 border border-red-500/30 p-3 text-xs text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                Motivo del reporte
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl bg-primary/70 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:border-accent focus:outline-none"
              >
                <option value="inapropiado">Contenido inapropiado u ofensivo</option>
                <option value="spam">Spam o publicidad no deseada</option>
                <option value="agresion">Falta de respeto o agresión</option>
                <option value="desinformacion">Información falsa sobre la liga</option>
                <option value="otro">Otro motivo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                Detalles adicionales (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe brevemente el problema..."
                maxLength={500}
                className="w-full rounded-xl bg-primary/70 border border-white/10 p-3 text-sm text-white placeholder-white/30 focus:border-accent focus:outline-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-white/60 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Enviar Reporte
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
