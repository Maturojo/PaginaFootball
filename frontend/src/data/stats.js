export const FALLBACK_PARTIDOS = [
  {
    _id: 'semifinal-tazon-del-mar-ix',
    jornada: 'Semifinal - Tazón del Mar IX',
    categoria: 'Liga Football Flag',
    equipoLocal: 'Krakens',
    equipoVisitante: 'Tridentes',
    fecha: '2026-06-01',
    estado: 'finalizado',
    golesLocal: 39,
    golesVisitante: 34,
    notas: 'KRAKENS\n• Lucas Gabotto: 5 rec 83 yds · 3 rush 65 yds 1 TD · 2 ints · 1 deflec · 2 flags\n• Angel Avila: 12/24 192 yds 2 TDs/3 ints · 1 rush 15 yds TD · 1 rec 11 yds · 1 int · 1 deflec · 4 flags\n• Elvis Rodriguez: 1/2 11 yds · 2 rec 56 yds · 2 deflecs · 5 flags\n\nTRIDENTES\n• Javier Papagni: 24/45 305 yds 4 TDs/3 int · 2 rush 13 yds\n• Pablo Corva: 8 rec 80 yds 1 TD · 1 int · 1 deflec · 4 flags\n• Mauro Castillo: 6 rec 100 yds 2 TDs',
  },
  {
    _id: 'final-tazon-del-mar-ix',
    jornada: 'Final - Tazón del Mar IX',
    categoria: 'Liga Football Flag',
    equipoLocal: 'Liebres',
    equipoVisitante: 'Krakens',
    fecha: '2026-06-08',
    estado: 'finalizado',
    golesLocal: 36,
    golesVisitante: 26,
    notas: 'LIEBRES CAMPEONES DEL TAZÓN DEL MAR IX',
  },
];

export const FALLBACK_STATS = [
  {
    _id: 'posiciones-tazon-del-mar-ix',
    temporada: 'Tazón del Mar IX',
    categoria: 'Liga Football Flag',
    descripcion: 'Posiciones finales Fecha 5 - FAMDQ',
    tabla: [
      { equipo: 'Liebres', PJ: 5, PG: 5, PP: 0, PF: 134, PC: 81, Pts: 15 },
      { equipo: 'Krakens', PJ: 5, PG: 3, PP: 2, PF: 137, PC: 81, Pts: 9 },
      { equipo: 'Tridentes', PJ: 5, PG: 2, PP: 3, PF: 91, PC: 145, Pts: 6 },
      { equipo: 'Acorazados', PJ: 5, PG: 0, PP: 5, PF: 71, PC: 126, Pts: 0 },
    ],
  },
];

