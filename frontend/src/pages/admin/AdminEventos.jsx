import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';

import { API_URL } from '../../config.js';

function fotoSrc(f) { return f.startsWith('http') ? f : `${API_URL}${f}`; }

function EventoForm({ initial, onSave, onCancel }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: initial ? { ...initial, fecha: initial.fecha?.slice(0, 10) } : {}
  });

  const onSubmit = async (data) => {
    try {
      const form = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (k === 'fotos') { if (v?.[0]) Array.from(v).forEach(f => form.append('fotos', f)); }
        else if (v !== undefined && v !== null) form.append(k, v);
      });
      await onSave(form);
      reset();
    } catch (err) {
      console.error('Error al guardar evento:', err);
      alert('Error al guardar: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-primary mb-4">{initial ? 'Editar evento' : 'Nuevo evento'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título *</label>
          <input {...register('titulo', { required: true })} className="input" placeholder="Final del Torneo Apertura" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fecha *</label>
          <input {...register('fecha', { required: true })} type="date" className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Lugar</label>
          <input {...register('lugar')} className="input" placeholder="Cancha Municipal, MDP" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fotos (podés seleccionar varias)</label>
          <input {...register('fotos')} type="file" accept="image/*" multiple
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea {...register('descripcion')} className="input resize-none" rows={3} placeholder="Descripción del evento..." />
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition">
          {initial ? 'Guardar cambios' : 'Crear evento'}
        </button>
        <button type="button" onClick={onCancel} className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition">Cancelar</button>
      </div>
    </form>
  );
}

export default function AdminEventos() {
  const [eventos, setEventos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expandido, setExpandido] = useState(null);

  const load = () => api.get('/eventos/all').then(r => setEventos(r.data));
  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    try {
      if (editing) await api.put(`/eventos/${editing._id}`, form);
      else await api.post('/eventos', form);
      setShowForm(false); setEditing(null); load();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este evento?')) return;
    await api.delete(`/eventos/${id}`);
    load();
  };

  const handleBorrarFoto = async (eventoId, url) => {
    if (!confirm('¿Eliminar esta foto?')) return;
    await api.delete(`/eventos/${eventoId}/foto`, { data: { url } });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Eventos y Fotos</h1>
        {!showForm && !editing && (
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="bg-primary text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-900 transition">
            + Nuevo evento
          </button>
        )}
      </div>

      {(showForm || editing) && (
        <EventoForm initial={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      )}

      <div className="space-y-3">
        {eventos.length === 0 && <p className="text-gray-400 text-center py-8">No hay eventos. Creá el primero.</p>}
        {eventos.map(e => (
          <div key={e._id} className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-4">
              {e.fotos?.[0] ? (
                <img src={fotoSrc(e.fotos[0])} alt={e.titulo} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">📸</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800">{e.titulo}</p>
                <p className="text-sm text-gray-500">
                  {new Date(e.fecha).toLocaleDateString('es-AR')} · {e.lugar} · {e.fotos?.length || 0} fotos
                </p>
              </div>
              <button onClick={() => setExpandido(expandido === e._id ? null : e._id)}
                className="text-gray-400 hover:text-gray-600 text-sm px-3 py-1">
                {expandido === e._id ? 'Cerrar ▲' : 'Ver fotos ▼'}
              </button>
              <button onClick={() => { setEditing(e); setShowForm(false); }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50">Editar</button>
              <button onClick={() => handleDelete(e._id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50">Eliminar</button>
            </div>

            {expandido === e._id && e.fotos?.length > 0 && (
              <div className="border-t border-gray-100 p-4 grid grid-cols-4 md:grid-cols-6 gap-2">
                {e.fotos.map((foto, i) => (
                  <div key={i} className="relative group">
                    <img src={fotoSrc(foto)} alt="" className="w-full aspect-square object-cover rounded-lg" />
                    <button
                      onClick={() => handleBorrarFoto(e._id, foto)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
