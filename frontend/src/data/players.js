const baseStats = {
  partidos: 0,
  touchdowns: 0,
  intercepciones: 0,
  yardas: 0,
};

function player({ equipo, numero, nombre, posicion, capitan = false, esMVP = false, stats = {}, foto }) {
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
    foto,
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
    foto: '/jugadores/javier-papagni.png',
    stats: { partidos: 6, touchdowns: 23, intercepciones: 0, yardas: 1447 },
  }),
  player({
    equipo: 'Tridentes',
    numero: 82,
    nombre: 'Emanuel Rodríguez',
    posicion: 'WR',
    foto: '/jugadores/emanuel-rodriguez.png',
    stats: { partidos: 2, touchdowns: 0, intercepciones: 0, yardas: 53 },
  }),
  player({
    equipo: 'Tridentes',
    numero: 19,
    nombre: 'Pablo Corva',
    posicion: 'WR',
    foto: '/jugadores/pablo-corva.png',
    stats: { partidos: 5, touchdowns: 3, intercepciones: 1, yardas: 249 },
  }),
  player({
    equipo: 'Tridentes',
    numero: 21,
    nombre: 'Ignacio Cuesta',
    posicion: 'WR',
    capitan: true,
    foto: '/jugadores/ignacio-cuesta.png',
    stats: { partidos: 5, touchdowns: 6, intercepciones: 5, yardas: 339 },
  }),
  player({
    equipo: 'Tridentes',
    numero: 48,
    nombre: 'Mauro Castillo',
    posicion: 'WR',
    stats: { partidos: 5, touchdowns: 6, intercepciones: 0, yardas: 309 },
  }),
  player({ equipo: 'Tridentes', numero: 26, nombre: 'Nicolás Iglesia', posicion: 'WR' }),
  player({ equipo: 'Tridentes', numero: 69, nombre: 'Gabriel Sosa', posicion: 'C', capitan: true, foto: '/jugadores/gabriel-sosa.png' }),
  player({ equipo: 'Tridentes', numero: 90, nombre: 'Luciano Escobar', posicion: 'WR', foto: '/jugadores/luciano-escobar.png' }),
  player({ equipo: 'Tridentes', numero: 'S/N', nombre: 'Gerónimo Ferreyra', posicion: 'WR', foto: '/jugadores/geronimo-ferreyra.png' }),
  player({
    equipo: 'Tridentes',
    numero: 74,
    nombre: 'Iñaki Irurzun',
    posicion: 'C',
    stats: { partidos: 5, touchdowns: 3, intercepciones: 1, yardas: 248 },
  }),
  player({ equipo: 'Tridentes', numero: 79, nombre: 'Diego Parrotta', posicion: 'R', stats: { partidos: 3, touchdowns: 0, intercepciones: 0, yardas: 64 } }),
  player({ equipo: 'Tridentes', numero: 'S/N', nombre: 'Francisco Toni', posicion: 'WR', stats: { partidos: 2, touchdowns: 1, intercepciones: 0, yardas: 45 } }),

  player({
    equipo: 'Krakens',
    numero: 25,
    nombre: 'Ángel Ávila',
    posicion: 'QB',
    foto: '/jugadores/angel-avila.png',
    stats: { partidos: 7, touchdowns: 19, intercepciones: 4, yardas: 1393 },
  }),
  player({
    equipo: 'Krakens',
    numero: 2,
    nombre: 'Lucas Gabotto',
    posicion: 'WR',
    capitan: true,
    esMVP: true,
    foto: '/jugadores/lucas-gabotto.png',
    stats: { partidos: 7, touchdowns: 10, intercepciones: 7, yardas: 837 },
  }),
  player({
    equipo: 'Krakens',
    numero: 53,
    nombre: 'Julián Fernández',
    posicion: 'WR',
    foto: '/jugadores/julian-fernandez.png',
    stats: { partidos: 4, touchdowns: 4, intercepciones: 0, yardas: 154 },
  }),
  player({
    equipo: 'Krakens',
    numero: 9,
    nombre: 'Elvis Rodríguez',
    posicion: 'WR',
    stats: { partidos: 5, touchdowns: 9, intercepciones: 3, yardas: 522 },
  }),
  player({
    equipo: 'Krakens',
    numero: 17,
    nombre: 'Renzo Amado',
    posicion: 'C',
    capitan: true,
    foto: '/jugadores/renzo-amado.png',
    stats: { partidos: 6, touchdowns: 0, intercepciones: 0, yardas: 125 },
  }),
  player({
    equipo: 'Krakens',
    numero: 34,
    nombre: 'Rubén Gabotto',
    posicion: 'WR',
    stats: { partidos: 1, touchdowns: 1, intercepciones: 0, yardas: 6 },
  }),
  player({ equipo: 'Krakens', numero: 82, nombre: 'Ignacio Ríos', posicion: 'WR', stats: { partidos: 5, touchdowns: 1, intercepciones: 2, yardas: 127 } }),
  player({ equipo: 'Krakens', numero: 38, nombre: 'Leandro Cattaneo', posicion: 'WR', stats: { partidos: 2, touchdowns: 0, intercepciones: 0, yardas: 23 } }),
  player({ equipo: 'Krakens', numero: 23, nombre: 'Jano Nisonni', posicion: 'WR', stats: { partidos: 1, touchdowns: 0, intercepciones: 0, yardas: 15 } }),
  player({ equipo: 'Krakens', numero: 99, nombre: 'Jonathan Baldovino', posicion: 'Jugador', stats: { partidos: 2, touchdowns: 0, intercepciones: 0, yardas: 15 } }),
  player({ equipo: 'Krakens', numero: 6, nombre: 'Daniel Montes', posicion: 'WR', foto: '/jugadores/daniel-montes.png', stats: { partidos: 4, touchdowns: 2, intercepciones: 0, yardas: 97 } }),
  player({ equipo: 'Krakens', numero: '00', nombre: 'Mateo Pignol', posicion: 'WR', foto: '/jugadores/mateo-pignol.png' }),

  player({
    equipo: 'Liebres',
    numero: 19,
    nombre: 'Agustín Luporini',
    posicion: 'QB',
    capitan: true,
    foto: '/jugadores/agustin-luporini.png',
    stats: { partidos: 4, touchdowns: 12, intercepciones: 2, yardas: 771 },
  }),
  player({
    equipo: 'Liebres',
    numero: 11,
    nombre: 'Matías Rojo',
    posicion: 'WR',
    foto: '/jugadores/matias-rojo.png',
    stats: { partidos: 4, touchdowns: 4, intercepciones: 4, yardas: 253 },
  }),
  player({
    equipo: 'Liebres',
    numero: 25,
    nombre: 'Emiliano Sánchez',
    posicion: 'WR',
    capitan: true,
    foto: '/jugadores/emiliano-sanchez.png',
    stats: { partidos: 5, touchdowns: 7, intercepciones: 3, yardas: 290 },
  }),
  player({ equipo: 'Liebres', numero: 37, nombre: 'Gustavo Duarte', posicion: 'WR', foto: '/jugadores/gustavo-duarte.png' }),
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
    foto: '/jugadores/juan-cruz-rodriguez.png',
    stats: { partidos: 1, touchdowns: 0, intercepciones: 0, yardas: 0 },
  }),
  player({ equipo: 'Liebres', numero: '00', nombre: 'Germán Romero', posicion: 'C' }),
  player({
    equipo: 'Liebres',
    numero: 60,
    nombre: 'Lucas Yuntunen',
    posicion: 'R',
    foto: '/jugadores/lucas-yuntunen.png',
    stats: { partidos: 1, touchdowns: 0, intercepciones: 0, yardas: 0 },
  }),
  player({ equipo: 'Liebres', numero: 21, nombre: 'Lauro Ibarra', posicion: 'C', stats: { partidos: 4, touchdowns: 0, intercepciones: 0, yardas: 65 } }),
  player({ equipo: 'Liebres', numero: 37, nombre: 'Héctor González', posicion: 'WR', stats: { partidos: 4, touchdowns: 10, intercepciones: 0, yardas: 407 } }),
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

