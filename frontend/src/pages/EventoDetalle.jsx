import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

import { API_URL } from '../config.js';

function fotoSrc(f) {
  return f.startsWith('http') ? f : `${API_URL}${f}`;
}

export default function EventoDetalle() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);
  const [fotoIdx, setFotoIdx] = useState(0);

  useEffect(() => {
    api.get(`/eventos/${id}`).then(r => setEvento(r.data)).finally(() => setLoading(false));
  }, [id]);

  const abrirFoto = (idx) => { setFotoIdx(idx); setFotoAmpliada(evento.fotos[idx]); };
  const anterior = () => { const i = (fotoIdx - 1 + evento.fotos.length) % evento.fotos.length; setFotoIdx(i); setFotoAmpliada(evento.fotos[i]); };
  const siguiente = () => { const i = (fotoIdx + 1) % evento.fotos.length; setFotoIdx(i); setFotoAmpliada(evento.fotos[i]); };

  if (loading) return <div className="bg-primary min-h-screen flex items-center justify-center"><p className="text-white/40">Cargando...</p></div>;
  if (!evento) return <div className="bg-primary min-h-screen flex items-center justify-center"><p className="text-white/40">Evento no encontrado</p></div>;

  return (
    <div className="bg-primary text-white min-h-screen">
      {/* Hero */}
      <section className="bg-secondary border-b border-accent/20 py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/eventos" className="text-accent/60 hover:text-accent text-sm transition mb-4 inline-block">
            ← Todos los eventos
          </Link>
          <p className="text-accent text-sm font-semibold uppercase tracking-wide mb-2">
            {new Date(evento.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">{evento.titulo}</h1>
          {evento.lugar && <p className="text-white/50 mt-2">📍 {evento.lugar}</p>}
          {evento.descripcion && <p className="text-white/60 mt-4 leading-relaxed">{evento.descripcion}</p>}
        </div>
      </section>

      {/* Galería */}
      {evento.fotos?.length > 0 && (
        <section className="max-w-6xl mx-auto py-12 px-4">
          <h2 className="text-xl font-bold text-white mb-6">
            Fotos <span className="text-accent ml-2 text-base font-normal">({evento.fotos.length})</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {evento.fotos.map((foto, i) => (
              <button
                key={i}
                onClick={() => abrirFoto(i)}
                className="aspect-square overflow-hidden rounded-lg bg-secondary hover:opacity-80 transition"
              >
                <img src={fotoSrc(foto)} alt={`Foto ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {fotoAmpliada && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setFotoAmpliada(null)}>
          <button onClick={e => { e.stopPropagation(); anterior(); }} className="absolute left-4 text-white text-4xl hover:text-accent transition px-4 py-2">‹</button>
          <img
            src={fotoSrc(fotoAmpliada)}
            alt="Foto ampliada"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button onClick={e => { e.stopPropagation(); siguiente(); }} className="absolute right-4 text-white text-4xl hover:text-accent transition px-4 py-2">›</button>
          <button onClick={() => setFotoAmpliada(null)} className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl">✕</button>
          <p className="absolute bottom-4 text-white/40 text-sm">{fotoIdx + 1} / {evento.fotos.length}</p>
        </div>
      )}
    </div>
  );
}
