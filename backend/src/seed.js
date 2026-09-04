require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Team = require('./models/Team');
const Product = require('./models/Product');
const Page = require('./models/Page');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado a MongoDB');

  // Admin user
  const exists = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!exists) {
    await User.create({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    console.log('Admin creado:', process.env.ADMIN_EMAIL);
  }

  // Equipos — upsert por nombre para no perder logos ya subidos
  const equipos = [
    { nombre: 'Acorazados', descripcion: 'Los Acorazados de Mar del Plata, uno de los equipos más fuertes de la liga.', colores: 'Gris y negro', anioFundacion: 2016, ciudad: 'Mar del Plata', categoria: 'Liga Football Flag', activo: false },
    { nombre: 'Liebres', descripcion: 'Las Liebres, conocidas por su velocidad y agilidad en el campo de juego.', colores: 'Naranja y negro', anioFundacion: 2016, ciudad: 'Mar del Plata', categoria: 'Liga Football Flag' },
    { nombre: 'Krakens', descripcion: 'Los Krakens, implacables y poderosos como la bestia que los representa.', colores: 'Violeta y negro', anioFundacion: 2016, ciudad: 'Mar del Plata', categoria: 'Liga Football Flag' },
    { nombre: 'Tridentes', descripcion: 'Los Tridentes, potencia ofensiva de la liga de football americano MDP.', colores: 'Verde y dorado', anioFundacion: 2016, ciudad: 'Mar del Plata', categoria: 'Liga Football Flag' },
    { nombre: 'Nereidas', descripcion: 'Las Nereidas, nombradas en honor a las ninfas del mar, orgullo de la costa atlántica y único equipo femenino de la liga.', colores: 'Azul y blanco', anioFundacion: 2016, ciudad: 'Mar del Plata', categoria: 'Football Flag Femenino' },
    { nombre: 'Sirenas', descripcion: 'Sirenas es uno de los equipos femeninos de flag football de Mar del Plata.', colores: 'Lila, blanco y azul', anioFundacion: 2025, ciudad: 'Mar del Plata', categoria: 'Football Flag Femenino' },
    { nombre: 'Corales', descripcion: 'Corales es uno de los equipos femeninos de flag football de Mar del Plata.', colores: 'Azul, rosa y blanco', anioFundacion: 2025, ciudad: 'Mar del Plata', categoria: 'Football Flag Femenino' },
    { nombre: 'Atlantes', descripcion: 'Atlantes es la selección de Mar del Plata, representando lo mejor del football americano de la ciudad en el formato 7vs7.', colores: 'Azul y dorado', anioFundacion: 2016, ciudad: 'Mar del Plata', categoria: 'Football Americano 7vs7', esSeleccion: true },
    { nombre: 'Bárbaros', descripcion: 'Los Bárbaros, equipo de Football Americano 7vs7 de Mar del Plata.', ciudad: 'Mar del Plata', categoria: 'Football Americano 7vs7', proximamente: false },
    { nombre: 'Templarios', descripcion: 'Los Templarios, equipo de Football Americano 7vs7 de Mar del Plata.', ciudad: 'Mar del Plata', categoria: 'Football Americano 7vs7', proximamente: false },
  ];

  // Detectar logos automáticamente desde frontend/public/equipos/ sin importar extensión
  const fs = require('fs');
  const path = require('path');
  const equiposDir = path.join(__dirname, '../../frontend/public/equipos');

  const getLogoPath = (nombre) => {
    const nombreLimpio = nombre.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '') // quitar tildes
      .replace(/\s+/g, '-'); // espacios a guiones
    try {
      const archivos = fs.readdirSync(equiposDir);
      const archivo = archivos
        .filter(f => f.toLowerCase().startsWith(nombreLimpio))
        .sort((a, b) => {
          const aPng = a.toLowerCase().endsWith('.png') ? -1 : 0;
          const bPng = b.toLowerCase().endsWith('.png') ? -1 : 0;
          return aPng - bPng || a.localeCompare(b);
        })[0];
      return archivo ? `/equipos/${archivo}` : '';
    } catch { return ''; }
  };

  for (const e of equipos) {
    const existing = await Team.findOne({ nombre: e.nombre });
    const update = { ...e };
    // Preservar logo subido por admin (que empieza con /uploads/)
    // Reemplazar logos con URL localhost por la ruta correcta
    const logoActual = existing?.logo || '';
    const logoRepo = getLogoPath(e.nombre);
    if (logoActual.startsWith('https://res.cloudinary.com/')) {
      delete update.logo; // conservar logo subido a Cloudinary
    } else {
      // Usar logo del repo si existe, sino conservar el actual
      update.logo = logoRepo || logoActual || '';
    }
    await Team.findOneAndUpdate({ nombre: e.nombre }, update, { upsert: true, new: true });
  }
  console.log('Equipos actualizados (logos preservados)');

  // Productos
  const cityHallTrainingShirt = {
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
  };
  const anniversaryShirt = {
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
  };
  const fixedProducts = [anniversaryShirt, cityHallTrainingShirt];
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany(fixedProducts);
    console.log('Productos creados');
  }
  for (const product of fixedProducts) {
    await Product.findOneAndUpdate(
      { nombre: product.nombre },
      { $setOnInsert: product },
      { upsert: true, new: true }
    );
  }
  await Product.updateMany(
    { nombre: { $nin: fixedProducts.map(product => product.nombre) } },
    { $set: { activo: false } }
  );

  // Páginas
  const lucasTestimonio = {
    nombre: 'Lucas Gabotto',
    rol: 'Jugador',
    texto: 'Estos diez años en la liga fueron una experiencia muy buena para mí. Fui mejorando de a poco, pasando de tener un desempeño más bajo a sentirme cada vez más cómodo y rendir mejor dentro de la cancha. Además, me quedo con la buena onda y todos los momentos compartidos con mis amigos y compañeros durante estos años.',
    activo: true,
  };

  const pages = [
    {
      key: 'inicio',
      contenido: {
        titulo: 'Liga de Football Americano Mar del Plata',
        subtitulo: 'La pasión del gridiron en la ciudad feliz',
        descripcion: 'Somos la liga oficial de Football Americano de Mar del Plata. Unidos por la pasión, el deporte y el compañerismo.',
        telefono: '+54 9 223 666-1385',
        email: 'contacto@ligafootballmdp.com'
      }
    },
    {
      key: 'historia',
      contenido: {
        titulo: 'Nuestra Historia',
        texto: 'La Liga de Football Americano de Mar del Plata nació en 2010 con la visión de llevar este deporte apasionante a la costa argentina. Comenzamos con tres equipos fundadores y hoy contamos con una comunidad de cientos de jugadores, fanáticos y familias que se suman cada temporada.\n\nA lo largo de los años hemos organizado torneos, participado en competencias nacionales y formado generaciones de jugadores que hoy representan a la ciudad con orgullo.',
        imagen: ''
      }
    },
    {
      key: 'contacto',
      contenido: {
        titulo: 'Contactanos',
        direccion: 'Mar del Plata, Buenos Aires, Argentina',
        telefono: '+54 9 223 666-1385',
        email: 'contacto@ligafootballmdp.com',
        instagram: 'ligafootballmdp',
        facebook: 'ligafootballmdp'
      }
    }
  ];

  for (const p of pages) {
    await Page.findOneAndUpdate({ key: p.key }, { contenido: p.contenido }, { upsert: true });
  }
  const testimoniosPage = await Page.findOne({ key: 'testimonios' });
  const existingTestimonios = Array.isArray(testimoniosPage?.contenido?.items) ? testimoniosPage.contenido.items : [];
  const hasLucasTestimonio = existingTestimonios.some(item => item.nombre?.toLowerCase() === lucasTestimonio.nombre.toLowerCase());
  await Page.findOneAndUpdate(
    { key: 'testimonios' },
    {
      contenido: {
        ...(testimoniosPage?.contenido || {}),
        items: hasLucasTestimonio ? existingTestimonios : [lucasTestimonio, ...existingTestimonios],
      },
    },
    { upsert: true }
  );
  console.log('Páginas inicializadas');

  await mongoose.disconnect();
  console.log('Seed completado');
}

seed().catch(console.error);
