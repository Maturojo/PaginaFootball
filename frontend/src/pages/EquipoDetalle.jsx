import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../api';
import TeamStars from '../components/TeamStars';
import { FALLBACK_PLAYERS, mergePlayers, playersForTeam } from '../data/players.js';
import { FALLBACK_TEAMS } from '../data/teams.js';
import { teamLogoSrc, teamSlug } from '../utils/teamLogo.js';

const TEAM_COVERS = {
  nereidas: '/equipos/nereidas-cover.jpg',
};

function slugify(str) {
  return teamSlug(str);
}

export default function EquipoDetalle() {
  const { id } = useParams();
  const location = useLocation();
  const [team, setTeam] = useState(location.state?.team || null);
  const [players, setPlayers] = useState(FALLBACK_PLAYERS);
  const [loading, setLoading] = useState(!location.state?.team);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (team) return;
    const findTeam = teams => teams.find(t => t._id === id || slugify(t.nombre) === id);

    api.get('/teams')
      .then(r => {
        const found = findTeam(r.data) || findTeam(FALLBACK_TEAMS);
        if (found) setTeam(found);
        else setNotFound(true);
      })
      .catch(() => {
        const found = findTeam(FALLBACK_TEAMS);
        if (found) setTeam(found);
        else setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    api.get('/jugadores')
      .then(r => setPlayers(mergePlayers(r.data)))
      .catch(() => setPlayers(FALLBACK_PLAYERS));
  }, []);

  if (loading) return (
    <div className="bg-primary min-h-screen flex items-center justify-center">
      <p className="text-white/40 text-lg">Cargando...</p>
    </div>
  );

  if (notFound) return (
    <div className="bg-primary min-h-screen flex flex-col items-center justify-center text-white gap-4">
      <p className="text-5xl">🏈</p>
      <p className="text-2xl font-bold">Equipo no encontrado</p>
      <Link to="/equipos" className="text-accent hover:underline">← Volver a equipos</Link>
    </div>
  );

  const logo = teamLogoSrc(team);
  const cover = TEAM_COVERS[slugify(team.nombre)];
  const roster = playersForTeam(team.nombre, players);

  return (
    <div className="bg-primary text-white min-h-screen pt-16">
      {/* Hero del equipo */}
      <section className={`relative overflow-hidden border-b border-accent/20 py-16 px-4 ${cover ? 'bg-primary' : 'bg-secondary'}`}>
        {cover && (
          <>
            <img
              src={cover}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/45" />
          </>
        )}
        <div className="relative max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-shrink-0">
            {logo ? (
              <img
                src={logo}
                alt={team.nombre}
                className="w-44 h-44 object-contain drop-shadow-2xl"
              />
            ) : (
              <div className="w-44 h-44 bg-accent/10 rounded-full flex items-center justify-center">
                <span className="text-7xl">🏈</span>
              </div>
            )}
          </div>
          <div>
            <Link to="/equipos" className="text-accent/60 hover:text-accent text-sm transition mb-3 inline-block">
              ← Todos los equipos
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">{team.nombre}</h1>
            <div className="flex flex-wrap gap-4 mt-3">
              {team.ciudad && (
                <span className="flex items-center gap-1.5 text-white/50 text-sm">
                  📍 {team.ciudad}
                </span>
              )}
              {team.anioFundacion && (
                <span className="flex items-center gap-1.5 text-white/50 text-sm">
                  📅 Est. {team.anioFundacion}
                </span>
              )}
              {team.colores && (
                <span className="flex items-center gap-1.5 text-white/50 text-sm">
                  🎨 {team.colores}
                </span>
              )}
            </div>
            <div className="mt-5 flex md:justify-start justify-center">
              <TeamStars campeonatos={team.campeonatos || []} />
            </div>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="max-w-4xl mx-auto py-14 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Descripción */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold text-accent mb-4 uppercase tracking-wide">Sobre el equipo</h2>
          <div className="w-10 h-0.5 bg-accent mb-5 rounded" />
          <p className="text-white/60 leading-relaxed text-lg">
            {team.descripcion || 'Información próximamente.'}
          </p>

          {/* Plantel si hay jugadores */}
          {(roster.length > 0 || team.jugadores?.length > 0) && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-accent mb-4 uppercase tracking-wide">Plantel</h2>
              <div className="w-10 h-0.5 bg-accent mb-5 rounded" />
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {roster.length > 0 ? roster.map(player => (
                  <li key={player._id} className="bg-secondary border border-accent/10 rounded-lg px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-10 text-accent font-extrabold">#{player.numero}</span>
                      <div className="min-w-0">
                        <p className="text-white font-bold truncate">{player.nombre}</p>
                        <p className="text-white/40 text-xs">{player.posicion}</p>
                      </div>
                    </div>
                  </li>
                )) : team.jugadores.map((j, i) => (
                  <li key={i} className="bg-secondary border border-accent/10 rounded-lg px-4 py-2.5 text-white/70 text-sm">
                    🏈 {j}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <div className="bg-secondary border border-accent/20 rounded-xl p-5">
            <h3 className="text-accent font-bold text-sm uppercase tracking-wide mb-4">Información</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-white/30 text-xs uppercase">Nombre</dt>
                <dd className="text-white font-medium mt-0.5">{team.nombre}</dd>
              </div>
              {team.ciudad && (
                <div>
                  <dt className="text-white/30 text-xs uppercase">Ciudad</dt>
                  <dd className="text-white font-medium mt-0.5">{team.ciudad}</dd>
                </div>
              )}
              {team.anioFundacion && (
                <div>
                  <dt className="text-white/30 text-xs uppercase">Fundación</dt>
                  <dd className="text-white font-medium mt-0.5">{team.anioFundacion}</dd>
                </div>
              )}
              {team.colores && (
                <div>
                  <dt className="text-white/30 text-xs uppercase">Colores</dt>
                  <dd className="text-white font-medium mt-0.5">{team.colores}</dd>
                </div>
              )}
              {roster.length > 0 && (
                <div>
                  <dt className="text-white/30 text-xs uppercase">Jugadores</dt>
                  <dd className="text-white font-medium mt-0.5">{roster.length}</dd>
                </div>
              )}
              {team.campeonatos?.length > 0 && (
                <div>
                  <dt className="text-white/30 text-xs uppercase">Campeonatos</dt>
                  <dd className="text-white font-medium mt-0.5">{team.campeonatos.join(', ')}</dd>
                </div>
              )}
            </dl>
          </div>

          <Link
            to="/contacto"
            className="block bg-accent text-white text-center font-bold py-3 rounded-xl hover:bg-accent-light transition shadow-lg shadow-accent/20"
          >
            Quiero unirme
          </Link>
        </div>
      </section>
    </div>
  );
}
