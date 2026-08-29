import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import {
  FALLBACK_EQUIPADOS,
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
  touchdowns:    { label: 'Touchdowns',    cols: ['TD'],                              keys: ['td'] },
  pase:          { label: 'Pase',          cols: ['PAS','COM','%','YDS','TD','INT'],  keys: ['pas','com','pct','yds','td','int'] },
  corrida:       { label: 'Corrida',        cols: ['AC','YDS','PROM','TD'],            keys: ['int','yds','prom','td'] },
  recepcion:     { label: 'Recepción',      cols: ['REC','YDS','PROM','TD'],           keys: ['rec','yds','prom','td'] },
  flags:         { label: 'Flageos',        cols: ['FLAGS'],                           keys: ['flags'] },
  intercepciones:{ label: 'Intercepciones', cols: ['INTS','PICK SIX'],                 keys: ['ints','pickSix'] },
  sacks:         { label: 'Sacks',          cols: ['SACKS','SAFETY'],                  keys: ['sacks','safety'] },
  deflecciones:  { label: 'Deflecciones',   cols: ['DEFLEC'],                          keys: ['deflec'] },
  tackles:       { label: 'Tackles',        cols: ['TACKLES'],                         keys: ['tackles'] },
  fumbles:       { label: 'Fumbles',        cols: ['FF','FR'],                         keys: ['forzado','recuperado'] },
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
  BAR: 'bg-indigo-700',
  TEM: 'bg-red-600',
};

const CAMPEONES_TAZON = {
  I: 'Tridentes',
  II: 'Tridentes',
  III: 'Tridentes',
  IV: 'Krakens',
  V: 'Liebres',
  VI: 'Liebres',
  VII: 'Tridentes',
  VIII: 'Tridentes',
  IX: 'Liebres',
  X: 'Krakens',
};

const CAMPEON_COLORS = {
  Krakens: 'bg-purple-600',
  Liebres: 'bg-orange-400',
  Tridentes: 'bg-red-500',
};

const ROMAN_ORDER = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
  XI: 11,
};

function temporadaNumero(temporada) {
  const match = String(temporada ?? '').match(/Tazón del Mar\s+([IVX]+)/i);
  return ROMAN_ORDER[match?.[1]?.toUpperCase()] || 0;
}

function tazonRoman(temporada) {
  return String(temporada ?? '').match(/Tazón del Mar\s+([IVX]+)/i)?.[1]?.toUpperCase();
}

function campeonDeTemporada(temporada) {
  return CAMPEONES_TAZON[tazonRoman(temporada)] || null;
}

function ordenarTemporadasDesc(temporadas) {
  return [...temporadas].sort((a, b) => temporadaNumero(b) - temporadaNumero(a) || String(a).localeCompare(String(b)));
}

function jugadorConNumero(jugador) {
  return jugador.numero && jugador.numero !== 'S/N'
    ? `#${jugador.numero} ${jugador.nombre || jugador.jugador}`
    : (jugador.nombre || jugador.jugador);
}

