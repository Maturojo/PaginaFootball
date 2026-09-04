export const STORE_PRODUCT_NAMES = new Set([
  'remera 10 años',
  'remera de entrenamiento - city hall',
]);

export const FALLBACK_PRODUCTS = [
  {
    _id: 'remera-10-anos',
    nombre: 'Remera 10 años',
    precio: 25000,
    descripcion: 'Remera conmemorativa FAMDQ 10 años, diseño blanco con frente y dorso.',
    categoria: 'Indumentaria',
    stock: 20,
    whatsapp: '5492236661385',
    imagen: '/tienda/remera-10-anos-frente.jpg',
    imagenes: [
      '/tienda/remera-10-anos-frente.jpg',
      '/tienda/remera-10-anos-dorso.jpg',
    ],
  },
  {
    _id: 'remera-entrenamiento-city-hall',
    nombre: 'Remera de entrenamiento - CITY HALL',
    precio: 25000,
    descripcion: 'Remera de entrenamiento FAMDQ City Hall, diseño azul con frente y dorso.',
    categoria: 'Indumentaria',
    stock: 20,
    whatsapp: '5492236661385',
    imagen: '/tienda/remera-entrenamiento-city-hall-frente.png',
    imagenes: [
      '/tienda/remera-entrenamiento-city-hall-frente.png',
      '/tienda/remera-entrenamiento-city-hall-dorso.png',
    ],
  },
];

export function isStoreProduct(product) {
  return STORE_PRODUCT_NAMES.has(product.nombre?.toLowerCase());
}

export function findFallbackProduct(id) {
  return FALLBACK_PRODUCTS.find(product => product._id === id);
}

export function mergeFallbackProducts(products) {
  const visibleProducts = products.filter(isStoreProduct);
  const names = new Set(visibleProducts.map(product => product.nombre?.toLowerCase()));
  const missing = FALLBACK_PRODUCTS.filter(product => !names.has(product.nombre.toLowerCase()));
  return [...missing, ...visibleProducts];
}
