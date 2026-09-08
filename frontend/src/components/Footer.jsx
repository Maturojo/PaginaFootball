import { Link } from 'react-router-dom';

const navItems = [
  ['/', 'Inicio'],
  ['/historia', 'Liga'],
  ['/equipos', 'Equipos'],
  ['/fixture', 'Partidos'],
  ['/estadisticas', 'Posiciones'],
  ['/eventos', 'Eventos'],
  ['/contacto', 'Contacto'],
];

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-auto border-t border-accent/20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_0.8fr_0.9fr_0.9fr]">
        <div className="flex flex-col items-start gap-3">
          <img src="/logo.png" alt="Logo Liga de Football Americano Mar del Plata" className="h-16 w-16 object-contain" />
          <div>
            <p className="font-extrabold text-white">Fútbol Americano</p>
            <p className="text-accent font-semibold text-sm tracking-widest uppercase">Mar del Plata</p>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-white/52">
            Liga oficial de football americano de Mar del Plata. Competencia local, entrenamiento y comunidad deportiva.
          </p>
          <Link
            to="/inscripcion"
            className="mt-2 inline-flex min-h-10 items-center rounded-full bg-accent px-5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-accent-light"
          >
            Sumate a jugar
          </Link>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-accent uppercase tracking-wide text-sm">Navegación</h4>
          <ul className="space-y-2 text-sm text-white/60">
            {navItems.map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:text-accent transition">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-accent uppercase tracking-wide text-sm">Contacto</h4>
          <div className="space-y-2 text-sm text-white/60">
            <p>Mar del Plata, Buenos Aires</p>
            <a href="tel:+5492236661385" className="block hover:text-accent transition">+54 9 223 666-1385</a>
            <a href="mailto:contacto@ligafootballmdp.com" className="block hover:text-accent transition">contacto@ligafootballmdp.com</a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-accent uppercase tracking-wide text-sm">Más de la liga</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link to="/jugadores" className="hover:text-accent transition">Jugadores</Link></li>
            <li><Link to="/testimonios" className="hover:text-accent transition">Testimonios</Link></li>
            <li><Link to="/tienda" className="hover:text-accent transition">Tienda</Link></li>
            <li><Link to="/remeras" className="hover:text-accent transition">Diseñá tu remera</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 text-center py-3 text-xs text-white/30">
        © {new Date().getFullYear()} Liga Fútbol Americano MDP. Todos los derechos reservados.
        <span className="ml-4">
          <Link to="/admin" className="hover:text-accent transition">Admin</Link>
        </span>
      </div>
    </footer>
  );
}
