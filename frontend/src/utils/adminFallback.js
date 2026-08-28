export function isMongoId(id) {
  return /^[0-9a-fA-F]{24}$/.test(String(id || ''));
}

export function markFallbackItems(items = []) {
  return items.map(item => ({ ...item, __fallback: true }));
}

export function fallbackDeleteMessage() {
  alert('Este dato viene fijo del sitio. Editalo y guardalo primero para copiarlo al admin, y despues vas a poder eliminarlo desde la base.');
}

export function imageSource(src, apiUrl) {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('/tienda') || src.startsWith('/eventos') || src.startsWith('/logos') || src.startsWith('/jugadores')) {
    return src;
  }
  return src.startsWith('/') ? `${apiUrl}${src}` : src;
}
