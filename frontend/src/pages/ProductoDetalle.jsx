import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { API_URL } from '../config.js';

function buildWhatsAppLink(product) {
  const phone = product.whatsapp || '5492235000000';
  const msg = encodeURIComponent(`Hola! Me interesa el producto: ${product.nombre} ($${product.precio})`);
  return `https://wa.me/${phone}?text=${msg}`;
}

export default function ProductoDetalle() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/${id}`).then(r => setProduct(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="bg-primary text-white min-h-screen pt-16 flex items-center justify-center">
      <p className="text-white/40">Cargando...</p>
    </div>
  );

  if (!product) return (
    <div className="bg-primary text-white min-h-screen pt-16 flex flex-col items-center justify-center gap-4">
      <p className="text-white/40 text-xl">Producto no encontrado</p>
      <Link to="/tienda" className="text-accent hover:underline">← Volver a la tienda</Link>
    </div>
  );

  const imagenSrc = product.imagen
    ? product.imagen.startsWith('/') ? `${API_URL}${product.imagen}` : product.imagen
    : null;

  return (
    <div className="bg-primary text-white min-h-screen pt-16">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/40 mb-8">
          <Link to="/tienda" className="hover:text-accent transition">Tienda</Link>
          <span>/</span>
          <span className="text-white/70">{product.nombre}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Imagen */}
          <div className="bg-secondary border border-accent/20 rounded-2xl overflow-hidden flex items-center justify-center aspect-square">
            {imagenSrc ? (
              <img src={imagenSrc} alt={product.nombre} className="w-full h-full object-cover" />
            ) : (
              <span className="text-9xl opacity-20">🏈</span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <span className="text-xs text-accent/70 uppercase tracking-widest font-semibold mb-2">{product.categoria}</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{product.nombre}</h1>

            {product.descripcion && (
              <p className="text-white/60 text-base leading-relaxed mb-6">{product.descripcion}</p>
            )}

            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-extrabold text-accent">${product.precio.toLocaleString('es-AR')}</span>
              {product.stock === 0 ? (
                <span className="bg-red-500/20 text-red-400 text-sm font-bold px-3 py-1 rounded-full">Sin stock</span>
              ) : product.stock <= 5 ? (
                <span className="bg-orange-500/20 text-orange-400 text-sm font-bold px-3 py-1 rounded-full">¡Últimas {product.stock} unidades!</span>
              ) : (
                <span className="bg-green-500/20 text-green-400 text-sm font-bold px-3 py-1 rounded-full">En stock</span>
              )}
            </div>

            <a
              href={buildWhatsAppLink(product)}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-bold text-lg transition-all ${
                product.stock === 0
                  ? 'bg-white/10 text-white/30 pointer-events-none'
                  : 'bg-green-600 hover:bg-green-500 text-white hover:scale-105 shadow-lg shadow-green-900/30'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Comprar por WhatsApp
            </a>

            <Link to="/tienda" className="mt-4 text-center text-white/30 hover:text-accent text-sm transition">
              ← Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
