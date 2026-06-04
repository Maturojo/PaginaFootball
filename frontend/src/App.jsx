import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingButtons from './components/FloatingButtons';
import PrivateRoute from './components/PrivateRoute';

import Inicio from './pages/Inicio';
import Historia from './pages/Historia';
import Equipos from './pages/Equipos';
import EquipoDetalle from './pages/EquipoDetalle';
import Estadisticas from './pages/Estadisticas';
import Fixture from './pages/Fixture';
import Jugadores from './pages/Jugadores';
import Noticias from './pages/Noticias';
import NoticiaDetalle from './pages/NoticiaDetalle';
import Eventos from './pages/Eventos';
import EventoDetalle from './pages/EventoDetalle';
import Tienda from './pages/Tienda';
import ProductoDetalle from './pages/ProductoDetalle';
import Contacto from './pages/Contacto';
import Inscripcion from './pages/Inscripcion';

import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import DashboardHome from './pages/admin/DashboardHome';
import AdminEquipos from './pages/admin/AdminEquipos';
import AdminFixture from './pages/admin/AdminFixture';
import AdminJugadores from './pages/admin/AdminJugadores';
import AdminNoticias from './pages/admin/AdminNoticias';
import AdminProductos from './pages/admin/AdminProductos';
import AdminPaginas from './pages/admin/AdminPaginas';
import AdminEstadisticas from './pages/admin/AdminEstadisticas';
import AdminEventos from './pages/admin/AdminEventos';
import AdminInscripciones from './pages/admin/AdminInscripciones';

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicLayout><Inicio /></PublicLayout>} />
          <Route path="/historia" element={<PublicLayout><Historia /></PublicLayout>} />
          <Route path="/equipos" element={<PublicLayout><Equipos /></PublicLayout>} />
          <Route path="/equipos/:id" element={<PublicLayout><EquipoDetalle /></PublicLayout>} />
          <Route path="/estadisticas" element={<PublicLayout><Estadisticas /></PublicLayout>} />
          <Route path="/fixture" element={<PublicLayout><Fixture /></PublicLayout>} />
          <Route path="/jugadores" element={<PublicLayout><Jugadores /></PublicLayout>} />
          <Route path="/noticias" element={<PublicLayout><Noticias /></PublicLayout>} />
          <Route path="/noticias/:id" element={<PublicLayout><NoticiaDetalle /></PublicLayout>} />
          <Route path="/eventos" element={<PublicLayout><Eventos /></PublicLayout>} />
          <Route path="/eventos/:id" element={<PublicLayout><EventoDetalle /></PublicLayout>} />
          <Route path="/tienda" element={<PublicLayout><Tienda /></PublicLayout>} />
          <Route path="/tienda/:id" element={<PublicLayout><ProductoDetalle /></PublicLayout>} />
          <Route path="/contacto" element={<PublicLayout><Contacto /></PublicLayout>} />
          <Route path="/inscripcion" element={<PublicLayout><Inscripcion /></PublicLayout>} />

          <Route path="/admin" element={<Login />} />
          <Route path="/admin/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="equipos" element={<AdminEquipos />} />
            <Route path="fixture" element={<AdminFixture />} />
            <Route path="jugadores" element={<AdminJugadores />} />
            <Route path="noticias" element={<AdminNoticias />} />
            <Route path="estadisticas" element={<AdminEstadisticas />} />
            <Route path="eventos" element={<AdminEventos />} />
            <Route path="productos" element={<AdminProductos />} />
            <Route path="paginas" element={<AdminPaginas />} />
            <Route path="inscripciones" element={<AdminInscripciones />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
