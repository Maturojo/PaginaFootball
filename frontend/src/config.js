// Local: http://localhost:5000 | Producción (mismo dominio): ''
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
