import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';

import { API_URL } from '../../config.js';
import { mergeFallbackProducts } from '../../data/products.js';
import { fallbackDeleteMessage, imageSource, isMongoId } from '../../utils/adminFallback.js';
const CATEGORIAS = ['Indumentaria', 'Accesorios', 'Equipamiento', 'Otro'];

function ProductForm({ initial, onSave, onCancel }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: initial || { precio: '', stock: 0 } });

  const onSubmit = async (data) => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'imagen') {
        if (v?.[0]) form.append('imagen', v[0]);
        else if (initial?.imagen) form.append('imagen', initial.imagen);
      } else if (!['_id', 'imagenes', '__fallback', 'createdAt', 'updatedAt', '__v'].includes(k)) {
        form.append(k, v);
      }
    });
    await onSave(form);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-primary mb-4">{initial ? 'Editar producto' : 'Nuevo producto'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input {...register('nombre', { required: true })} className="input" placeholder="Nombre del producto" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Precio (ARS) *</label>
          <input {...register('precio', { required: true })} type="number" min="0" className="input" placeholder="3500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <select {...register('categoria')} className="input">
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input {...register('stock')} type="number" min="0" className="input" placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp (número sin +)</label>
          <input {...register('whatsapp')} className="input" placeholder="5492236661385" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Imagen</label>
          <input {...register('imagen')} type="file" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea {...register('descripcion')} className="input resize-none" rows={2} placeholder="Descripción breve..." />
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition">
          {initial ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <button type="button" onClick={onCancel} className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function AdminProductos() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/products/all')
    .then(r => setProducts(mergeFallbackProducts(r.data).map(p => (
      isMongoId(p._id) ? p : { ...p, activo: p.activo ?? true, __fallback: true }
    ))))
    .catch(() => setProducts(mergeFallbackProducts([]).map(p => ({ ...p, activo: p.activo ?? true, __fallback: true }))));
  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (editing && isMongoId(editing._id)) {
      await api.put(`/products/${editing._id}`, form);
    } else {
      await api.post('/products', form);
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
    if (!confirm('¿Eliminar este producto?')) return;
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Productos</h1>
        {!showForm && !editing && (
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-primary text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-900 transition">
            + Nuevo producto
          </button>
        )}
      </div>

      {(showForm || editing) && (
        <ProductForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      <div className="space-y-3">
        {products.length === 0 && <p className="text-gray-400 text-center py-8">No hay productos. Creá el primero.</p>}
        {products.map(p => (
          <div key={p._id} className="bg-white rounded-xl shadow px-6 py-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
              {p.imagen ? (
                <img src={imageSource(p.imagen, API_URL)} alt={p.nombre} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">👕</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800">{p.nombre}</p>
              <p className="text-sm text-gray-500">{p.categoria} · Stock: {p.stock}</p>
            </div>
            <p className="font-extrabold text-primary text-lg">${Number(p.precio).toLocaleString('es-AR')}</p>
            <span className={`text-xs px-2 py-1 rounded-full ${p.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {p.__fallback ? 'Fijo' : (p.activo ? 'Activo' : 'Inactivo')}
            </span>
            <button onClick={() => { setEditing(p); setShowForm(false); }} className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50">Editar</button>
            <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50">Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
