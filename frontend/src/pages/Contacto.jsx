import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api';

export default function Contacto() {
  const [data, setData] = useState({ titulo: 'Contactanos', direccion: '', telefono: '+54 9 223 666-1385', email: '', instagram: '', facebook: '' });
  const { register, handleSubmit, reset, formState: { isSubmitSuccessful } } = useForm();

  useEffect(() => {
    api.get('/pages/contacto').then(r => { if (r.data?.contenido) setData(r.data.contenido); });
  }, []);

  const onSubmit = (values) => {
    const phone = data.telefono?.replace(/\D/g, '') || '5492236661385';
    const msg = encodeURIComponent(`Nombre: ${values.nombre}\nEmail: ${values.email}\nMensaje: ${values.mensaje}`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    reset();
  };

  return (
    <div className="bg-primary text-white pt-16">
      <section className="bg-secondary border-b border-accent/20 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">{data.titulo}</h1>
        <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded" />
      </section>

      <section className="max-w-5xl mx-auto py-16 px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Información de contacto</h2>
          <div className="space-y-4">
            {data.direccion && (
              <div className="flex items-start gap-3 text-white/60">
                <span className="text-2xl">📍</span>
                <p>{data.direccion}</p>
              </div>
            )}
            {data.telefono && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">📞</span>
                <a href={`tel:${data.telefono}`} className="text-white/60 hover:text-accent transition">{data.telefono}</a>
              </div>
            )}
            {data.email && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">✉️</span>
                <a href={`mailto:${data.email}`} className="text-white/60 hover:text-accent transition">{data.email}</a>
              </div>
            )}
            {data.instagram && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">📸</span>
                <a href={`https://instagram.com/${data.instagram}`} target="_blank" rel="noreferrer" className="text-white/60 hover:text-accent transition">@{data.instagram}</a>
              </div>
            )}
            {data.facebook && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">👍</span>
                <a href={`https://facebook.com/${data.facebook}`} target="_blank" rel="noreferrer" className="text-white/60 hover:text-accent transition">{data.facebook}</a>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Envianos un mensaje</h2>
          {isSubmitSuccessful ? (
            <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-6 text-center">
              <p className="text-green-400 font-medium">¡Mensaje enviado por WhatsApp!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Nombre</label>
                <input {...register('nombre', { required: true })} className="w-full bg-secondary border border-accent/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent placeholder-white/20" placeholder="Tu nombre" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
                <input {...register('email', { required: true })} type="email" className="w-full bg-secondary border border-accent/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent placeholder-white/20" placeholder="tu@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Mensaje</label>
                <textarea {...register('mensaje', { required: true })} rows={4} className="w-full bg-secondary border border-accent/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent resize-none placeholder-white/20" placeholder="¿En qué podemos ayudarte?" />
              </div>
              <button type="submit" className="w-full bg-accent text-white font-bold py-3 rounded-lg hover:bg-accent-light transition shadow-lg shadow-accent/30">
                Enviar por WhatsApp
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