export const FALLBACK_LIDERES = [
  {
    temporada: 'Tazón del Mar IX',
    tipo: 'premios',
    jugadores: [
      { premio: 'MVP — Jugador Más Valioso', jugador: 'Lucas Gabotto', numero: 16, equipo: 'KRA' },
      { premio: 'JOF — Jugador Ofensivo', jugador: 'Lucas Gabotto', numero: 16, equipo: 'KRA' },
      { premio: 'JD — Jugador Defensivo', jugador: 'Lucas Gabotto', numero: 16, equipo: 'KRA' },
      { premio: 'JEV — Jugador Evolución', jugador: 'Ángel Ávila', numero: 25, equipo: 'KRA' },
      { premio: 'NOV — Novato del Torneo', jugador: 'Leandro Cattaneo', numero: 98, equipo: 'KRA' },
    ],
  },
  {
    temporada: 'Tazón del Mar IX',
    tipo: 'equipo-ofensivo',
    jugadores: [
      { pos: 1, nombre: 'Lucas Gabotto', numero: 16, equipo: 'KRA', votos: 11 },
      { pos: 2, nombre: 'Matías Rojo', numero: 11, equipo: 'LIE', votos: 9 },
      { pos: 3, nombre: 'Agustín Luporini', numero: 19, equipo: 'LIE', votos: 7 },
      { pos: 3, nombre: 'Emma Rodríguez', numero: 82, equipo: 'TRI', votos: 7 },
      { pos: 5, nombre: 'Emiliano Sánchez', numero: 81, equipo: 'LIE', votos: 5 },
    ],
  },
  {
    temporada: 'Tazón del Mar IX',
    tipo: 'equipo-defensivo',
    jugadores: [
      { pos: 1, nombre: 'Lucas Gabotto', numero: 16, equipo: 'KRA', votos: 10 },
      { pos: 2, nombre: 'Matías Rojo', numero: 11, equipo: 'LIE', votos: 7 },
      { pos: 3, nombre: 'Elvis Rodríguez', numero: 9, equipo: 'KRA', votos: 6 },
      { pos: 4, nombre: 'Emma Rodríguez', numero: 82, equipo: 'TRI', votos: 4 },
      { pos: 4, nombre: 'Rubén Gabotto', numero: 34, equipo: 'KRA', votos: 4 },
    ],
  },
  {
    temporada: 'Final - Tazón del Mar IX',
    tipo: 'pase',
    jugadores: [
      { pos: 1, nombre: 'Agustin Luporini', equipo: 'LIE', pas: 27, com: 16, pct: 59, yds: 185, td: 4, int: 0 },
      { pos: 2, nombre: 'Angel Avila', equipo: 'KRA', pas: 35, com: 22, pct: 62, yds: 188, td: 4, int: 2 },
      { pos: 3, nombre: 'Lucas Gabotto', equipo: 'KRA', pas: 2, com: 1, pct: 50, yds: 13, td: 0, int: 1 },
    ],
  },
  {
    temporada: 'Final - Tazón del Mar IX',
    tipo: 'corrida',
    jugadores: [
      { pos: 1, nombre: 'Agustin Luporini', equipo: 'LIE', int: 5, yds: 46, prom: 9.2, td: 1 },
      { pos: 2, nombre: 'Angel Avila', equipo: 'KRA', int: 2, yds: 19, prom: 9.5, td: 0 },
      { pos: 3, nombre: 'Matias Rojo', equipo: 'LIE', int: 1, yds: 6, prom: 6.0, td: 0 },
    ],
  },
  {
    temporada: 'Final - Tazón del Mar IX',
    tipo: 'recepcion',
    jugadores: [
      { pos: 1, nombre: 'Matias Rojo', equipo: 'LIE', rec: 9, yds: 128, prom: 18.3, td: 2 },
      { pos: 2, nombre: 'Emiliano Sanchez', equipo: 'LIE', rec: 7, yds: 57, prom: 6.33, td: 2 },
      { pos: 3, nombre: 'Lucas Gabotto', equipo: 'KRA', rec: 7, yds: 94, prom: 13.4, td: 0 },
      { pos: 4, nombre: 'Julian Fernandez', equipo: 'KRA', rec: 6, yds: 40, prom: 6.6, td: 1 },
      { pos: 5, nombre: 'Elvis Rodriguez', equipo: 'KRA', rec: 5, yds: 28, prom: 5.6, td: 2 },
      { pos: 6, nombre: 'Renzo Amado', equipo: 'KRA', rec: 3, yds: 20, prom: 6.6, td: 0 },
      { pos: 7, nombre: 'Angel Avila', equipo: 'KRA', rec: 1, yds: 13, prom: 13.0, td: 0 },
      { pos: 8, nombre: 'Ruben Gabotto', equipo: 'KRA', rec: 1, yds: 6, prom: 6.0, td: 1 },
    ],
  },
  {
    temporada: 'Final - Tazón del Mar IX',
    tipo: 'intercepciones',
    jugadores: [
      { pos: 1, nombre: 'Emiliano Sanchez', equipo: 'LIE', ints: 1 },
      { pos: 1, nombre: 'Matias Rojo', equipo: 'LIE', ints: 1 },
      { pos: 1, nombre: 'Joel Gamarra', equipo: 'LIE', ints: 1 },
    ],
  },
  {
    temporada: 'Final - Tazón del Mar IX',
    tipo: 'sacks',
    jugadores: [
      { pos: 1, nombre: 'Juan Cruz Rodriguez', equipo: 'LIE', sacks: 1, safety: 1 },
    ],
  },
  {
    temporada: 'Final - Tazón del Mar IX',
    tipo: 'flags',
    jugadores: [
      { pos: 1, nombre: 'Agustin Luporini', equipo: 'LIE', flags: 6 },
      { pos: 2, nombre: 'Emiliano Sanchez', equipo: 'LIE', flags: 3 },
      { pos: 2, nombre: 'Joel Gamarra', equipo: 'LIE', flags: 3 },
      { pos: 2, nombre: 'Angel Avila', equipo: 'KRA', flags: 3 },
      { pos: 2, nombre: 'Lucas Gabotto', equipo: 'KRA', flags: 3 },
      { pos: 6, nombre: 'Matias Rojo', equipo: 'LIE', flags: 2 },
      { pos: 6, nombre: 'Elvis Rodriguez', equipo: 'KRA', flags: 2 },
      { pos: 8, nombre: 'Lucas Yuntunen', equipo: 'LIE', flags: 1 },
      { pos: 8, nombre: 'Juan Cruz Rodriguez', equipo: 'LIE', flags: 1 },
    ],
  },
  {
    temporada: 'Final - Tazón del Mar IX',
    tipo: 'deflecciones',
    jugadores: [
      { pos: 1, nombre: 'Elvis Rodriguez', equipo: 'KRA', deflec: 1 },
    ],
  },
];

export const FALLBACK_TEMPORADAS = [...new Set(FALLBACK_LIDERES.map(l => l.temporada))];

export function fallbackLideresByTemporada(temporada) {
  return FALLBACK_LIDERES.filter(l => l.temporada === temporada);
}
