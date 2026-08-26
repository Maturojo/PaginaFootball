import { useMemo, useState } from 'react';
import { FALLBACK_TEAMS } from '../data/teams.js';
import { teamLogoSrc } from '../utils/teamLogo.js';

const WHATSAPP_PHONE = '5492235000000';
const TALLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const TEAM_STYLES = {
  Acorazados: { main: '#d1d5db', accent: '#111827', text: '#111827', trim: '#6b7280' },
  Liebres: { main: '#f97316', accent: '#111827', text: '#ffffff', trim: '#fb923c' },
  Krakens: { main: '#6d28d9', accent: '#111827', text: '#ffffff', trim: '#a78bfa' },
  Tridentes: { main: '#166534', accent: '#d4af37', text: '#ffffff', trim: '#22c55e' },
  Nereidas: { main: '#2563eb', accent: '#f8fafc', text: '#ffffff', trim: '#60a5fa' },
  Atlantes: { main: '#1d4ed8', accent: '#facc15', text: '#ffffff', trim: '#38bdf8' },
  Bárbaros: { main: '#991b1b', accent: '#111827', text: '#ffffff', trim: '#ef4444' },
  Templarios: { main: '#f8fafc', accent: '#b91c1c', text: '#111827', trim: '#d1d5db' },
};

function normalizeName(value) {
  return value.trim().toUpperCase().slice(0, 14);
}

function buildWhatsAppLink({ equipo, talle, nombre, numero, corte, notas }) {
  const lines = [
    'Hola! Quiero encargar una remera personalizada.',
    `Equipo: ${equipo}`,
    `Talle: ${talle}`,
    `Nombre atras: ${normalizeName(nombre) || 'Sin definir'}`,
    numero ? `Numero: ${numero}` : 'Numero: Sin numero',
    `Corte: ${corte}`,
    notas ? `Notas: ${notas}` : null,
  ].filter(Boolean);

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function JerseyPreview({ team, name, number }) {
  const style = TEAM_STYLES[team.nombre] || TEAM_STYLES.Acorazados;
  const displayName = normalizeName(name) || 'TU NOMBRE';
  const displayNumber = number || '00';

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[4/5] flex items-center justify-center">
      <div
        className="absolute inset-x-8 top-8 h-[78%] rounded-t-[42px] rounded-b-2xl shadow-2xl border"
        style={{ background: style.main, borderColor: style.trim }}
      />
      <div
        className="absolute left-0 top-20 w-24 h-44 rounded-tl-[42px] rounded-bl-2xl -rotate-12 shadow-xl"
        style={{ background: style.accent }}
      />
      <div
        className="absolute right-0 top-20 w-24 h-44 rounded-tr-[42px] rounded-br-2xl rotate-12 shadow-xl"
        style={{ background: style.accent }}
      />
      <div
        className="absolute inset-x-20 top-8 h-16 rounded-b-full border-b-8"
        style={{ background: style.accent, borderColor: style.trim }}
      />
      <div className="relative z-10 flex flex-col items-center text-center px-10 pt-14">
        <img src={teamLogoSrc(team)} alt={team.nombre} className="w-20 h-20 object-contain mb-7 drop-shadow-xl" />
        <p className="text-xs font-black tracking-widest uppercase opacity-80" style={{ color: style.text }}>
          {team.nombre}
        </p>
        <p className="mt-4 text-3xl font-black leading-none break-all" style={{ color: style.text }}>
          {displayName}
        </p>
        <p className="mt-4 text-7xl font-black leading-none" style={{ color: style.text }}>
          {displayNumber}
        </p>
      </div>
    </div>
  );
}

