import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';
import { FALLBACK_LIDERES } from '../../data/stats.js';
import { fallbackDeleteMessage, isMongoId } from '../../utils/adminFallback.js';

const TIPOS = [
  'touchdowns',
  'pase',
  'corrida',
  'recepcion',
  'flags',
  'intercepciones',
  'sacks',
  'deflecciones',
  'tackles',
  'premios',
  'equipo-ofensivo',
  'equipo-defensivo',
];

const TIPO_LABELS = {
  touchdowns: 'Touchdowns',
  pase: 'Pase',
  corrida: 'Corrida',
  recepcion: 'Recepción',
  flags: 'Flageos',
  intercepciones: 'Intercepciones',
  sacks: 'Sacks',
  deflecciones: 'Deflecciones',
  tackles: 'Tackles',
  premios: 'Premios',
  'equipo-ofensivo': 'Equipo ofensivo',
  'equipo-defensivo': 'Equipo defensivo',
};

function liderKey(lider) {
  return `${String(lider.temporada || '').toLowerCase()}|${String(lider.tipo || '').toLowerCase()}`;
}

function mergeLideres(apiLideres = []) {
  const existing = new Set(apiLideres.map(liderKey));
  const missing = FALLBACK_LIDERES.filter(lider => !existing.has(liderKey(lider)))
    .map(lider => ({
      ...lider,
      _id: lider._id || `fallback-${liderKey(lider).replace(/[^a-z0-9]+/g, '-')}`,
      activo: lider.activo ?? true,
      __fallback: true,
    }));
  return [...missing, ...apiLideres];
}

function LiderForm({ initial, onSave, onCancel }) {
  const defaultValues = initial
    ? {
        temporada: initial.temporada,
        tipo: initial.tipo,
        jugadoresJson: JSON.stringify(initial.jugadores || [], null, 2),
      }
    : {
        temporada: '',
        tipo: 'pase',
        jugadoresJson: '[\n  {\n    "nombre": "",\n    "team": "",\n    "yds": 0\n  }\n]',
      };

  const { register, handleSubmit, reset } = useForm({ defaultValues });

  const onSubmit = async (data) => {
    let jugadores;
    try {
      jugadores = JSON.parse(data.jugadoresJson || '[]');
      if (!Array.isArray(jugadores)) throw new Error('El JSON debe ser un array.');
    } catch (err) {
      alert(`Revisá el JSON de jugadores: ${err.message}`);
      return;
    }

    await onSave({
      temporada: data.temporada,
      tipo: data.tipo,
      jugadores,
      activo: true,
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-primary mb-4">{initial ? 'Editar líderes' : 'Nueva tabla de líderes'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Temporada *</label>
          <input {...register('temporada', { required: true })} className="input" placeholder="Tazón del Mar XI" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo *</label>
          <select {...register('tipo')} className="input">
            {TIPOS.map(tipo => <option key={tipo} value={tipo}>{TIPO_LABELS[tipo]}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Jugadores / datos</label>
          <textarea
            {...register('jugadoresJson', { required: true })}
            className="input font-mono text-xs resize-y min-h-[320px]"
            spellCheck={false}
          />
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition">
          {initial ? 'Guardar cambios' : 'Crear líderes'}
        </button>
        <button type="button" onClick={onCancel} className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function AdminLideres() {
  const [lideres, setLideres] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filtro, setFiltro] = useState('');

  const load = () => api.get('/lideres').then(r => setLideres(mergeLideres(r.data || [])));
  useEffect(() => { load(); }, []);

  const lideresFiltrados = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    if (!q) return lideres;
    return lideres.filter(lider =>
      `${lider.temporada} ${TIPO_LABELS[lider.tipo] || lider.tipo}`.toLowerCase().includes(q)
    );
  }, [filtro, lideres]);

  const handleSave = async (data) => {
    if (editing && isMongoId(editing._id)) await api.put(`/lideres/${editing._id}`, data);
    else await api.post('/lideres', data);
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!isMongoId(id)) {
      fallbackDeleteMessage();
      return;
    }
    if (!confirm('¿Eliminar esta tabla de líderes?')) return;
    await api.delete(`/lideres/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Líderes y Premios</h1>
          <p className="text-sm text-gray-500">Tablas por tazón, finales, premios y equipos ideales.</p>
        </div>
        {!showForm && !editing && (
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-primary text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-900 transition">
            + Nueva tabla
          </button>
        )}
      </div>

      {(showForm || editing) && (
        <LiderForm initial={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      )}

      <div className="mb-4">
        <input
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="input max-w-md"
          placeholder="Buscar por temporada o tipo..."
        />
      </div>

      <div className="space-y-3">
        {lideresFiltrados.length === 0 && <p className="text-gray-400 text-center py-8">No hay líderes cargados.</p>}
        {lideresFiltrados.map(lider => (
          <div key={lider._id} className="bg-white rounded-xl shadow px-6 py-4 flex items-center gap-4">
            <div className="text-3xl">🏆</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800">{lider.temporada} — {TIPO_LABELS[lider.tipo] || lider.tipo}</p>
              <p className="text-sm text-gray-500">{lider.jugadores?.length || 0} registros</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${lider.__fallback ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
              {lider.__fallback ? 'Fijo' : 'Activo'}
            </span>
            <button onClick={() => { setEditing(lider); setShowForm(false); }} className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50">Editar</button>
            <button onClick={() => handleDelete(lider._id)} className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50">Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
