import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Testimonios() {
  const [form, setForm] = useState({ nombre: '', rol: '', texto: '', imagen: null });
  const [preview, setPreview] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const remaining = useMemo(() => 700 - form.texto.length, [form.texto.length]);

  const setField = (name, value) => {
    setForm(current => ({ ...current, [name]: value }));
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0] || null;
    setField('imagen', file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : '');
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const payload = new FormData();
    payload.append('nombre', form.nombre);
    payload.append('rol', form.rol);
    payload.append('texto', form.texto);
    if (form.imagen) payload.append('imagen', form.imagen);

    try {
      await api.post('/pages/testimonios', payload);
      setEnviado(true);
      setForm({ nombre: '', rol: '', texto: '', imagen: null });
      if (preview) URL.revokeObjectURL(preview);
      setPreview('');
    } catch (e) {
      setError(e.response?.data?.message || 'No pudimos cargar el testimonio. Probá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary text-white pt-16">
      <section className="bg-secondary border-b border-accent/20 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold">Sumá tu testimonio</h1>
        <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded" />
        <p className="text-white/50 mt-4 text-lg">Contá qué significó la liga para vos y aparece en la página principal.</p>
      </section>

      <section className="max-w-3xl mx-auto py-16 px-4">
        {enviado ? (
          <div className="rounded-2xl border border-green-500/30 bg-green-900/30 p-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Testimonio cargado</h2>
            <p className="text-white/60">Gracias por compartirlo. Ya está disponible en el inicio.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/" className="rounded-full bg-accent px-6 py-2.5 font-bold text-white transition hover:bg-accent-light">
                Ver inicio
              </Link>
              <button
                type="button"
                onClick={() => setEnviado(false)}
                className="rounded-full border border-white/20 px-6 py-2.5 font-bold text-white transition hover:bg-white/10"
              >
                Cargar otro
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            {error && <div className="rounded-lg border border-red-500/30 bg-red-900/30 p-3 text-sm text-red-300">{error}</div>}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-white/70">Nombre completo *</label>
                <input
                  value={form.nombre}
                  onChange={e => setField('nombre', e.target.value)}
                  required
                  maxLength={80}
                  className="w-full rounded-lg border border-accent/20 bg-secondary px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-white/70">Rol / equipo</label>
                <input
                  value={form.rol}
                  onChange={e => setField('rol', e.target.value)}
                  maxLength={100}
                  className="w-full rounded-lg border border-accent/20 bg-secondary px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Jugador, entrenadora, equipo..."
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
              <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-accent/25 bg-secondary">
                {preview ? (
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-extrabold text-accent">
                    {form.nombre.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-white/70">Foto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="block w-full text-sm text-white/50 file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:font-bold file:text-white hover:file:bg-accent-light"
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-white/70">Testimonio *</label>
                <span className={`text-xs ${remaining < 80 ? 'text-accent' : 'text-white/35'}`}>{remaining}</span>
              </div>
              <textarea
                value={form.texto}
                onChange={e => setField('texto', e.target.value)}
                required
                maxLength={700}
                rows={7}
                className="w-full resize-none rounded-lg border border-accent/20 bg-secondary px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Contanos tu experiencia en la liga..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent py-3 font-bold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-light disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Publicar testimonio'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
