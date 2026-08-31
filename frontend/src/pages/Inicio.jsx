import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

import { API_URL } from '../config.js';
import { FALLBACK_EVENTS } from '../data/events.js';

const HERO_SLIDES = [
  '/hero/portada.jpg',
  '/hero/portada-nereidas.png',
  '/hero/portada-atlantes.jpg',
];
const HERO_TITLE = 'Fútbol Americano';
const HERO_TITLE_2 = 'Mar del Plata';
const HERO_SUBTITLE = 'Football Equipado – Flag Football 5vs5 Femenino y Masculino';

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
    const interval = setInterval(() => {
      setHeroSlide(current => (current + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

      {/* Cards de secciones */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { to: '/historia', icon: '📖', title: 'Nuestra Historia', desc: 'Conocé los orígenes y el recorrido de la liga desde 2016.' },
            { to: '/equipos', icon: '🏟️', title: 'Los Equipos', desc: 'Conocé los equipos que compiten en la liga temporada a temporada.' },
            { to: '/remeras', icon: '👕', title: 'Remeras Personalizadas', desc: 'Elegí tu equipo y encargá tu remera con nombre atrás.' },
          ].map(c => (
            <Link
              key={c.to}
              to={c.to}
              className="bg-secondary border border-accent/20 rounded-xl p-8 flex flex-col items-center text-center hover:border-accent/60 hover:-translate-y-1 transition-all group"
            >
              <span className="text-5xl mb-4">{c.icon}</span>
              <h3 className="font-bold text-xl text-white mb-2 group-hover:text-accent transition">{c.title}</h3>
              <p className="text-white/50 text-sm">{c.desc}</p>
            </Link>
          ))}
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
