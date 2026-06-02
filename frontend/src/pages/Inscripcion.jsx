import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api';

const EQUIPOS = ['Sin preferencia', 'Acorazados', 'Liebres', 'Krakens', 'Tridentes', 'Nereidas', 'Atlantes'];
const POSICIONES = ['No sé aún', 'Quarterback (QB)', 'Wide Receiver (WR)', 'Running Back (RB)', 'Lineman (OL/DL)', 'Linebacker (LB)', 'Cornerback (CB)', 'Safety (S)', 'Otra'];

export default function Inscripcion() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/inscripciones', data);
      setEnviado(true);
      reset();
    } catch {
      setError('Hubo un error al enviar. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary text-white pt-16">
      <section className="bg-secondary border-b border-accent/20 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold">Sumate a la Liga</h1>
        <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded" />
        <p className="text-white/50 mt-4 text-lg">Completá el formulario y nos ponemos en contacto</p>
      </section>

      <section className="max-w-2xl mx-auto py-16 px-4">
        {enviado ? (
          <div className="bg-green-900/30 border border-green-500/30 rounded-2xl p-10 text-center">
            <p className="text-5xl mb-4">🏈</p>
            <h2 className="text-2xl font-bold text-white mb-3">¡Inscripción recibida!</h2>
            <p className="text-white/60">Nos ponemos en contacto a la brevedad. ¡Bienvenido a la liga!</p>
            <button onClick={() => setEnviado(false)} className="mt-6 bg-accent text-white px-6 py-2 rounded-full font-bold hover:bg-accent-light transition">
              Nueva inscripción
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Nombre completo *</label>
                <input {...register('nombre', { required: true })} className="w-full bg-secondary border border-accent/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent placeholder-white/20" placeholder="Tu nombre" />
                {errors.nombre && <p className="text-red-400 text-xs mt-1">Campo requerido</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Edad</label>
                <input {...register('edad')} type="number" min="10" max="60" className="w-full bg-secondary border border-accent/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent placeholder-white/20" placeholder="Tu edad" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Email *</label>
                <input {...register('email', { required: true })} type="email" className="w-full bg-secondary border border-accent/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent placeholder-white/20" placeholder="tu@email.com" />
                {errors.email && <p className="text-red-400 text-xs mt-1">Campo requerido</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Teléfono / WhatsApp *</label>
                <input {...register('telefono', { required: true })} className="w-full bg-secondary border border-accent/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent placeholder-white/20" placeholder="223 000-0000" />
                {errors.telefono && <p className="text-red-400 text-xs mt-1">Campo requerido</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Posición de interés</label>
                <select {...register('posicion')} className="w-full bg-secondary border border-accent/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent">
                  {POSICIONES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Equipo preferido</label>
                <select {...register('equipoPreferido')} className="w-full bg-secondary border border-accent/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent">
                  {EQUIPOS.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Experiencia previa</label>
              <input {...register('experiencia')} className="w-full bg-secondary border border-accent/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent placeholder-white/20" placeholder="¿Jugaste antes? ¿Algún deporte similar?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Mensaje (opcional)</label>
              <textarea {...register('mensaje')} rows={3} className="w-full bg-secondary border border-accent/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent resize-none placeholder-white/20" placeholder="Contanos algo sobre vos..." />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-accent text-white font-bold py-3 rounded-xl hover:bg-accent-light transition shadow-lg shadow-accent/30 disabled:opacity-50">
              {loading ? 'Enviando...' : '¡Quiero jugar! 🏈'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
