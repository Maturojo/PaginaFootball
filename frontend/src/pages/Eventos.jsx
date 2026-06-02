import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

import { API_URL } from '../config.js';

function fotoSrc(f) {
  return f.startsWith('http') ? f : `${API_URL}${f}`;
}

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/eventos').then(r => setEventos(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-primary text-white pt-16">
      <section className="bg-secondary border-b border-accent/20 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">Eventos y Fotos</h1>
        <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded" />
        <p className="text-white/50 mt-4 text-lg">Revivé los momentos de la liga</p>
      </section>

      <section className="max-w-6xl mx-auto py-16 px-4">
        {loading && <p className="text-center text-white/40">Cargando eventos...</p>}
        {!loading && eventos.length === 0 && (
          <p className="text-center text-white/40">No hay eventos publicados aún.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map(evento => (
            <Link
              key={evento._id}
              to={`/eventos/${evento._id}`}
              className="bg-secondary border border-accent/20 rounded-xl overflow-hidden hover:border-accent/60 hover:-translate-y-1 transition-all group"
            >
              {/* Foto de portada */}
              <div className="h-52 bg-primary/50 overflow-hidden relative">
                {evento.fotos?.length > 0 ? (
                  <>
                    <img
                      src={fotoSrc(evento.fotos[0])}
                      alt={evento.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {evento.fotos.length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        +{evento.fotos.length - 1} fotos
                      </span>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl opacity-30">📸</span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <p className="text-accent text-xs font-semibold uppercase tracking-wide mb-1">
                  {new Date(evento.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h3 className="font-bold text-lg text-white group-hover:text-accent transition">{evento.titulo}</h3>
                {evento.lugar && <p className="text-white/40 text-sm mt-1">📍 {evento.lugar}</p>}
                {evento.descripcion && (
                  <p className="text-white/50 text-sm mt-2 line-clamp-2">{evento.descripcion}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
