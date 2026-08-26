const baseStats = {
  partidos: 0,
  touchdowns: 0,
  intercepciones: 0,
  yardas: 0,
};

function player({ equipo, numero, nombre, posicion, capitan = false, esMVP = false, stats = {} }) {
  const id = `${equipo}-${numero}-${nombre}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    _id: `fallback-${id}`,
    equipo,
    numero,
    nombre,
    posicion,
    esMVP,
    stats: { ...baseStats, ...stats },
    bio: `Roster X Tazón del Mar - ${equipo}${capitan ? ' · Capitán' : ''}.`,
  };
}

export const FALLBACK_PLAYERS = [
  player({
    equipo: 'Tridentes',
    numero: 8,
    nombre: 'Javier Papagni',
    posicion: 'QB',
    stats: { partidos: 5, touchdowns: 23, intercepciones: 0, yardas: 1348 },
  }),
  player({
    equipo: 'Tridentes',
    numero: 82,
    nombre: 'Emanuel Rodríguez',
    posicion: 'WR',
    stats: { partidos: 1, touchdowns: 0, intercepciones: 0, yardas: 47 },
  }),
  player({
    equipo: 'Tridentes',
    numero: 19,
    nombre: 'Pablo Corva',
    posicion: 'WR',
    stats: { partidos: 4, touchdowns: 3, intercepciones: 1, yardas: 217 },
  }),
  player({
    equipo: 'Tridentes',
    numero: 21,
    nombre: 'Ignacio Cuesta',
    posicion: 'WR',
    capitan: true,
    stats: { partidos: 4, touchdowns: 6, intercepciones: 3, yardas: 306 },
  }),
  player({
    equipo: 'Tridentes',
    numero: 48,
    nombre: 'Mauro Castillo',
    posicion: 'WR',
    stats: { partidos: 4, touchdowns: 6, intercepciones: 0, yardas: 297 },
  }),
  player({ equipo: 'Tridentes', numero: 26, nombre: 'Nicolás Iglesia', posicion: 'WR' }),
  player({ equipo: 'Tridentes', numero: 69, nombre: 'Gabriel Sosa', posicion: 'C', capitan: true }),
  player({ equipo: 'Tridentes', numero: 90, nombre: 'Luciano Escobar', posicion: 'WR' }),
  player({
    equipo: 'Tridentes',
    numero: 74,
    nombre: 'Iñaki Irurzun',
    posicion: 'C',
    stats: { partidos: 4, touchdowns: 6, intercepciones: 1, yardas: 233 },
  }),
  player({ equipo: 'Tridentes', numero: 79, nombre: 'Diego Parrotta', posicion: 'R', stats: { partidos: 2, touchdowns: 0, intercepciones: 0, yardas: 57 } }),
  player({ equipo: 'Tridentes', numero: 'S/N', nombre: 'Francisco Toni', posicion: 'WR', stats: { partidos: 2, touchdowns: 1, intercepciones: 0, yardas: 45 } }),

  player({
    equipo: 'Krakens',
    numero: 53,
    nombre: 'Ángel Ávila',
    posicion: 'QB',
    stats: { partidos: 6, touchdowns: 16, intercepciones: 3, yardas: 1175 },
  }),
  player({
    equipo: 'Krakens',
    numero: 16,
    nombre: 'Lucas Gabotto',
    posicion: 'WR',
    capitan: true,
    esMVP: true,
    stats: { partidos: 6, touchdowns: 8, intercepciones: 7, yardas: 670 },
  }),
  player({
    equipo: 'Krakens',
    numero: 85,
    nombre: 'Julián Fernández',
    posicion: 'WR',
    stats: { partidos: 3, touchdowns: 3, intercepciones: 0, yardas: 112 },
  }),
  player({
    equipo: 'Krakens',
    numero: 9,
    nombre: 'Elvis Rodríguez',
    posicion: 'WR',
    stats: { partidos: 4, touchdowns: 7, intercepciones: 1, yardas: 399 },
  }),
  player({
    equipo: 'Krakens',
    numero: 14,
    nombre: 'Renzo Amado',
    posicion: 'C',
    capitan: true,
    stats: { partidos: 5, touchdowns: 0, intercepciones: 0, yardas: 92 },
  }),
  player({
    equipo: 'Krakens',
    numero: 34,
    nombre: 'Rubén Gabotto',
    posicion: 'WR',
    stats: { partidos: 1, touchdowns: 1, intercepciones: 0, yardas: 6 },
  }),
  player({ equipo: 'Krakens', numero: 82, nombre: 'Ignacio Ríos', posicion: 'WR', stats: { partidos: 4, touchdowns: 1, intercepciones: 1, yardas: 127 } }),
  player({ equipo: 'Krakens', numero: 38, nombre: 'Leandro Cattaneo', posicion: 'WR', stats: { partidos: 1, touchdowns: 0, intercepciones: 0, yardas: 20 } }),
  player({ equipo: 'Krakens', numero: 23, nombre: 'Jano Nisonni', posicion: 'WR', stats: { partidos: 1, touchdowns: 0, intercepciones: 0, yardas: 15 } }),
  player({ equipo: 'Krakens', numero: 99, nombre: 'Jonathan Baldovino', posicion: 'Jugador', stats: { partidos: 2, touchdowns: 0, intercepciones: 0, yardas: 15 } }),
  player({ equipo: 'Krakens', numero: 6, nombre: 'Daniel Montes', posicion: 'WR', stats: { partidos: 3, touchdowns: 1, intercepciones: 0, yardas: 49 } }),
  player({ equipo: 'Krakens', numero: '00', nombre: 'Mateo Pignol', posicion: 'WR' }),

  player({
    equipo: 'Liebres',
    numero: 19,
    nombre: 'Agustín Luporini',
    posicion: 'QB',
    capitan: true,
    stats: { partidos: 4, touchdowns: 12, intercepciones: 2, yardas: 771 },
  }),
  player({
    equipo: 'Liebres',
    numero: 11,
    nombre: 'Matías Rojo',
    posicion: 'WR',
    stats: { partidos: 4, touchdowns: 2, intercepciones: 4, yardas: 253 },
  }),
  player({
    equipo: 'Liebres',
    numero: 25,
    nombre: 'Emiliano Sánchez',
    posicion: 'WR',
    capitan: true,
    stats: { partidos: 5, touchdowns: 7, intercepciones: 3, yardas: 258 },
  }),
  player({ equipo: 'Liebres', numero: 37, nombre: 'Gustavo Duarte', posicion: 'WR' }),
  player({
    equipo: 'Liebres',
    numero: 13,
    nombre: 'Joel Gamarra',
    posicion: 'WR',
    stats: { partidos: 3, touchdowns: 0, intercepciones: 1, yardas: 25 },
  }),
  player({
    equipo: 'Liebres',
    numero: 42,
    nombre: 'Juan Cruz Rodríguez',
    posicion: 'WR',
    stats: { partidos: 1, touchdowns: 0, intercepciones: 0, yardas: 0 },
  }),
  player({ equipo: 'Liebres', numero: '00', nombre: 'Germán Romero', posicion: 'C' }),
  player({
    equipo: 'Liebres',
    numero: 60,
    nombre: 'Lucas Yuntunen',
    posicion: 'R',
    stats: { partidos: 1, touchdowns: 0, intercepciones: 0, yardas: 0 },
  }),
  player({ equipo: 'Liebres', numero: 21, nombre: 'Lauro Ibarra', posicion: 'C', stats: { partidos: 4, touchdowns: 0, intercepciones: 0, yardas: 65 } }),
  player({ equipo: 'Liebres', numero: 37, nombre: 'Héctor González', posicion: 'WR', stats: { partidos: 4, touchdowns: 6, intercepciones: 0, yardas: 407 } }),
];

function normalizeKey(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function playerKey(player) {
  return [player.equipo, player.numero, player.nombre].map(normalizeKey).join('|');
}

export function mergePlayers(apiPlayers = []) {
  const safeApiPlayers = Array.isArray(apiPlayers) ? apiPlayers : [];
  const existing = new Set(safeApiPlayers.map(playerKey));
  const missingFallbacks = FALLBACK_PLAYERS.filter(player => !existing.has(playerKey(player)));

  return [...safeApiPlayers, ...missingFallbacks];
}

export function playersForTeam(teamName, players = FALLBACK_PLAYERS) {
  const normalizedTeam = normalizeKey(teamName);

  return players.filter(player => normalizeKey(player.equipo) === normalizedTeam);
}
