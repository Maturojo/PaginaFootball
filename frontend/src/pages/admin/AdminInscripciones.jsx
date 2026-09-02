import { useEffect, useState } from 'react';
import api from '../../api';

const ESTADOS = { pendiente: 'bg-yellow-100 text-yellow-700', contactado: 'bg-blue-100 text-blue-700', aceptado: 'bg-green-100 text-green-700', rechazado: 'bg-red-100 text-red-600' };

function whatsappNumber(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('54')) return digits;
  if (digits.startsWith('9') && digits.length >= 11) return `54${digits}`;
  if (digits.length >= 10) return `549${digits.replace(/^0+/, '')}`;
  return digits;
}

function whatsappLink(inscripcion) {
  const phone = whatsappNumber(inscripcion.telefono);
  const message = encodeURIComponent(
    `Hola ${inscripcion.nombre || ''}, ¿cómo estás? Te escribimos de la Liga de Football Americano Mar del Plata por tu inscripción.`
  );
  return phone ? `https://wa.me/${phone}?text=${message}` : '';
}

export default function AdminInscripciones() {
  const [insc, setInsc] = useState([]);
  const load = () => api.get('/inscripciones/all').then(r => setInsc(r.data));
  useEffect(() => { load(); }, []);

  const cambiarEstado = async (id, estado) => {
    await api.put(`/inscripciones/${id}`, { estado }); load();
  };
  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta inscripción?')) return;
    await api.delete(`/inscripciones/${id}`); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Inscripciones</h1>
        <span className="bg-accent/10 text-accent font-bold px-4 py-1.5 rounded-full text-sm">{insc.filter(i => i.estado === 'pendiente').length} pendientes</span>
      </div>
      {insc.length === 0 && <p className="text-gray-400 text-center py-8">No hay inscripciones aún.</p>}
      <div className="space-y-3">
        {insc.map(i => (
          <div key={i._id} className="bg-white rounded-xl shadow p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800">{i.nombre} <span className="text-gray-400 font-normal text-sm">· {i.edad} años</span></p>
                <p className="text-sm text-gray-600 mt-0.5">📱 {i.telefono} · ✉️ {i.email}</p>
                <p className="text-sm text-gray-500 mt-1">Posición: {i.posicion} · Equipo: {i.equipoPreferido}</p>
                {i.experiencia && <p className="text-sm text-gray-500">Experiencia: {i.experiencia}</p>}
                {i.mensaje && <p className="text-sm text-gray-400 mt-1 italic">"{i.mensaje}"</p>}
                <p className="text-xs text-gray-300 mt-2">{new Date(i.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${ESTADOS[i.estado]}`}>{i.estado}</span>
                <select value={i.estado} onChange={e => cambiarEstado(i._id, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400">
                  <option value="pendiente">Pendiente</option>
                  <option value="contactado">Contactado</option>
                  <option value="aceptado">Aceptado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
                {whatsappLink(i) && (
                  <a
                    href={whatsappLink(i)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-600"
                  >
                    WhatsApp
                  </a>
                )}
                <button onClick={() => handleDelete(i._id)} className="text-red-400 text-xs hover:text-red-600">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
