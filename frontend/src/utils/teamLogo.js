import { API_URL } from '../config.js';

const TEAM_LOGOS = {
  acorazados: '/equipos/acorazados.png',
  atlantes: '/equipos/atlantes.png',
  barbaros: '/equipos/barbaros.png',
  krakens: '/equipos/krakens.png',
  liebres: '/equipos/liebres.png',
  nereidas: '/equipos/nereidas.png',
  sirenas: '/equipos/sirenas.png',
  corales: '/equipos/corales.png',
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
  const fallbackLogo = TEAM_LOGOS[teamSlug(team?.nombre)];
  const logo = team?.logo;
  if (logo) {
    if (logo.startsWith('http')) return logo;
    if (logo.startsWith('/equipos/')) return fallbackLogo || logo;
    return `${API_URL}${logo}`;
  }

  return fallbackLogo || null;
}
