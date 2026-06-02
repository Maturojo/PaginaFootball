import { useEffect, useState } from 'react';
import api from '../api';

import { API_URL } from '../config.js';

function buildWhatsAppLink(product) {
  const phone = product.whatsapp || '5492235000000';
  const msg = encodeURIComponent(`Hola! Me interesa el producto: ${product.nombre} ($${product.precio})`);
  return `https://wa.me/${phone}?text=${msg}`;
}

export default function Tienda() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState('Todos');

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data)).finally(() => setLoading(false));
  }, []);

  const categorias = ['Todos', ...new Set(products.map(p => p.categoria).filter(Boolean))];
  const filtered = categoria === 'Todos' ? products : products.filter(p => p.categoria === categoria);

  return (
    <div className="bg-primary text-white pt-16">
      <section className="bg-secondary border-b border-accent/20 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">Tienda Oficial</h1>
        <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded" />
        <p className="text-white/50 mt-4 text-lg">Merchandise y equipamiento oficial de la Liga</p>
      </section>

      <section className="max-w-6xl mx-auto py-16 px-4">
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categorias.map(c => (
            <button
              key={c}
              onClick={() => setCategoria(c)}
              className={`px-5 py-2 rounded-full font-medium transition ${
                categoria === c
                  ? 'bg-accent text-white'
                  : 'bg-secondary border border-accent/20 hover:border-accent/60 text-white/60 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading && <p className="text-center text-white/40">Cargando productos...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-white/40">No hay productos disponibles.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(product => (
            <div key={product._id} className="bg-secondary border border-accent/20 rounded-xl hover:border-accent/50 transition-all flex flex-col">
              <div className="bg-primary/50 rounded-t-xl h-48 flex items-center justify-center overflow-hidden">
                {product.imagen ? (
                  <img
                    src={product.imagen.startsWith('/') ? `${API_URL}${product.imagen}` : product.imagen}
                    alt={product.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">🏈</span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-xs text-accent/60 uppercase tracking-wide">{product.categoria}</span>
                <h3 className="font-bold text-white mt-1">{product.nombre}</h3>
                {product.descripcion && <p className="text-sm text-white/40 mt-1 flex-1">{product.descripcion}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-accent">${product.precio.toLocaleString('es-AR')}</span>
                  {product.stock === 0 && <span className="text-xs text-red-400 font-medium">Sin stock</span>}
                </div>
                <a
                  href={buildWhatsAppLink(product)}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold transition text-white ${
                    product.stock === 0 ? 'bg-white/10 pointer-events-none text-white/30' : 'bg-green-600 hover:bg-green-500'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Comprar por WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
