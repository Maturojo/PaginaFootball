import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';

const PAGINAS = [
  {
    key: 'inicio',
    label: 'Inicio',
    fields: [
      { name: 'titulo', label: 'Título principal', type: 'text' },
      { name: 'subtitulo', label: 'Subtítulo', type: 'text' },
      { name: 'descripcion', label: 'Descripción', type: 'textarea' },
      { name: 'telefono', label: 'Teléfono', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
    ],
  },
  {
    key: 'historia',
    label: 'Historia',
    fields: [
      { name: 'titulo', label: 'Título', type: 'text' },
      { name: 'texto', label: 'Texto de la historia', type: 'textarea', rows: 8 },
      { name: 'imagen', label: 'URL de imagen (opcional)', type: 'text' },
    ],
  },
  {
    key: 'contacto',
    label: 'Contacto',
    fields: [
      { name: 'titulo', label: 'Título', type: 'text' },
      { name: 'direccion', label: 'Dirección', type: 'text' },
      { name: 'telefono', label: 'Teléfono / WhatsApp', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'instagram', label: 'Instagram (solo usuario)', type: 'text' },
      { name: 'facebook', label: 'Facebook (usuario o URL)', type: 'text' },
    ],
  },
];

function PageEditor({ page, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    api.get(`/pages/${page.key}`).then(r => {
      reset(r.data?.contenido || {});
      setLoading(false);
    });
  }, [page.key]);

  const onSubmit = async (data) => {
    await api.put(`/pages/${page.key}`, { contenido: data });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (onSaved) onSaved();
  };

  if (loading) return <p className="text-gray-400">Cargando...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {page.fields.map(f => (
        <div key={f.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
          {f.type === 'textarea' ? (
            <textarea {...register(f.name)} className="input resize-none" rows={f.rows || 4} />
          ) : (
            <input {...register(f.name)} type={f.type} className="input" />
          )}
        </div>
      ))}
      <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition">
        {saved ? '✓ Guardado' : 'Guardar cambios'}
      </button>
    </form>
  );
}

export default function AdminPaginas() {
  const [active, setActive] = useState(0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Editar Páginas</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {PAGINAS.map((p, i) => (
          <button
            key={p.key}
            onClick={() => setActive(i)}
            className={`px-5 py-2 rounded-lg font-medium transition ${active === i ? 'bg-primary text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <PageEditor key={PAGINAS[active].key} page={PAGINAS[active]} />
      </div>
    </div>
  );
}
