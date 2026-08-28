import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';
import { FALLBACK_PARTIDOS } from '../../data/stats.js';
import { fallbackDeleteMessage, isMongoId } from '../../utils/adminFallback.js';

const CATS = ['Liga Football Flag', 'Football Flag Femenino', 'Football Americano 7vs7'];
const EQUIPOS = ['Acorazados', 'Liebres', 'Krakens', 'Tridentes', 'Nereidas', 'Sirenas', 'Corales', 'Atlantes', 'Bárbaros', 'Templarios'];
const ESTADOS = ['programado', 'en_juego', 'finalizado', 'cancelado'];

function partidoKey(partido) {
  return [
    partido.jornada,
    partido.equipoLocal || partido.titulo,
    partido.equipoVisitante || '',
    partido.fecha,
  ].map(value => String(value || '').toLowerCase()).join('|');
}

function mergePartidos(apiPartidos = []) {
  const existing = new Set(apiPartidos.map(partidoKey));
  const missing = FALLBACK_PARTIDOS.filter(partido => !existing.has(partidoKey(partido)))
    .map(partido => ({ ...partido, __fallback: true }));
  return [...missing, ...apiPartidos];
}

function PartidoForm({ initial, onSave, onCancel }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: initial ? { ...initial, fecha: initial.fecha?.slice(0, 10) } : { estado: 'programado', categoria: CATS[0] }
  });
  const onSubmit = async (data) => { await onSave(data); reset(); };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-primary mb-4">{initial ? 'Editar partido' : 'Nuevo partido'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Jornada / Fecha</label>
          <input {...register('jornada')} className="input" placeholder="Jornada 1, Final, etc." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Categoría *</label>
          <select {...register('categoria')} className="input">{CATS.map(c => <option key={c}>{c}</option>)}</select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select {...register('estado')} className="input">{ESTADOS.map(e => <option key={e}>{e}</option>)}</select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Equipo Local *</label>
          <select {...register('equipoLocal', { required: true })} className="input">
            <option value="">Seleccionar...</option>
            {EQUIPOS.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Equipo Visitante *</label>
          <select {...register('equipoVisitante', { required: true })} className="input">
            <option value="">Seleccionar...</option>
            {EQUIPOS.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Lugar</label>
          <input {...register('lugar')} className="input" placeholder="Cancha Municipal" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fecha *</label>
          <input {...register('fecha', { required: true })} type="date" className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hora</label>
          <input {...register('hora')} className="input" placeholder="16:00" />
        </div>
        <div></div>
        <div>
          <label className="block text-sm font-medium mb-1">Puntos Local</label>
          <input {...register('golesLocal')} type="number" min="0" className="input" placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Puntos Visitante</label>
          <input {...register('golesVisitante')} type="number" min="0" className="input" placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">MVP del partido</label>
          <input {...register('mvp')} className="input" placeholder="Nombre del jugador" />
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition">{initial ? 'Guardar' : 'Crear partido'}</button>
        <button type="button" onClick={onCancel} className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition">Cancelar</button>
      </div>
    </form>
  );
}

export default function AdminFixture() {
  const [partidos, setPartidos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/partidos/all')
    .then(r => setPartidos(mergePartidos(r.data)))
    .catch(() => setPartidos(mergePartidos([])));
  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (editing && isMongoId(editing._id)) await api.put(`/partidos/${editing._id}`, data);
    else await api.post('/partidos', data);
    setShowForm(false); setEditing(null); load();
  };

  const handleDelete = async (id) => {
    if (!isMongoId(id)) {
      fallbackDeleteMessage();
      return;
    }
    if (!confirm('¿Eliminar este partido?')) return;
    await api.delete(`/partidos/${id}`); load();
  };

  const BADGE = { programado: 'bg-blue-100 text-blue-700', en_juego: 'bg-green-100 text-green-700', finalizado: 'bg-gray-100 text-gray-600', cancelado: 'bg-red-100 text-red-600' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Fixture y Resultados</h1>
        {!showForm && !editing && (
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-primary text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-900 transition">+ Nuevo partido</button>
        )}
      </div>
      {(showForm || editing) && <PartidoForm initial={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />}
      <div className="space-y-3">
        {partidos.length === 0 && <p className="text-gray-400 text-center py-8">No hay partidos cargados.</p>}
        {partidos.map(p => (
          <div key={p._id} className="bg-white rounded-xl shadow px-5 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm">{p.equipoLocal ? `${p.equipoLocal} vs ${p.equipoVisitante}` : p.titulo}</p>
              <p className="text-xs text-gray-500">{new Date(p.fecha).toLocaleDateString('es-AR')} · {p.categoria} · {p.jornada}</p>
              {p.estado === 'finalizado' && <p className="text-xs font-bold text-gray-700 mt-0.5">{p.golesLocal} - {p.golesVisitante}</p>}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${BADGE[p.estado]}`}>{p.estado}</span>
            {p.__fallback && <span className="text-xs px-2 py-1 rounded-full font-medium bg-amber-100 text-amber-700">Fijo</span>}
            <button onClick={() => { setEditing(p); setShowForm(false); }} className="text-blue-600 text-sm px-3 py-1 rounded hover:bg-blue-50">Editar</button>
            <button onClick={() => handleDelete(p._id)} className="text-red-500 text-sm px-3 py-1 rounded hover:bg-red-50">Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
