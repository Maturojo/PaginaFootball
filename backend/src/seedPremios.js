require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Lider = require('./models/Lider');

const TEMPORADA = 'Tazón del Mar IX';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado a MongoDB');

  await Lider.deleteMany({ temporada: TEMPORADA, tipo: 'premios' });

  await Lider.create({
    temporada: TEMPORADA,
    tipo: 'premios',
    jugadores: [
      { premio: 'MVP — Jugador Más Valioso',  jugador: 'Lucas Gabotto',    numero: 16, equipo: 'KRA' },
      { premio: 'JOF — Jugador Ofensivo',     jugador: 'Lucas Gabotto',    numero: 16, equipo: 'KRA' },
      { premio: 'JD — Jugador Defensivo',     jugador: 'Lucas Gabotto',    numero: 16, equipo: 'KRA' },
      { premio: 'JEV — Jugador Evolución',    jugador: 'Ángel Ávila',      numero: 25, equipo: 'KRA' },
      { premio: 'NOV — Novato del Torneo',    jugador: 'Leandro Cattaneo', numero: 98, equipo: 'KRA' },
    ],
  });
  console.log('✓ Premios individuales cargados');

  await Lider.deleteMany({ temporada: TEMPORADA, tipo: 'equipo-ofensivo' });
  await Lider.create({
    temporada: TEMPORADA,
    tipo: 'equipo-ofensivo',
    jugadores: [
      { pos: 1, nombre: 'Lucas Gabotto',    numero: 16, equipo: 'KRA', votos: 11 },
      { pos: 2, nombre: 'Matías Rojo',      numero: 11, equipo: 'LIE', votos: 9  },
      { pos: 3, nombre: 'Agustín Luporini', numero: 19, equipo: 'LIE', votos: 7  },
      { pos: 3, nombre: 'Emma Rodríguez',   numero: 82, equipo: 'TRI', votos: 7  },
      { pos: 5, nombre: 'Emiliano Sánchez', numero: 81, equipo: 'LIE', votos: 5  },
    ],
  });
  console.log('✓ Equipo ofensivo cargado');

  await Lider.deleteMany({ temporada: TEMPORADA, tipo: 'equipo-defensivo' });
  await Lider.create({
    temporada: TEMPORADA,
    tipo: 'equipo-defensivo',
    jugadores: [
      { pos: 1, nombre: 'Lucas Gabotto',  numero: 16, equipo: 'KRA', votos: 10 },
      { pos: 2, nombre: 'Matías Rojo',    numero: 11, equipo: 'LIE', votos: 7  },
      { pos: 3, nombre: 'Elvis Rodríguez',numero: 9,  equipo: 'KRA', votos: 6  },
      { pos: 4, nombre: 'Emma Rodríguez', numero: 82, equipo: 'TRI', votos: 4  },
      { pos: 4, nombre: 'Rubén Gabotto',  numero: 34, equipo: 'KRA', votos: 4  },
    ],
  });
  console.log('✓ Equipo defensivo cargado');

  console.log('\n✅ Premios Tazón del Mar IX cargados');
  await mongoose.disconnect();
}

seed().catch(console.error);
