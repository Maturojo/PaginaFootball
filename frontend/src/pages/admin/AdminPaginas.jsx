import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';
import { API_URL } from '../../config.js';
import { FALLBACK_PARTIDOS } from '../../data/stats.js';

const DEFAULT_HERO_SLIDES = [
  '/hero/portada-slide-mariscal.jpg',
  '/hero/portada-slide-chicas.jpg',
];

const DEFAULT_MODALIDADES = [
  {
    id: 'equipado',
    title: 'Football Equipado',
    desc: 'Entrenamientos con casco y hombreras para quienes quieren vivir la modalidad con contacto.',
    detail: 'Es la versión con contacto del fútbol americano. Se juega con casco, hombreras y protecciones, trabajando bloqueo, tackleo, estrategia ofensiva y defensiva en equipo.',
    points: [
      ['Contacto', 'Se aprende progresivamente, con técnica y seguridad antes de pasar a situaciones reales de juego.'],
      ['Roles definidos', 'Hay posiciones ofensivas y defensivas: corredores, receptores, línea, mariscal, defensivos y más.'],
      ['Entrenamiento', 'Ideal para quienes quieren vivir la intensidad del football con equipamiento completo.'],
    ],
    image: '/hero/portada-equipados-accion.jpg',
    slides: [
      '/hero/modalidad-equipado-1.jpg',
      '/hero/modalidad-equipado-2.jpg',
      '/hero/modalidad-equipado-3.jpg',
    ],
    to: '/equipos',
    cta: 'Ver equipos',
  },
  {
    id: 'flag-masculino',
    title: 'Flag Masculino',
    desc: 'Competencia 5vs5, ritmo alto y técnica para aprender el deporte desde sus fundamentos.',
    detail: 'Es una modalidad sin contacto fuerte: para detener la jugada se quita una bandera del cinturón del rival. Prioriza velocidad, lectura de juego, pases, rutas y defensa individual.',
    points: [
      ['Sin tackleo', 'La jugada termina cuando se retira una flag, por eso es ágil y accesible para empezar.'],
      ['Formato 5vs5', 'Se juega con cinco jugadores por equipo, mucho espacio y decisiones rápidas.'],
      ['Competencia local', 'La liga masculina combina entrenamientos, partidos y torneos durante la temporada.'],
    ],
    image: '/hero/portada-flag-accion.jpg',
    slides: [
      '/hero/portada-flag-accion.jpg',
      '/hero/portada-slide-flag-1.jpg',
      '/hero/portada-slide-flag-2.jpg',
      '/hero/portada-slide-flag-3.jpg',
    ],
    to: '/equipos',
    cta: 'Ver equipos',
  },
  {
    id: 'flag-femenino',
    title: 'Flag Femenino',
    desc: 'Equipos femeninos en crecimiento, entrenamientos abiertos y comunidad para empezar desde cero.',
    detail: 'Comparte las reglas centrales del flag 5vs5 y suma un espacio femenino en crecimiento, pensado para entrenar, competir y aprender el deporte en grupo desde cualquier nivel.',
    points: [
      ['Abierto a principiantes', 'Podés probar aunque nunca hayas jugado: se enseñan técnica, reglas y fundamentos desde cero.'],
      ['Juego dinámico', 'La modalidad combina velocidad, coordinación, pases, recepción y lectura defensiva.'],
      ['Equipo y comunidad', 'Es una puerta de entrada ideal para sumarse a Nereidas y a la liga femenina local.'],
    ],
    image: '/hero/portada-femenino-accion.jpg',
    slides: ['/hero/portada-femenino-accion.jpg'],
    to: '/inscripcion',
    cta: 'Sumarme',
  },
];

const DEFAULT_TRAINING_PLACES = [
  [
    'Centro Naval',
    'Entrenamientos y partidos',
    [
      ['Miércoles', '18:00 a 20:00 · Entrenamientos de todas las modalidades'],
      ['Sábados', '13:00 a 14:00 · Flag Femenino'],
      ['Sábados', '14:00 a 16:00 · Liga de Football Flag'],
      ['Sábados', '16:00 a 18:00 · Entrenamiento de Equipados'],
    ],
  ],
];

