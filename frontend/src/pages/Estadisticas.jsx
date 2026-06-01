import { useEffect, useState } from 'react';
import api from '../api';

const COLS = ['Equipo', 'PJ', 'PG', 'PP', 'PF', 'PC', 'Pts'];

export default function Estadisticas() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activa, setActiva] = useState(0);

  useEffect(() => {
    api.get('/estadisticas').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-primary text-white">
      <section className="bg-secondary border-b border-accent/20 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">Estadísticas</h1>
        <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded" />
        <p className="text-white/50 mt-4 text-lg">Tablas de posiciones por temporada</p>
      </section>

      <section className="max-w-4xl mx-auto py-16 px-4">
        {loading && <p className="text-center text-white/40">Cargando estadísticas...</p>}
        {!loading && stats.length === 0 && (
          <p className="text-center text-white/40">No hay estadísticas cargadas aún.</p>
        )}

        {stats.length > 0 && (
          <>
            {/* Tabs por temporada/categoría */}
            <div className="flex flex-wrap gap-2 mb-8">
              {stats.map((s, i) => (
                <button
                  key={s._id}
                  onClick={() => setActiva(i)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                    activa === i
                      ? 'bg-accent text-white'
                      : 'bg-secondary border border-accent/20 text-white/60 hover:border-accent/50 hover:text-white'
                  }`}
                >
                  {s.temporada} — {s.categoria}
                </button>
              ))}
            </div>

            {/* Tabla activa */}
            {stats[activa] && (
              <div className="bg-secondary border border-accent/20 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-accent/10">
                  <h2 className="text-xl font-bold text-white">{stats[activa].temporada} · {stats[activa].categoria}</h2>
                  {stats[activa].descripcion && <p className="text-white/40 text-sm mt-1">{stats[activa].descripcion}</p>}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-accent/10">
                        <th className="text-left px-6 py-3 text-accent/70 font-semibold uppercase tracking-wide text-xs">Pos</th>
                        {COLS.map(c => (
                          <th key={c} className={`py-3 px-3 text-accent/70 font-semibold uppercase tracking-wide text-xs ${c === 'Equipo' ? 'text-left' : 'text-center'}`}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats[activa].tabla
                        .slice()
                        .sort((a, b) => b.Pts - a.Pts)
                        .map((fila, i) => (
                          <tr key={i} className={`border-b border-white/5 hover:bg-white/5 transition ${i === 0 ? 'bg-accent/5' : ''}`}>
                            <td className="px-6 py-3">
                              <span className={`font-bold ${i === 0 ? 'text-accent' : 'text-white/30'}`}>{i + 1}</span>
                            </td>
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
            )}
          </>
        )}
      </section>
    </div>
  );
}
