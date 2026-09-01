import { useEffect, useState } from 'react';
import api from '../api';
import { FALLBACK_PARTIDOS } from '../data/stats.js';
import { teamLogoSrc } from '../utils/teamLogo.js';

const CATS = ['Todos', 'Liga Football Flag', 'Football Flag Femenino', 'Football Americano 7vs7'];
const ESTADOS = { programado: { label: 'Programado', color: 'bg-blue-500/20 text-blue-300' }, en_juego: { label: 'En juego', color: 'bg-green-500/20 text-green-300 animate-pulse' }, finalizado: { label: 'Finalizado', color: 'bg-white/10 text-white/50' }, cancelado: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400' } };

function TeamLogo({ nombre, logoMap }) {
  const logo = logoMap[nombre] || teamLogoSrc({ nombre });
  if (logo) return <img src={logo} alt={nombre} className="w-16 h-16 object-contain" />;
  return <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-2xl">🏈</div>;
}

function dateLabel(partido) {
  return partido.fechaTexto || new Date(partido.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

function isOldEquipadosMatch(partido) {
  const fecha = String(partido.fecha || '').slice(0, 10);
  const equipos = [partido.equipoLocal, partido.equipoVisitante].map(e => String(e || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''));

  return partido.categoria === 'Football Americano 7vs7'
    && fecha === '2026-06-06'
    && equipos.includes('templarios')
    && equipos.includes('barbaros');
}

function mergePartidos(apiPartidos = []) {
  const visibles = apiPartidos.filter(partido => !isOldEquipadosMatch(partido));
  const ids = new Set(visibles.map(partido => partido._id));
  return [...visibles, ...FALLBACK_PARTIDOS.filter(partido => !ids.has(partido._id))];
}

function SectionTitle({ children, count }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="h-px flex-1 bg-accent/25" />
      <span className="text-xs font-extrabold uppercase tracking-widest text-accent">
        {children}
        <span className="ml-2 text-white/30">({count})</span>
      </span>
      <div className="h-px flex-1 bg-accent/25" />
    </div>
  );
}

function PartidoCard({ p, logoMap }) {
  const finalizado = p.estado === 'finalizado';
  const estado = ESTADOS[p.estado] || ESTADOS.programado;

  if (p.tipo === 'agenda') {
    return (
      <div className="bg-secondary border border-accent/20 rounded-xl p-5 hover:border-accent/40 transition">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-xs text-white/40">{p.jornada}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estado.color}`}>{estado.label}</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="w-24 min-h-20 rounded-lg bg-accent/10 border border-accent/20 flex flex-col items-center justify-center text-center flex-shrink-0">
            <p className="text-accent font-extrabold text-lg uppercase leading-tight">{dateLabel(p)}</p>
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-white text-lg leading-tight">{p.titulo}</h3>
            {p.lugar && <p className="text-white/40 text-sm mt-1">📍 {p.lugar}</p>}
            {p.notas && <p className="text-white/50 text-sm mt-2">{p.notas}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary border border-accent/20 rounded-xl p-5 hover:border-accent/40 transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/40">{p.jornada}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estado.color}`}>{estado.label}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        {/* Local */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <TeamLogo nombre={p.equipoLocal} logoMap={logoMap} />
          <p className="text-sm font-bold text-white text-center leading-tight">{p.equipoLocal}</p>
        </div>
        {/* Marcador */}
        <div className="text-center flex-shrink-0">
          {finalizado ? (
            <div className="flex items-center gap-2">
              <span className={`text-4xl font-extrabold ${p.golesLocal > p.golesVisitante ? 'text-accent' : 'text-white/50'}`}>{p.golesLocal}</span>
              <span className="text-white/30 text-2xl">-</span>
              <span className={`text-4xl font-extrabold ${p.golesVisitante > p.golesLocal ? 'text-accent' : 'text-white/50'}`}>{p.golesVisitante}</span>
            </div>
          ) : (
            <div>
              <p className="text-accent font-bold text-sm">{dateLabel(p)}</p>
              {p.hora && <p className="text-white/40 text-xs">{p.hora}hs</p>}
              <p className="text-white/20 text-2xl font-bold mt-1">VS</p>
            </div>
          )}
          {p.lugar && <p className="text-white/30 text-xs mt-1 max-w-[120px] text-center">📍{p.lugar}</p>}
        </div>
        {/* Visitante */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <TeamLogo nombre={p.equipoVisitante} logoMap={logoMap} />
          <p className="text-sm font-bold text-white text-center leading-tight">{p.equipoVisitante}</p>
        </div>
      </div>
      {finalizado && p.mvp && (
        <div className="mt-3 pt-3 border-t border-white/5 text-center">
          <span className="text-xs text-accent/60">⭐ MVP: <span className="text-accent font-semibold">{p.mvp}</span></span>
        </div>
      )}
      {p.notas && (
        <div className="mt-3 pt-3 border-t border-white/5">
          {p.notas.includes('CAMPEONES') ? (
            <p className="text-center text-yellow-400 font-bold text-sm">🏆 {p.notas.replace('🏆 ', '').replace(' 🏆', '')} 🏆</p>
          ) : (
            <div className="text-xs text-white/50 leading-relaxed space-y-0.5">
              {p.notas.split('\n').map((line, i) => (
                <p key={i} className={line.startsWith('•') ? 'pl-3 text-white/40' : 'font-semibold text-white/70 mt-2 first:mt-0'}>
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Fixture() {
  const [partidos, setPartidos] = useState([]);
  const [logoMap, setLogoMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('Todos');
  const [vista, setVista] = useState('todos');

  useEffect(() => {
    Promise.all([
      api.get('/partidos'),
      api.get('/teams'),
    ]).then(([p, t]) => {
      setPartidos(mergePartidos(p.data || []));
      const map = {};
      t.data.forEach(team => { if (team.logo) map[team.nombre] = teamLogoSrc(team); });
      setLogoMap(map);
    }).catch(() => {
      setPartidos(FALLBACK_PARTIDOS);
      setLogoMap({});
    }).finally(() => setLoading(false));
  }, []);

  const filtrados = partidos
    .filter(p => cat === 'Todos' || p.categoria === cat)
    .filter(p => vista === 'todos' ? true : vista === 'proximos' ? p.estado !== 'finalizado' : p.estado === 'finalizado')
    .sort((a, b) => {
      // Programados primero, luego finalizados por fecha descendente
      if (a.estado !== 'finalizado' && b.estado === 'finalizado') return -1;
      if (a.estado === 'finalizado' && b.estado !== 'finalizado') return 1;
      if (a.estado === 'finalizado' && b.estado === 'finalizado') return new Date(b.fecha) - new Date(a.fecha);
      return new Date(a.fecha) - new Date(b.fecha);
    });
  const programados = filtrados.filter(p => p.estado !== 'finalizado');
  const finalizados = filtrados.filter(p => p.estado === 'finalizado');

  return (
    <div className="bg-primary text-white pt-16">
      <section className="bg-secondary border-b border-accent/20 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold">Fixture y Resultados</h1>
        <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded" />
        <p className="text-white/50 mt-4 text-lg">Calendario de partidos y resultados</p>
      </section>

      <section className="max-w-3xl mx-auto py-12 px-4">
        {/* Toggle próximos / resultados */}
        <div className="flex bg-secondary border border-accent/20 rounded-xl p-1 mb-6 w-fit mx-auto">
          {[['todos', '🗓️ Todos'], ['proximos', '📅 Próximos'], ['resultados', '🏆 Resultados']].map(([v, l]) => (
            <button key={v} onClick={() => setVista(v)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${vista === v ? 'bg-accent text-white' : 'text-white/50 hover:text-white'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Filtro categorías */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${cat === c ? 'bg-accent text-white' : 'bg-secondary border border-accent/20 text-white/50 hover:text-white hover:border-accent/50'}`}>
              {c}
            </button>
          ))}
        </div>

        {loading && <p className="text-center text-white/40">Cargando...</p>}
        {!loading && filtrados.length === 0 && (
          <p className="text-center text-white/40 py-10">No hay partidos en esta sección aún.</p>
        )}

        <div className="space-y-5">
          {programados.length > 0 && (
            <section className="space-y-4">
              <SectionTitle count={programados.length}>Programados</SectionTitle>
              {programados.map(p => <PartidoCard key={p._id} p={p} logoMap={logoMap} />)}
            </section>
          )}

          {programados.length > 0 && finalizados.length > 0 && (
            <div className="py-2">
              <div className="h-px bg-white/10" />
            </div>
          )}

          {finalizados.length > 0 && (
            <section className="space-y-4">
              <SectionTitle count={finalizados.length}>Finalizados</SectionTitle>
              {finalizados.map(p => <PartidoCard key={p._id} p={p} logoMap={logoMap} />)}
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
