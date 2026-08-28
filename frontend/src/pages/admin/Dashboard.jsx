import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const sections = [
  { to: '/admin/dashboard', label: 'Resumen', icon: '🏠', end: true },
  { to: '/admin/dashboard/noticias', label: 'Noticias', icon: '📰' },
  { to: '/admin/dashboard/fixture', label: 'Fixture', icon: '📅' },
  { to: '/admin/dashboard/equipos', label: 'Equipos', icon: '🏟️' },
  { to: '/admin/dashboard/jugadores', label: 'Jugadores', icon: '👤' },
  { to: '/admin/dashboard/estadisticas', label: 'Estadísticas', icon: '📊' },
  { to: '/admin/dashboard/lideres', label: 'Líderes', icon: '🏆' },
  { to: '/admin/dashboard/eventos', label: 'Eventos y Fotos', icon: '📸' },
  { to: '/admin/dashboard/productos', label: 'Productos', icon: '👕' },
  { to: '/admin/dashboard/inscripciones', label: 'Inscripciones', icon: '✍️' },
  { to: '/admin/dashboard/paginas', label: 'Páginas', icon: '📄' },
];

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sidebar */}
      <aside className="bg-primary text-white w-full md:w-64 flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <span className="text-accent text-2xl">🏈</span>
            <span className="text-sm leading-tight">Panel Admin<br /><span className="font-normal text-white/60">Liga Football MDP</span></span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {sections.map(s => {
            const active = s.end
              ? location.pathname === s.to
              : location.pathname.startsWith(s.to);
            return (
              <Link
                key={s.to}
                to={s.to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition font-medium ${active ? 'bg-accent text-primary' : 'hover:bg-white/10'}`}
              >
                <span>{s.icon}</span>{s.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 mt-auto border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-red-500/20 text-red-300 transition"
          >
            <span>🚪</span> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