const DEFAULT_EXPERIENCE = {
  eyebrow: 'Probá una clase',
  title: 'No necesitás experiencia',
  text: 'Entrená con nosotros aunque nunca hayas jugado. Te prestamos una bandera, te enseñamos desde cero y podés probar una clase.',
  cta: 'Quiero probar',
  to: '/inscripcion',
};

const DEFAULT_HOME_TEXT = {
  heroMeta: 'Est. 2016 · Mar del Plata · Argentina',
  heroPrimaryCta: 'SUMATE',
  heroPrimaryTo: '/inscripcion',
  heroStoreCta: 'Ir a la Tienda',
  heroStoreTo: '/tienda',
  heroShirtCta: 'Diseña tu remera',
  heroShirtTo: '/remeras',
  welcomeTitle: 'Bienvenidos a la Liga',
  modalitiesEyebrow: 'Entrená con nosotros',
  modalitiesTitle: 'Elegí tu modalidad',
  modalitiesAllTeamsLabel: 'Ver todos los equipos →',
  modalitiesAllTeamsTo: '/equipos',
  modalitiesExplanationCta: 'Ver explicación',
  howToPlayEyebrow: 'Cómo se juega',
  trainingEyebrow: 'Lugares de entrenamiento',
  trainingTitle: 'Dónde nos encontrás',
  newsTitle: 'Últimas Noticias',
  newsAllLabel: 'Ver todas →',
  newsAllTo: '/noticias',
  eventTitle: 'Último Evento',
  eventAllLabel: 'Ver todos →',
  eventAllTo: '/eventos',
  eventPhotosLabel: 'Ver fotos →',
  galleryTitle: 'Momentos de la Liga',
  galleryAllLabel: 'Ver todos →',
  galleryAllTo: '/eventos',
  contactTitle: '¿Querés sumarte a la liga?',
  contactText: 'Contactanos y te informamos sobre cómo participar.',
  contactCta: 'Contactanos',
  contactTo: '/contacto',
};

const HOME_TEXT_GROUPS = [
  {
    title: 'Portada principal',
    fields: [
      ['heroMeta', 'Texto superior'],
      ['heroPrimaryCta', 'Botón principal'],
      ['heroPrimaryTo', 'Link botón principal'],
      ['heroStoreCta', 'Botón tienda'],
      ['heroStoreTo', 'Link botón tienda'],
      ['heroShirtCta', 'Botón remeras'],
      ['heroShirtTo', 'Link botón remeras'],
    ],
  },
  {
    title: 'Bienvenida y modalidades',
    fields: [
      ['welcomeTitle', 'Título bienvenida'],
      ['modalitiesEyebrow', 'Etiqueta modalidades'],
      ['modalitiesTitle', 'Título modalidades'],
      ['modalitiesAllTeamsLabel', 'Link ver equipos'],
      ['modalitiesAllTeamsTo', 'Destino ver equipos'],
      ['modalitiesExplanationCta', 'Botón explicación'],
      ['howToPlayEyebrow', 'Etiqueta explicación'],
    ],
  },
  {
    title: 'Entrenamientos, noticias y eventos',
    fields: [
      ['trainingEyebrow', 'Etiqueta entrenamientos'],
      ['trainingTitle', 'Título entrenamientos'],
      ['newsTitle', 'Título noticias'],
      ['newsAllLabel', 'Link todas las noticias'],
      ['newsAllTo', 'Destino noticias'],
      ['eventTitle', 'Título evento'],
      ['eventAllLabel', 'Link todos los eventos'],
      ['eventAllTo', 'Destino eventos'],
      ['eventPhotosLabel', 'Texto ver fotos'],
      ['galleryTitle', 'Título galería'],
      ['galleryAllLabel', 'Link galería'],
      ['galleryAllTo', 'Destino galería'],
    ],
  },
  {
    title: 'Contacto final',
    fields: [
      ['contactTitle', 'Título contacto'],
      ['contactText', 'Texto contacto', 'textarea'],
      ['contactCta', 'Botón contacto'],
      ['contactTo', 'Link contacto'],
    ],
  },
];

