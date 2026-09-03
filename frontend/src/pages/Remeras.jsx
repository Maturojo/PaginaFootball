import { Component, lazy, Suspense, useMemo, useState } from 'react';
import {
  Check,
  ChevronRight,
  Hash,
  MessageCircle,
  Ruler,
  Scissors,
  Shirt,
  Sparkles,
  Type,
} from 'lucide-react';
import { hasTeamModel } from '../data/jersey3dModels.js';
import { FALLBACK_TEAMS } from '../data/teams.js';
import { teamLogoSrc, teamSlug } from '../utils/teamLogo.js';

const Jersey3DViewer = lazy(() => import('../components/Jersey3DViewer.jsx'));

const WHATSAPP_PHONE = '5492235000000';
const TALLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const TEAM_STYLES = {
  Acorazados: { body: '#f4f4f5', side: '#111827', trim: '#0f172a', chest: '#4b5563', number: '#111827', outline: '#6b7280', text: '#111827', pattern: 'clean' },
  Liebres: { body: '#f97316', side: '#111827', trim: '#fb923c', chest: '#111827', number: '#111827', outline: '#ffffff', text: '#ffffff', pattern: 'speed' },
  Krakens: { body: '#111827', side: '#7e22ce', trim: '#a78bfa', chest: '#ffffff', number: '#7e22ce', outline: '#bfdbfe', text: '#ffffff', pattern: 'side' },
  Tridentes: { body: '#991b1b', side: '#b45309', trim: '#facc15', chest: '#f8fafc', number: '#111827', outline: '#facc15', text: '#ffffff', pattern: 'bolts' },
  Nereidas: { body: '#38bdf8', body2: '#8b5cf6', side: '#075985', trim: '#ec4899', chest: '#f9a8d4', number: '#1d4ed8', outline: '#f472b6', text: '#ffffff', pattern: 'gradient' },
  Sirenas: { body: '#bca7d9', side: '#25264b', trim: '#f3eee1', chest: '#f8fafc', number: '#bca7d9', outline: '#f3eee1', text: '#ffffff', pattern: 'waves' },
  Corales: { body: '#0b1530', side: '#ec4899', trim: '#f472b6', chest: '#f8fafc', number: '#f8fafc', outline: '#db2777', text: '#ffffff', pattern: 'side' },
  Atlantes: { body: '#1d4ed8', side: '#0f172a', trim: '#38bdf8', chest: '#f8fafc', number: '#facc15', outline: '#ffffff', text: '#ffffff', pattern: 'waves' },
  Bárbaros: { body: '#111827', side: '#92400e', trim: '#d97706', chest: '#facc15', number: '#facc15', outline: '#111827', text: '#ffffff', pattern: 'armor' },
  Templarios: { body: '#374151', side: '#111827', trim: '#d4af37', chest: '#d4af37', number: '#d4af37', outline: '#111827', text: '#ffffff', pattern: 'clean' },
};

