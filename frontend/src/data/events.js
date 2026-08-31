export const FALLBACK_EVENTS = [
  {
    _id: 'agenda-flag-masculino-2026',
    titulo: 'Agenda 2026 - Flag Masculino',
    descripcion: 'XI Tazón del Mar: 5, 12 y 19 de septiembre; 3, 17 y 24 de octubre; final el 7 de noviembre. Torneo Nacional FABA el 21 y 22 de noviembre en Buenos Aires.',
    fecha: '2026-09-05',
    lugar: 'Mar del Plata / Buenos Aires',
    fotos: ['/eventos/agenda-flag-masculino-2026.jpeg'],
  },
  {
    _id: 'agenda-flag-femenino-2026',
    titulo: 'Agenda 2026 - Flag Femenino',
    descripcion: 'Jornada abierta Flag Football desde cero el 12 de septiembre. Partidos Sirenas vs Corales el 26 de septiembre, 31 de octubre y 28 de noviembre. Torneo Nacional FABA el 10 y 11 de octubre en Buenos Aires.',
    fecha: '2026-09-12',
    lugar: 'Mar del Plata / Buenos Aires',
    fotos: ['/eventos/agenda-flag-femenino-2026.jpeg'],
  },
  {
    _id: 'agenda-atlantes-2026',
    titulo: 'Agenda 2026 - Atlantes Football Equipado',
    descripcion: 'Competencia local: Bárbaros vs Templarios el 26 de septiembre y 31 de octubre. Atlantes vs Centauros en noviembre, fecha a confirmar.',
    fecha: '2026-09-26',
    lugar: 'Mar del Plata',
    fotos: ['/eventos/agenda-atlantes-2026.jpeg'],
  },
  {
    _id: 'nereidas-sumate-2026',
    titulo: 'Nereidas - Sumate al equipo',
    descripcion: 'Entrenamientos de Flag Football Femenino. No necesitás experiencia. Miércoles de 18 a 20 h y sábados de 13 a 14:30 h en Centro Naval, Mar del Plata. Instagram: @nereidasflagfem.',
    fecha: '2026-08-26',
    lugar: 'Centro Naval, Mar del Plata',
    fotos: ['/eventos/nereidas-sumate-2026.jpeg'],
  },
];

export function findFallbackEvent(id) {
  return FALLBACK_EVENTS.find(event => event._id === id);
}
