export const FALLBACK_TEAMS = [
  {
    _id: 'acorazados',
    nombre: 'Acorazados',
    descripcion: 'Los Acorazados de Mar del Plata, uno de los equipos mas fuertes de la liga.',
    colores: 'Gris y negro',
    anioFundacion: 2016,
    ciudad: 'Mar del Plata',
    categoria: 'Liga Football Flag',
    oculto: true,
    campeonatos: [],
  },
  {
    _id: 'liebres',
    nombre: 'Liebres',
    descripcion: 'Las Liebres, conocidas por su velocidad y agilidad en el campo de juego. Campeones del Tazón del Mar V, VI y IX.',
    colores: 'Naranja y negro',
    anioFundacion: 2016,
    ciudad: 'Mar del Plata',
    categoria: 'Liga Football Flag',
    campeonatos: ['Tazón del Mar V', 'Tazón del Mar VI', 'Tazón del Mar IX'],
  },
  {
    _id: 'krakens',
    nombre: 'Krakens',
    descripcion: 'Los Krakens, implacables y poderosos como la bestia que los representa. Campeones del Tazón del Mar IV y X.',
    colores: 'Violeta y negro',
    anioFundacion: 2016,
    ciudad: 'Mar del Plata',
    categoria: 'Liga Football Flag',
    campeonatos: ['Tazón del Mar IV', 'Tazón del Mar X'],
  },
  {
    _id: 'tridentes',
    nombre: 'Tridentes',
    descripcion: 'Los Tridentes, potencia ofensiva de la liga de football americano MDP.',
    colores: 'Verde y dorado',
    anioFundacion: 2016,
    ciudad: 'Mar del Plata',
    categoria: 'Liga Football Flag',
    campeonatos: ['Tazón del Mar I', 'Tazón del Mar II', 'Tazón del Mar III', 'Tazón del Mar VII', 'Tazón del Mar VIII'],
  },
  {
    _id: 'nereidas',
    nombre: 'Nereidas',
    descripcion: 'Las Nereidas, orgullo de la costa atlantica y unico equipo femenino de la liga.',
    colores: 'Azul y blanco',
    anioFundacion: 2016,
    ciudad: 'Mar del Plata',
    categoria: 'Football Flag Femenino',
  },
  {
    _id: 'sirenas',
    nombre: 'Sirenas',
    descripcion: 'Sirenas es uno de los equipos femeninos de flag football de Mar del Plata.',
    colores: 'Lila, blanco y azul',
    anioFundacion: 2025,
    ciudad: 'Mar del Plata',
    categoria: 'Football Flag Femenino',
  },
  {
    _id: 'corales',
    nombre: 'Corales',
    descripcion: 'Corales es uno de los equipos femeninos de flag football de Mar del Plata.',
    colores: 'Azul, rosa y blanco',
    anioFundacion: 2025,
    ciudad: 'Mar del Plata',
    categoria: 'Football Flag Femenino',
  },
  {
    _id: 'atlantes',
    nombre: 'Atlantes',
    descripcion: 'Atlantes es la seleccion de Mar del Plata en el formato 7vs7.',
    colores: 'Azul y dorado',
    anioFundacion: 2016,
    ciudad: 'Mar del Plata',
    categoria: 'Football Americano 7vs7',
    esSeleccion: true,
  },
  {
    _id: 'barbaros',
    nombre: 'Bárbaros',
    descripcion: 'Los Barbaros, equipo de Football Americano 7vs7 de Mar del Plata.',
    ciudad: 'Mar del Plata',
    categoria: 'Football Americano 7vs7',
  },
  {
    _id: 'templarios',
    nombre: 'Templarios',
    descripcion: 'Los Templarios, equipo de Football Americano 7vs7 de Mar del Plata.',
    ciudad: 'Mar del Plata',
    categoria: 'Football Americano 7vs7',
  },
];

function teamKey(team) {
  return String(team?.nombre || team?._id || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

function championshipDescription(team) {
  if (!team.campeonatos?.length) return team.descripcion;
  if (/campe[oó]n/i.test(team.descripcion || '')) return team.descripcion;

  const titles = team.campeonatos.join(', ');
  return `${team.descripcion || ''} Campeones de ${titles}.`.trim();
}

function withChampionshipBio(team) {
  return {
    ...team,
    descripcion: championshipDescription(team),
  };
}

export function mergeTeams(apiTeams = []) {
  const fallbackByKey = new Map(FALLBACK_TEAMS.map(team => [teamKey(team), team]));
  const mergedApiTeams = apiTeams.map(team => {
    const fallback = fallbackByKey.get(teamKey(team));
    return fallback
      ? withChampionshipBio({ ...fallback, ...team, campeonatos: team.campeonatos?.length ? team.campeonatos : fallback.campeonatos })
      : withChampionshipBio(team);
  });
  const existing = new Set(mergedApiTeams.map(teamKey));
  const missingFallbacks = FALLBACK_TEAMS.filter(team => !existing.has(teamKey(team)));
  return [...mergedApiTeams, ...missingFallbacks.map(withChampionshipBio)];
}
