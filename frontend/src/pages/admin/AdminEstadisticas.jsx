import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../../api';
import { FALLBACK_STATS } from '../../data/stats.js';
import { fallbackDeleteMessage, isMongoId } from '../../utils/adminFallback.js';

const CATEGORIAS = ['Liga Football Flag', 'Football Flag Femenino', 'Football Americano 7vs7'];
const EQUIPOS = ['Acorazados', 'Liebres', 'Krakens', 'Tridentes', 'Nereidas', 'Sirenas', 'Corales', 'Atlantes', 'Bárbaros', 'Templarios'];

function statKey(stat) {
  return `${String(stat.temporada || '').toLowerCase()}|${String(stat.categoria || '').toLowerCase()}|${String(stat.descripcion || '').toLowerCase()}`;
}

function mergeStats(apiStats = []) {
  const existing = new Set(apiStats.map(statKey));
  const missing = FALLBACK_STATS.filter(stat => !existing.has(statKey(stat)))
    .map(stat => ({ ...stat, activo: stat.activo ?? true, __fallback: true }));
  return [...missing, ...apiStats];
}

function StatForm({ initial, onSave, onCancel }) {
  const defaultFila = { equipo: '', PJ: 0, PG: 0, PP: 0, PF: 0, PC: 0, Pts: 0 };
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: initial || { temporada: '', categoria: CATEGORIAS[0], descripcion: '', tabla: [defaultFila] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'tabla' });

  const onSubmit = async (data) => {
    await onSave(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-primary mb-4">{initial ? 'Editar tabla' : 'Nueva tabla de posiciones'}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Temporada *</label>
          <input {...register('temporada', { required: true })} className="input" placeholder="2024" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Categoría *</label>
          <select {...register('categoria')} className="input">
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <input {...register('descripcion')} className="input" placeholder="Torneo Apertura..." />
        </div>
      </div>

      {/* Tabla de filas */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              {['Equipo', 'PJ', 'PG', 'PP', 'PF', 'PC', 'Pts', ''].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((field, i) => (
              <tr key={field.id} className="border-t border-gray-100">
                <td className="px-2 py-1">
                  <select {...register(`tabla.${i}.equipo`)} className="input text-sm py-1">
                    <option value="">Seleccionar...</option>
                    {EQUIPOS.map(e => <option key={e}>{e}</option>)}
                  </select>
                </td>
                {['PJ', 'PG', 'PP', 'PF', 'PC', 'Pts'].map(col => (
                  <td key={col} className="px-2 py-1">
                    <input {...register(`tabla.${i}.${col}`, { valueAsNumber: true })} type="number" min="0" className="input text-sm py-1 w-16 text-center" />
                  </td>
                ))}
                <td className="px-2 py-1">
                  <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={() => append({ equipo: '', PJ: 0, PG: 0, PP: 0, PF: 0, PC: 0, Pts: 0 })}
        className="text-sm text-accent hover:text-blue-700 font-medium mb-4 block">
        + Agregar equipo a la tabla
      </button>

      <div className="flex gap-3">
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition">
          {initial ? 'Guardar cambios' : 'Crear tabla'}
        </button>
        <button type="button" onClick={onCancel} className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function AdminEstadisticas() {
  const [stats, setStats] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/estadisticas/all').then(r => setStats(mergeStats(r.data)));
  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (editing && isMongoId(editing._id)) await api.put(`/estadisticas/${editing._id}`, data);
    else await api.post('/estadisticas', data);
    setShowForm(false); setEditing(null); load();
  };

  const handleDelete = async (id) => {
    if (!isMongoId(id)) {
      fallbackDeleteMessage();
      return;
    }
    if (!confirm('¿Eliminar esta tabla?')) return;
    await api.delete(`/estadisticas/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Estadísticas</h1>
        {!showForm && !editing && (
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-primary text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-900 transition">
            + Nueva tabla
          </button>
        )}
      </div>

      {(showForm || editing) && (
        <StatForm initial={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      )}

      <div className="space-y-3">
        {stats.length === 0 && <p className="text-gray-400 text-center py-8">No hay tablas. Creá la primera.</p>}
        {stats.map(s => (
          <div key={s._id} className="bg-white rounded-xl shadow px-6 py-4 flex items-center gap-4">
            <div className="text-3xl">📊</div>
            <div className="flex-1">
              <p className="font-bold text-gray-800">{s.temporada} — {s.categoria}</p>
              <p className="text-sm text-gray-500">{s.tabla?.length || 0} equipos · {s.descripcion}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${s.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {s.__fallback ? 'Fijo' : (s.activo ? 'Activo' : 'Inactivo')}
            </span>
            <button onClick={() => { setEditing(s); setShowForm(false); }} className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50">Editar</button>
            <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50">Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
