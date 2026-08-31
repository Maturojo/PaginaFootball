import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/historia', label: 'Historia' },
  { to: '/fixture', label: 'Fixture' },
  { to: '/equipos', label: 'Equipos' },
  { to: '/jugadores', label: 'Jugadores' },
  { to: '/estadisticas', label: 'Estadísticas' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/tienda', label: 'Tienda' },
  { to: '/remeras', label: 'Remeras' },
  { to: '/inscripcion', label: '¡Sumate!' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-transparent bg-transparent text-white transition-all duration-300" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-18 py-2">
        <Link to="/" className="flex items-center gap-3 font-bold text-xl tracking-wide">
          <img src="/logo.png" alt="Logo Liga" className="h-12 w-12 object-contain" />
          <div className="leading-tight">
            <span className="block text-white font-extrabold tracking-wide">Fútbol Americano</span>
            <span className="block text-accent text-sm font-semibold tracking-widest uppercase">Mar del Plata</span>
          </div>
        </Link>

        {/* Desktop */}
        <ul className="hidden xl:flex gap-1">
          {links.map(l => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded transition font-medium ${isActive ? 'bg-accent text-white' : 'hover:bg-accent/20 text-gray-300 hover:text-white'}`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="xl:hidden p-2 rounded hover:bg-white/10">
          <span className="block w-6 h-0.5 bg-white mb-1.5" />
          <span className="block w-6 h-0.5 bg-white mb-1.5" />
          <span className="block w-6 h-0.5 bg-white" />
        </button>
      </div>

      {open && (
        <ul className="xl:hidden bg-primary border-t border-accent/20 px-4 pb-4">
          {links.map(l => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block py-2 px-3 rounded my-1 ${isActive ? 'bg-accent text-white font-bold' : 'hover:bg-accent/20 text-gray-300'}`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