const SIMPLE_PAGES = [
  {
    key: 'historia',
    label: 'Historia',
    fields: [
      { name: 'titulo', label: 'Título', type: 'text' },
      { name: 'subtitulo', label: 'Texto corto de portada', type: 'textarea', rows: 3 },
      { name: 'texto', label: 'Texto de la historia', type: 'textarea', rows: 8 },
      { name: 'imagen', label: 'Imagen de portada', type: 'image' },
    ],
  },
  {
    key: 'contacto',
    label: 'Contacto',
    fields: [
      { name: 'titulo', label: 'Título', type: 'text' },
      { name: 'direccion', label: 'Dirección', type: 'text' },
      { name: 'telefono', label: 'Teléfono / WhatsApp', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'instagram', label: 'Instagram (solo usuario)', type: 'text' },
      { name: 'facebook', label: 'Facebook (usuario o URL)', type: 'text' },
    ],
  },
];

const CUSTOM_PAGES = [
  { key: 'calendario', label: 'Calendario' },
  { key: 'testimonios', label: 'Testimonios' },
  { key: 'sponsors', label: 'Sponsors' },
  { key: 'emails', label: 'Emails' },
];

const PAGES = [{ key: 'inicio', label: 'Inicio' }, ...SIMPLE_PAGES, ...CUSTOM_PAGES];

const LIST_CONFIG = {
  calendario: {
    title: 'Calendario simple',
    emptyItem: { titulo: '', tipo: 'Entrenamiento', fecha: '', hora: '', lugar: 'Centro Naval', descripcion: '', activo: true },
    fields: [
      ['titulo', 'Título'],
      ['tipo', 'Tipo'],
      ['fecha', 'Fecha'],
      ['hora', 'Hora'],
      ['lugar', 'Lugar'],
      ['descripcion', 'Descripción', 'textarea'],
    ],
  },
  testimonios: {
    title: 'Testimonios',
    emptyItem: { nombre: '', rol: '', texto: '', imagen: '', activo: true },
    fields: [
      ['nombre', 'Nombre'],
      ['rol', 'Rol / equipo'],
      ['texto', 'Frase', 'textarea'],
      ['imagen', 'Foto', 'image'],
    ],
  },
  sponsors: {
    title: 'Sponsors y aliados',
    emptyItem: { nombre: '', descripcion: '', web: '', imagen: '', activo: true },
    fields: [
      ['nombre', 'Nombre'],
      ['web', 'Link'],
      ['descripcion', 'Descripción', 'textarea'],
      ['imagen', 'Logo / imagen', 'image'],
    ],
  },
};

const DEFAULT_EMAILS = {
  confirmationSubject: 'Recibimos tu inscripción - Liga de Football Americano MDP',
  confirmationBody: [
    'Hola {nombre},',
    '',
    'Tu inscripción en la Liga de Football Americano Mar del Plata se registró correctamente.',
    'Gracias por sumarte. Te vamos a escribir o llamar en cualquier momento para contarte los próximos pasos.',
    '',
    'Liga de Football Americano Mar del Plata',
  ].join('\n'),
  notificationSubject: 'Nueva inscripción - {nombre}',
  notificationIntro: 'Nueva inscripción recibida desde la web.',
};

function imageSrc(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  if (
    src.startsWith('/hero') ||
    src.startsWith('/historia') ||
    src.startsWith('/eventos') ||
    src.startsWith('/equipos') ||
    src.startsWith('/tienda') ||
    src.startsWith('/remeras') ||
    src.startsWith('/jugadores') ||
    src === '/logo.png'
  ) return src;
  return src.startsWith('/') ? `${API_URL}${src}` : src;
}

async function uploadImage(file) {
  const form = new FormData();
  form.append('imagen', file);
  const response = await api.post('/pages/upload/image', form);
  return response.data.url;
}

function mergeModalidades(custom = []) {
  if (!Array.isArray(custom)) return DEFAULT_MODALIDADES;
  return DEFAULT_MODALIDADES.map(defaultModalidad => ({
    ...defaultModalidad,
    ...(custom.find(item => item?.id === defaultModalidad.id) || {}),
  }));
}

