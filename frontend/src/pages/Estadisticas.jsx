import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import {
  FALLBACK_HISTORICOS,
  FALLBACK_LIDERES,
  FALLBACK_STATS,
  FALLBACK_TEMPORADAS,
  fallbackLideresByTemporada,
  mergeFallbackLideres,
  mergeFallbackTemporadas,
} from '../data/stats.js';

const COLS_STATS = ['Equipo', 'PJ', 'PG', 'PP', 'PF', 'PC', 'Pts'];

const TIPOS = {
  pase:          { label: 'Pase',          cols: ['PAS','COM','%','YDS','TD','INT'],  keys: ['pas','com','pct','yds','td','int'] },
  corrida:       { label: 'Corrida',        cols: ['INT','YDS','PROM','TD'],           keys: ['int','yds','prom','td'] },
  recepcion:     { label: 'Recepción',      cols: ['REC','YDS','PROM','TD'],           keys: ['rec','yds','prom','td'] },
  flags:         { label: 'Flageos',        cols: ['FLAGS'],                           keys: ['flags'] },
  intercepciones:{ label: 'Intercepciones', cols: ['INTS'],                            keys: ['ints'] },
  sacks:         { label: 'Sacks',          cols: ['SACKS','SAFETY'],                  keys: ['sacks','safety'] },
  deflecciones:  { label: 'Deflecciones',   cols: ['DEFLEC'],                          keys: ['deflec'] },
};

const PREMIOS_ICONS = {
  'MVP — Jugador Más Valioso': '🏆',
  'JOF — Jugador Ofensivo':    '⚔️',
  'JD — Jugador Defensivo':    '🛡️',
  'JEV — Jugador Evolución':   '📈',
  'NOV — Novato del Torneo':   '🌟',
};

const EQUIPO_COLORS = {
  KRA: 'bg-purple-600',
  TRI: 'bg-red-500',
  LIE: 'bg-orange-400',
  ACO: 'bg-gray-500',
};

