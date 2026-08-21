const apiBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

// Local: http://localhost:5000 | Producción: mismo dominio.
export const API_URL = apiBaseUrl.replace(/\/api\/?$/, '');
