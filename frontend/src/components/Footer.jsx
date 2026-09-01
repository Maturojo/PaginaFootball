import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-auto border-t border-accent/20">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-start gap-3">
          <img src="/logo.png" alt="Logo" className="h-16 w-16 object-contain" />
          <div>
            <p className="font-extrabold text-white">Fútbol Americano</p>
            <p className="text-accent font-semibold text-sm tracking-widest uppercase">Mar del Plata</p>
          </div>
          <p className="text-white/50 text-sm">La liga oficial de Football Americano de Mar del Plata. Est. 2016</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-accent uppercase tracking-wide text-sm">Navegación</h4>
          <ul className="space-y-1 text-sm text-white/60">
            {['/', '/historia', '/equipos', '/estadisticas', '/eventos', '/tienda', '/remeras', '/contacto'].map((to, i) => (
              <li key={to}><Link to={to} className="hover:text-accent transition">{['Inicio','Historia','Equipos','Estadísticas','Eventos','Tienda','Remeras','Contacto'][i]}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-accent uppercase tracking-wide text-sm">Contacto</h4>
          <p className="text-sm text-white/60">Mar del Plata, Buenos Aires</p>
          <p className="text-sm text-white/60">+54 9 223 666-1385</p>
          <p className="text-sm text-white/60">contacto@ligafootballmdp.com</p>
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
