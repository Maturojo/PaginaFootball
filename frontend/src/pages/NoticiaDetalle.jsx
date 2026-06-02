import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

import { API_URL } from '../config.js';
function imgSrc(i) { return i?.startsWith('http') ? i : `${API_URL}${i}`; }

export default function NoticiaDetalle() {
  const { id } = useParams();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/noticias/${id}`).then(r => setNoticia(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="bg-primary min-h-screen flex items-center justify-center"><p className="text-white/40">Cargando...</p></div>;
  if (!noticia) return <div className="bg-primary min-h-screen flex items-center justify-center"><p className="text-white/40">Noticia no encontrada</p></div>;

  return (
    <div className="bg-primary text-white min-h-screen pt-16">
      {noticia.imagen && (
        <div className="w-full h-72 md:h-96 overflow-hidden relative">
          <img src={imgSrc(noticia.imagen)} alt={noticia.titulo} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent" />
        </div>
      )}
      <article className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/noticias" className="text-accent/60 hover:text-accent text-sm transition mb-6 inline-block">← Todas las noticias</Link>
        <p className="text-accent text-sm font-semibold uppercase tracking-wide mb-3">
          {new Date(noticia.createdAt).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {noticia.autor}
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-8">{noticia.titulo}</h1>
        <div className="text-white/70 leading-relaxed text-lg whitespace-pre-line">{noticia.contenido}</div>
      </article>
    </div>
  );
}
