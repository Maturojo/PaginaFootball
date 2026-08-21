export const FALLBACK_EVENTS = [
  {
    _id: 'final-tazon-del-mar-ix',
    titulo: 'Final Tazón del Mar IX',
    descripcion: 'Liebres se consagró campeón ante Krakens en la final del Tazón del Mar IX.',
    fecha: '2026-06-08',
    lugar: 'Mar del Plata',
    fotos: [],
  },
  {
    _id: 'semifinal-tazon-del-mar-ix',
    titulo: 'Semifinal Tazón del Mar IX',
    descripcion: 'Krakens y Tridentes jugaron una semifinal intensa por el pase a la final.',
    fecha: '2026-06-01',
    lugar: 'Mar del Plata',
    fotos: [],
  },
];

export function findFallbackEvent(id) {
  return FALLBACK_EVENTS.find(event => event._id === id);
}
