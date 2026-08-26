import { useMemo, useState } from 'react';
import { FALLBACK_TEAMS } from '../data/teams.js';
import { teamLogoSrc } from '../utils/teamLogo.js';

const WHATSAPP_PHONE = '5492235000000';
const TALLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const TEAM_STYLES = {
  Acorazados: { body: '#f4f4f5', side: '#111827', trim: '#0f172a', chest: '#4b5563', number: '#111827', outline: '#6b7280', text: '#111827', pattern: 'clean' },
  Liebres: { body: '#f97316', side: '#111827', trim: '#fb923c', chest: '#111827', number: '#111827', outline: '#ffffff', text: '#ffffff', pattern: 'speed' },
  Krakens: { body: '#111827', side: '#7e22ce', trim: '#a78bfa', chest: '#ffffff', number: '#7e22ce', outline: '#bfdbfe', text: '#ffffff', pattern: 'side' },
  Tridentes: { body: '#991b1b', side: '#b45309', trim: '#facc15', chest: '#f8fafc', number: '#111827', outline: '#facc15', text: '#ffffff', pattern: 'bolts' },
  Nereidas: { body: '#38bdf8', body2: '#8b5cf6', side: '#075985', trim: '#ec4899', chest: '#f9a8d4', number: '#1d4ed8', outline: '#f472b6', text: '#ffffff', pattern: 'gradient' },
  Atlantes: { body: '#1d4ed8', side: '#0f172a', trim: '#38bdf8', chest: '#f8fafc', number: '#facc15', outline: '#ffffff', text: '#ffffff', pattern: 'waves' },
  Bárbaros: { body: '#111827', side: '#92400e', trim: '#d97706', chest: '#facc15', number: '#facc15', outline: '#111827', text: '#ffffff', pattern: 'armor' },
  Templarios: { body: '#374151', side: '#111827', trim: '#d4af37', chest: '#d4af37', number: '#d4af37', outline: '#111827', text: '#ffffff', pattern: 'clean' },
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

function JerseyFace({ team, name, number, side }) {
  const style = TEAM_STYLES[team.nombre] || TEAM_STYLES.Acorazados;
  const displayName = normalizeName(name) || 'TU NOMBRE';
  const displayNumber = number || '00';
  const isBack = side === 'back';
  const gradientId = `jersey-gradient-${team._id}-${side}`;
  const shadowId = `jersey-shadow-${team._id}-${side}`;
  const bodyFill = style.body2 ? `url(#${gradientId})` : style.body;

  return (
    <svg viewBox="0 0 360 460" role="img" aria-label={`${side === 'front' ? 'Frente' : 'Dorso'} remera ${team.nombre}`} className="w-full h-full drop-shadow-2xl">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={style.body} />
          <stop offset="58%" stopColor={style.body} />
          <stop offset="100%" stopColor={style.body2 || style.body} />
        </linearGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#000000" floodOpacity="0.42" />
        </filter>
        <linearGradient id={`${gradientId}-shine`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
        </linearGradient>
      </defs>

      <g filter={`url(#${shadowId})`}>
        <path d="M120 44 L154 24 H206 L240 44 L316 80 L288 160 L258 148 V414 H102 V148 L72 160 L44 80 Z" fill={bodyFill} />
        <path d="M44 80 L120 44 L104 148 L72 160 Z" fill={style.side} />
        <path d="M240 44 L316 80 L288 160 L256 148 Z" fill={style.side} />
        <path d="M154 24 H206 L222 49 C210 70 150 70 138 49 Z" fill={style.side} />
        <path d="M154 24 H206" stroke={style.trim} strokeWidth="8" strokeLinecap="round" />
        <path d="M74 156 L44 80 M286 156 L316 80" stroke={style.trim} strokeWidth="8" strokeLinecap="round" opacity="0.9" />
        <path d="M120 44 L154 24 H206 L240 44 L316 80 L288 160 L258 148 V414 H102 V148 L72 160 L44 80 Z" fill={`url(#${gradientId}-shine)`} />

        {style.pattern === 'bolts' && (
          <g fill={style.trim} opacity="0.55">
            <path d="M144 68 L188 210 H154 L214 388 L174 238 H208 Z" />
            <path d="M230 80 L264 170 H238 L276 294 L226 154 H250 Z" opacity="0.65" />
          </g>
        )}
        {style.pattern === 'speed' && (
          <g stroke={style.trim} strokeWidth="9" strokeLinecap="round" opacity="0.5">
            <path d="M112 116 C148 100 198 96 246 110" />
            <path d="M112 144 C156 128 208 126 254 140" />
          </g>
        )}
        {style.pattern === 'waves' && (
          <g stroke={style.trim} strokeWidth="7" fill="none" opacity="0.55">
            <path d="M106 294 C136 268 172 320 206 292 S254 276 280 302" />
            <path d="M98 326 C134 300 170 350 208 320 S252 306 284 332" />
          </g>
        )}
        {style.pattern === 'armor' && (
          <g stroke={style.trim} strokeWidth="5" opacity="0.42">
            <path d="M116 92 L244 92" />
            <path d="M108 132 L252 132" />
            <path d="M108 172 L252 172" />
          </g>
        )}
        {style.pattern === 'side' && (
          <g fill={style.side} opacity="0.72">
            <path d="M102 122 C130 164 132 320 110 414 H102 Z" />
            <path d="M258 122 C230 164 228 320 250 414 H258 Z" />
          </g>
        )}

        <g textAnchor="middle" fontFamily="Impact, Arial Black, Arial, sans-serif">
          {!isBack && (
            <>
              <text x="180" y="139" fontSize="33" fill={style.chest} stroke={style.outline} strokeWidth="2" paintOrder="stroke" letterSpacing="1">
                {team.nombre.toUpperCase()}
              </text>
              <image href={teamLogoSrc(team)} x="150" y="154" width="60" height="60" preserveAspectRatio="xMidYMid meet" />
            </>
          )}
          {isBack && (
            <text x="180" y="134" fontSize="34" fill={style.chest} stroke={style.outline} strokeWidth="2" paintOrder="stroke" letterSpacing="1">
              {displayName}
            </text>
          )}
          <text x="180" y={isBack ? 288 : 308} fontSize="126" fill={style.number} stroke={style.outline} strokeWidth="7" paintOrder="stroke">
            {displayNumber}
          </text>
        </g>

        <path d="M112 64 C124 210 118 300 104 408" stroke="#000000" strokeWidth="2" opacity="0.14" />
        <path d="M248 64 C236 210 242 300 256 408" stroke="#ffffff" strokeWidth="2" opacity="0.18" />
      </g>
    </svg>
  );
}

function JerseyPreview({ team, name, number }) {
  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[4/5] flex items-center justify-center [perspective:1100px]">
      <style>{`
        @keyframes jerseySpin {
          0% { transform: rotateY(-24deg) rotateX(4deg); }
          42% { transform: rotateY(156deg) rotateX(4deg); }
          50% { transform: rotateY(180deg) rotateX(4deg); }
          92% { transform: rotateY(336deg) rotateX(4deg); }
          100% { transform: rotateY(336deg) rotateX(4deg); }
        }
      `}</style>
      <div className="absolute inset-x-10 bottom-3 h-8 rounded-full bg-black/50 blur-xl" />
      <div className="relative w-full h-full [transform-style:preserve-3d] animate-[jerseySpin_9s_ease-in-out_infinite]">
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:translateZ(18px)]">
          <JerseyFace team={team} name={name} number={number} side="front" />
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(18px)]">
          <JerseyFace team={team} name={name} number={number} side="back" />
        </div>
        <div className="absolute left-[13%] top-[18%] h-[67%] w-9 rounded-full bg-black/30 blur-sm [transform:rotateY(90deg)_translateZ(132px)]" />
        <div className="absolute right-[13%] top-[18%] h-[67%] w-9 rounded-full bg-white/10 blur-sm [transform:rotateY(90deg)_translateZ(-132px)]" />
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
