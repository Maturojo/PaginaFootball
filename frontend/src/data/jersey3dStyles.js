const DEFAULT_STYLE = {
  body: '#e5e7eb',
  side: '#111827',
  trim: '#0f172a',
  chest: '#111827',
  number: '#111827',
  outline: '#ffffff',
  pattern: 'clean',
};

export const JERSEY_3D_STYLES = {
  acorazados: { body: '#f4f4f5', side: '#111827', trim: '#0f172a', chest: '#4b5563', number: '#111827', outline: '#d1d5db', pattern: 'clean' },
  liebres: { body: '#f97316', side: '#111827', trim: '#fb923c', chest: '#111827', number: '#111827', outline: '#ffffff', pattern: 'speed' },
  krakens: { body: '#101827', side: '#6d21c7', trim: '#a78bfa', chest: '#ffffff', number: '#7e22ce', outline: '#dbeafe', pattern: 'side' },
  tridentes: { body: '#991b1b', side: '#92400e', trim: '#facc15', chest: '#fff7ed', number: '#111827', outline: '#facc15', pattern: 'bolts' },
  nereidas: { body: '#38bdf8', body2: '#8b5cf6', side: '#075985', trim: '#ec4899', chest: '#f9a8d4', number: '#1d4ed8', outline: '#f9a8d4', pattern: 'gradient' },
  sirenas: { body: '#bca7d9', side: '#25264b', trim: '#f3eee1', chest: '#f8fafc', number: '#a78bca', outline: '#f3eee1', pattern: 'waves' },
  corales: { body: '#08142d', side: '#db2777', trim: '#f472b6', chest: '#f8fafc', number: '#f8fafc', outline: '#db2777', pattern: 'coral' },
  atlantes: { body: '#1d4ed8', side: '#0f172a', trim: '#38bdf8', chest: '#f8fafc', number: '#facc15', outline: '#ffffff', pattern: 'waves' },
  barbaros: { body: '#111827', side: '#78350f', trim: '#d97706', chest: '#facc15', number: '#facc15', outline: '#111827', pattern: 'armor' },
  templarios: { body: '#374151', side: '#111827', trim: '#d4af37', chest: '#d4af37', number: '#d4af37', outline: '#111827', pattern: 'clean' },
};

function normalizeTeamKey(team) {
  return String(team?._id || team?.nombre || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function getJersey3DStyle(team) {
  return JERSEY_3D_STYLES[normalizeTeamKey(team)] || DEFAULT_STYLE;
}
