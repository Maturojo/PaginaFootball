import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Bookmark, Bell, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import AuthModal from './AuthModal';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/historia', label: 'Liga' },
  { to: '/equipos', label: 'Equipos' },
  { to: '/fixture', label: 'Partidos' },
  { to: '/estadisticas', label: 'Posiciones' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/jugadores', label: 'Jugadores' },
  { to: '/comunidad', label: 'Comunidad', isCommunity: true },
  { to: '/tienda', label: 'Tienda' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, profile, isAuthenticated, isAdmin, logout } = useAuth();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 border-b transition-all duration-300 ${
          scrolled || open
            ? 'bg-primary/96 text-white shadow-lg shadow-black/20 backdrop-blur border-accent/20'
            : 'bg-transparent text-white border-transparent'
        }`}
        style={!scrolled && !open ? { textShadow: '0 1px 4px rgba(0,0,0,0.8)' } : {}}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-[64px] py-2">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3 font-bold text-xl tracking-wide"
            onClick={() => setOpen(false)}
          >
            <img src="/logo.png" alt="Logo Liga" className="h-10 w-10 object-contain" />
            <div className="min-w-0 leading-tight">
              <span className="block text-sm font-extrabold tracking-wide text-white lg:text-base">
                Fútbol Americano
              </span>
              <span className="block text-[11px] font-semibold uppercase tracking-widest text-accent">
                Mar del Plata
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-1.5">
            <ul className="flex gap-0.5 items-center">
              {links.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) =>
                      `relative whitespace-nowrap px-2.5 py-2 text-[12px] font-bold uppercase tracking-wide transition 2xl:px-3 2xl:text-sm flex items-center gap-1.5 ${
                        isActive
                          ? 'text-accent-light'
                          : 'hover:text-white text-white/68'
                      } ${
                        l.isCommunity
                          ? 'bg-accent/15 text-accent border border-accent/30 rounded-full px-3 py-1 font-extrabold hover:bg-accent hover:text-white'
                          : ''
                      }`
                    }
                  >
                    {l.isCommunity && <Sparkles size={13} className="text-yellow-400" />}
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <Link
              to="/inscripcion"
              className="ml-1 inline-flex min-h-9 items-center justify-center rounded-full bg-accent px-3.5 text-[11px] font-extrabold uppercase tracking-wide text-white transition hover:bg-accent-light focus:outline-none 2xl:px-4 2xl:text-xs"
            >
              Sumate
            </Link>

            {/* Auth / User Control Desktop */}
            <div className="relative ml-2" ref={dropdownRef}>
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 rounded-full border border-accent/40 bg-secondary/80 p-1 pl-2 pr-3 text-xs font-bold text-white hover:border-accent transition"
                  >
                    {profile?.avatar ? (
                      <img
                        src={profile.avatar}
                        alt=""
                        className="h-7 w-7 rounded-full object-cover border border-accent/40"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-accent font-bold">
                        {profile?.username ? profile.username[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="max-w-[100px] truncate text-accent-light">
                      @{profile?.username || 'perfil'}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-secondary border border-accent/30 p-2 shadow-2xl z-50 animate-fadeIn">
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <p className="text-xs font-semibold text-white/40">Conectado como</p>
                        <p className="text-sm font-bold text-white truncate">
                          {profile?.displayName || user?.email}
                        </p>
                        <p className="text-xs text-accent truncate">@{profile?.username}</p>
                      </div>

                      <Link
                        to={`/comunidad/perfil/${profile?.username}`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
                      >
                        <User size={15} className="text-accent" />
                        Mi Perfil Social
                      </Link>

                      <Link
                        to="/comunidad/notificaciones"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
                      >
                        <Bell size={15} className="text-accent" />
                        Notificaciones
                      </Link>

                      <Link
                        to="/comunidad/guardados"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
                      >
                        <Bookmark size={15} className="text-accent" />
                        Guardados
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-yellow-400 hover:bg-yellow-400/10 transition"
                        >
                          <Shield size={15} />
                          Panel Admin
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          navigate('/');
                        }}
                        className="w-full mt-1 border-t border-white/10 flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
                      >
                        <LogOut size={15} />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3.5 text-[11px] font-extrabold uppercase tracking-wide text-white transition hover:bg-white/15 hover:border-white/40 2xl:px-4 2xl:text-xs"
                >
                  <User size={14} />
                  Ingresar
                </button>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <div className="xl:hidden flex items-center gap-2">
            {!isAuthenticated && (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex h-9 items-center justify-center rounded-full bg-accent/20 border border-accent/40 px-3 text-xs font-bold text-accent"
              >
                Ingresar
              </button>
            )}

            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-light"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={open}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="xl:hidden border-t border-accent/20 bg-primary px-4 pb-6 pt-3 shadow-2xl shadow-black/30">
            {isAuthenticated && (
              <div className="mb-4 flex items-center justify-between rounded-xl bg-secondary/80 border border-accent/20 p-3">
                <div className="flex items-center gap-3">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent font-bold">
                      {profile?.username ? profile.username[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-white">{profile?.displayName || user?.email}</p>
                    <p className="text-xs text-accent">@{profile?.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}

            <ul className="grid gap-1">
              {links.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between min-h-11 px-3 py-2.5 text-sm font-extrabold uppercase tracking-wide transition rounded-lg ${
                        isActive
                          ? 'bg-accent text-white'
                          : 'text-white/72 hover:bg-white/10 hover:text-white'
                      } ${l.isCommunity ? 'border border-accent/40 bg-accent/10 text-accent' : ''}`
                    }
                  >
                    <span>{l.label}</span>
                    {l.isCommunity && <Sparkles size={15} className="text-yellow-400" />}
                  </NavLink>
                </li>
              ))}

              {isAuthenticated && (
                <>
                  <li>
                    <Link
                      to={`/comunidad/perfil/${profile?.username}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 min-h-11 px-3 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white/72 hover:bg-white/10 hover:text-white rounded-lg"
                    >
                      <User size={18} className="text-accent" />
                      Mi Perfil Social
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/comunidad/guardados"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 min-h-11 px-3 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white/72 hover:bg-white/10 hover:text-white rounded-lg"
                    >
                      <Bookmark size={18} className="text-accent" />
                      Guardados
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 min-h-11 px-3 py-2.5 text-sm font-extrabold uppercase tracking-wide text-yellow-400 hover:bg-yellow-400/10 rounded-lg"
                      >
                        <Shield size={18} />
                        Panel Administrador
                      </Link>
                    </li>
                  )}
                </>
              )}
            </ul>

            <Link
              to="/inscripcion"
              onClick={() => setOpen(false)}
              className="mt-4 flex min-h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-accent-light"
            >
              Sumate a jugar
            </Link>
          </div>
        )}
      </nav>

      {/* Modal de autenticación */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
