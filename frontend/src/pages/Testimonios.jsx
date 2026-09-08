import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { API_URL } from '../config.js';

const DEFAULT_TESTIMONIOS = [
  {
    nombre: 'Lucas Gabotto',
    rol: 'Pre-selección Argentina · 5 MVPs del Tazon del Mar',
    imagen: '/jugadores/lucas-gabotto.png',
    texto: 'Estos diez años en la liga fueron una experiencia muy buena para mí. Fui mejorando de a poco, pasando de tener un desempeño más bajo a sentirme cada vez más cómodo y rendir mejor dentro de la cancha. Además, me quedo con la buena onda y todos los momentos compartidos con mis amigos y compañeros durante estos años.',
    activo: true,
  },
];

function imageSrc(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  if (src.startsWith('/jugadores') || src.startsWith('/hero') || src.startsWith('/equipos')) return src;
  return src.startsWith('/') ? `${API_URL}${src}` : src;
}

function mergeTestimonios(items = []) {
  const visibles = items.filter(item => item.activo !== false);
  const defaultsByName = new Map(DEFAULT_TESTIMONIOS.map(item => [item.nombre.toLowerCase(), item]));
  const enriched = visibles.map(item => {
    const fallback = defaultsByName.get(item.nombre?.toLowerCase());
    return fallback ? { ...fallback, ...item, rol: item.rol || fallback.rol, imagen: item.imagen || fallback.imagen } : item;
  });
  const names = new Set(enriched.map(item => item.nombre?.toLowerCase()));
  const missingDefaults = DEFAULT_TESTIMONIOS.filter(item => !names.has(item.nombre.toLowerCase()));
  return [...enriched, ...missingDefaults];
}

export default function Testimonios() {
  const [form, setForm] = useState({ nombre: '', rol: '', texto: '', imagen: null });
  const [preview, setPreview] = useState('');
  const [testimonios, setTestimonios] = useState(DEFAULT_TESTIMONIOS);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState('');

  const remaining = useMemo(() => 700 - form.texto.length, [form.texto.length]);

  const loadTestimonios = ({ showLoading = true } = {}) => {
    if (showLoading) setLoadingItems(true);
    api.get('/pages/testimonios')
      .then(r => setTestimonios(mergeTestimonios(r.data?.contenido?.items || [])))
      .catch(() => setTestimonios(DEFAULT_TESTIMONIOS))
      .finally(() => setLoadingItems(false));
  };

  useEffect(() => {
    api.get('/pages/testimonios')
      .then(r => setTestimonios(mergeTestimonios(r.data?.contenido?.items || [])))
      .catch(() => setTestimonios(DEFAULT_TESTIMONIOS))
      .finally(() => setLoadingItems(false));
  }, []);

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
      loadTestimonios();
    } catch (e) {
      setError(e.response?.data?.message || 'No pudimos cargar el testimonio. Probá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary text-white pt-16">
      <section className="bg-secondary border-b border-accent/20 py-16 px-4 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-accent">Comunidad</p>
        <h1 className="mt-3 text-3xl md:text-5xl font-extrabold">Testimonios</h1>
        <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded" />
        <p className="text-white/50 mt-4 text-lg">Experiencias reales de quienes forman parte de la liga.</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-accent">Voces de la liga</p>
            <h2 className="mt-3 text-2xl font-black uppercase text-white md:text-3xl">Todos los testimonios</h2>
          </div>
          {loadingItems && <p className="text-sm text-white/40">Cargando testimonios...</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonios.map((item, index) => (
            <article key={`${item.nombre}-${index}`} className="rounded-2xl border border-accent/20 bg-secondary p-6">
              <div className="mb-5 flex items-center gap-4">
                {item.imagen ? (
                  <img src={imageSrc(item.imagen)} alt={item.nombre} className="h-16 w-16 rounded-full border-2 border-accent/25 object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/20 bg-primary text-xl font-extrabold text-accent">
                    {item.nombre?.charAt(0) || '?'}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="truncate font-extrabold text-white">{item.nombre}</h3>
                  {item.rol && <p className="mt-1 text-sm text-accent">{item.rol}</p>}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-white/68">“{item.texto}”</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto pb-16 px-4">
        <div className="mb-8 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-accent">Participá</p>
          <h2 className="mt-3 text-2xl font-black uppercase text-white md:text-3xl">Sumá tu testimonio</h2>
        </div>
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
