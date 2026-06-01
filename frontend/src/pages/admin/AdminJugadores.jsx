import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';

import { API_URL } from '../../config.js';
const EQUIPOS = ['Acorazados', 'Liebres', 'Krakens', 'Tridentes', 'Nereidas', 'Atlantes'];
const POSICIONES = ['Quarterback', 'Wide Receiver', 'Running Back', 'Lineman', 'Linebacker', 'Cornerback', 'Safety', 'Otra'];

function JugadorForm({ initial, onSave, onCancel }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: initial?.stats ? { ...initial, ...initial.stats } : initial || {} });
  const onSubmit = async (data) => {
    const form = new FormData();
    const stats = { touchdowns: data.touchdowns || 0, intercepciones: data.intercepciones || 0, yardas: data.yardas || 0, partidos: data.partidos || 0 };
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'foto') { if (v?.[0]) form.append('foto', v[0]); }
      else if (!['touchdowns', 'intercepciones', 'yardas', 'partidos'].includes(k)) form.append(k, v);
    });
    form.append('stats', JSON.stringify(stats));
    await onSave(form); reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-primary mb-4">{initial ? 'Editar jugador' : 'Nuevo jugador'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium mb-1">Nombre *</label><input {...register('nombre', { required: true })} className="input" /></div>
        <div><label className="block text-sm font-medium mb-1">Número</label><input {...register('numero')} type="number" className="input" /></div>
        <div><label className="block text-sm font-medium mb-1">Posición</label><select {...register('posicion')} className="input">{POSICIONES.map(p => <option key={p}>{p}</option>)}</select></div>
        <div><label className="block text-sm font-medium mb-1">Equipo *</label><select {...register('equipo', { required: true })} className="input"><option value="">Seleccionar...</option>{EQUIPOS.map(e => <option key={e}>{e}</option>)}</select></div>
        <div><label className="block text-sm font-medium mb-1">Foto</label><input {...register('foto')} type="file" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white" /></div>
        <div className="flex items-center gap-2 mt-5"><input {...register('esMVP')} type="checkbox" id="esMVP" className="w-4 h-4" /><label htmlFor="esMVP" className="text-sm font-medium">Marcar como MVP ⭐</label></div>
        <div className="md:col-span-3"><label className="block text-sm font-medium mb-1">Bio</label><textarea {...register('bio')} className="input resize-none" rows={2} placeholder="Breve descripción del jugador..." /></div>
        <div><label className="block text-sm font-medium mb-1">Partidos jugados</label><input {...register('partidos')} type="number" min="0" className="input" defaultValue={0} /></div>
        <div><label className="block text-sm font-medium mb-1">Touchdowns</label><input {...register('touchdowns')} type="number" min="0" className="input" defaultValue={0} /></div>
        <div><label className="block text-sm font-medium mb-1">Intercepciones</label><input {...register('intercepciones')} type="number" min="0" className="input" defaultValue={0} /></div>
      </div>
      <div className="flex gap-3 mt-5">
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition">{initial ? 'Guardar' : 'Crear jugador'}</button>
        <button type="button" onClick={onCancel} className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition">Cancelar</button>
      </div>
    </form>
  );
}

export default function AdminJugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/jugadores/all').then(r => setJugadores(r.data));
  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (editing) await api.put(`/jugadores/${editing._id}`, form);
    else await api.post('/jugadores', form);
    setShowForm(false); setEditing(null); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este jugador?')) return;
    await api.delete(`/jugadores/${id}`); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Jugadores</h1>
        {!showForm && !editing && <button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-primary text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-900 transition">+ Nuevo jugador</button>}
      </div>
      {(showForm || editing) && <JugadorForm initial={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />}
      <div className="space-y-3">
        {jugadores.length === 0 && <p className="text-gray-400 text-center py-8">No hay jugadores cargados.</p>}
        {jugadores.map(j => (
          <div key={j._id} className="bg-white rounded-xl shadow px-5 py-3 flex items-center gap-3">
            {j.foto ? <img src={j.foto.startsWith('/') ? `${API_URL}${j.foto}` : j.foto} alt={j.nombre} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              : <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">👤</div>}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm">{j.esMVP && '⭐ '}{j.nombre} {j.numero && <span className="text-gray-400">#{j.numero}</span>}</p>
              <p className="text-xs text-gray-500">{j.equipo} · {j.posicion}</p>
            </div>
            <button onClick={() => { setEditing(j); setShowForm(false); }} className="text-blue-600 text-sm px-3 py-1 rounded hover:bg-blue-50">Editar</button>
            <button onClick={() => handleDelete(j._id)} className="text-red-500 text-sm px-3 py-1 rounded hover:bg-red-50">Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