function TablaStandings({ stat }) {
  return (
    <div className="bg-secondary border border-accent/20 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-accent/10">
        <h2 className="text-xl font-bold text-white">{stat.temporada} · {stat.categoria}</h2>
        {stat.descripcion && <p className="text-white/40 text-sm mt-1">{stat.descripcion}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-accent/10">
              <th className="text-left px-6 py-3 text-accent/70 font-semibold uppercase tracking-wide text-xs">Pos</th>
              {COLS_STATS.map(c => (
                <th key={c} className={`py-3 px-3 text-accent/70 font-semibold uppercase tracking-wide text-xs ${c === 'Equipo' ? 'text-left' : 'text-center'}`}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stat.tabla.slice().sort((a, b) => b.Pts - a.Pts).map((fila, i) => (
              <tr key={i} className={`border-b border-white/5 hover:bg-white/5 transition ${i === 0 ? 'bg-accent/5' : ''}`}>
                <td className="px-6 py-3"><span className={`font-bold ${i === 0 ? 'text-accent' : 'text-white/30'}`}>{i + 1}</span></td>
                <td className="px-3 py-3 font-semibold text-white">{fila.equipo}</td>
                <td className="px-3 py-3 text-center text-white/60">{fila.PJ}</td>
                <td className="px-3 py-3 text-center text-green-400">{fila.PG}</td>
                <td className="px-3 py-3 text-center text-red-400">{fila.PP}</td>
                <td className="px-3 py-3 text-center text-white/60">{fila.PF}</td>
                <td className="px-3 py-3 text-center text-white/60">{fila.PC}</td>
                <td className="px-3 py-3 text-center font-extrabold text-accent">{fila.Pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TablaLideres({ lideres }) {
  const [tipoActivo, setTipoActivo] = useState('pase');

  const tiposDisponibles = Object.keys(TIPOS).filter(t => lideres.some(l => l.tipo === t));
  if (tiposDisponibles.length === 0) {
    return (
      <p className="text-center text-white/40 bg-secondary border border-accent/20 rounded-xl px-6 py-10">
        No hay tablas de líderes cargadas para esta temporada.
      </p>
    );
  }

  const tipoVisible = tiposDisponibles.includes(tipoActivo) ? tipoActivo : tiposDisponibles[0];
  const lider = lideres.find(l => l.tipo === tipoVisible);
  const config = TIPOS[tipoVisible];

  return (
    <div>
      {/* Tabs de tipo */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tiposDisponibles.map(t => (
          <button
            key={t}
            onClick={() => setTipoActivo(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              tipoVisible === t ? 'bg-accent text-white' : 'bg-secondary border border-accent/20 text-white/60 hover:text-white hover:border-accent/50'
            }`}
          >
            {TIPOS[t].label}
          </button>
        ))}
      </div>

      {lider && (
        <div className="bg-secondary border border-accent/20 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-accent/10">
            <h2 className="text-lg font-bold text-white">Líderes en {config.label}</h2>
            <p className="text-white/40 text-sm">{lider.temporada}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-accent/10">
                  <th className="text-left px-4 py-3 text-accent/70 font-semibold uppercase tracking-wide text-xs w-8">#</th>
                  <th className="text-left px-4 py-3 text-accent/70 font-semibold uppercase tracking-wide text-xs">Jugador</th>
                  <th className="text-center px-3 py-3 text-accent/70 font-semibold uppercase tracking-wide text-xs">Equipo</th>
                  {config.cols.map(c => (
                    <th key={c} className="text-center px-3 py-3 text-accent/70 font-semibold uppercase tracking-wide text-xs">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lider.jugadores.map((j, i) => (
                  <tr key={i} className={`border-b border-white/5 hover:bg-white/5 transition ${i === 0 ? 'bg-accent/5' : ''}`}>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-sm ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-white/30'}`}>
                        {j.pos}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{j.nombre}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${EQUIPO_COLORS[j.equipo] || 'bg-white/20'}`}>
                        {j.equipo}
                      </span>
                    </td>
                    {config.keys.map(k => (
                      <td key={k} className="px-3 py-3 text-center text-white/70 font-medium">{j[k] ?? '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TablaPremios({ lideres }) {
  const premios     = lideres.find(l => l.tipo === 'premios');
  const ofensivo    = lideres.find(l => l.tipo === 'equipo-ofensivo');
  const defensivo   = lideres.find(l => l.tipo === 'equipo-defensivo');

  return (
    <div className="space-y-8">
      {/* Premios individuales */}
      {premios && (
        <div className="bg-secondary border border-accent/20 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-accent/10">
            <h2 className="text-lg font-bold text-white">🏅 Premios Individuales</h2>
            <p className="text-white/40 text-sm">{premios.temporada}</p>
          </div>
          <div className="divide-y divide-white/5">
            {premios.jugadores.map((j, i) => (
              <div key={i} className={`flex items-center gap-4 px-6 py-4 ${j.premio.includes('MVP') ? 'bg-yellow-500/5' : ''}`}>
                <span className="text-2xl w-8 text-center">{PREMIOS_ICONS[j.premio] || '🏅'}</span>
                <div className="flex-1">
                  <p className="text-xs text-accent/60 uppercase tracking-widest font-semibold">{j.premio}</p>
                  <p className="font-bold text-white text-lg">#{j.numero} {j.jugador}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${EQUIPO_COLORS[j.equipo] || 'bg-white/20'}`}>
                  {j.equipo}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipo ofensivo y defensivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[{ data: ofensivo, label: '⚔️ Equipo Ofensivo' }, { data: defensivo, label: '🛡️ Equipo Defensivo' }].map(({ data, label }) => data && (
          <div key={label} className="bg-secondary border border-accent/20 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-accent/10">
              <h2 className="text-lg font-bold text-white">{label}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-accent/10">
                    <th className="text-left px-4 py-3 text-accent/70 font-semibold uppercase tracking-wide text-xs w-8">#</th>
                    <th className="text-left px-4 py-3 text-accent/70 font-semibold uppercase tracking-wide text-xs">Jugador</th>
                    <th className="text-center px-3 py-3 text-accent/70 font-semibold uppercase tracking-wide text-xs">Eq.</th>
                    <th className="text-center px-3 py-3 text-accent/70 font-semibold uppercase tracking-wide text-xs">Votos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.jugadores.map((j, i) => (
                    <tr key={i} className={`border-b border-white/5 hover:bg-white/5 transition ${i === 0 ? 'bg-accent/5' : ''}`}>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-white/30'}`}>{j.pos}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">#{j.numero} {j.nombre}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${EQUIPO_COLORS[j.equipo] || 'bg-white/20'}`}>{j.equipo}</span>
                      </td>
                      <td className="px-3 py-3 text-center text-accent font-bold">{j.votos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TablaHistoricos() {
  const temporadasHistoricas = [...new Set(
    FALLBACK_LIDERES
      .filter(l => !l.temporada.includes('Final') && !l.temporada.includes('Semi'))
      .map(l => l.temporada)
  )];
  const premiosPorTemporada = temporadasHistoricas
    .map(temporada => ({
      temporada,
      premios: FALLBACK_LIDERES.find(l => l.temporada === temporada && l.tipo === 'premios')?.jugadores || [],
      ofensivo: FALLBACK_LIDERES.find(l => l.temporada === temporada && l.tipo === 'equipo-ofensivo')?.jugadores || [],
      defensivo: FALLBACK_LIDERES.find(l => l.temporada === temporada && l.tipo === 'equipo-defensivo')?.jugadores || [],
    }))
    .filter(t => t.premios.length || t.ofensivo.length || t.defensivo.length);
  const premiosHistoricos = [
    { codigo: 'MVP', titulo: 'MVP', subtitulo: 'Jugador Más Valioso' },
    { codigo: 'JEV', titulo: 'Jugador Evolución', subtitulo: 'Mayor crecimiento' },
    { codigo: 'NOV', titulo: 'Rookie', subtitulo: 'Novato del torneo' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FALLBACK_HISTORICOS.map(categoria => (
          <div key={categoria.key} className="bg-secondary border border-accent/20 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-accent/10">
              <p className="text-xs text-accent/60 uppercase tracking-widest font-bold">Líderes históricos</p>
              <h2 className="text-xl font-extrabold text-white mt-1">{categoria.titulo}</h2>
            </div>
            <div className="divide-y divide-white/5">
              {categoria.jugadores.map(jugador => (
                <div key={`${categoria.key}-${jugador.pos}-${jugador.nombre}`} className="px-5 py-4 flex items-center gap-4">
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center font-extrabold ${
                    jugador.pos === 1 ? 'bg-yellow-400 text-primary' : jugador.pos === 2 ? 'bg-white/20 text-white' : jugador.pos === 3 ? 'bg-orange-500/80 text-white' : 'bg-white/10 text-white/60'
                  }`}>
                    {jugador.pos}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white truncate">{jugador.nombre}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${EQUIPO_COLORS[jugador.equipo] || 'bg-white/20'}`}>
                        {jugador.equipo}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-white/60">
                        {jugador.partidos} PJ
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-accent">{jugador.valor}</p>
                    <p className="text-white/35 text-xs font-bold">{categoria.abreviatura}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {premiosHistoricos.map(premio => (
          <div key={premio.codigo} className="bg-secondary border border-accent/20 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-accent/10">
              <p className="text-xs text-accent/60 uppercase tracking-widest font-bold">Premios históricos</p>
              <h2 className="text-xl font-extrabold text-white mt-1">{premio.titulo}</h2>
              <p className="text-white/40 text-xs mt-1">{premio.subtitulo}</p>
            </div>
            <div className="divide-y divide-white/5">
              {premiosPorTemporada.map(({ temporada, premios }) => {
                const ganador = premios.find(p => p.premio.startsWith(premio.codigo));
                if (!ganador) return null;

                return (
                  <div key={`${premio.codigo}-${temporada}`} className="px-5 py-4">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-wide">{temporada}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="font-bold text-white truncate">#{ganador.numero} {ganador.jugador}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${EQUIPO_COLORS[ganador.equipo] || 'bg-white/20'}`}>
                        {ganador.equipo}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[{ key: 'ofensivo', label: 'Equipo Ofensivo' }, { key: 'defensivo', label: 'Equipo Defensivo' }].map(({ key, label }) => (
          <div key={key} className="bg-secondary border border-accent/20 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-accent/10">
              <p className="text-xs text-accent/60 uppercase tracking-widest font-bold">Equipos ideales históricos</p>
              <h2 className="text-xl font-extrabold text-white mt-1">{label}</h2>
            </div>
            <div className="divide-y divide-white/5">
              {premiosPorTemporada.filter(t => t[key].length).map(item => (
                <div key={`${key}-${item.temporada}`} className="px-5 py-4">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wide mb-3">{item.temporada}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item[key].map(jugador => (
                      <div key={`${key}-${item.temporada}-${jugador.nombre}`} className="bg-primary/40 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-sm truncate">#{jugador.numero} {jugador.nombre}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${EQUIPO_COLORS[jugador.equipo] || 'bg-white/20'}`}>
                          {jugador.equipo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PremiosSection() {
  const [lideresPremios, setLideresPremios] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [temporadaActiva, setTemporadaActiva] = useState('');

  useEffect(() => {
    api.get('/lideres/temporadas').then(r => {
      // Solo temporadas que tienen premios (no las de partidos individuales)
      const temporadas = r.data?.length ? mergeFallbackTemporadas(r.data) : FALLBACK_TEMPORADAS;
      const principales = temporadas.filter(t => !t.includes('Final') && !t.includes('Semi'));
      setTemporadas(principales);
      if (principales.length > 0) setTemporadaActiva(principales[0]);
    }).catch(() => {
      const principales = FALLBACK_TEMPORADAS.filter(t => !t.includes('Final') && !t.includes('Semi'));
      setTemporadas(principales);
      if (principales.length > 0) setTemporadaActiva(principales[0]);
    });
  }, []);

  useEffect(() => {
    if (temporadaActiva) {
      api.get(`/lideres?temporada=${encodeURIComponent(temporadaActiva)}`)
        .then(r => setLideresPremios(r.data?.length ? mergeFallbackLideres(r.data, temporadaActiva) : fallbackLideresByTemporada(temporadaActiva)))
        .catch(() => setLideresPremios(fallbackLideresByTemporada(temporadaActiva)));
    }
  }, [temporadaActiva]);

  if (temporadas.length === 0) return <p className="text-center text-white/40">No hay premios cargados aún.</p>;

  return (
    <>
      {temporadas.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {temporadas.map(t => (
            <button key={t} onClick={() => setTemporadaActiva(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${temporadaActiva === t ? 'bg-accent text-white' : 'bg-secondary border border-accent/20 text-white/60 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
      )}
      {temporadas.length === 1 && <p className="text-center text-accent font-bold mb-6 text-lg">{temporadaActiva}</p>}
      <TablaPremios lideres={lideresPremios} />
    </>
  );
}

export default function Estadisticas() {
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState([]);
  const [lideres, setLideres] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [temporadaActiva, setTemporadaActiva] = useState('');
  const [seccion, setSeccion] = useState(searchParams.get('seccion') || 'premios');
  const [loading, setLoading] = useState(true);
  const [activaStat, setActivaStat] = useState(0);
  const temporadasConLideres = temporadas.filter(temporada =>
    fallbackLideresByTemporada(temporada).some(lider => TIPOS[lider.tipo])
    || (temporada === temporadaActiva && lideres.some(lider => TIPOS[lider.tipo]))
  );

  useEffect(() => {
    Promise.all([
      api.get('/estadisticas'),
      api.get('/lideres/temporadas'),
    ]).then(([s, t]) => {
      const statsData = s.data?.length ? s.data : FALLBACK_STATS;
      const temporadasData = t.data?.length ? mergeFallbackTemporadas(t.data) : FALLBACK_TEMPORADAS;
      setStats(statsData);
      setTemporadas(temporadasData);
      const paramTemporada = searchParams.get('temporada');
      const defaultTemporada = paramTemporada && temporadasData.includes(paramTemporada) ? paramTemporada : temporadasData[0];
      if (temporadasData.length > 0) setTemporadaActiva(defaultTemporada || temporadasData[0]);
    }).catch(() => {
      setStats(FALLBACK_STATS);
      setTemporadas(FALLBACK_TEMPORADAS);
      const paramTemporada = searchParams.get('temporada');
      const defaultTemporada = paramTemporada && FALLBACK_TEMPORADAS.includes(paramTemporada) ? paramTemporada : FALLBACK_TEMPORADAS[0];
      if (FALLBACK_TEMPORADAS.length > 0) setTemporadaActiva(defaultTemporada || FALLBACK_TEMPORADAS[0]);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (temporadaActiva) {
      api.get(`/lideres?temporada=${encodeURIComponent(temporadaActiva)}`)
        .then(r => setLideres(r.data?.length ? mergeFallbackLideres(r.data, temporadaActiva) : fallbackLideresByTemporada(temporadaActiva)))
        .catch(() => setLideres(fallbackLideresByTemporada(temporadaActiva)));
    }
  }, [temporadaActiva]);

  useEffect(() => {
    if (seccion === 'lideres' && temporadasConLideres.length > 0 && !temporadasConLideres.includes(temporadaActiva)) {
      setTemporadaActiva(temporadasConLideres[0]);
    }
  }, [seccion, temporadaActiva, temporadasConLideres]);

  return (
    <div className="bg-primary text-white pt-16">
      <section className="bg-secondary border-b border-accent/20 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">Estadísticas</h1>
        <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded" />
        <p className="text-white/50 mt-4 text-lg">Posiciones y líderes estadísticos</p>
      </section>

      <section className="max-w-5xl mx-auto py-12 px-4">
        {loading && <p className="text-center text-white/40">Cargando...</p>}

        {!loading && (
          <>
            {/* Selector sección */}
            <div className="flex flex-wrap gap-3 mb-8 justify-center">
              {[['premios','🏅 Premios'], ['lideres','📈 Líderes'], ['historicos','🏛️ Históricos'], ['posiciones','📊 Posiciones']].map(([v, l]) => (
                <button key={v} onClick={() => setSeccion(v)}
                  className={`px-6 py-2 rounded-lg font-bold transition ${seccion === v ? 'bg-accent text-white' : 'bg-secondary border border-accent/20 text-white/60 hover:text-white'}`}>
                  {l}
                </button>
              ))}
            </div>

            {/* PREMIOS */}
            {seccion === 'premios' && (
              <PremiosSection />
            )}

            {/* LÍDERES */}
            {seccion === 'lideres' && (
              <>
                {temporadasConLideres.length === 0 && <p className="text-center text-white/40">No hay líderes cargados aún.</p>}
                {temporadasConLideres.length > 0 && (
                  <>
                    {/* Selector temporada */}
                    {temporadasConLideres.length > 1 && (
                      <div className="flex flex-wrap gap-2 mb-6 justify-center">
                        {temporadasConLideres.map(t => (
                          <button
                            key={t}
                            onClick={() => setTemporadaActiva(t)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${temporadaActiva === t ? 'bg-accent text-white' : 'bg-secondary border border-accent/20 text-white/60 hover:text-white'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                    {temporadasConLideres.length === 1 && (
                      <p className="text-center text-accent font-bold mb-6 text-lg">{temporadaActiva}</p>
                    )}
                    <TablaLideres lideres={lideres} />
                  </>
                )}
              </>
            )}

            {/* HISTÓRICOS */}
            {seccion === 'historicos' && (
              <TablaHistoricos />
            )}

            {/* POSICIONES */}
            {seccion === 'posiciones' && (
              <>
                {stats.length === 0 && <p className="text-center text-white/40">No hay tablas de posiciones cargadas aún.</p>}
                {stats.length > 0 && (
                  <>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {stats.map((s, i) => (
                        <button
                          key={s._id}
                          onClick={() => setActivaStat(i)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${activaStat === i ? 'bg-accent text-white' : 'bg-secondary border border-accent/20 text-white/60 hover:border-accent/50 hover:text-white'}`}
                        >
                          {s.temporada} — {s.categoria}
                        </button>
                      ))}
                    </div>
                    {stats[activaStat] && <TablaStandings stat={stats[activaStat]} />}
                  </>
                )}
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
