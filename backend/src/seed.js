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
    rol: 'Fue preselección Argentina · 5 MVPs en la liga',
    imagen: '/jugadores/lucas-gabotto.png',
    texto: 'Estos diez años en la liga fueron una experiencia muy buena para mí. Fui mejorando de a poco, pasando de tener un desempeño más bajo a sentirme cada vez más cómodo y rendir mejor dentro de la cancha. Además, me quedo con la buena onda y todos los momentos compartidos con mis amigos y compañeros durante estos años.',
    activo: true,
  };

  const historiaText = `Orígenes en Parque Camet
El desarrollo del Fútbol Americano en la ciudad de Mar del Plata es un proceso reciente, caracterizado por un crecimiento sostenido a partir de iniciativas locales y un fuerte componente comunitario. Fútbol Americano Mar del Plata nació en 2016 cuando un grupo de jóvenes empezaron con las primeras prácticas deportivas en Parque Camet. Estas primeras convocatorias, organizadas de manera independiente, lograron reunir rápidamente a un número significativo de participantes, evidenciando el interés existente y el potencial de desarrollo del deporte a nivel local.

Primeros equipos y competencia
A partir de esta base inicial, hacia los años 2016 y 2017 se produjo un punto de inflexión con la conformación de una estructura organizativa más formal. En este período se establecieron los primeros equipos locales y se dio origen a una liga incipiente en la modalidad Flag Football 7vs7 (un híbrido entre deporte con contacto y sin contacto), lo que permitió el pasaje de una práctica recreativa a un esquema deportivo competitivo. Asimismo, se conformaron representativos de la ciudad para participar en encuentros y competencias interurbanas, viajando a jugar contra equipos de Buenos Aires, Santa Fé y Concepción del Uruguay. En esa época se jugaban los partidos en Parque Camet y también en INAREPS.

Flag Football 5vs5
En paralelo, el crecimiento del Flag Football en la modalidad 5vs5 en los últimos años a nivel mundial —modalidad sin contacto del fútbol americano— resultó fundamental para la expansión de la disciplina. El flag football ha sido incorporado al programa olímpico para los Juegos Olímpicos de Los Ángeles 2028, lo que ha impulsado su crecimiento global. Su carácter inclusivo, dinámico y de menor requerimiento en cuanto a equipamiento facilitó la incorporación de nuevos practicantes.

Argentina en el mapa internacional
A nivel nacional, FAARG (Fútbol Americano Argentina) creció institucionalmente recibiendo el reconocimiento de IFAF (International Federation of American Football), organización similar a FIBA que nuclea la competencia nacional y hoy olímpica de todas las modalidades del deporte fuera de EEUU. Este reconocimiento como institución deportiva permitió hace ya 3 años que Argentina compita como Selección en torneos Sudamericanos (medalla de plata, Brasil 2022), Continentales (5to puesto, Charlotte, EEUU, 2023; fase de grupos, Panamá 2025) y mundiales (puesto 27, Finlandia 2024). En 2026, la selección masculina juvenil obtuvo la medalla de bronce en los Juegos Suramericanos de la Juventud (Panamá 2026). Actualmente, el equipo nacional gestionado por la Federación Argentina de Football Americano (FAARG) continúa su preparación con el objetivo de clasificar al Campeonato Mundial IFAF 2026 en Alemania, que será clave para el proceso hacia los Juegos Olímpicos de Los Ángeles 2028.

Un referente marplatense
Es importante destacar que el capitán de la Selección Argentina es Inti Sellares, jugador marplatense que hace varios años se fue a vivir a Buenos Aires y además compite en la modalidad equipados 11 vs 11, saliendo Novato Ofensivo 2 del Año, y MVP de la temporada 2 veces, consiguiendo el título de liga tras 15 años con el equipo de Legionarios.

Consolidación local
Luego de la pandemia (2020), el fútbol americano en Mar del Plata continuó su proceso de consolidación trasladando su competencia local a la modalidad 5vs5 realizándose a la fecha 9 torneos locales, en el que participan 4 equipos. Este crecimiento se vio acompañado por una incorporación constante de jugadores, la formación de entrenadores, la participación en competencias regionales y nacionales en esta modalidad, la progresiva institucionalización de la actividad, la articulación de espacios de entrenamiento, organización de torneos y vinculación con ámbitos educativos y deportivos de la ciudad. Desde la pandemia a hoy, se ha jugado en Club Biguá, Parque Camet, el predio deportivo UNMDP y hoy el Centro Naval a través del CASI MDQ.

Nuevas modalidades
La modalidad Flag Football 5vs5 masculina se consolidó como puerta de entrada al deporte y base formativa para la aparición de otras dos modalidades en 2025, el fútbol americano equipado y el flag football femenino. La modalidad femenina se encuentra hoy en auge, participando por primera vez la selección argentina en el Continental de Panamá 2025. A nivel local existen hoy 3 equipos, Nereidas, Selección Marplatense, junto a Sirenas y Gaviotas como equipos locales.

Football equipado
En cuanto a la modalidad equipado, que puede jugarse en las modalidades 7vs7, 9vs9 y 11vs11 (NFL), en 2024 se realizó una Clínica en Córboba de la modalidad organizada por CFA (Córdoba Fútbol Americano) y la ISF (International Sports Federation), en la que se donaron los primeros cascos y hombreras para poder entrenar la modalidad. En 2025 se firmó un convenio con AEFA (Asociación Entrerriana de Football Americano), en la que dio en consignación varios equipamientos necesarios para la práctica. Sumado a algunas inversiones realizadas por FAMDQ, hoy hay 3 equipos, Atlantes, Selección Marplatense, junto con Bárbaros y Templarios como equipos locales.

Asociación Civil y presente
En 2023 FAMDQ se estableció como Asociación Civil como club de barrio. Cabe agregar que FAMDQ ha organizado 2 torneos Nacionales (2023, 2024) MDQ Open recibiendo jugadores de todo el país. Hoy felizmente contamos con 3 modalidades de entrenamiento: Football Equipado, Flag Football Masculino y Flag Football Femenino, en el que participan aproximadamente 60 personas en total de diferentes edades.`;

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
        titulo: 'Historia',
        subtitulo: 'De las primeras prácticas en Parque Camet a una comunidad con flag masculino, flag femenino y football equipado.',
        texto: historiaText,
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
  const updatedTestimonios = hasLucasTestimonio
    ? existingTestimonios.map(item => (
      item.nombre?.toLowerCase() === lucasTestimonio.nombre.toLowerCase()
        ? { ...item, rol: lucasTestimonio.rol, imagen: item.imagen || lucasTestimonio.imagen }
        : item
    ))
    : [lucasTestimonio, ...existingTestimonios];
  await Page.findOneAndUpdate(
    { key: 'testimonios' },
    {
      contenido: {
        ...(testimoniosPage?.contenido || {}),
        items: updatedTestimonios,
      },
    },
    { upsert: true }
  );
  console.log('Páginas inicializadas');

  await mongoose.disconnect();
  console.log('Seed completado');
}

seed().catch(console.error);