const TEAM_JERSEY_IMAGES = {
  acorazados: '/remeras/acorazados.jpeg',
  corales: '/remeras/corales.png',
  krakens: '/remeras/krakens.jpeg',
  sirenas: '/remeras/sirenas.png',
  tridentes: '/remeras/tridentes.jpeg',
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
  const clipId = `jersey-clip-${team._id}-${side}`;
  const bodyFill = style.body2 ? `url(#${gradientId})` : style.body;
  const silhouettePath = 'M148 55 L95 74 L32 108 C25 112 25 118 29 126 L61 190 C65 198 70 200 79 196 L105 183 L109 414 C109 432 119 440 137 442 H293 C311 440 321 432 321 414 L325 183 L351 196 C360 200 365 198 369 190 L401 126 C405 118 405 112 398 108 L335 74 L282 55 C269 81 245 96 215 96 C185 96 161 81 148 55 Z';

  return (
    <svg viewBox="0 0 430 470" role="img" aria-label={`${side === 'front' ? 'Frente' : 'Dorso'} remera ${team.nombre}`} className="w-full h-full drop-shadow-2xl">
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
        <clipPath id={clipId}>
          <path d={silhouettePath} />
        </clipPath>
      </defs>

      <g filter={`url(#${shadowId})`}>
        <path d={silhouettePath} fill={bodyFill} stroke="#ffffff" strokeOpacity="0.08" strokeWidth="2" />
        <path d="M95 74 L32 108 C25 112 25 118 29 126 L61 190 C65 198 70 200 79 196 L105 183 C109 132 124 86 148 55 Z" fill={style.side} />
        <path d="M282 55 L335 74 L398 108 C405 112 405 118 401 126 L369 190 C365 198 360 200 351 196 L325 183 C321 132 306 86 282 55 Z" fill={style.side} />
        <path d="M170 43 H260 L282 55 C269 83 245 98 215 98 C185 98 161 83 148 55 Z" fill={style.side} />
        <path d="M166 47 L195 92 L215 70 L235 92 L264 47" fill="none" stroke={style.trim} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M172 44 C190 39 240 39 258 44" stroke="#ffffff" strokeWidth="2" opacity="0.45" strokeLinecap="round" />
        <path d="M65 190 L31 116 M365 190 L399 116" stroke={style.trim} strokeWidth="9" strokeLinecap="round" opacity="0.95" />
        <path d={silhouettePath} fill={`url(#${gradientId}-shine)`} />
        <path d={silhouettePath} filter={`url(#${fabricId})`} opacity="0.55" />
        <path d="M133 77 C159 111 271 111 297 77" fill="none" stroke="#000000" strokeWidth="2" opacity="0.16" />
        <path d="M105 181 C145 207 285 207 325 181" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.12" />

        <g clipPath={`url(#${clipId})`}>
          {style.pattern === 'bolts' && (
            <g fill={style.trim} opacity="0.55">
              <path d="M166 102 L218 235 H180 L247 414 L205 262 H244 Z" />
              <path d="M262 112 L300 204 H272 L316 334 L260 182 H286 Z" opacity="0.62" />
            </g>
          )}
          {style.pattern === 'speed' && (
            <g stroke={style.trim} strokeWidth="9" strokeLinecap="round" opacity="0.5">
              <path d="M106 137 C166 116 256 116 324 136" />
              <path d="M106 167 C174 145 256 147 324 165" />
            </g>
          )}
          {style.pattern === 'waves' && (
            <g stroke={style.trim} strokeWidth="7" fill="none" opacity="0.55">
              <path d="M105 305 C154 275 200 331 244 301 S292 283 325 315" />
              <path d="M105 341 C155 309 201 363 247 329 S296 313 325 347" />
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
              <path d="M105 125 C135 190 134 324 116 426 H109 Z" />
              <path d="M325 125 C295 190 296 324 314 426 H321 Z" />
            </g>
          )}
        </g>

        <g textAnchor="middle" fontFamily="Impact, Arial Black, Arial, sans-serif">
          {!isBack && (
            <>
              <text x="215" y="154" fontSize="38" fill={style.chest} stroke={style.outline} strokeWidth="2.5" paintOrder="stroke" letterSpacing="1.3">
                {team.nombre.toUpperCase()}
              </text>
              <image href={teamLogoSrc(team)} x="190" y="61" width="50" height="50" preserveAspectRatio="xMidYMid meet" />
              <text x="83" y="119" transform="rotate(-18 83 119)" fontSize="26" fill={style.number} stroke={style.outline} strokeWidth="2" paintOrder="stroke">
                {displayNumber}
              </text>
              <text x="347" y="119" transform="rotate(18 347 119)" fontSize="26" fill={style.number} stroke={style.outline} strokeWidth="2" paintOrder="stroke">
                {displayNumber}
              </text>
            </>
          )}
          {isBack && (
            <text x="215" y="154" fontSize="38" fill={style.chest} stroke={style.outline} strokeWidth="2.5" paintOrder="stroke" letterSpacing="1.2">
              {displayName}
            </text>
          )}
          <text x="215" y={isBack ? 297 : 312} fontSize="132" fill={style.number} stroke={style.outline} strokeWidth="9" paintOrder="stroke">
            {displayNumber}
          </text>
        </g>

        {!isBack && (
          <g>
            <rect x="248" y="375" width="48" height="24" rx="3" fill="#111827" opacity="0.82" />
            <rect x="252" y="379" width="17" height="16" rx="2" fill={style.trim} />
            <text x="278" y="390" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="7" fill="#ffffff" fontWeight="700">
              MDP
            </text>
          </g>
        )}
        <path d="M105 82 C114 186 111 316 109 414" stroke="#000000" strokeWidth="2" opacity="0.12" />
        <path d="M325 82 C316 186 319 316 321 414" stroke="#ffffff" strokeWidth="2" opacity="0.2" />
        <path d="M109 414 C158 431 272 431 321 414" fill="none" stroke="#000000" strokeWidth="2" opacity="0.18" />
      </g>
    </svg>
  );
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext
      && (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    );
  } catch {
    return false;
  }
}

class ViewerErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    this.props.onError?.(error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function Jersey2DFallback({ team, name, number }) {
  const jerseyImage = TEAM_JERSEY_IMAGES[teamSlug(team.nombre)];

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute inset-x-12 bottom-3 h-10 rounded-full bg-black/45 blur-2xl" />
      <div className="absolute inset-8 rounded-full bg-accent/10 blur-3xl" />
      {jerseyImage ? (
        <img
          src={jerseyImage}
          alt={`Remera ${team.nombre}`}
          className="relative max-h-[94%] max-w-[88%] object-contain drop-shadow-2xl"
        />
      ) : (
        <div className="relative w-full h-full">
          <JerseyFace team={team} name={name} number={number} side="front" />
        </div>
      )}
    </div>
  );
}

function ViewerLoading() {
  return (
    <div className="grid h-full w-full place-items-center bg-secondary/60">
      <div className="flex flex-col items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-white/50">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
        Cargando visor 3D
      </div>
    </div>
  );
}

function JerseyPreview({ team, name, number }) {
  const [viewerFailed, setViewerFailed] = useState(false);
  const canUse3D = useMemo(() => supportsWebGL(), []);
  const teamHas3DModel = hasTeamModel(team);
  const fallback = <Jersey2DFallback team={team} name={name} number={number} />;

  return (
    <div className="relative mx-auto h-[330px] w-full max-w-md sm:h-[430px] lg:h-[500px] xl:h-[520px]">
      {!teamHas3DModel || !canUse3D || viewerFailed ? fallback : (
        <ViewerErrorBoundary fallback={fallback} onError={() => setViewerFailed(true)}>
          <Suspense fallback={<ViewerLoading />}>
            <Jersey3DViewer key={team._id || team.nombre} team={team} name={name} number={number} />
          </Suspense>
        </ViewerErrorBoundary>
      )}
    </div>
  );
}

