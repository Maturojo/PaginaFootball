import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';

import { API_URL } from '../../config.js';
import { FALLBACK_EVENTS } from '../../data/events.js';
import { fallbackDeleteMessage, imageSource, isMongoId } from '../../utils/adminFallback.js';

function fotoSrc(f) { return imageSource(f, API_URL); }

const PHOTO_BATCH_SIZE = 1;
const MAX_PHOTO_WIDTH = 1200;
const PHOTO_QUALITY = 0.72;
const MAX_PHOTO_BYTES = 900 * 1024;

function eventoKey(evento) {
  return `${String(evento.titulo || '').toLowerCase()}|${String(evento.fecha || '').slice(0, 10)}`;
}

function mergeEventos(apiEventos = []) {
  const existing = new Set(apiEventos.map(eventoKey));
  const missing = FALLBACK_EVENTS.filter(evento => !existing.has(eventoKey(evento)))
    .map(evento => ({ ...evento, activo: evento.activo ?? true, __fallback: true }));
  return [...missing, ...apiEventos];
}

function buildEventoForm(fields, fotos = []) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null && !['_id', '__fallback', 'createdAt', 'updatedAt', '__v', 'fotos'].includes(k)) {
      form.append(k, v);
    }
  });
  fotos.forEach(foto => form.append('fotos', foto));
  return form;
}

async function resizeImage(file) {
  if (!file.type.startsWith('image/')) return file;

  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageUrl;
    });

    const canvas = document.createElement('canvas');
    let scale = Math.min(1, MAX_PHOTO_WIDTH / image.width);
    let quality = PHOTO_QUALITY;
    let blob = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);

      blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (!blob || blob.size <= MAX_PHOTO_BYTES) break;

      scale *= 0.8;
      quality = Math.max(0.55, quality - 0.07);
    }

    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, '.jpg');
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

async function preparePhotos(files) {
  const fotos = Array.from(files || []);
  const processed = [];
  for (const foto of fotos) {
    processed.push(await resizeImage(foto));
  }
  return processed;
}

function EventoForm({ initial, onSave, onCancel }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: initial ? { ...initial, fecha: initial.fecha?.slice(0, 10) } : {}
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const onSubmit = async (data) => {
    if (saving) return;
    setSaving(true);
    setStatus('Preparando fotos...');
    try {
      const fotos = await preparePhotos(data.fotos);
      await onSave({ fields: data, fotos, setStatus });
      reset();
    } catch (err) {
      console.error('Error al guardar evento:', err);
      alert('Error al guardar: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
      setStatus('');
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
        <button type="submit" disabled={saving} className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition disabled:opacity-60 disabled:cursor-not-allowed">
          {saving ? 'Subiendo...' : (initial ? 'Guardar cambios' : 'Crear evento')}
        </button>
        <button type="button" onClick={onCancel} className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition">Cancelar</button>
      </div>
      {status && <p className="text-sm text-gray-500 mt-3">{status}</p>}
    </form>
  );
}

export default function AdminEventos() {
  const [eventos, setEventos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expandido, setExpandido] = useState(null);

  const load = () => api.get('/eventos/all')
    .then(r => setEventos(mergeEventos(r.data)))
    .catch(() => setEventos(mergeEventos([])));
  useEffect(() => { load(); }, []);

  const handleSave = async ({ fields, fotos, setStatus }) => {
    let eventoId = editing?._id;

    if (editing && isMongoId(editing._id)) {
      setStatus('Guardando datos...');
      await api.put(`/eventos/${editing._id}`, buildEventoForm(fields));
    } else {
      setStatus('Creando evento...');
      const response = await api.post('/eventos', buildEventoForm(fields));
      eventoId = response.data?._id;
    }

    for (let index = 0; index < fotos.length; index += PHOTO_BATCH_SIZE) {
      const batchNumber = Math.floor(index / PHOTO_BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(fotos.length / PHOTO_BATCH_SIZE);
      setStatus(`Subiendo foto ${batchNumber} de ${totalBatches}...`);
      await api.put(`/eventos/${eventoId}`, buildEventoForm(fields, fotos.slice(index, index + PHOTO_BATCH_SIZE)));
    }

    setShowForm(false); setEditing(null); load();
  };

  const handleDelete = async (id) => {
    if (!isMongoId(id)) {
      fallbackDeleteMessage();
      return;
    }
    if (!confirm('¿Eliminar este evento?')) return;
    await api.delete(`/eventos/${id}`);
    load();
  };

  const handleBorrarFoto = async (eventoId, url) => {
    if (!isMongoId(eventoId)) {
      fallbackDeleteMessage();
      return;
    }
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
              {e.__fallback && <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">Fijo</span>}
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