function imageInputId(prefix, index = '') {
  return `${prefix}-${index}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function normalizeSlide(slide, defaults = {}) {
  const fallback = { fit: 'cover', x: 50, y: 50, zoom: 100, ...defaults };
  if (typeof slide === 'string') return { src: slide, ...fallback };
  const fit = slide?.fit === 'contain' ? 'contain' : fallback.fit;
  return {
    src: slide?.src || '',
    fit,
    x: Number.isFinite(Number(slide?.x)) ? Number(slide.x) : fallback.x,
    y: Number.isFinite(Number(slide?.y)) ? Number(slide.y) : fallback.y,
    zoom: Number.isFinite(Number(slide?.zoom)) ? Number(slide.zoom) : fallback.zoom,
  };
}

function calendarKey(item) {
  return String(item.sourceId || `${item.titulo}|${item.fecha}|${item.hora || ''}`).toLowerCase();
}

function formatCalendarDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function partidoToCalendarItem(partido) {
  const isAgenda = partido.tipo === 'agenda';
  const titulo = isAgenda
    ? (partido.titulo || partido.jornada)
    : `${partido.equipoLocal} vs ${partido.equipoVisitante}`;
  const marcador = partido.estado === 'finalizado' && partido.golesLocal !== null && partido.golesVisitante !== null
    ? `Resultado: ${partido.golesLocal} - ${partido.golesVisitante}`
    : '';

  return {
    sourceId: `fixture-${partido._id}`,
    titulo,
    tipo: partido.categoria || 'Fixture',
    fecha: partido.fechaTexto || formatCalendarDate(partido.fecha),
    fechaOrden: partido.fecha,
    hora: partido.hora ? `${partido.hora} hs` : '',
    lugar: partido.lugar || '',
    descripcion: [partido.jornada, marcador].filter(Boolean).join(' · '),
    activo: partido.activo !== false,
    fromFixture: true,
  };
}

function mergeCalendarItems(manualItems = [], partidos = []) {
  const merged = new Map();

  partidos
    .filter(partido => partido.activo !== false)
    .map(partidoToCalendarItem)
    .forEach(item => merged.set(calendarKey(item), item));

  manualItems
    .filter(item => item.activo !== false)
    .forEach(item => merged.set(calendarKey(item), item));

  return [...merged.values()].sort((a, b) => {
    const dateA = new Date(a.fechaOrden || a.fecha);
    const dateB = new Date(b.fechaOrden || b.fecha);
    const timeA = Number.isFinite(dateA.getTime()) ? dateA.getTime() : Number.MAX_SAFE_INTEGER;
    const timeB = Number.isFinite(dateB.getTime()) ? dateB.getTime() : Number.MAX_SAFE_INTEGER;
    return timeA - timeB;
  });
}

function cleanSlide(slide, defaults) {
  const normalized = normalizeSlide(slide, defaults);
  if (!normalized.src) return null;
  return normalized;
}

function ImageValueEditor({ label, value, onChange, id }) {
  const inputId = imageInputId(id || label);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {value && <img src={imageSrc(value)} alt="" className="mb-2 h-28 w-48 object-cover rounded-lg border border-gray-200" />}
      <div className="flex flex-col gap-2 md:flex-row">
        <input value={value || ''} onChange={e => onChange(e.target.value)} className="input" placeholder="/hero/foto.jpg o URL" />
        <label htmlFor={inputId} className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-blue-900">
          {uploading ? 'Subiendo...' : 'Subir'}
        </label>
        <input id={inputId} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
    </div>
  );
}

function slideStyle(slide) {
  const offsetX = (50 - slide.x) * 0.7;
  const offsetY = (50 - slide.y) * 0.7;
  return {
    objectFit: slide.fit === 'contain' ? 'contain' : 'cover',
    objectPosition: 'center center',
    transform: `translate(${offsetX}%, ${offsetY}%) scale(${slide.zoom / 100})`,
  };
}

function SlidesEditor({ title, slides, onChange, id, defaultFit = 'cover', defaultY = 50 }) {
  const [newUrl, setNewUrl] = useState('');
  const defaults = { fit: defaultFit, x: 50, y: defaultY, zoom: 100 };
  const values = (Array.isArray(slides) ? slides : []).map(slide => normalizeSlide(slide, defaults));

  const updateAt = (index, changes) => {
    onChange(values.map((slide, i) => (i === index ? { ...slide, ...changes } : slide)));
  };

  const updatePosition = (index, changes) => {
    onChange(values.map((slide, i) => (
      i === index
        ? { ...slide, fit: slide.fit === 'natural' ? 'cover' : slide.fit, zoom: slide.zoom <= 100 ? 115 : slide.zoom, ...changes }
        : slide
    )));
  };

  const move = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= values.length) return;
    const next = [...values];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    onChange(next);
  };

  const addUrl = () => {
    const clean = newUrl.trim();
    if (!clean) return;
    onChange([...values, { src: clean, ...defaults }]);
    setNewUrl('');
  };

  const addFile = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    const uploaded = [];
    for (const file of files) uploaded.push({ src: await uploadImage(file), ...defaults });
    onChange([...values, ...uploaded]);
    event.target.value = '';
  };

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <p className="mb-3 font-bold text-gray-800">{title}</p>
      <div className="space-y-3">
        {values.map((slide, index) => (
          <div key={`${slide.src}-${index}`} className="rounded-lg border border-gray-200 p-3">
            <div className="grid gap-3 md:grid-cols-[160px_1fr_auto] md:items-start">
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={imageSrc(slide.src)}
                    alt=""
                    className="h-full w-full"
                    style={slideStyle(slide)}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <input value={slide.src} onChange={e => updateAt(index, { src: e.target.value })} className="input" />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <label className="text-sm font-medium text-gray-700">
                    Modo
                    <select value={slide.fit} onChange={e => updateAt(index, { fit: e.target.value })} className="input mt-1">
                      <option value="cover">Rellenar sin margen</option>
                      <option value="contain">Foto completa</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium text-gray-700">
                    Zoom: {slide.zoom}%
                    <input
                      type="range"
                      min="80"
                      max="180"
                      value={slide.zoom}
                      onChange={e => updateAt(index, { zoom: Number(e.target.value) })}
                      className="mt-3 w-full accent-primary"
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-700">
                    Horizontal: {slide.x}%
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={slide.x}
                      onChange={e => updatePosition(index, { x: Number(e.target.value) })}
                      className="mt-3 w-full accent-primary"
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-700">
                    Vertical: {slide.y}%
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={slide.y}
                      onChange={e => updatePosition(index, { y: Number(e.target.value) })}
                      className="mt-3 w-full accent-primary"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Usá Zoom para acercar o alejar, y Horizontal/Vertical para mover el encuadre dentro del marco.
                </p>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(index, -1)} className="rounded border px-2 py-1 text-sm">↑</button>
                <button type="button" onClick={() => move(index, 1)} className="rounded border px-2 py-1 text-sm">↓</button>
                <button type="button" onClick={() => onChange(values.filter((_, i) => i !== index))} className="rounded border border-red-200 px-2 py-1 text-sm text-red-600">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2 md:flex-row">
        <input value={newUrl} onChange={e => setNewUrl(e.target.value)} className="input" placeholder="Pegar URL o ruta de imagen" />
        <button type="button" onClick={addUrl} className="rounded-lg border border-gray-300 px-4 py-2 font-bold hover:bg-gray-50">Agregar URL</button>
        <label htmlFor={imageInputId(id, 'slides')} className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-primary px-4 py-2 font-bold text-white hover:bg-blue-900">
          Subir fotos
        </label>
        <input id={imageInputId(id, 'slides')} type="file" accept="image/*" multiple onChange={addFile} className="hidden" />
      </div>
    </div>
  );
}

function InicioEditor() {
  const [contenido, setContenido] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/pages/inicio').then(r => {
      const data = r.data?.contenido || {};
      setContenido({
        titulo: data.titulo || 'Fútbol Americano',
        titulo2: data.titulo2 || 'Mar del Plata',
        subtitulo: data.subtitulo || 'Football Equipado – Flag Football 5vs5 Femenino y Masculino',
        descripcion: data.descripcion || 'Somos la liga oficial de Football Americano de Mar del Plata.',
        heroSlides: Array.isArray(data.heroSlides) && data.heroSlides.length ? data.heroSlides : DEFAULT_HERO_SLIDES,
        modalidades: mergeModalidades(data.modalidades),
        experience: { ...DEFAULT_EXPERIENCE, ...(data.experience || {}) },
        trainingPlaces: Array.isArray(data.trainingPlaces) && data.trainingPlaces.length ? data.trainingPlaces : DEFAULT_TRAINING_PLACES,
        homeText: { ...DEFAULT_HOME_TEXT, ...(data.homeText || {}) },
      });
    });
  }, []);

  const setField = (name, value) => setContenido(current => ({ ...current, [name]: value }));
  const setExperience = (name, value) => setContenido(current => ({
    ...current,
    experience: { ...current.experience, [name]: value },
  }));
  const setHomeText = (name, value) => setContenido(current => ({
    ...current,
    homeText: { ...current.homeText, [name]: value },
  }));
  const setModalidad = (index, nextModalidad) => setContenido(current => ({
    ...current,
    modalidades: current.modalidades.map((modalidad, i) => (i === index ? nextModalidad : modalidad)),
  }));

  const setTrainingText = (value) => {
    const schedule = value.split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [day, ...rest] = line.split('|');
        return [day?.trim() || 'Día', rest.join('|').trim()];
      });
    setContenido(current => ({ ...current, trainingPlaces: [['Centro Naval', 'Entrenamientos y partidos', schedule]] }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/pages/inicio', {
        contenido: {
          ...contenido,
          heroSlides: (contenido.heroSlides || []).map(slide => cleanSlide(slide, { fit: 'cover', x: 50, y: 52, zoom: 100 })).filter(Boolean),
          modalidades: (contenido.modalidades || []).map(modalidad => ({
            ...modalidad,
            slides: (modalidad.slides || []).map(slide => cleanSlide(slide, { fit: 'cover', x: 50, y: 50, zoom: 100 })).filter(Boolean),
          })),
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (!contenido) return <p className="text-gray-400">Cargando...</p>;

  const scheduleText = (contenido.trainingPlaces?.[0]?.[2] || [])
    .map(([day, item]) => `${day} | ${item}`)
    .join('\n');

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título principal</label>
          <input value={contenido.titulo} onChange={e => setField('titulo', e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Segunda línea del título</label>
          <input value={contenido.titulo2} onChange={e => setField('titulo2', e.target.value)} className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
          <input value={contenido.subtitulo} onChange={e => setField('subtitulo', e.target.value)} className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción bienvenida</label>
          <textarea value={contenido.descripcion} onChange={e => setField('descripcion', e.target.value)} className="input resize-none" rows={3} />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-4">
        <p className="mb-4 font-bold text-gray-800">Textos y botones del inicio</p>
        <div className="space-y-5">
          {HOME_TEXT_GROUPS.map(group => (
            <div key={group.title}>
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">{group.title}</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {group.fields.map(([name, label, type]) => (
                  <label key={name} className={type === 'textarea' ? 'md:col-span-2' : ''}>
                    <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
                    {type === 'textarea' ? (
                      <textarea
                        value={contenido.homeText[name] || ''}
                        onChange={e => setHomeText(name, e.target.value)}
                        className="input resize-none"
                        rows={3}
                      />
                    ) : (
                      <input
                        value={contenido.homeText[name] || ''}
                        onChange={e => setHomeText(name, e.target.value)}
                        className="input"
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SlidesEditor
        title="Slide principal del inicio"
        id="hero"
        slides={contenido.heroSlides}
        defaultFit="cover"
        defaultY={52}
        onChange={slides => setField('heroSlides', slides)}
      />

      <div className="rounded-xl border border-gray-200 p-4">
        <p className="mb-4 font-bold text-gray-800">Bloque “No necesitás experiencia”</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input value={contenido.experience.eyebrow} onChange={e => setExperience('eyebrow', e.target.value)} className="input" placeholder="Etiqueta" />
          <input value={contenido.experience.title} onChange={e => setExperience('title', e.target.value)} className="input" placeholder="Título" />
          <input value={contenido.experience.cta} onChange={e => setExperience('cta', e.target.value)} className="input" placeholder="Botón" />
          <input value={contenido.experience.to} onChange={e => setExperience('to', e.target.value)} className="input" placeholder="/inscripcion" />
          <textarea value={contenido.experience.text} onChange={e => setExperience('text', e.target.value)} className="input resize-none md:col-span-2" rows={3} placeholder="Texto" />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-4">
        <p className="mb-3 font-bold text-gray-800">Centro Naval</p>
        <textarea value={scheduleText} onChange={e => setTrainingText(e.target.value)} className="input resize-none font-mono text-sm" rows={5} />
        <p className="mt-2 text-xs text-gray-500">Una línea por horario, usando: Día | texto del horario</p>
      </div>

      <div className="space-y-5">
        {contenido.modalidades.map((modalidad, index) => (
          <div key={modalidad.id} className="rounded-xl border border-gray-200 p-4">
            <p className="mb-4 text-lg font-bold text-primary">{modalidad.title}</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input value={modalidad.title} onChange={e => setModalidad(index, { ...modalidad, title: e.target.value })} className="input" placeholder="Título" />
              <input value={modalidad.cta} onChange={e => setModalidad(index, { ...modalidad, cta: e.target.value })} className="input" placeholder="Texto botón" />
              <input value={modalidad.to} onChange={e => setModalidad(index, { ...modalidad, to: e.target.value })} className="input" placeholder="Link botón" />
              <ImageValueEditor
                id={`${modalidad.id}-cover`}
                label="Portada de la tarjeta"
                value={modalidad.image}
                onChange={image => setModalidad(index, { ...modalidad, image })}
              />
              <textarea value={modalidad.desc} onChange={e => setModalidad(index, { ...modalidad, desc: e.target.value })} className="input resize-none md:col-span-2" rows={2} placeholder="Texto corto" />
              <textarea value={modalidad.detail} onChange={e => setModalidad(index, { ...modalidad, detail: e.target.value })} className="input resize-none md:col-span-2" rows={3} placeholder="Explicación" />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {modalidad.points.map(([title, text], pointIndex) => (
                <div key={pointIndex} className="rounded-lg border border-gray-200 p-3">
                  <input
                    value={title}
                    onChange={e => {
                      const points = modalidad.points.map((point, i) => (i === pointIndex ? [e.target.value, point[1]] : point));
                      setModalidad(index, { ...modalidad, points });
                    }}
                    className="input mb-2"
                    placeholder="Título punto"
                  />
                  <textarea
                    value={text}
                    onChange={e => {
                      const points = modalidad.points.map((point, i) => (i === pointIndex ? [point[0], e.target.value] : point));
                      setModalidad(index, { ...modalidad, points });
                    }}
                    className="input resize-none"
                    rows={3}
                    placeholder="Texto punto"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <SlidesEditor
                title={`Fotos del slide de ${modalidad.title}`}
                id={`${modalidad.id}-slides`}
                slides={modalidad.slides}
                onChange={slides => setModalidad(index, { ...modalidad, slides })}
              />
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={save} disabled={saving} className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition disabled:opacity-60">
        {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
      </button>
    </div>
  );
}

function SimplePageEditor({ page }) {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  useEffect(() => {
    setLoading(true);
    api.get(`/pages/${page.key}`).then(r => {
      reset(r.data?.contenido || {});
      setLoading(false);
    });
  }, [page.key, reset]);

  const onSubmit = async (data) => {
    await api.put(`/pages/${page.key}`, { contenido: data });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <p className="text-gray-400">Cargando...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {page.fields.map(f => (
        <div key={f.name}>
          {f.type === 'image' ? (
            <ImageValueEditor label={f.label} id={`${page.key}-${f.name}`} value={watch(f.name) || ''} onChange={value => setValue(f.name, value)} />
          ) : (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea {...register(f.name)} className="input resize-none" rows={f.rows || 4} />
              ) : (
                <input {...register(f.name)} type={f.type} className="input" />
              )}
            </>
          )}
        </div>
      ))}
      <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition">
        {saved ? '✓ Guardado' : 'Guardar cambios'}
      </button>
    </form>
  );
}

function ContentListEditor({ pageKey }) {
  const config = LIST_CONFIG[pageKey];
  const [items, setItems] = useState([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const pageRequest = api.get(`/pages/${pageKey}`);
    const request = pageKey === 'calendario'
      ? Promise.all([pageRequest, api.get('/partidos').catch(() => ({ data: [] }))])
      : pageRequest;

    request.then(response => {
      if (pageKey === 'calendario') {
        const [pageResponse, partidosResponse] = response;
        const manualItems = Array.isArray(pageResponse.data?.contenido?.items) ? pageResponse.data.contenido.items : [];
        const partidos = partidosResponse.data?.length ? partidosResponse.data : FALLBACK_PARTIDOS;
        setItems(mergeCalendarItems(manualItems, partidos));
        setLoading(false);
        return;
      }

      setItems(Array.isArray(response.data?.contenido?.items) ? response.data.contenido.items : []);
      setLoading(false);
    });
  }, [pageKey]);

  const updateItem = (index, name, value) => {
    setItems(current => current.map((item, i) => (i === index ? { ...item, [name]: value } : item)));
  };

  const move = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    setItems(next);
  };

  const save = async () => {
    await api.put(`/pages/${pageKey}`, { contenido: { items } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <p className="text-gray-400">Cargando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-primary">{config.title}</h2>
        <button type="button" onClick={() => setItems(current => [...current, { ...config.emptyItem }])} className="rounded-lg bg-primary px-4 py-2 font-bold text-white hover:bg-blue-900">
          + Agregar
        </button>
      </div>

      {items.length === 0 && <p className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-400">Todavía no hay contenido cargado.</p>}

      {items.map((item, index) => (
        <div key={index} className="rounded-xl border border-gray-200 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-gray-700">{item.titulo || item.nombre || `Item ${index + 1}`}</p>
              {item.fromFixture && <p className="text-xs font-semibold text-blue-500">Desde fixture</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={item.activo !== false} onChange={e => updateItem(index, 'activo', e.target.checked)} className="h-4 w-4 accent-primary" />
                Visible
              </label>
              <button type="button" onClick={() => move(index, -1)} className="rounded border px-2 py-1 text-sm">↑</button>
              <button type="button" onClick={() => move(index, 1)} className="rounded border px-2 py-1 text-sm">↓</button>
              <button type="button" onClick={() => setItems(current => current.filter((_, i) => i !== index))} className="rounded border border-red-200 px-3 py-1 text-sm text-red-600">
                Eliminar
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {config.fields.map(([name, label, type]) => (
              <div key={name} className={type === 'textarea' || type === 'image' ? 'md:col-span-2' : ''}>
                {type === 'image' ? (
                  <ImageValueEditor
                    label={label}
                    id={`${pageKey}-${index}-${name}`}
                    value={item[name] || ''}
                    onChange={value => updateItem(index, name, value)}
                  />
                ) : (
                  <>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                    {type === 'textarea' ? (
                      <textarea value={item[name] || ''} onChange={e => updateItem(index, name, e.target.value)} className="input resize-none" rows={3} />
                    ) : (
                      <input value={item[name] || ''} onChange={e => updateItem(index, name, e.target.value)} className="input" />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button type="button" onClick={save} className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition">
        {saved ? '✓ Guardado' : 'Guardar cambios'}
      </button>
    </div>
  );
}

function EmailsEditor() {
  const [contenido, setContenido] = useState(DEFAULT_EMAILS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pages/emails').then(r => {
      setContenido({ ...DEFAULT_EMAILS, ...(r.data?.contenido || {}) });
      setLoading(false);
    });
  }, []);

  const setField = (name, value) => setContenido(current => ({ ...current, [name]: value }));

  const save = async () => {
    await api.put('/pages/emails', { contenido });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <p className="text-gray-400">Cargando...</p>;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        Podés usar: {'{nombre}'}, {'{email}'}, {'{telefono}'}, {'{edad}'}, {'{posicion}'}, {'{equipoPreferido}'}, {'{experiencia}'} y {'{mensaje}'}.
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Asunto para quien se inscribe</label>
        <input value={contenido.confirmationSubject} onChange={e => setField('confirmationSubject', e.target.value)} className="input" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Mensaje para quien se inscribe</label>
        <textarea value={contenido.confirmationBody} onChange={e => setField('confirmationBody', e.target.value)} className="input resize-none font-mono text-sm" rows={8} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Asunto del aviso interno</label>
        <input value={contenido.notificationSubject} onChange={e => setField('notificationSubject', e.target.value)} className="input" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Texto inicial del aviso interno</label>
        <textarea value={contenido.notificationIntro} onChange={e => setField('notificationIntro', e.target.value)} className="input resize-none" rows={3} />
      </div>
      <button type="button" onClick={save} className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition">
        {saved ? '✓ Guardado' : 'Guardar cambios'}
      </button>
    </div>
  );
}

export default function AdminPaginas() {
  const [active, setActive] = useState(0);
  const page = PAGES[active];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Editar Páginas</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {PAGES.map((p, i) => (
          <button
            key={p.key}
            onClick={() => setActive(i)}
            className={`px-5 py-2 rounded-lg font-medium transition ${active === i ? 'bg-primary text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        {page.key === 'inicio' && <InicioEditor />}
        {SIMPLE_PAGES.some(item => item.key === page.key) && <SimplePageEditor key={page.key} page={SIMPLE_PAGES.find(item => item.key === page.key)} />}
        {LIST_CONFIG[page.key] && <ContentListEditor key={page.key} pageKey={page.key} />}
        {page.key === 'emails' && <EmailsEditor />}
      </div>
    </div>
  );
}
