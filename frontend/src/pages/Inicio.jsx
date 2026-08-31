import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

import { API_URL } from '../config.js';
import { FALLBACK_EVENTS } from '../data/events.js';

const HERO_SLIDES = [
  '/hero/portada-slide-mariscal.jpg',
  '/hero/portada-slide-chicas.jpg',
  '/hero/portada-slide-flag-1.jpg',
  '/hero/portada-slide-flag-2.jpg',
  '/hero/portada-slide-flag-3.jpg',
];
const HERO_TITLE = 'Fútbol Americano';
const HERO_TITLE_2 = 'Mar del Plata';
const HERO_SUBTITLE = 'Football Equipado – Flag Football 5vs5 Femenino y Masculino';

const MODALIDADES = [
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
    slides: ['/hero/portada-flag-accion.jpg'],
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

const TRAINING_PLACES = [
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

function fotoSrc(f) {
  if (f?.startsWith('/eventos/')) return f;
  return f?.startsWith('http') ? f : `${API_URL}${f}`;
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

export default function Inicio() {
  const [data, setData] = useState({
    titulo: 'Fútbol Americano',
    titulo2: 'Mar del Plata',
    subtitulo: 'Football Equipado – Flag Football 5vs5 Femenino y Masculino',
    descripcion: 'Somos la liga oficial de Football Americano de Mar del Plata.',
  });
  const [fotos, setFotos] = useState([]);
  const [ultimoEvento, setUltimoEvento] = useState(null);
  const [noticias, setNoticias] = useState([]);
  const [heroSlide, setHeroSlide] = useState(0);
  const [selectedModalidad, setSelectedModalidad] = useState(MODALIDADES[0].id);
  const [modalidadSlide, setModalidadSlide] = useState(0);
  const modalidadActiva = MODALIDADES.find(modalidad => modalidad.id === selectedModalidad) || MODALIDADES[0];
  const modalidadSlides = modalidadActiva.slides || [modalidadActiva.image];

  useEffect(() => {
    api.get('/pages/inicio').then(r => { if (r.data?.contenido) setData(r.data.contenido); });
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
    if (HERO_SLIDES.length === 0) return undefined;

    const interval = setInterval(() => {
      setHeroSlide(current => (current + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
        {HERO_SLIDES.map((slide, index) => (
          <img
            key={slide}
            src={slide}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${heroSlide === index ? 'opacity-100' : 'opacity-0'}`}
            style={{ objectPosition: 'center 52%' }}
          />
        ))}
        <div className="absolute inset-0 bg-primary/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/45 via-primary/15 to-primary/70" />
        <div className="relative max-w-4xl mx-auto text-center mt-8 md:mt-12">
          <img src="/logo.png" alt="Logo Liga" className="h-36 w-36 object-contain mx-auto mb-8 drop-shadow-2xl" />
          <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-4">Est. 2016 · Mar del Plata · Argentina</p>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-white">{HERO_TITLE}</h1>
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-white">{HERO_TITLE_2}</h2>
          <p className="text-xl text-white/75 mb-10">{HERO_SUBTITLE}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/inscripcion" className="bg-accent text-white font-bold px-8 py-3 rounded-full hover:bg-accent-light transition shadow-lg shadow-accent/30">
              SUMATE
            </Link>
            <Link to="/tienda" className="border-2 border-accent/60 text-white font-bold px-8 py-3 rounded-full hover:bg-accent/20 transition">
              Ir a la Tienda
            </Link>
            <Link to="/remeras" className="border-2 border-white/30 text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition">
              Diseña tu remera
            </Link>
          </div>
        </div>
      </section>

      {/* Descripción */}
      <section className="bg-secondary py-20 px-4 text-center border-y border-accent/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Bienvenidos a la Liga</h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-6 rounded" />
          <p className="text-white/60 text-lg leading-relaxed">{data.descripcion}</p>
        </div>
      </section>

      {/* Modalidades */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-2">Entrená con nosotros</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">Elegí tu modalidad</h2>
            </div>
            <Link to="/equipos" className="text-accent hover:text-accent-light text-sm font-semibold transition">
              Ver todos los equipos →
            </Link>
          </div>
          <div className="flex gap-5 overflow-x-auto snap-x pb-2 md:grid md:grid-cols-3 md:overflow-visible">
            {MODALIDADES.map(modalidad => (
              <article
                key={modalidad.id}
                className={`min-w-[82%] snap-start bg-secondary border rounded-xl overflow-hidden md:min-w-0 transition ${selectedModalidad === modalidad.id ? 'border-accent shadow-lg shadow-accent/15' : 'border-accent/20'}`}
              >
                <div className="h-56 bg-primary/50 overflow-hidden">
                  <img src={modalidad.image} alt={modalidad.title} className="w-full h-full object-cover" />
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
                      Ver explicación
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
          <div className="mt-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-6 items-stretch">
            <div className="relative overflow-hidden rounded-xl border border-accent/20 bg-primary/70 min-h-[280px]">
              {modalidadSlides.map((slide, index) => (
                <img
                  key={slide}
                  src={slide}
                  alt={modalidadActiva.title}
                  className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${modalidadSlide === index ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}
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
                        key={`${slide}-dot`}
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
              <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-3">Cómo se juega</p>
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

      {/* No necesitás experiencia */}
      <section className="bg-secondary border-y border-accent/10 py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-3">Probá una clase</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">No necesitás experiencia</h2>
            <p className="text-white/64 text-lg leading-relaxed mt-4">
              Entrená con nosotros aunque nunca hayas jugado. Te prestamos una bandera, te enseñamos desde cero y podés probar una clase.
            </p>
          </div>
          <Link
            to="/inscripcion"
            className="inline-flex items-center justify-center bg-accent text-white font-bold px-8 py-3 rounded-full hover:bg-accent-light transition shadow-lg shadow-accent/25"
          >
            Quiero probar
          </Link>
        </div>
      </section>

      {/* Entrenamientos */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-8 items-stretch">
          <div>
            <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-2">Lugares de entrenamiento</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Dónde nos encontrás</h2>
            <div className="space-y-3">
              {TRAINING_PLACES.map(([place, mode, schedule]) => (
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
                <h2 className="text-3xl font-bold text-white">Últimas Noticias</h2>
                <div className="w-12 h-1 bg-accent mt-2 rounded" />
              </div>
              <Link to="/noticias" className="text-accent hover:text-accent-light text-sm font-semibold transition">
                Ver todas →
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
                <h2 className="text-3xl font-bold text-white">Último Evento</h2>
                <div className="w-12 h-1 bg-accent mt-2 rounded" />
              </div>
              <Link to="/eventos" className="text-accent hover:text-accent-light text-sm font-semibold transition">
                Ver todos →
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
                <span className="text-accent font-semibold text-sm mt-6">Ver fotos →</span>
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
                <h2 className="text-3xl font-bold text-white">Momentos de la Liga</h2>
                <div className="w-12 h-1 bg-accent mt-2 rounded" />
              </div>
              <Link to="/eventos" className="text-accent hover:text-accent-light text-sm font-semibold transition">
                Ver todos →
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

      {/* CTA contacto */}
      <section className="bg-secondary border-t border-accent/20 py-16 px-4 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">¿Querés sumarte a la liga?</h2>
        <p className="text-white/50 text-lg mb-8">Contactanos y te informamos sobre cómo participar.</p>
        <Link to="/contacto" className="bg-accent text-white font-bold px-10 py-3 rounded-full hover:bg-accent-light transition shadow-lg shadow-accent/30">
          Contactanos
        </Link>
      </section>
    </div>
  );
}