function normalizeName(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildEquipoIdealRanking(tipo) {
  const players = new Map();

  FALLBACK_LIDERES
    .filter(lider => lider.tipo === tipo && !lider.temporada.includes('Final') && !lider.temporada.includes('Semi'))
    .forEach(lider => {
      lider.jugadores.forEach(jugador => {
        const name = jugador.nombre || jugador.jugador;
        const key = normalizeName(name);
        if (!key) return;

        const current = players.get(key) || {
          nombre: name,
          equipo: jugador.equipo,
          count: 0,
          temporadas: [],
        };

        current.count += 1;
        current.equipo = jugador.equipo || current.equipo;
        current.temporadas.push(lider.temporada);
        players.set(key, current);
      });
    });

  return [...players.values()]
    .sort((a, b) => b.count - a.count || a.nombre.localeCompare(b.nombre))
    .slice(0, 10)
    .map((player, index) => ({ ...player, pos: index + 1 }));
}

function buildEquipadosHistoricos() {
  const categorias = [
    { key: 'tdPasados', titulo: 'TD pasados', abreviatura: 'TD', tipo: 'pase', stat: 'td' },
    { key: 'tdCorridos', titulo: 'TD corridos', abreviatura: 'TD', tipo: 'corrida', stat: 'td' },
    { key: 'tdRecibidos', titulo: 'TD recibidos', abreviatura: 'TD', tipo: 'recepcion', stat: 'td' },
    { key: 'yardasPasando', titulo: 'Yardas pasando', abreviatura: 'YDS', tipo: 'pase', stat: 'yds' },
    { key: 'yardasCorriendo', titulo: 'Yardas corriendo', abreviatura: 'YDS', tipo: 'corrida', stat: 'yds' },
    { key: 'yardasRecibiendo', titulo: 'Yardas recibiendo', abreviatura: 'YDS', tipo: 'recepcion', stat: 'yds' },
    { key: 'intercepciones', titulo: 'Intercepciones', abreviatura: 'INT', tipo: 'intercepciones', stat: 'ints' },
    { key: 'tackles', titulo: 'Tackles', abreviatura: 'TCK', tipo: 'tackles', stat: 'tackles' },
    { key: 'fumblesForzados', titulo: 'Fumbles forzados', abreviatura: 'FF', tipo: 'fumbles', stat: 'forzado' },
    { key: 'fumblesRecuperados', titulo: 'Fumbles recuperados', abreviatura: 'FR', tipo: 'fumbles', stat: 'recuperado' },
  ];

  const lideres = FALLBACK_EQUIPADOS.flatMap(partido => partido.lideres || []);

  return categorias
    .map(categoria => {
      const jugadores = new Map();

      lideres
        .filter(lider => lider.tipo === categoria.tipo)
        .forEach(lider => {
          lider.jugadores.forEach(jugador => {
            const valor = Number(jugador[categoria.stat]) || 0;
            const key = normalizeName(jugador.nombre);
            if (!key || valor <= 0) return;

            const current = jugadores.get(key) || {
              nombre: jugador.nombre,
              equipo: jugador.equipo,
              partidos: 0,
              valor: 0,
            };

            current.valor += valor;
            current.partidos += 1;
            current.equipo = jugador.equipo || current.equipo;
            jugadores.set(key, current);
          });
        });

      return {
        ...categoria,
        jugadores: [...jugadores.values()]
          .sort((a, b) => b.valor - a.valor || a.nombre.localeCompare(b.nombre))
          .slice(0, 10)
          .map((jugador, index) => ({ ...jugador, pos: index + 1 })),
      };
    })
    .filter(categoria => categoria.jugadores.length > 0);
}

function CampeonTemporada({ temporada }) {
  const campeon = campeonDeTemporada(temporada);
  if (!campeon) return null;

  return (
    <div className="mb-6 rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <p className="text-xs text-yellow-200/70 uppercase tracking-widest font-extrabold">Campeón</p>
        <h2 className="text-2xl font-extrabold text-white mt-1">{campeon}</h2>
      </div>
      <span className={`self-start sm:self-center text-xs font-extrabold px-3 py-1 rounded-full text-white ${CAMPEON_COLORS[campeon] || 'bg-white/20'}`}>
        {temporada}
      </span>
    </div>
  );
}

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

function EquipadosSection() {
  const [partidoActivo, setPartidoActivo] = useState(FALLBACK_EQUIPADOS[0]?.id || '');
  const partido = FALLBACK_EQUIPADOS.find(item => item.id === partidoActivo) || FALLBACK_EQUIPADOS[0];

  if (!partido) {
    return (
      <p className="text-center text-white/40 bg-secondary border border-accent/20 rounded-xl px-6 py-10">
        No hay partidos de equipados cargados todavía.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {FALLBACK_EQUIPADOS.length > 1 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {FALLBACK_EQUIPADOS.map(item => (
            <button
              key={item.id}
              onClick={() => setPartidoActivo(item.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${
                partido.id === item.id
                  ? 'bg-accent text-white'
                  : 'bg-secondary border border-accent/20 text-white/60 hover:text-white'
              }`}
            >
              {item.resultado.fecha} · {item.resultado.local} {item.resultado.puntosLocal}-{item.resultado.puntosVisitante} {item.resultado.visitante}
            </button>
          ))}
        </div>
      )}

      <div className="bg-secondary border border-accent/20 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-accent/10">
          <p className="text-xs text-accent/60 uppercase tracking-widest font-bold">{partido.categoria}</p>
          <h2 className="text-2xl font-extrabold text-white mt-1">{partido.titulo}</h2>
          {partido.resultado.fecha && <p className="text-white/40 text-sm mt-1">{partido.resultado.fecha}</p>}
        </div>
        <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-center justify-center gap-4 text-center">
            <div>
              <p className="text-sm text-white/50">{partido.resultado.local}</p>
              <p className="text-5xl font-extrabold text-white">{partido.resultado.puntosLocal}</p>
            </div>
            <span className="text-white/20 text-3xl font-extrabold">-</span>
            <div>
              <p className="text-sm text-white/50">{partido.resultado.visitante}</p>
              <p className="text-5xl font-extrabold text-white">{partido.resultado.puntosVisitante}</p>
            </div>
          </div>
          <div className="bg-primary/45 border border-white/10 rounded-xl px-5 py-4">
            <p className="text-xs text-accent/70 uppercase tracking-widest font-bold">Jugador destacado</p>
            <p className="text-xl font-extrabold text-white mt-1">#38 {partido.resultado.destacado}</p>
            <p className="text-white/50 text-sm mt-1">{partido.resultado.resumenDestacado}</p>
          </div>
        </div>
      </div>

      <TablaLideres lideres={partido.lideres} />
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
                  <p className="font-bold text-white text-lg">{jugadorConNumero(j)}</p>
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
                      <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{jugadorConNumero(j)}</td>
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

function TablaHistoricos({ deporte = 'flag' }) {
  const esEquipados = deporte === 'equipados';
  const historicos = esEquipados ? buildEquipadosHistoricos() : FALLBACK_HISTORICOS;
  const temporadasHistoricas = esEquipados ? [] : ordenarTemporadasDesc([...new Set(
    FALLBACK_LIDERES
      .filter(l => !l.temporada.includes('Final') && !l.temporada.includes('Semi'))
      .map(l => l.temporada)
  )]);
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
  const equiposIdealesRanking = [
    { key: 'equipo-ofensivo', titulo: 'Equipo Ofensivo', icon: '⚔️', jugadores: buildEquipoIdealRanking('equipo-ofensivo') },
    { key: 'equipo-defensivo', titulo: 'Equipo Defensivo', icon: '🛡️', jugadores: buildEquipoIdealRanking('equipo-defensivo') },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {historicos.map(categoria => (
          <div key={categoria.key} className="bg-secondary border border-accent/20 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-accent/10">
              <p className="text-xs text-accent/60 uppercase tracking-widest font-bold">
                Líderes históricos {esEquipados ? 'equipados' : 'flag'}
              </p>
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

      {!esEquipados && <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <p className="font-bold text-white truncate">{jugadorConNumero(ganador)}</p>
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
      </div>}

      {!esEquipados && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {equiposIdealesRanking.map(({ key, titulo, icon, jugadores }) => (
          <div key={key} className="bg-secondary border border-accent/20 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-accent/10">
              <p className="text-xs text-accent/60 uppercase tracking-widest font-bold">Equipos ideales históricos</p>
              <h2 className="text-xl font-extrabold text-white mt-1">{icon} {titulo}</h2>
              <p className="text-white/40 text-xs mt-1">Jugadores con más apariciones acumuladas</p>
            </div>
            <div className="divide-y divide-white/5">
              {jugadores.map(jugador => (
                <div key={`${key}-${jugador.pos}-${jugador.nombre}`} className="px-5 py-4 flex items-center gap-4">
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
                        {jugador.temporadas.length} torneos
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-accent">x{jugador.count}</p>
                    <p className="text-white/35 text-xs font-bold">EQUIPO</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

function PremiosSection({ deporte = 'flag' }) {
  const [lideresPremios, setLideresPremios] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [temporadaActiva, setTemporadaActiva] = useState('');

  useEffect(() => {
    if (deporte === 'equipados') {
      setTemporadas([]);
      setTemporadaActiva('');
      setLideresPremios([]);
      return;
    }

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
  }, [deporte]);

  useEffect(() => {
    if (deporte === 'flag' && temporadaActiva) {
      api.get(`/lideres?temporada=${encodeURIComponent(temporadaActiva)}`)
        .then(r => setLideresPremios(r.data?.length ? mergeFallbackLideres(r.data, temporadaActiva) : fallbackLideresByTemporada(temporadaActiva)))
        .catch(() => setLideresPremios(fallbackLideresByTemporada(temporadaActiva)));
    }
  }, [deporte, temporadaActiva]);

  if (deporte === 'equipados') {
    return (
      <p className="text-center text-white/40 bg-secondary border border-accent/20 rounded-xl px-6 py-10">
        Todavía no hay premios cargados para equipados.
      </p>
    );
  }

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
      <CampeonTemporada temporada={temporadaActiva} />
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
  const initialSeccion = searchParams.get('seccion') === 'equipados' ? 'lideres' : (searchParams.get('seccion') || 'premios');
  const initialDeporte = searchParams.get('deporte') || (searchParams.get('seccion') === 'equipados' ? 'equipados' : 'flag');
  const [seccion, setSeccion] = useState(initialSeccion);
  const [deporte, setDeporte] = useState(initialDeporte === 'equipados' ? 'equipados' : 'flag');
  const [loading, setLoading] = useState(true);
  const [activaStat, setActivaStat] = useState(0);
  const temporadasConLideres = temporadas.filter(temporada =>
    fallbackLideresByTemporada(temporada).some(lider => TIPOS[lider.tipo])
    || (temporada === temporadaActiva && lideres.some(lider => TIPOS[lider.tipo]))
  );
  const temporadasTazones = ordenarTemporadasDesc(temporadasConLideres.filter(t => /^Tazón del Mar/i.test(t)));
  const temporadasFinales = ordenarTemporadasDesc(temporadasConLideres.filter(t => /^Final/i.test(t)));
  const temporadasOtras = temporadasConLideres.filter(t => !/^Tazón del Mar/i.test(t) && !/^Final/i.test(t));
  const temporadasLideresOrdenadas = [...temporadasTazones, ...temporadasFinales, ...temporadasOtras];

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
    if (deporte === 'flag' && seccion === 'lideres' && temporadasLideresOrdenadas.length > 0 && !temporadasLideresOrdenadas.includes(temporadaActiva)) {
      setTemporadaActiva(temporadasLideresOrdenadas[0]);
    }
  }, [deporte, seccion, temporadaActiva, temporadasLideresOrdenadas]);

  const renderTemporadaButtons = (label, items) => items.length > 0 && (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className="text-xs font-extrabold uppercase tracking-widest text-accent/60 sm:w-20">{label}</span>
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {items.map(t => (
          <button
            key={t}
            onClick={() => setTemporadaActiva(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${temporadaActiva === t ? 'bg-accent text-white' : 'bg-secondary border border-accent/20 text-white/60 hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );

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
              {[['premios','🏅 Premios'], ['lideres','📈 Líderes'], ['historicos','🏛️ Históricos'], ['posiciones','📊 Estadísticas']].map(([v, l]) => (
                <button key={v} onClick={() => setSeccion(v)}
                  className={`px-6 py-2 rounded-lg font-bold transition ${seccion === v ? 'bg-accent text-white' : 'bg-secondary border border-accent/20 text-white/60 hover:text-white'}`}>
                  {l}
                </button>
              ))}
            </div>

            <div className="flex bg-secondary border border-accent/20 rounded-xl p-1 mb-8 w-fit mx-auto">
              {[['flag', 'Flag'], ['equipados', 'Equipados']].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setDeporte(value)}
                  className={`px-6 py-2 rounded-lg text-sm font-extrabold transition ${
                    deporte === value ? 'bg-accent text-white' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* PREMIOS */}
            {seccion === 'premios' && (
              <PremiosSection deporte={deporte} />
            )}

            {/* LÍDERES */}
            {seccion === 'lideres' && deporte === 'equipados' && (
              <EquipadosSection />
            )}

            {seccion === 'lideres' && deporte === 'flag' && (
              <>
                {temporadasLideresOrdenadas.length === 0 && <p className="text-center text-white/40">No hay líderes cargados aún.</p>}
                {temporadasLideresOrdenadas.length > 0 && (
                  <>
                    {/* Selector temporada */}
                    {temporadasLideresOrdenadas.length > 1 && (
                      <div className="space-y-3 mb-6 max-w-4xl mx-auto">
                        {renderTemporadaButtons('Tazones', temporadasTazones)}
                        {renderTemporadaButtons('Finales', temporadasFinales)}
                        {renderTemporadaButtons('Otros', temporadasOtras)}
                      </div>
                    )}
                    {temporadasLideresOrdenadas.length === 1 && (
                      <p className="text-center text-accent font-bold mb-6 text-lg">{temporadaActiva}</p>
                    )}
                    <CampeonTemporada temporada={temporadaActiva} />
                    <TablaLideres lideres={lideres} />
                  </>
                )}
              </>
            )}

            {/* HISTÓRICOS */}
            {seccion === 'historicos' && (
              <TablaHistoricos deporte={deporte} />
            )}

            {/* POSICIONES */}
            {seccion === 'posiciones' && deporte === 'equipados' && (
              <EquipadosSection />
            )}

            {seccion === 'posiciones' && deporte === 'flag' && (
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
                    {stats[activaStat] && (
                      <>
                        <CampeonTemporada temporada={stats[activaStat].temporada} />
                        <TablaStandings stat={stats[activaStat]} />
                      </>
                    )}
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
