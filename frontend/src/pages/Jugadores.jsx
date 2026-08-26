import { useEffect, useState } from 'react';
import api from '../api';
import { FALLBACK_PLAYERS, mergePlayers } from '../data/players.js';
import { FALLBACK_LIDERES } from '../data/stats.js';
import { teamLogoSrc } from '../utils/teamLogo.js';

import { API_URL } from '../config.js';
function fotoSrc(f) { return f?.startsWith('http') ? f : `${API_URL}${f}`; }

const EQUIPOS = ['Todos', 'Acorazados', 'Liebres', 'Krakens', 'Tridentes', 'Nereidas', 'Atlantes', 'Bárbaros', 'Templarios'];

function normalizeName(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function samePlayer(entryName, playerName) {
  return normalizeName(entryName) === normalizeName(playerName);
}

function playerHonors(player) {
  const premios = [];
  const ofensivo = [];
  const defensivo = [];

  FALLBACK_LIDERES.forEach(lider => {
    if (lider.tipo === 'premios') {
      lider.jugadores
        .filter(j => samePlayer(j.jugador, player.nombre))
        .forEach(j => premios.push({ temporada: lider.temporada, label: j.premio.split('—')[0].trim() }));
    }

    if (lider.tipo === 'equipo-ofensivo') {
      lider.jugadores
        .filter(j => samePlayer(j.nombre, player.nombre))
        .forEach(() => ofensivo.push(lider.temporada));
    }

    if (lider.tipo === 'equipo-defensivo') {
      lider.jugadores
        .filter(j => samePlayer(j.nombre, player.nombre))
        .forEach(() => defensivo.push(lider.temporada));
    }
  });

  return {
    premios,
    ofensivo,
    defensivo,
    total: premios.length + ofensivo.length + defensivo.length,
  };
}

export default function Jugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equipo, setEquipo] = useState('Todos');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/jugadores')
      .then(r => setJugadores(mergePlayers(r.data)))
      .catch(() => setJugadores(FALLBACK_PLAYERS))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = equipo === 'Todos' ? jugadores : jugadores.filter(j => j.equipo === equipo);

  return (
    <div className="bg-primary text-white pt-16">
      <section className="bg-secondary border-b border-accent/20 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold">Jugadores</h1>
        <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded" />
        <p className="text-white/50 mt-4 text-lg">Los atletas de la Liga Football MDP</p>
      </section>

      {/* MVPs destacados */}
      {jugadores.filter(j => j.esMVP).length > 0 && (
        <section className="bg-secondary border-b border-accent/10 py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-accent mb-6 flex items-center gap-2">⭐ MVPs Destacados</h2>
            <div className="flex flex-wrap gap-4">
              {jugadores.filter(j => j.esMVP).map(j => (
                <button key={j._id} onClick={() => setSelected(j)}
                  className="flex items-center gap-3 bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 hover:border-accent transition">
                  {j.foto ? <img src={fotoSrc(j.foto)} alt={j.nombre} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-lg">👤</div>}
                  <div className="text-left">
                    <p className="font-bold text-white text-sm">{j.nombre}</p>
                    <p className="text-accent/70 text-xs">{j.equipo} · {j.posicion}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-5xl mx-auto py-12 px-4">
        {/* Filtro */}
        <div className="flex flex-wrap gap-2 mb-8">
          {EQUIPOS.map(e => (
            <button key={e} onClick={() => setEquipo(e)}
              className={`min-h-10 px-3 py-1.5 rounded-full text-sm font-medium transition inline-flex items-center gap-2 ${equipo === e ? 'bg-accent text-white' : 'bg-secondary border border-accent/20 text-white/50 hover:text-white hover:border-accent/50'}`}>
              {e !== 'Todos' && (
                <img src={teamLogoSrc({ nombre: e })} alt="" className="w-7 h-7 object-contain" />
              )}
              {e}
            </button>
          ))}
        </div>

        {loading && <p className="text-center text-white/40">Cargando jugadores...</p>}
        {!loading && filtrados.length === 0 && <p className="text-center text-white/40 py-10">No hay jugadores registrados aún.</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtrados.map(j => (
            <button key={j._id} onClick={() => setSelected(j)}
              className="bg-secondary border border-accent/20 rounded-xl p-4 flex flex-col items-center hover:border-accent/60 hover:-translate-y-1 transition-all group">
              {j.foto ? (
                <img src={fotoSrc(j.foto)} alt={j.nombre} className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-accent/20 group-hover:border-accent transition" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-3xl mb-3 border-2 border-accent/10 group-hover:border-accent transition">👤</div>
              )}
              {j.numero && <span className="text-accent text-xs font-bold mb-1">#{j.numero}</span>}
              <p className="font-bold text-white text-sm text-center leading-tight">{j.nombre}</p>
              <p className="text-white/40 text-xs mt-1 text-center">{j.posicion}</p>
              {j.esMVP && <span className="mt-2 text-xs">⭐ MVP</span>}
            </button>
          ))}
        </div>
      </section>

      {/* Modal detalle */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-secondary border border-accent/30 rounded-2xl max-w-md w-full p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="float-right text-white/40 hover:text-white text-2xl">×</button>
            {selected.foto ? (
              <img src={fotoSrc(selected.foto)} alt={selected.nombre} className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-accent/30" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-accent/10 flex items-center justify-center text-5xl mx-auto mb-4">👤</div>
            )}
            {selected.numero && <p className="text-accent text-center font-extrabold text-2xl">#{selected.numero}</p>}
            <h2 className="text-2xl font-bold text-white text-center mt-1">{selected.nombre}</h2>
            <p className="text-center text-white/50 mt-1">{selected.equipo} · {selected.posicion}</p>
            {selected.bio && <p className="text-white/60 text-sm mt-4 text-center leading-relaxed">{selected.bio}</p>}
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mt-6">
              {[['PJ', selected.stats?.partidos], ['TD', selected.stats?.touchdowns], ['INT', selected.stats?.intercepciones], ['YDS', selected.stats?.yardas]].map(([l, v]) => (
                <div key={l} className="bg-primary/50 rounded-lg p-3 text-center">
                  <p className="text-accent font-extrabold text-xl">{v ?? 0}</p>
                  <p className="text-white/40 text-xs mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            {(() => {
              const honors = playerHonors(selected);
              return (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    ['Premios', honors.premios.length],
                    ['Ofensivo', honors.ofensivo.length],
                    ['Defensivo', honors.defensivo.length],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-primary/40 rounded-lg p-3 text-center border border-white/5">
                      <p className="text-white font-extrabold text-lg">{value}</p>
                      <p className="text-white/40 text-xs mt-0.5">{label}</p>
                    </div>
                  ))}
                  {honors.total > 0 && (
                    <div className="col-span-3 bg-primary/30 rounded-lg px-3 py-2 text-xs text-white/55 leading-relaxed">
                      {honors.premios.length > 0 && <p><span className="text-accent font-bold">Premios:</span> {honors.premios.map(p => `${p.label} (${p.temporada})`).join(' · ')}</p>}
                      {honors.ofensivo.length > 0 && <p><span className="text-accent font-bold">Equipo ofensivo:</span> {honors.ofensivo.join(' · ')}</p>}
                      {honors.defensivo.length > 0 && <p><span className="text-accent font-bold">Equipo defensivo:</span> {honors.defensivo.join(' · ')}</p>}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
