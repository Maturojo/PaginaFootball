export const FALLBACK_PRODUCTS = [
  {
    _id: 'camiseta-oficial-liga',
    nombre: 'Camiseta Oficial Liga',
    precio: 3500,
    descripcion: 'Camiseta oficial de la Liga de Football Americano MDP.',
    categoria: 'Indumentaria',
    stock: 20,
    whatsapp: '5492235000000',
  },
  {
    _id: 'gorra-liga-mdp',
    nombre: 'Gorra Liga MDP',
    precio: 1800,
    descripcion: 'Gorra bordada con el logo de la liga.',
    categoria: 'Accesorios',
    stock: 15,
    whatsapp: '5492235000000',
  },
  {
    _id: 'pelota-oficial',
    nombre: 'Pelota Oficial',
    precio: 4200,
    descripcion: 'Pelota reglamentaria para entrenamiento.',
    categoria: 'Equipamiento',
    stock: 5,
    whatsapp: '5492235000000',
  },
];

export function findFallbackProduct(id) {
  return FALLBACK_PRODUCTS.find(product => product._id === id);
}