export default function Remeras() {
  const equipos = FALLBACK_TEAMS.filter(team => !team.esSeleccion);
  const [equipoId, setEquipoId] = useState(equipos[0]._id);
  const [talle, setTalle] = useState('M');
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState('');
  const [corte, setCorte] = useState('Unisex');
  const [notas, setNotas] = useState('');

  const equipo = useMemo(
    () => equipos.find(team => team._id === equipoId) || equipos[0],
    [equipoId, equipos]
  );

  const whatsappLink = buildWhatsAppLink({ equipo: equipo.nombre, talle, nombre, numero, corte, notas });

  return (
    <div className="bg-primary text-white pt-16">
      <section className="bg-secondary border-b border-accent/20 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">Encargá tu remera</h1>
        <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded" />
        <p className="text-white/50 mt-4 text-lg">Elegí tu equipo y personalizala con tu nombre atrás</p>
      </section>

      <section className="max-w-6xl mx-auto py-14 px-4 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 items-start">
        <div className="bg-secondary border border-accent/20 rounded-xl p-5 md:p-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-accent text-sm font-bold uppercase tracking-widest">Pedido personalizado</span>
            <div className="flex-1 h-px bg-accent/20" />
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-3">Equipo</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {equipos.map(team => (
                  <button
                    key={team._id}
                    type="button"
                    onClick={() => setEquipoId(team._id)}
                    className={`min-h-24 rounded-lg border px-2 py-3 flex flex-col items-center justify-center gap-2 transition ${
                      equipoId === team._id
                        ? 'bg-accent/20 border-accent text-white'
                        : 'bg-primary/50 border-accent/10 text-white/50 hover:text-white hover:border-accent/50'
                    }`}
                  >
                    <img src={teamLogoSrc(team)} alt="" className="w-11 h-11 object-contain" />
                    <span className="text-xs font-bold text-center leading-tight">{team.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Nombre atrás</label>
                <input
                  value={nombre}
                  onChange={e => setNombre(normalizeName(e.target.value))}
                  className="input bg-white text-gray-900"
                  placeholder="TU NOMBRE"
                  maxLength={14}
                />
                <p className="text-xs text-white/30 mt-1">{normalizeName(nombre).length}/14 caracteres</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Número opcional</label>
                <input
                  value={numero}
                  onChange={e => setNumero(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  className="input bg-white text-gray-900"
                  placeholder="00"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Talle</label>
                <div className="grid grid-cols-3 gap-2">
                  {TALLES.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setTalle(size)}
                      className={`h-10 rounded-lg border text-sm font-bold transition ${
                        talle === size ? 'bg-accent border-accent text-white' : 'bg-primary/50 border-accent/20 text-white/60 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Corte</label>
                <select value={corte} onChange={e => setCorte(e.target.value)} className="input bg-white text-gray-900">
                  <option>Unisex</option>
                  <option>Femenino</option>
                  <option>Niño/a</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Notas para el pedido</label>
              <textarea
                value={notas}
                onChange={e => setNotas(e.target.value)}
                className="input bg-white text-gray-900 resize-none"
                rows={3}
                placeholder="Ej: consultar precio, forma de pago, retiro, etc."
              />
            </div>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="w-full min-h-12 bg-green-600 hover:bg-green-500 text-white rounded-xl font-extrabold flex items-center justify-center gap-2 transition shadow-lg shadow-green-900/30"
            >
              Encargar por WhatsApp
            </a>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="bg-secondary border border-accent/20 rounded-xl p-5 md:p-8 overflow-hidden">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-accent text-xs font-bold uppercase tracking-widest">Vista previa</p>
                <h2 className="text-2xl font-extrabold text-white mt-1">{equipo.nombre}</h2>
              </div>
              <img src={teamLogoSrc(equipo)} alt="" className="w-16 h-16 object-contain" />
            </div>
            <JerseyPreview team={equipo} name={nombre} number={numero} />
            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-primary/50 rounded-lg p-3">
                <p className="text-white/30 text-xs uppercase">Talle</p>
                <p className="font-bold text-white">{talle}</p>
              </div>
              <div className="bg-primary/50 rounded-lg p-3">
                <p className="text-white/30 text-xs uppercase">Nombre</p>
                <p className="font-bold text-white truncate">{normalizeName(nombre) || '-'}</p>
              </div>
              <div className="bg-primary/50 rounded-lg p-3">
                <p className="text-white/30 text-xs uppercase">Número</p>
                <p className="font-bold text-white">{numero || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
