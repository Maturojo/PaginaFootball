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
  const fabricId = `jersey-fabric-${team._id}-${side}`;
  const bodyFill = style.body2 ? `url(#${gradientId})` : style.body;

  return (
    <svg viewBox="0 0 430 560" role="img" aria-label={`${side === 'front' ? 'Frente' : 'Dorso'} remera ${team.nombre}`} className="w-full h-full drop-shadow-2xl">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={style.body} />
          <stop offset="56%" stopColor={style.body} />
          <stop offset="100%" stopColor={style.body2 || style.body} />
        </linearGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="#000000" floodOpacity="0.48" />
        </filter>
        <filter id={fabricId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.11" />
          </feComponentTransfer>
        </filter>
        <linearGradient id={`${gradientId}-shine`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id={`${gradientId}-center`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.18" />
          <stop offset="18%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="82%" stopColor="#000000" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
        </linearGradient>
      </defs>

      <g filter={`url(#${shadowId})`}>
        <path d="M143 59 C160 42 179 35 215 35 C251 35 270 42 287 59 L376 92 C400 101 413 123 408 149 L390 242 C386 264 371 276 350 271 L304 260 L292 498 C291 515 279 525 262 525 H168 C151 525 139 515 138 498 L126 260 L80 271 C59 276 44 264 40 242 L22 149 C17 123 30 101 54 92 Z" fill={bodyFill} />
        <path d="M54 92 L143 59 C132 104 126 162 126 260 L80 271 C59 276 44 264 40 242 L22 149 C17 123 30 101 54 92 Z" fill={style.side} />
        <path d="M287 59 L376 92 C400 101 413 123 408 149 L390 242 C386 264 371 276 350 271 L304 260 C304 162 298 104 287 59 Z" fill={style.side} />
        <path d="M168 39 H262 L281 62 C264 104 166 104 149 62 Z" fill={style.side} />
        <path d="M161 42 L195 100 L215 75 L235 100 L269 42" fill="none" stroke={style.trim} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M165 42 H265" stroke="#ffffff" strokeWidth="2" opacity="0.45" strokeLinecap="round" />
        <path d="M74 266 L40 98 M356 266 L390 98" stroke={style.trim} strokeWidth="9" strokeLinecap="round" opacity="0.95" />
        <path d="M143 59 C160 42 179 35 215 35 C251 35 270 42 287 59 L376 92 C400 101 413 123 408 149 L390 242 C386 264 371 276 350 271 L304 260 L292 498 C291 515 279 525 262 525 H168 C151 525 139 515 138 498 L126 260 L80 271 C59 276 44 264 40 242 L22 149 C17 123 30 101 54 92 Z" fill={`url(#${gradientId}-shine)`} />
        <path d="M143 59 C160 42 179 35 215 35 C251 35 270 42 287 59 L376 92 C400 101 413 123 408 149 L390 242 C386 264 371 276 350 271 L304 260 L292 498 C291 515 279 525 262 525 H168 C151 525 139 515 138 498 L126 260 L80 271 C59 276 44 264 40 242 L22 149 C17 123 30 101 54 92 Z" filter={`url(#${fabricId})`} opacity="0.55" />
        <path d="M135 87 C157 119 273 119 295 87" fill="none" stroke="#000000" strokeWidth="2" opacity="0.16" />
        <path d="M132 259 C148 304 282 304 298 259" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.12" />

        {style.pattern === 'bolts' && (
          <g fill={style.trim} opacity="0.55">
            <path d="M166 102 L218 252 H178 L250 458 L204 282 H244 Z" />
            <path d="M262 112 L300 204 H272 L316 334 L260 182 H286 Z" opacity="0.62" />
          </g>
        )}
        {style.pattern === 'speed' && (
          <g stroke={style.trim} strokeWidth="9" strokeLinecap="round" opacity="0.5">
            <path d="M130 146 C174 124 236 124 292 140" />
            <path d="M128 176 C184 154 246 156 304 172" />
          </g>
        )}
        {style.pattern === 'waves' && (
          <g stroke={style.trim} strokeWidth="7" fill="none" opacity="0.55">
            <path d="M128 334 C164 304 204 360 244 330 S294 312 324 344" />
            <path d="M118 370 C160 338 202 392 246 358 S296 342 330 376" />
          </g>
        )}
        {style.pattern === 'armor' && (
          <g stroke={style.trim} strokeWidth="5" opacity="0.42">
            <path d="M142 128 L288 128" />
            <path d="M134 170 L296 170" />
            <path d="M134 212 L296 212" />
          </g>
        )}
        {style.pattern === 'side' && (
          <g fill={style.side} opacity="0.72">
            <path d="M126 132 C154 198 154 384 140 516 H132 Z" />
            <path d="M304 132 C276 198 276 384 290 516 H298 Z" />
          </g>
        )}

        <g textAnchor="middle" fontFamily="Impact, Arial Black, Arial, sans-serif">
          {!isBack && (
            <>
              <text x="215" y="170" fontSize="40" fill={style.chest} stroke={style.outline} strokeWidth="2.5" paintOrder="stroke" letterSpacing="1.3">
                {team.nombre.toUpperCase()}
              </text>
              <image href={teamLogoSrc(team)} x="187" y="72" width="56" height="56" preserveAspectRatio="xMidYMid meet" />
              <text x="100" y="115" transform="rotate(-18 100 115)" fontSize="30" fill={style.number} stroke={style.outline} strokeWidth="2" paintOrder="stroke">
                {displayNumber}
              </text>
              <text x="330" y="115" transform="rotate(18 330 115)" fontSize="30" fill={style.number} stroke={style.outline} strokeWidth="2" paintOrder="stroke">
                {displayNumber}
              </text>
            </>
          )}
          {isBack && (
            <text x="215" y="154" fontSize="38" fill={style.chest} stroke={style.outline} strokeWidth="2.5" paintOrder="stroke" letterSpacing="1.2">
              {displayName}
            </text>
          )}
          <text x="215" y={isBack ? 330 : 352} fontSize="154" fill={style.number} stroke={style.outline} strokeWidth="9" paintOrder="stroke">
            {displayNumber}
          </text>
        </g>

        {!isBack && (
          <g>
            <rect x="238" y="454" width="48" height="24" rx="3" fill="#111827" opacity="0.82" />
            <rect x="242" y="458" width="17" height="16" rx="2" fill={style.trim} />
            <text x="268" y="469" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="7" fill="#ffffff" fontWeight="700">
              MDP
            </text>
          </g>
        )}
        <path d="M134 78 C148 226 146 378 138 502" stroke="#000000" strokeWidth="2" opacity="0.12" />
        <path d="M296 78 C282 226 284 378 292 502" stroke="#ffffff" strokeWidth="2" opacity="0.2" />
        <path d="M138 498 C172 510 258 510 292 498" fill="none" stroke="#000000" strokeWidth="2" opacity="0.18" />
      </g>
    </svg>
  );
}

function JerseyPreview({ team, name, number }) {
  const style = TEAM_STYLES[team.nombre] || TEAM_STYLES.Acorazados;

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/5] flex items-center justify-center [perspective:1200px]">
      <style>{`
        @keyframes jerseySpin {
          0%, 24% { transform: rotateY(-18deg) rotateX(3deg); }
          38%, 62% { transform: rotateY(198deg) rotateX(3deg); }
          76%, 100% { transform: rotateY(342deg) rotateX(3deg); }
        }
      `}</style>
      <div className="absolute inset-x-12 bottom-3 h-9 rounded-full bg-black/50 blur-xl" />
      <div className="relative w-full h-full [transform-style:preserve-3d] animate-[jerseySpin_9s_ease-in-out_infinite]">
        {[-18, -12, -6, 0, 6, 12, 18].map((z, i) => (
          <div
            key={z}
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `translateZ(${z}px) scale(${1 - Math.abs(z) * 0.0018})`,
              opacity: i === 3 ? 0.32 : 0.12,
              filter: 'blur(0.2px)',
            }}
          >
            <svg viewBox="0 0 430 560" className="w-full h-full">
              <path
                d="M143 59 C160 42 179 35 215 35 C251 35 270 42 287 59 L376 92 C400 101 413 123 408 149 L390 242 C386 264 371 276 350 271 L304 260 L292 498 C291 515 279 525 262 525 H168 C151 525 139 515 138 498 L126 260 L80 271 C59 276 44 264 40 242 L22 149 C17 123 30 101 54 92 Z"
                fill={i < 3 ? style.side : i > 3 ? '#0b1220' : style.body}
              />
            </svg>
          </div>
        ))}
        <div
          className="absolute left-[10%] top-[19%] h-[62%] w-16 rounded-[50%] blur-[1px]"
          style={{
            background: `linear-gradient(90deg, ${style.side}, rgba(0,0,0,.45))`,
            transform: 'rotateY(88deg) translateZ(178px)',
          }}
        />
        <div
          className="absolute right-[10%] top-[19%] h-[62%] w-16 rounded-[50%] blur-[1px]"
          style={{
            background: `linear-gradient(90deg, rgba(255,255,255,.12), ${style.side})`,
            transform: 'rotateY(88deg) translateZ(-178px)',
          }}
        />
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:translateZ(24px)]">
          <JerseyFace team={team} name={name} number={number} side="front" />
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(24px)]">
          <JerseyFace team={team} name={name} number={number} side="back" />
        </div>
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
