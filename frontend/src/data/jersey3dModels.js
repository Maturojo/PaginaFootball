const DEFAULT_R2_MODELS_URL = 'https://pub-8135ce8537024b8b97f74cd7e9ef8619.r2.dev';
const R2_MODELS_URL = (import.meta.env.VITE_R2_MODELS_URL || DEFAULT_R2_MODELS_URL).replace(/\/$/, '');

function r2ModelUrl(fileName, version = 1) {
  return `${R2_MODELS_URL}/models/${fileName}?v=${version}`;
}

export const BASE_JERSEY_MODEL_URL = r2ModelUrl('jersey-base.glb');

export const TEAM_MODEL_URLS = {
  barbaros: r2ModelUrl('barbaros.glb'),
  krakens: r2ModelUrl('krakens-v1.glb'),
  liebres: r2ModelUrl('liebres.glb'),
  nereidas: r2ModelUrl('nereidas.glb', 2),
  templarios: r2ModelUrl('templarios.glb'),
  tridentes: r2ModelUrl('tridentes-v1.glb'),
};

function normalizeTeamKey(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function getTeamModelUrl(team) {
  return [team?._id, team?.nombre]
    .map(normalizeTeamKey)
    .map(key => TEAM_MODEL_URLS[key])
    .find(Boolean);
}

export function hasTeamModel(team) {
  return Boolean(getTeamModelUrl(team));
}
