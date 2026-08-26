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
    stats: { partidos: 3, touchdowns: 14, intercepciones: 0, yardas: 854 },
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
    stats: { partidos: 3, touchdowns: 3, intercepciones: 1, yardas: 210 },
  }),
  player({
    equipo: 'Tridentes',
    numero: 21,
    nombre: 'Ignacio Cuesta',
    posicion: 'WR',
    capitan: true,
    stats: { partidos: 2, touchdowns: 3, intercepciones: 1, yardas: 150 },
  }),
  player({
    equipo: 'Tridentes',
    numero: 48,
    nombre: 'Mauro Castillo',
    posicion: 'WR',
    stats: { partidos: 3, touchdowns: 4, intercepciones: 0, yardas: 193 },
  }),
  player({ equipo: 'Tridentes', numero: 26, nombre: 'Nicolás Iglesia', posicion: 'WR' }),
  player({ equipo: 'Tridentes', numero: 69, nombre: 'Gabriel Sosa', posicion: 'C', capitan: true }),
  player({ equipo: 'Tridentes', numero: 90, nombre: 'Luciano Escobar', posicion: 'WR' }),
  player({
    equipo: 'Tridentes',
    numero: 74,
    nombre: 'Iñaki Irurzun',
    posicion: 'C',
    stats: { partidos: 2, touchdowns: 2, intercepciones: 0, yardas: 110 },
  }),
  player({ equipo: 'Tridentes', numero: 79, nombre: 'Diego Parrotta', posicion: 'R', stats: { partidos: 1, touchdowns: 0, intercepciones: 0, yardas: 5 } }),
  player({ equipo: 'Tridentes', numero: 'S/N', nombre: 'Francisco Toni', posicion: 'WR', stats: { partidos: 1, touchdowns: 1, intercepciones: 0, yardas: 3 } }),

  player({
    equipo: 'Krakens',
    numero: 53,
    nombre: 'Ángel Ávila',
    posicion: 'QB',
    stats: { partidos: 4, touchdowns: 12, intercepciones: 3, yardas: 830 },
  }),
  player({
    equipo: 'Krakens',
    numero: 16,
    nombre: 'Lucas Gabotto',
    posicion: 'WR',
    capitan: true,
    esMVP: true,
    stats: { partidos: 4, touchdowns: 4, intercepciones: 5, yardas: 534 },
  }),
  player({
    equipo: 'Krakens',
    numero: 85,
    nombre: 'Julián Fernández',
    posicion: 'WR',
    stats: { partidos: 2, touchdowns: 3, intercepciones: 0, yardas: 67 },
  }),
  player({
    equipo: 'Krakens',
    numero: 9,
    nombre: 'Elvis Rodríguez',
    posicion: 'WR',
    stats: { partidos: 2, touchdowns: 2, intercepciones: 0, yardas: 95 },
  }),
  player({
    equipo: 'Krakens',
    numero: 14,
    nombre: 'Renzo Amado',
    posicion: 'C',
    capitan: true,
    stats: { partidos: 3, touchdowns: 0, intercepciones: 0, yardas: 55 },
  }),
  player({
    equipo: 'Krakens',
    numero: 34,
    nombre: 'Rubén Gabotto',
    posicion: 'WR',
    stats: { partidos: 1, touchdowns: 1, intercepciones: 0, yardas: 6 },
  }),
  player({ equipo: 'Krakens', numero: 82, nombre: 'Ignacio Ríos', posicion: 'WR', stats: { partidos: 2, touchdowns: 0, intercepciones: 0, yardas: 43 } }),
  player({ equipo: 'Krakens', numero: 38, nombre: 'Leandro Cattaneo', posicion: 'WR', stats: { partidos: 1, touchdowns: 0, intercepciones: 0, yardas: 20 } }),
  player({ equipo: 'Krakens', numero: 23, nombre: 'Jano Nisonni', posicion: 'WR' }),
  player({ equipo: 'Krakens', numero: 99, nombre: 'Jonathan Baldovino', posicion: 'Jugador', stats: { partidos: 1, touchdowns: 0, intercepciones: 0, yardas: 15 } }),
  player({ equipo: 'Krakens', numero: 6, nombre: 'Daniel Montes', posicion: 'WR', stats: { partidos: 3, touchdowns: 1, intercepciones: 0, yardas: 49 } }),
  player({ equipo: 'Krakens', numero: '00', nombre: 'Mateo Pignol', posicion: 'WR' }),

  player({
    equipo: 'Liebres',
    numero: 19,
    nombre: 'Agustín Luporini',
    posicion: 'QB',
    capitan: true,
    stats: { partidos: 3, touchdowns: 11, intercepciones: 2, yardas: 612 },
  }),
  player({
    equipo: 'Liebres',
    numero: 11,
    nombre: 'Matías Rojo',
    posicion: 'WR',
    stats: { partidos: 2, touchdowns: 2, intercepciones: 3, yardas: 157 },
  }),
  player({
    equipo: 'Liebres',
    numero: 25,
    nombre: 'Emiliano Sánchez',
    posicion: 'WR',
    capitan: true,
    stats: { partidos: 3, touchdowns: 5, intercepciones: 2, yardas: 152 },
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
  player({ equipo: 'Liebres', numero: 21, nombre: 'Lauro Ibarra', posicion: 'C', stats: { partidos: 2, touchdowns: 0, intercepciones: 0, yardas: 21 } }),
  player({ equipo: 'Liebres', numero: 37, nombre: 'Héctor González', posicion: 'WR', stats: { partidos: 2, touchdowns: 3, intercepciones: 0, yardas: 170 } }),
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
