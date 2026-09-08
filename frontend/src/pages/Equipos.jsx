import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import TeamStars from '../components/TeamStars';
import { FALLBACK_PLAYERS, mergePlayers, playersForTeam } from '../data/players.js';
import { mergeTeams } from '../data/teams.js';
import { teamLogoSrc, teamSlug } from '../utils/teamLogo.js';

function slugify(str) {
  return teamSlug(str);
}

const CATEGORIAS = [
  { key: 'Liga Football Flag', icon: '🏈', descripcion: 'Equipos de la liga de football flag de Mar del Plata' },
  { key: 'Football Flag Femenino', icon: '⚡', descripcion: 'Equipos femeninos de football flag' },
  { key: 'Football Americano 7vs7', icon: '🏟️', descripcion: 'Equipos de football americano 7vs7' },
];

const EQUIPOS_INACTIVOS = ['Acorazados'];
const TEAM_COVERS = {
  corales: '/equipos/corales.jpg',
  krakens: '/equipos/krakens-slide-1.jpg',
  liebres: '/equipos/liebres-slide-1.jpg',
  nereidas: '/equipos/nereidas-cover.jpg',
  sirenas: '/equipos/sirenas.jpg',
  tridentes: '/equipos/tridentes-slide-1.jpg',
};

function isActiveTeam(team) {
  return !team.oculto && !EQUIPOS_INACTIVOS.includes(team.nombre);
}

function TeamCard({ team, players = [] }) {
  const logo = teamLogoSrc(team);
  const cover = TEAM_COVERS[slugify(team.nombre)];
  const rosterPreview = players.slice(0, 5);

  return (
    <Link
      to={`/equipos/${slugify(team.nombre)}`}
      state={{ team }}
      className="group relative flex min-h-[440px] flex-col overflow-hidden border border-accent/20 bg-secondary transition-all hover:-translate-y-1 hover:border-accent/60 hover:shadow-2xl hover:shadow-black/25"
    >
      <div className="relative h-36 overflow-hidden bg-primary">
        {cover ? (
          <img src={cover} alt={`Equipo ${team.nombre}`} className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,rgba(74,140,196,0.28),rgba(255,255,255,0.04))]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/45 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4">
          {logo ? (
            <img src={logo} alt={team.nombre} className="h-24 w-24 object-contain drop-shadow-xl" loading="lazy" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center bg-accent/15 text-2xl font-black text-accent">
              {team.nombre?.charAt(0)}
            </div>
          )}
          <span className="mb-2 border border-white/15 bg-primary/70 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white/70 backdrop-blur">
            {team.ciudad || 'Mar del Plata'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-light">{team.categoria}</p>
        <h3 className="mt-2 text-3xl font-black uppercase leading-none text-white">{team.nombre}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/56">{team.descripcion}</p>
        <div className="mt-4 min-h-9">
          <TeamStars campeonatos={team.campeonatos || []} compact />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-y border-white/10 py-4">
          <div>
            <p className="text-2xl font-black text-white">{players.length}</p>
            <p className="text-xs font-bold uppercase tracking-wide text-white/35">Jugadores</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">{team.campeonatos?.length || 0}</p>
            <p className="text-xs font-bold uppercase tracking-wide text-white/35">Títulos</p>
          </div>
        </div>
        {players.length > 0 && (
          <div className="w-full mt-5 border-t border-accent/10 pt-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-wide">
              <span className="text-accent font-bold">Plantel</span>
              <span className="text-white/40">{players.length} jugadores</span>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-white/60">
              {rosterPreview.map(player => (
                <li key={player._id} className="flex items-center gap-2">
                  <span className="w-9 text-accent/80 font-bold">#{player.numero}</span>
                  <span className="min-w-0 flex-1 truncate">{player.nombre}</span>
                  <span className="text-white/30 text-xs">{player.posicion}</span>
                </li>
              ))}
            </ul>
            {players.length > rosterPreview.length && (
              <p className="text-white/35 text-xs mt-3">+{players.length - rosterPreview.length} más</p>
            )}
          </div>
        )}
        <span className="mt-auto pt-5 text-sm font-extrabold uppercase tracking-wide text-accent-light">
          Ver equipo
        </span>
      </div>
    </Link>
  );
}

export default function Equipos() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState(FALLBACK_PLAYERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([api.get('/teams'), api.get('/jugadores')])
      .then(([teamsResult, playersResult]) => {
        const apiTeams = teamsResult.status === 'fulfilled' ? teamsResult.value.data : [];
        const apiPlayers = playersResult.status === 'fulfilled' ? playersResult.value.data : [];

        setTeams(mergeTeams(apiTeams).filter(isActiveTeam));
        setPlayers(mergePlayers(apiPlayers));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-primary text-white pt-16">
      <section className="relative overflow-hidden border-b border-accent/20 bg-secondary px-4 py-20 text-center">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(74,140,196,0.18),transparent_55%)]" />
        <div className="relative">
          <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-accent">Competencia local</p>
          <h1 className="mt-3 text-3xl font-black uppercase text-white md:text-5xl">Equipos</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/55">Conocé a los equipos que forman parte de la Liga Football Americano Mar del Plata.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto py-16 px-4 space-y-16">
        {loading && <p className="text-center text-white/40">Cargando equipos...</p>}

        {!loading && CATEGORIAS.map(cat => {
          const equipos = teams.filter(t => t.categoria === cat.key);
          if (equipos.length === 0) return null;

          // Para 7vs7 separar selección de equipos
          if (cat.key === 'Football Americano 7vs7') {
            const seleccion = equipos.filter(t => t.esSeleccion);
            const resto = equipos.filter(t => !t.esSeleccion);
            return (
              <section key={cat.key}>
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">{cat.key}</h2>
                    <p className="text-white/40 text-sm">{cat.descripcion}</p>
                  </div>
                  <div className="flex-1 h-px bg-accent/20 ml-4" />
                </div>

                {/* Selección */}
                {seleccion.length > 0 && (
                  <>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-accent text-xs font-bold uppercase tracking-widest">🏅 Selección Mar del Plata</span>
                      <div className="flex-1 h-px bg-accent/20" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {seleccion.map(team => (
                        <TeamCard key={team._id} team={team} players={playersForTeam(team.nombre, players)} />
                      ))}
                    </div>
                  </>
                )}

                {/* Resto de equipos */}
                {resto.length > 0 && (
                  <>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Equipos</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {resto.map(team => (
                        <TeamCard key={team._id} team={team} players={playersForTeam(team.nombre, players)} />
                      ))}
                    </div>
                  </>
                )}
              </section>
            );
          }

          return (
            <section key={cat.key}>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h2 className="text-2xl font-extrabold text-white">{cat.key}</h2>
                  <p className="text-white/40 text-sm">{cat.descripcion}</p>
                </div>
                <div className="flex-1 h-px bg-accent/20 ml-4" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipos.map(team => (
                  <TeamCard key={team._id} team={team} players={playersForTeam(team.nombre, players)} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
