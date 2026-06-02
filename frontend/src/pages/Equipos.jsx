import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

import { API_URL } from '../config.js';

export function slugify(str) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');
}

function logoSrc(logo) {
  if (!logo) return null;
  return logo.startsWith('http') ? logo : `${API_URL}${logo}`;
}

const CATEGORIAS = [
  { key: 'Liga Football Flag', icon: '🏈', descripcion: 'Equipos de la liga de football flag de Mar del Plata' },
  { key: 'Football Flag Femenino', icon: '⚡', descripcion: 'Equipo femenino de football flag' },
  { key: 'Football Americano 7vs7', icon: '🏟️', descripcion: 'Equipos de football americano 7vs7' },
];

function TeamCard({ team }) {
  return (
    <Link
      to={`/equipos/${slugify(team.nombre)}`}
      state={{ team }}
      className="bg-secondary border border-accent/20 rounded-xl overflow-hidden hover:border-accent/60 hover:-translate-y-1 transition-all flex flex-col items-center group relative"
    >
      <div className="p-6 flex flex-col items-center w-full">
        {team.logo ? (
          <img src={logoSrc(team.logo)} alt={team.nombre} className="w-44 h-44 object-contain" />
        ) : (
          <div className="w-44 h-44 bg-accent/10 rounded-full flex items-center justify-center">
            <span className="text-7xl">🏈</span>
          </div>
        )}
      </div>

      {/* Barra azul que sube desde abajo en hover */}
      <div className="w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-accent py-3 text-center">
        <span className="text-white text-sm font-bold tracking-wide">Ver equipo →</span>
      </div>
    </Link>
  );
}

export default function Equipos() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teams').then(r => setTeams(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-primary text-white pt-16">
      <section className="bg-secondary border-b border-accent/20 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">Equipos</h1>
        <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded" />
        <p className="text-white/50 mt-4 text-lg">Conocé a todos los equipos de la Liga Football MDP</p>
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
                      {seleccion.map(team => <TeamCard key={team._id} team={team} />)}
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
                      {resto.map(team => <TeamCard key={team._id} team={team} />)}
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
                {equipos.map(team => <TeamCard key={team._id} team={team} />)}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
