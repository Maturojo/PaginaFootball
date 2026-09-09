import { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { Sparkles, Compass, Bell, Bookmark, User, PlusCircle, Users, Flame } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import AuthModal from '../../components/AuthModal';

export default function CommunityLayout({ onOpenCreatePost }) {
  const { user, profile, isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: '/comunidad', label: 'Feed', icon: Sparkles, end: true },
    { to: '/comunidad/explorar', label: 'Explorar', icon: Compass },
    ...(isAuthenticated
      ? [
          { to: '/comunidad/notificaciones', label: 'Notificaciones', icon: Bell },
          { to: '/comunidad/guardados', label: 'Guardados', icon: Bookmark },
          { to: `/comunidad/perfil/${profile?.username || ''}`, label: 'Mi Perfil', icon: User },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-primary text-white pt-16">
      {/* Sub-header de Comunidad */}
      <div className="sticky top-[64px] z-30 border-b border-accent/20 bg-primary/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo de módulo */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 border border-accent/40 text-accent font-black text-sm">
                🏈
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-wide text-white block leading-none">
                  Comunidad MDP
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-accent block mt-0.5">
                  Red Social Oficial
                </span>
              </div>
            </div>

            {/* Pestañas de navegación interna */}
            <nav className="flex items-center gap-1 sm:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                        isActive
                          ? 'bg-accent text-white shadow-md shadow-accent/20'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon size={14} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </NavLink>
                );
              })}

              {!isAuthenticated && (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-accent/20 border border-accent/40 text-accent hover:bg-accent hover:text-white transition"
                >
                  <User size={13} />
                  <span>Ingresar</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        <Outlet context={{ onOpenAuth: () => setAuthModalOpen(true) }} />
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
