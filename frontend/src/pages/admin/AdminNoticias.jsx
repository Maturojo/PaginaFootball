import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';

import { API_URL } from '../../config.js';

function NoticiaForm({ initial, onSave, onCancel }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: initial || {} });
  const onSubmit = async (data) => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'imagen') { if (v?.[0]) form.append('imagen', v[0]); }
      else form.append(k, v);
    });
    await onSave(form); reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-primary mb-4">{initial ? 'Editar noticia' : 'Nueva noticia'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Título *</label><input {...register('titulo', { required: true })} className="input" /></div>
        <div><label className="block text-sm font-medium mb-1">Autor</label><input {...register('autor')} className="input" placeholder="Liga Football MDP" /></div>
        <div className="flex items-center gap-2 mt-5"><input {...register('destacada')} type="checkbox" id="dest" className="w-4 h-4" /><label htmlFor="dest" className="text-sm font-medium">Noticia destacada</label></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Imagen</label><input {...register('imagen')} type="file" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white" /></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Contenido *</label><textarea {...register('contenido', { required: true })} className="input resize-none" rows={8} /></div>
      </div>
      <div className="flex gap-3 mt-5">
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition">{initial ? 'Guardar' : 'Publicar'}</button>
        <button type="button" onClick={onCancel} className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition">Cancelar</button>
      </div>
    </form>
  );
}

export default function AdminNoticias() {
  const [noticias, setNoticias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/noticias/all').then(r => setNoticias(r.data));
  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (editing) await api.put(`/noticias/${editing._id}`, form);
    else await api.post('/noticias', form);
    setShowForm(false); setEditing(null); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta noticia?')) return;
    await api.delete(`/noticias/${id}`); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Noticias</h1>
        {!showForm && !editing && <button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-primary text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-900 transition">+ Nueva noticia</button>}
      </div>
      {(showForm || editing) && <NoticiaForm initial={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />}
      <div className="space-y-3">
        {noticias.length === 0 && <p className="text-gray-400 text-center py-8">No hay noticias.</p>}
        {noticias.map(n => (
          <div key={n._id} className="bg-white rounded-xl shadow px-5 py-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
              {n.imagen ? <img src={n.imagen.startsWith('/') ? `${API_URL}${n.imagen}` : n.imagen} className="w-full h-full object-cover" /> : <span className="text-xl">📰</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm">{n.destacada && '⭐ '}{n.titulo}</p>
              <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString('es-AR')} · {n.autor}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${n.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{n.activo ? 'Activo' : 'Inactivo'}</span>
            <button onClick={() => { setEditing(n); setShowForm(false); }} className="text-blue-600 text-sm px-3 py-1 rounded hover:bg-blue-50">Editar</button>
            <button onClick={() => handleDelete(n._id)} className="text-red-500 text-sm px-3 py-1 rounded hover:bg-red-50">Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