function playerNameKey(player) {
  return [player.equipo, player.nombre].map(normalizeKey).join('|');
}

export function mergePlayers(apiPlayers = []) {
  const safeApiPlayers = Array.isArray(apiPlayers) ? apiPlayers : [];
  const fallbackByKey = new Map(FALLBACK_PLAYERS.map(player => [playerKey(player), player]));
  const fallbackByName = new Map(FALLBACK_PLAYERS.map(player => [playerNameKey(player), player]));
  const mergedApiPlayers = safeApiPlayers.map(player => {
    const fallback = fallbackByKey.get(playerKey(player)) || fallbackByName.get(playerNameKey(player));
    return fallback
      ? {
          ...fallback,
          ...player,
          foto: player.foto || fallback.foto,
          stats: { ...fallback.stats, ...(player.stats || {}) },
        }
      : player;
  });
  const existing = new Set(mergedApiPlayers.map(playerKey));
  const existingByName = new Set(mergedApiPlayers.map(playerNameKey));
  const missingFallbacks = FALLBACK_PLAYERS.filter(player => !existing.has(playerKey(player)) && !existingByName.has(playerNameKey(player)));

  return [...mergedApiPlayers, ...missingFallbacks];
}

export function playersForTeam(teamName, players = FALLBACK_PLAYERS) {
  const normalizedTeam = normalizeKey(teamName);

  return players.filter(player => normalizeKey(player.equipo) === normalizedTeam);
}