export default function Remeras() {
  const equipos = FALLBACK_TEAMS.filter(team => !team.esSeleccion && !team.oculto);
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
    <div className="min-h-screen overflow-x-clip bg-primary pt-[72px] text-white">
      <section className="relative overflow-hidden border-b border-accent/20 bg-secondary px-4 py-10 sm:py-14 lg:py-16">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-blue-950/70 blur-3xl" />
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-accent-light">
            <Shirt className="h-4 w-4" aria-hidden="true" />
            Indumentaria oficial
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            Encargá tu remera
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/55 sm:mt-4 sm:text-lg">
            Elegí tu equipo, talle y personalización. Vas a ver el resultado mientras completás el pedido.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-5 px-3 py-5 sm:gap-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(390px,0.92fr)] lg:gap-6 lg:py-8 xl:grid-cols-[minmax(0,1fr)_500px]">
        <div className="order-2 rounded-2xl border border-accent/20 bg-secondary p-4 shadow-2xl shadow-black/10 sm:p-6 lg:order-1">
          <div className="mb-6 flex items-center gap-3 lg:mb-4">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-accent-light sm:text-sm">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Personalizá tu pedido
            </span>
            <div className="h-px flex-1 bg-accent/20" />
          </div>

          <div className="space-y-7 lg:space-y-5">
            <div>
              <div className="mb-3 flex items-end justify-between gap-3 lg:mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white/75">
                  <Shirt className="h-4 w-4 text-accent-light" aria-hidden="true" />
                  Equipo
                </div>
                <span className="flex items-center gap-1 text-[11px] text-white/35 sm:hidden">
                  Deslizá para ver más
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>
              <div className="scrollbar-none -mx-1 grid snap-x snap-mandatory auto-cols-[106px] grid-flow-col gap-2 overflow-x-auto px-1 pb-2 sm:mx-0 sm:grid-flow-row sm:grid-cols-4 sm:auto-cols-auto sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-7">
                {equipos.map(team => (
                  <button
                    key={team._id}
                    type="button"
                    onClick={() => setEquipoId(team._id)}
                    aria-pressed={equipoId === team._id}
                    className={`relative flex min-h-[94px] snap-start flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-secondary lg:min-h-[78px] lg:gap-1 lg:px-1 lg:py-2 ${
                      equipoId === team._id
                        ? 'border-accent bg-accent/20 text-white shadow-lg shadow-accent/10'
                        : 'border-white/10 bg-primary/55 text-white/55 hover:border-accent/50 hover:text-white'
                    }`}
                  >
                    {equipoId === team._id && (
                      <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-accent text-white">
                        <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                      </span>
                    )}
                    <img src={teamLogoSrc(team)} alt="" className="h-11 w-11 object-contain lg:h-9 lg:w-9" />
                    <span className="text-center text-xs font-bold leading-tight lg:text-[11px]">{team.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="jersey-name" className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/75">
                  <Type className="h-4 w-4 text-accent-light" aria-hidden="true" />
                  Nombre atrás
                </label>
                <input
                  id="jersey-name"
                  value={nombre}
                  onChange={e => setNombre(normalizeName(e.target.value))}
                  className="input min-h-12 bg-white text-base text-gray-900 lg:min-h-11 lg:py-2"
                  placeholder="TU NOMBRE"
                  maxLength={14}
                />
                <p className="mt-1.5 text-right text-xs text-white/30">{normalizeName(nombre).length}/14 caracteres</p>
              </div>
              <div>
                <label htmlFor="jersey-number" className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/75">
                  <Hash className="h-4 w-4 text-accent-light" aria-hidden="true" />
                  Número opcional
                </label>
                <input
                  id="jersey-number"
                  value={numero}
                  onChange={e => setNumero(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  className="input min-h-12 bg-white text-base text-gray-900 lg:min-h-11 lg:py-2"
                  placeholder="00"
                  inputMode="numeric"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/75">
                  <Ruler className="h-4 w-4 text-accent-light" aria-hidden="true" />
                  Talle
                </div>
                <div className="grid grid-cols-3 gap-2 lg:grid-cols-6 lg:gap-1.5">
                  {TALLES.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setTalle(size)}
                      aria-pressed={talle === size}
                      className={`h-11 rounded-lg border text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:h-11 ${
                        talle === size ? 'border-accent bg-accent text-white shadow-md shadow-accent/20' : 'border-white/10 bg-primary/50 text-white/60 hover:border-accent/50 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="jersey-cut" className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/75">
                  <Scissors className="h-4 w-4 text-accent-light" aria-hidden="true" />
                  Corte
                </label>
                <select id="jersey-cut" value={corte} onChange={e => setCorte(e.target.value)} className="input min-h-12 bg-white text-base text-gray-900 lg:min-h-11 lg:py-2">
                  <option>Unisex</option>
                  <option>Femenino</option>
                  <option>Niño/a</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="jersey-notes" className="mb-2 block text-sm font-semibold text-white/75">Notas para el pedido</label>
              <textarea
                id="jersey-notes"
                value={notas}
                onChange={e => setNotas(e.target.value)}
                className="input min-h-24 resize-none bg-white text-base text-gray-900 lg:min-h-20"
                rows={2}
                placeholder="Ej: consultar precio, forma de pago, retiro, etc."
              />
            </div>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-center font-extrabold text-white shadow-lg shadow-green-900/30 transition hover:bg-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary lg:min-h-12"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Encargar por WhatsApp
            </a>
            <p className="-mt-4 text-center text-xs leading-relaxed text-white/35">
              Se abrirá WhatsApp con todos los datos del pedido listos para enviar.
            </p>
          </div>
        </div>

        <div className="order-1 lg:order-2 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-2xl border border-accent/25 bg-secondary p-4 shadow-2xl shadow-black/20 sm:p-6">
            <div className="mb-2 flex items-center justify-between gap-4 sm:mb-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-light">Vista previa</p>
                  <span className="flex items-center gap-1 rounded-full bg-green-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    En vivo
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white sm:text-2xl">{equipo.nombre}</h2>
              </div>
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-white/10 bg-primary/45 sm:h-16 sm:w-16">
                <img src={teamLogoSrc(equipo)} alt={`Escudo de ${equipo.nombre}`} className="h-12 w-12 object-contain sm:h-14 sm:w-14" />
              </div>
            </div>
            <div className="rounded-xl bg-[radial-gradient(circle_at_center,rgba(74,140,196,0.12),transparent_68%)]">
              <JerseyPreview key={equipo._id || equipo.nombre} team={equipo} name={nombre} number={numero} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm sm:mt-5">
              <div className="min-w-0 rounded-lg border border-white/5 bg-primary/55 p-2.5 sm:p-3">
                <p className="text-[10px] uppercase tracking-wide text-white/35 sm:text-xs">Talle</p>
                <p className="mt-0.5 font-bold text-white">{talle}</p>
              </div>
              <div className="min-w-0 rounded-lg border border-white/5 bg-primary/55 p-2.5 sm:p-3">
                <p className="text-[10px] uppercase tracking-wide text-white/35 sm:text-xs">Nombre</p>
                <p className="mt-0.5 truncate font-bold text-white">{normalizeName(nombre) || '-'}</p>
              </div>
              <div className="min-w-0 rounded-lg border border-white/5 bg-primary/55 p-2.5 sm:p-3">
                <p className="text-[10px] uppercase tracking-wide text-white/35 sm:text-xs">Número</p>
                <p className="mt-0.5 font-bold text-white">{numero || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
