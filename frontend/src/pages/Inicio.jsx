import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

import { API_URL } from '../config.js';
import { FALLBACK_EVENTS } from '../data/events.js';
import { FALLBACK_PARTIDOS } from '../data/stats.js';

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

function fotoSrc(f) {
  if (f?.startsWith('/eventos/')) return f;
  return f?.startsWith('http') ? f : `${API_URL}${f}`;
}

function pageImageSrc(src) {
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

function nonEmptyArray(value, fallback) {
  return Array.isArray(value) && value.length > 0 ? value : fallback;
}

function normalizeSlide(slide, defaults = {}) {
  if (typeof slide === 'string') return { src: slide, ...defaults };
  const normalized = { ...defaults, ...(slide || {}) };
  return {
    ...normalized,
    fit: normalized.fit === 'contain' ? 'contain' : 'cover',
  };
}

function slideStyle(slide) {
  const zoom = Number.isFinite(Number(slide.zoom)) ? Number(slide.zoom) : 100;
  const x = Number.isFinite(Number(slide.x)) ? Number(slide.x) : 50;
  const y = Number.isFinite(Number(slide.y)) ? Number(slide.y) : 50;
  const offsetX = (50 - x) * 0.7;
  const offsetY = (50 - y) * 0.7;
  return {
    objectFit: slide.fit === 'contain' ? 'contain' : 'cover',
    objectPosition: 'center center',
    transform: `translate(${offsetX}%, ${offsetY}%) scale(${zoom / 100})`,
  };
}

function slideKey(slide, index) {
  const normalized = normalizeSlide(slide);
  return `${normalized.src || 'slide'}-${index}`;
}

function mergeModalidades(custom = []) {
  if (!Array.isArray(custom)) return DEFAULT_MODALIDADES;
  return DEFAULT_MODALIDADES.map(defaultModalidad => ({
    ...defaultModalidad,
    ...(custom.find(item => item?.id === defaultModalidad.id) || {}),
  }));
}

function sortByCreated(events = []) {
  return [...events].sort((a, b) => new Date(b.createdAt || b.fecha) - new Date(a.createdAt || a.fecha));
}

function sortVisibleEvents(events = []) {
  return [...events].sort((a, b) => {
    if (Boolean(a.fijado) !== Boolean(b.fijado)) return Boolean(b.fijado) - Boolean(a.fijado);
    const ordenA = Number.isFinite(Number(a.orden)) ? Number(a.orden) : 0;
    const ordenB = Number.isFinite(Number(b.orden)) ? Number(b.orden) : 0;
    if (ordenA !== ordenB) return ordenA - ordenB;
    return new Date(b.createdAt || b.fecha) - new Date(a.createdAt || a.fecha);
  });
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

export default function Inicio() {
  const [data, setData] = useState({
    titulo: 'Fútbol Americano',
    titulo2: 'Mar del Plata',
    subtitulo: 'Football Equipado – Flag Football 5vs5 Femenino y Masculino',
    descripcion: 'Somos la liga oficial de Football Americano de Mar del Plata.',
    heroSlides: DEFAULT_HERO_SLIDES,
    modalidades: DEFAULT_MODALIDADES,
    experience: DEFAULT_EXPERIENCE,
    trainingPlaces: DEFAULT_TRAINING_PLACES,
    homeText: DEFAULT_HOME_TEXT,
  });
  const [fotos, setFotos] = useState([]);
  const [ultimoEvento, setUltimoEvento] = useState(null);
  const [noticias, setNoticias] = useState([]);
  const [calendario, setCalendario] = useState([]);
  const [testimonios, setTestimonios] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [heroSlide, setHeroSlide] = useState(0);
  const [selectedModalidad, setSelectedModalidad] = useState(DEFAULT_MODALIDADES[0].id);
  const [modalidadSlide, setModalidadSlide] = useState(0);
  const heroSlides = nonEmptyArray(data.heroSlides, DEFAULT_HERO_SLIDES);
  const modalidades = mergeModalidades(data.modalidades);
  const trainingPlaces = nonEmptyArray(data.trainingPlaces, DEFAULT_TRAINING_PLACES);
  const experience = { ...DEFAULT_EXPERIENCE, ...(data.experience || {}) };
  const homeText = { ...DEFAULT_HOME_TEXT, ...(data.homeText || {}) };
  const modalidadActiva = modalidades.find(modalidad => modalidad.id === selectedModalidad) || modalidades[0];
  const modalidadSlides = nonEmptyArray(modalidadActiva.slides, [modalidadActiva.image]);

  useEffect(() => {
    api.get('/pages/inicio').then(r => { if (r.data?.contenido) setData(current => ({ ...current, ...r.data.contenido })); });
    Promise.all([
      api.get('/pages/calendario'),
      api.get('/partidos').catch(() => ({ data: [] })),
    ]).then(([pageResponse, partidosResponse]) => {
      const manualItems = pageResponse.data?.contenido?.items || [];
      const partidos = partidosResponse.data?.length ? partidosResponse.data : FALLBACK_PARTIDOS;
      setCalendario(mergeCalendarItems(manualItems, partidos));
    });
    api.get('/pages/testimonios').then(r => setTestimonios((r.data?.contenido?.items || []).filter(item => item.activo !== false)));
    api.get('/pages/sponsors').then(r => setSponsors((r.data?.contenido?.items || []).filter(item => item.activo !== false)));
    api.get('/eventos').then(r => {
      const eventos = r.data || [];
      const ordenados = sortVisibleEvents(eventos);
      const todas = ordenados.flatMap(e => (e.fotos || []).map(f => ({ src: f, titulo: e.titulo, id: e._id })));
      setUltimoEvento(sortByCreated(eventos)[0] || null);
      setFotos(todas.slice(0, 9));
    }).catch(() => {
      const ordenados = sortVisibleEvents(FALLBACK_EVENTS);
      const todas = ordenados.flatMap(e => (e.fotos || []).map(f => ({ src: f, titulo: e.titulo, id: e._id })));
      setUltimoEvento(sortByCreated(FALLBACK_EVENTS)[0] || null);
      setFotos(todas.slice(0, 9));
    });
    api.get('/noticias').then(r => setNoticias(r.data.slice(0, 3)));
  }, []);

  useEffect(() => {
    if (heroSlides.length < 2) return undefined;

    const interval = setInterval(() => {
      setHeroSlide(current => (current + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    setModalidadSlide(0);
  }, [selectedModalidad]);

  useEffect(() => {
    if (modalidadSlides.length < 2) return undefined;

    const interval = setInterval(() => {
      setModalidadSlide(current => (current + 1) % modalidadSlides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [modalidadSlides.length, selectedModalidad]);

  return (
    <div className="bg-primary text-white">
      {/* Hero */}
      <section className="relative h-[72vh] min-h-[640px] max-h-[760px] px-4 pt-24 md:pt-28 pb-24 md:pb-28 overflow-hidden flex items-center">
        {heroSlides.map((slide, index) => {
          const normalizedSlide = normalizeSlide(slide, { fit: 'cover', x: 50, y: 52, zoom: 100 });
          return (
            <img
              key={slideKey(slide, index)}
              src={pageImageSrc(normalizedSlide.src)}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${heroSlide === index ? 'opacity-100' : 'opacity-0'}`}
              style={slideStyle(normalizedSlide)}
            />
          );
        })}
        <div className="absolute inset-0 bg-primary/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/45 via-primary/15 to-primary/70" />
        <div className="relative max-w-4xl mx-auto text-center mt-8 md:mt-12">
          <img src="/logo.png" alt="Logo Liga" className="h-36 w-36 object-contain mx-auto mb-8 drop-shadow-2xl" />
          <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-4">{homeText.heroMeta}</p>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-white">{data.titulo}</h1>
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-white">{data.titulo2}</h2>
          <p className="text-xl text-white/75 mb-10">{data.subtitulo}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={homeText.heroPrimaryTo} className="bg-accent text-white font-bold px-8 py-3 rounded-full hover:bg-accent-light transition shadow-lg shadow-accent/30">
              {homeText.heroPrimaryCta}
            </Link>
            <Link to={homeText.heroStoreTo} className="border-2 border-accent/60 text-white font-bold px-8 py-3 rounded-full hover:bg-accent/20 transition">
              {homeText.heroStoreCta}
            </Link>
            <Link to={homeText.heroShirtTo} className="border-2 border-white/30 text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition">
              {homeText.heroShirtCta}
            </Link>
          </div>
        </div>
      </section>

      {/* Descripción */}
      <section className="bg-secondary py-20 px-4 text-center border-y border-accent/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">{homeText.welcomeTitle}</h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-6 rounded" />
          <p className="text-white/60 text-lg leading-relaxed">{data.descripcion}</p>
        </div>
      </section>

      {/* Modalidades */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-2">{homeText.modalitiesEyebrow}</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">{homeText.modalitiesTitle}</h2>
            </div>
            <Link to={homeText.modalitiesAllTeamsTo} className="text-accent hover:text-accent-light text-sm font-semibold transition">
              {homeText.modalitiesAllTeamsLabel}
            </Link>
          </div>
          <div className="flex gap-5 overflow-x-auto snap-x pb-2 md:grid md:grid-cols-3 md:overflow-visible">
            {modalidades.map(modalidad => (
              <article
                key={modalidad.id}
                className={`min-w-[82%] snap-start bg-secondary border rounded-xl overflow-hidden md:min-w-0 transition ${selectedModalidad === modalidad.id ? 'border-accent shadow-lg shadow-accent/15' : 'border-accent/20'}`}
              >
                <div className="h-56 bg-primary/50 overflow-hidden">
                  <img src={pageImageSrc(modalidad.image)} alt={modalidad.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-extrabold text-white">{modalidad.title}</h3>
                  <p className="text-white/58 leading-relaxed mt-3 min-h-[84px]">{modalidad.desc}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedModalidad(modalidad.id)}
                      className="inline-flex items-center justify-center bg-accent text-white font-bold px-5 py-2.5 rounded-full hover:bg-accent-light transition"
                    >
                      {homeText.modalitiesExplanationCta}
                    </button>
                    <Link
                      to={modalidad.to}
                      className="inline-flex items-center justify-center border border-white/20 text-white font-bold px-5 py-2.5 rounded-full hover:bg-white/10 transition"
                    >
                      {modalidad.cta}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
            <div className="relative overflow-hidden rounded-xl border border-accent/20 bg-primary/70">
              {(() => {
                const currentSlide = normalizeSlide(modalidadSlides[modalidadSlide], { fit: 'cover', x: 50, y: 50, zoom: 100 });

                return (
                  <div className="aspect-[16/10]">
                    <img
                      key={slideKey(currentSlide, modalidadSlide)}
                      src={pageImageSrc(currentSlide.src)}
                      alt={modalidadActiva.title}
                      className="h-full w-full"
                      style={slideStyle(currentSlide)}
                    />
                  </div>
                );
              })()}
              {modalidadSlides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setModalidadSlide(current => (current - 1 + modalidadSlides.length) % modalidadSlides.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary/75 text-white text-2xl leading-none hover:bg-accent transition"
                    aria-label="Foto anterior"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalidadSlide(current => (current + 1) % modalidadSlides.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary/75 text-white text-2xl leading-none hover:bg-accent transition"
                    aria-label="Foto siguiente"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {modalidadSlides.map((slide, index) => (
                      <button
                        key={`${slideKey(slide, index)}-dot`}
                        type="button"
                        onClick={() => setModalidadSlide(index)}
                        className={`h-2.5 rounded-full transition-all ${modalidadSlide === index ? 'w-8 bg-accent' : 'w-2.5 bg-white/45 hover:bg-white/80'}`}
                        aria-label={`Ver foto ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="bg-secondary border border-accent/20 rounded-xl p-6 md:p-8">
              <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-3">{homeText.howToPlayEyebrow}</p>
              <h3 className="text-3xl font-extrabold text-white">{modalidadActiva.title}</h3>
              <p className="text-white/65 text-lg leading-relaxed mt-4">{modalidadActiva.detail}</p>
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                {modalidadActiva.points.map(([title, text]) => (
                  <div key={title} className="border border-accent/15 bg-primary/45 rounded-lg p-4">
                    <p className="text-white font-bold">{title}</p>
                    <p className="text-white/50 text-sm leading-relaxed mt-2">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {calendario.length > 0 && (
        <section className="bg-secondary border-y border-accent/10 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-2">Agenda</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white">Próximos entrenamientos y partidos</h2>
              </div>
              <Link to="/fixture" className="text-accent hover:text-accent-light text-sm font-semibold transition">
                Ver fixture →
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {calendario.map((item, index) => (
                <article key={`${item.titulo}-${index}`} className="rounded-xl border border-accent/20 bg-primary/55 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-accent">{item.tipo || 'Actividad'}</p>
                  <h3 className="mt-3 text-xl font-extrabold text-white">{item.titulo}</h3>
                  <p className="mt-2 text-white/55">{[item.fecha, item.hora].filter(Boolean).join(' · ')}</p>
                  {item.lugar && <p className="mt-1 text-white/45">📍 {item.lugar}</p>}
                  {item.descripcion && <p className="mt-4 text-sm leading-relaxed text-white/55">{item.descripcion}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No necesitás experiencia */}
      <section className="bg-secondary border-y border-accent/10 py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-3">{experience.eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">{experience.title}</h2>
            <p className="text-white/64 text-lg leading-relaxed mt-4">
              {experience.text}
            </p>
          </div>
          <Link
            to={experience.to}
            className="inline-flex items-center justify-center bg-accent text-white font-bold px-8 py-3 rounded-full hover:bg-accent-light transition shadow-lg shadow-accent/25"
          >
            {experience.cta}
          </Link>
        </div>
      </section>

      {/* Entrenamientos */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-8 items-stretch">
          <div>
            <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-2">{homeText.trainingEyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">{homeText.trainingTitle}</h2>
            <div className="space-y-3">
              {trainingPlaces.map(([place, mode, schedule]) => (
                <div key={place} className="border border-accent/20 bg-secondary/80 rounded-xl p-5">
                  <p className="text-white font-extrabold text-xl">{place}</p>
                  <p className="text-accent font-semibold mt-1">{mode}</p>
                  <div className="mt-3 space-y-2">
                    {schedule.map(([day, item]) => (
                      <p key={`${day}-${item}`} className="text-white/55">
                        <span className="text-white/75 font-semibold">{day}:</span> {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="min-h-[360px] overflow-hidden rounded-xl border border-accent/20 bg-secondary">
            <iframe
              title="Mapa de entrenamientos en Mar del Plata"
              src="https://www.google.com/maps?q=Centro%20Naval%20Mar%20del%20Plata&output=embed"
              className="h-full min-h-[360px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Noticias */}
      {noticias.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white">{homeText.newsTitle}</h2>
                <div className="w-12 h-1 bg-accent mt-2 rounded" />
              </div>
              <Link to={homeText.newsAllTo} className="text-accent hover:text-accent-light text-sm font-semibold transition">
                {homeText.newsAllLabel}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {noticias.map(n => (
                <Link key={n._id} to={`/noticias/${n._id}`}
                  className="bg-secondary border border-accent/20 rounded-xl overflow-hidden hover:border-accent/50 hover:-translate-y-1 transition-all group">
                  <div className="h-44 bg-primary/50 overflow-hidden">
                    {n.imagen
                      ? <img src={fotoSrc(n.imagen)} alt={n.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📰</div>}
                  </div>
                  <div className="p-4">
                    <p className="text-accent text-xs mb-1">{new Date(n.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}</p>
                    <h3 className="font-bold text-white group-hover:text-accent transition leading-tight">{n.titulo}</h3>
                    <p className="text-white/40 text-sm mt-2 line-clamp-2">{n.contenido}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Último evento */}
      {ultimoEvento && (
        <section className="py-16 px-4 bg-primary">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white">{homeText.eventTitle}</h2>
                <div className="w-12 h-1 bg-accent mt-2 rounded" />
              </div>
              <Link to={homeText.eventAllTo} className="text-accent hover:text-accent-light text-sm font-semibold transition">
                {homeText.eventAllLabel}
              </Link>
            </div>
            <Link
              to={`/eventos/${ultimoEvento._id}`}
              className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] bg-secondary border border-accent/20 rounded-xl overflow-hidden hover:border-accent/60 transition-all group"
            >
              <div className="h-72 md:h-80 bg-primary/50 overflow-hidden">
                {ultimoEvento.fotos?.[0] ? (
                  <img
                    src={fotoSrc(ultimoEvento.fotos[0])}
                    alt={ultimoEvento.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">📸</div>
                )}
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <p className="text-accent text-xs font-semibold uppercase tracking-wide mb-2">
                  {new Date(ultimoEvento.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h3 className="font-bold text-2xl md:text-3xl text-white group-hover:text-accent transition">{ultimoEvento.titulo}</h3>
                {ultimoEvento.lugar && <p className="text-white/45 text-sm mt-3">📍 {ultimoEvento.lugar}</p>}
                {ultimoEvento.descripcion && (
                  <p className="text-white/55 mt-4 leading-relaxed line-clamp-3">{ultimoEvento.descripcion}</p>
                )}
                <span className="text-accent font-semibold text-sm mt-6">{homeText.eventPhotosLabel}</span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Galería de fotos */}
      {fotos.length > 0 && (
        <section className="py-16 px-4 bg-secondary border-y border-accent/10">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white">{homeText.galleryTitle}</h2>
                <div className="w-12 h-1 bg-accent mt-2 rounded" />
              </div>
              <Link to={homeText.galleryAllTo} className="text-accent hover:text-accent-light text-sm font-semibold transition">
                {homeText.galleryAllLabel}
              </Link>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-3">
              {fotos.map((f, i) => (
                <Link
                  key={i}
                  to={`/eventos/${f.id}`}
                  className={`overflow-hidden rounded-xl bg-primary/50 group ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
                >
                  <div className={`relative ${i === 0 ? 'h-64 md:h-80' : 'h-32 md:h-40'} overflow-hidden`}>
                    <img
                      src={fotoSrc(f.src)}
                      alt={f.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end p-3">
                      <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity line-clamp-1">
                        {f.titulo}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {testimonios.length > 0 && (
        <section className="py-16 px-4 bg-primary">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 text-center">
              <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-2">Comunidad</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">Por qué se suman</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {testimonios.slice(0, 3).map((item, index) => (
                <article key={`${item.nombre}-${index}`} className="rounded-xl border border-accent/20 bg-secondary p-6">
                  <p className="text-white/65 leading-relaxed">“{item.texto}”</p>
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <p className="font-extrabold text-white">{item.nombre}</p>
                    {item.rol && <p className="text-sm text-accent">{item.rol}</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {sponsors.length > 0 && (
        <section className="bg-secondary border-y border-accent/10 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 text-center">
              <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-2">Aliados</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">Sponsors y aliados</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {sponsors.map((item, index) => {
                const content = (
                  <article className="h-full rounded-xl border border-accent/20 bg-primary/55 p-5 text-center hover:border-accent/50 transition">
                    {item.imagen ? (
                      <img src={pageImageSrc(item.imagen)} alt={item.nombre} className="mx-auto h-20 w-full object-contain" />
                    ) : (
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-3xl">★</div>
                    )}
                    <h3 className="mt-4 font-extrabold text-white">{item.nombre}</h3>
                    {item.descripcion && <p className="mt-2 text-sm text-white/50">{item.descripcion}</p>}
                  </article>
                );

                return item.web ? (
                  <a key={`${item.nombre}-${index}`} href={item.web} target="_blank" rel="noreferrer">{content}</a>
                ) : (
                  <div key={`${item.nombre}-${index}`}>{content}</div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA contacto */}
      <section className="bg-secondary border-t border-accent/20 py-16 px-4 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">{homeText.contactTitle}</h2>
        <p className="text-white/50 text-lg mb-8">{homeText.contactText}</p>
        <Link to={homeText.contactTo} className="bg-accent text-white font-bold px-10 py-3 rounded-full hover:bg-accent-light transition shadow-lg shadow-accent/30">
          {homeText.contactCta}
        </Link>
      </section>
    </div>
  );
}
