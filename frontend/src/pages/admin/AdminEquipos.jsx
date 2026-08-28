import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';

import { API_URL } from '../../config.js';
import { mergeTeams } from '../../data/teams.js';
import { fallbackDeleteMessage, imageSource, isMongoId } from '../../utils/adminFallback.js';

function TeamForm({ initial, onSave, onCancel }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: initial || {} });

  const onSubmit = async (data) => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'logo') {
        if (v?.[0]) form.append('logo', v[0]);
      } else if (!['_id', '__fallback', 'createdAt', 'updatedAt', '__v'].includes(k)) {
        form.append(k, v);
      }
    });
    if (initial?.logo && typeof data.logo !== 'object') form.append('logo', initial.logo);
    await onSave(form);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-primary mb-4">{initial ? 'Editar equipo' : 'Nuevo equipo'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input {...register('nombre', { required: true })} className="input" placeholder="Nombre del equipo" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ciudad</label>
          <input {...register('ciudad')} className="input" placeholder="Mar del Plata" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Colores</label>
          <input {...register('colores')} className="input" placeholder="Azul y blanco" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Año de fundación</label>
          <input {...register('anioFundacion')} type="number" className="input" placeholder="2010" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea {...register('descripcion')} className="input resize-none" rows={3} placeholder="Descripción del equipo..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <select {...register('categoria')} className="input">
            <option>Liga Football Flag</option>
            <option>Football Flag Femenino</option>
            <option>Football Americano 7vs7</option>
          </select>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input {...register('proximamente')} type="checkbox" id="proximamente" className="w-4 h-4" />
          <label htmlFor="proximamente" className="text-sm font-medium">Marcar como "Próximamente"</label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Logo (imagen)</label>
          <input {...register('logo')} type="file" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white" />
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition">
          {initial ? 'Guardar cambios' : 'Crear equipo'}
        </button>
        <button type="button" onClick={onCancel} className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function AdminEquipos() {
  const [teams, setTeams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/teams/all').then(r => setTeams(mergeTeams(r.data).map(t => (
    isMongoId(t._id) ? t : { ...t, activo: t.activo ?? true, __fallback: true }
  ))));
  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (editing && isMongoId(editing._id)) {
      await api.put(`/teams/${editing._id}`, form);
    } else {
      await api.post('/teams', form);
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!isMongoId(id)) {
      fallbackDeleteMessage();
      return;
    }
    if (!confirm('¿Eliminar este equipo?')) return;
    await api.delete(`/teams/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Equipos</h1>
        {!showForm && (
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-primary text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-900 transition">
            + Nuevo equipo
          </button>
        )}
      </div>

      {(showForm || editing) && (
        <TeamForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      <div className="space-y-3">
        {teams.length === 0 && <p className="text-gray-400 text-center py-8">No hay equipos. Creá el primero.</p>}
        {teams.map(t => (
          <div key={t._id} className="bg-white rounded-xl shadow px-6 py-4 flex items-center gap-4">
            {t.logo ? (
              <img src={imageSource(t.logo, API_URL)} alt={t.nombre} className="w-14 h-14 object-contain rounded-lg" />
            ) : (
              <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">🏈</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800">{t.nombre}</p>
              <p className="text-sm text-gray-500">{t.ciudad} · {t.colores}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${t.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {t.__fallback ? 'Fijo' : (t.activo ? 'Activo' : 'Inactivo')}
            </span>
            <button onClick={() => { setEditing(t); setShowForm(false); }} className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50">Editar</button>
            <button onClick={() => handleDelete(t._id)} className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50">Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
