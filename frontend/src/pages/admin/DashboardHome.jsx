import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function DashboardHome() {
  const [stats, setStats] = useState({ teams: 0, products: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/teams/all').catch(() => ({ data: [] })),
      api.get('/products/all').catch(() => ({ data: [] })),
    ]).then(([t, p]) => setStats({ teams: t.data.length, products: p.data.length }));
  }, []);

  const cards = [
    { to: '/admin/dashboard/equipos', icon: '🏟️', label: 'Equipos', count: stats.teams, color: 'bg-blue-50 border-blue-200' },
    { to: '/admin/dashboard/productos', icon: '👕', label: 'Productos', count: stats.products, color: 'bg-yellow-50 border-yellow-200' },
    { to: '/admin/dashboard/paginas', icon: '📄', label: 'Páginas', count: 3, color: 'bg-green-50 border-green-200' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Bienvenido al panel</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map(c => (
          <Link key={c.to} to={c.to} className={`border rounded-xl p-6 ${c.color} hover:shadow transition`}>
            <p className="text-3xl">{c.icon}</p>
            <p className="text-3xl font-extrabold text-primary mt-2">{c.count}</p>
            <p className="text-gray-600 font-medium">{c.label}</p>
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-bold text-lg text-primary mb-3">Accesos rápidos</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/dashboard/equipos" className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition">+ Agregar equipo</Link>
          <Link to="/admin/dashboard/productos" className="bg-accent text-primary px-5 py-2 rounded-lg text-sm font-medium hover:bg-yellow-400 transition">+ Agregar producto</Link>
          <Link to="/" target="_blank" className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Ver sitio web ↗</Link>
        </div>
      </div>
    </div>
  );
}
