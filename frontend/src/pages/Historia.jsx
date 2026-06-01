import { useEffect, useState } from 'react';
import api from '../api';
import { API_URL } from '../config.js';

export default function Historia() {
  const [data, setData] = useState({ titulo: 'Nuestra Historia', texto: '', imagen: '' });

  useEffect(() => {
    api.get('/pages/historia').then(r => { if (r.data?.contenido) setData(r.data.contenido); });
  }, []);

  return (
    <div className="bg-primary text-white">
      <section className="bg-secondary border-b border-accent/20 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">{data.titulo}</h1>
        <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded" />
      </section>

      <section className="max-w-4xl mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {data.imagen && (
            <img
              src={data.imagen.startsWith('/') ? `${API_URL}${data.imagen}` : data.imagen}
              alt="Historia"
              className="rounded-xl shadow-2xl w-full object-cover border border-accent/20"
            />
          )}
          <div className={data.imagen ? '' : 'md:col-span-2'}>
            <div className="text-white/70 leading-relaxed whitespace-pre-line text-lg">
              {data.texto || <p className="text-white/30 italic">Contenido próximamente...</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary border-t border-accent/10 py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['2016', 'Fundación'], ['3+', 'Equipos'], ['100+', 'Jugadores'], ['8+', 'Temporadas']].map(([n, l]) => (
            <div key={l} className="bg-primary border border-accent/20 rounded-xl p-6">
              <p className="text-4xl font-extrabold text-accent">{n}</p>
              <p className="text-white/60 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
