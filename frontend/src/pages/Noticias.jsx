import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

import { API_URL } from '../config.js';
function imgSrc(i) { return i?.startsWith('http') ? i : `${API_URL}${i}`; }

export default function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/noticias').then(r => setNoticias(r.data)).finally(() => setLoading(false));
  }, []);

  const destacadas = noticias.filter(n => n.destacada);
  const resto = noticias.filter(n => !n.destacada);

  return (
    <div className="bg-primary text-white">
      <section className="bg-secondary border-b border-accent/20 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold">Noticias</h1>
        <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded" />
        <p className="text-white/50 mt-4 text-lg">Novedades de la Liga Football MDP</p>
      </section>

      <section className="max-w-5xl mx-auto py-14 px-4">
        {loading && <p className="text-center text-white/40">Cargando noticias...</p>}
        {!loading && noticias.length === 0 && <p className="text-center text-white/40 py-10">No hay noticias publicadas aún.</p>}

        {/* Destacadas */}
        {destacadas.length > 0 && (
          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {destacadas.map(n => (
              <Link key={n._id} to={`/noticias/${n._id}`}
                className="relative rounded-2xl overflow-hidden group border border-accent/20 hover:border-accent/60 transition h-64">
                {n.imagen ? (
                  <img src={imgSrc(n.imagen)} alt={n.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : <div className="w-full h-full bg-secondary" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="bg-accent text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block">DESTACADA</span>
                  <h3 className="font-extrabold text-xl text-white leading-tight">{n.titulo}</h3>
                  <p className="text-white/60 text-xs mt-1">{new Date(n.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Resto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {resto.map(n => (
            <Link key={n._id} to={`/noticias/${n._id}`}
              className="bg-secondary border border-accent/20 rounded-xl overflow-hidden hover:border-accent/50 hover:-translate-y-1 transition-all group">
              <div className="h-44 bg-primary/50 overflow-hidden">
                {n.imagen ? <img src={imgSrc(n.imagen)} alt={n.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📰</div>}
              </div>
              <div className="p-4">
                <p className="text-accent text-xs mb-1">{new Date(n.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}</p>
                <h3 className="font-bold text-white group-hover:text-accent transition leading-tight">{n.titulo}</h3>
                <p className="text-white/40 text-sm mt-2 line-clamp-2">{n.contenido}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
