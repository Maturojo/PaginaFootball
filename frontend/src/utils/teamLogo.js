import { API_URL } from '../config.js';

const TEAM_LOGOS = {
  acorazados: '/equipos/acorazados.png',
  atlantes: '/equipos/atlantes.png',
  barbaros: '/equipos/barbaros.png',
  krakens: '/equipos/krakens.png',
  liebres: '/equipos/liebres.png',
  nereidas: '/equipos/nereidas.png',
  sirenas: '/equipos/sirenas.jpg',
  corales: '/equipos/corales.jpg',
  templarios: '/equipos/templarios.png',
  tridentes: '/equipos/tridentes.png',
};

export function teamSlug(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

export function teamLogoSrc(team) {
  const logo = team?.logo;
  if (logo) {
    if (logo.startsWith('http')) return logo;
    if (logo.startsWith('/equipos/')) return logo;
    return `${API_URL}${logo}`;
  }

  return TEAM_LOGOS[teamSlug(team?.nombre)] || null;
}
