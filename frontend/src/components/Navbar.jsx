import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/historia', label: 'Liga' },
  { to: '/equipos', label: 'Equipos' },
  { to: '/fixture', label: 'Partidos' },
  { to: '/estadisticas', label: 'Posiciones' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/jugadores', label: 'Jugadores' },
  { to: '/tienda', label: 'Tienda' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${scrolled || open ? 'bg-primary/96 text-white shadow-lg shadow-black/20 backdrop-blur border-accent/20' : 'bg-transparent text-white border-transparent'}`} style={!scrolled && !open ? { textShadow: '0 1px 4px rgba(0,0,0,0.8)' } : {}}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-[64px] py-2">
        <Link to="/" className="flex min-w-0 items-center gap-3 font-bold text-xl tracking-wide" onClick={() => setOpen(false)}>
          <img src="/logo.png" alt="Logo Liga" className="h-10 w-10 object-contain" />
          <div className="min-w-0 leading-tight">
            <span className="block text-sm font-extrabold tracking-wide text-white lg:text-base">Fútbol Americano</span>
            <span className="block text-[11px] font-semibold uppercase tracking-widest text-accent">Mar del Plata</span>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden xl:flex items-center gap-1.5">
          <ul className="flex gap-0.5">
          {links.map(l => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `whitespace-nowrap px-2.5 py-2 text-[12px] font-bold uppercase tracking-wide transition 2xl:px-3 2xl:text-sm ${isActive ? 'text-accent-light' : 'hover:text-white text-white/68'}`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
          </ul>
          <Link
            to="/inscripcion"
            className="ml-2 inline-flex min-h-10 items-center justify-center rounded-full bg-accent px-4 text-[12px] font-extrabold uppercase tracking-wide text-white transition hover:bg-accent-light focus:outline-none focus-visible:ring-2 focus-visible:ring-white 2xl:px-5 2xl:text-sm"
          >
            Sumate a jugar
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="xl:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-light"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="xl:hidden border-t border-accent/20 bg-primary px-4 pb-5 pt-2 shadow-2xl shadow-black/30">
          <ul className="grid gap-1">
            {links.map(l => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block min-h-11 px-3 py-3 text-sm font-extrabold uppercase tracking-wide transition ${isActive ? 'bg-accent text-white' : 'text-white/72 hover:bg-white/10 hover:text-white'}`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link
            to="/inscripcion"
            onClick={() => setOpen(false)}
            className="mt-3 flex min-h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-accent-light"
          >
            Sumate a jugar
          </Link>
        </div>
      )}
    </nav>
  );
}
