require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Lider = require('./models/Lider');

const TEMPORADA = 'Tazón del Mar IX';

const datos = [
  {
    tipo: 'pase',
    jugadores: [
      { pos: 1,  nombre: 'Angel Avila',       equipo: 'KRA', pas: 156, com: 102, pct: 66,  yds: 1049, td: 18, int: 8  },
      { pos: 2,  nombre: 'Javier Papagni',     equipo: 'TRI', pas: 138, com: 76,  pct: 52,  yds: 843,  td: 13, int: 11 },
      { pos: 3,  nombre: 'Agustin Luporini',   equipo: 'LIE', pas: 113, com: 63,  pct: 55,  yds: 788,  td: 15, int: 1  },
      { pos: 4,  nombre: 'Mateo Pignol',       equipo: 'ACO', pas: 66,  com: 37,  pct: 56,  yds: 351,  td: 3,  int: 2  },
      { pos: 5,  nombre: 'Jano Bisonni',       equipo: 'ACO', pas: 55,  com: 25,  pct: 43,  yds: 253,  td: 5,  int: 4  },
      { pos: 6,  nombre: 'Elvis Rodriguez',    equipo: 'KRA', pas: 5,   com: 6,   pct: 83,  yds: 114,  td: 2,  int: 0  },
      { pos: 7,  nombre: 'Geronimo Ferreyra',  equipo: 'TRI', pas: 26,  com: 13,  pct: 50,  yds: 98,   td: 1,  int: 5  },
      { pos: 8,  nombre: 'Ignacio Cuesta',     equipo: 'ACO', pas: 7,   com: 5,   pct: 71,  yds: 60,   td: 3,  int: 1  },
      { pos: 9,  nombre: 'Matias Rojo',        equipo: 'LIE', pas: 1,   com: 1,   pct: 100, yds: 13,   td: 0,  int: 0  },
      { pos: 10, nombre: 'Emiliano Sanchez',   equipo: 'LIE', pas: 3,   com: 1,   pct: 33,  yds: 8,    td: 0,  int: 1  },
    ],
  },
  {
    tipo: 'corrida',
    jugadores: [
      { pos: 1,  nombre: 'Agustin Luporini',  equipo: 'LIE', int: 16, yds: 141, prom: 8.8,  td: 1 },
      { pos: 2,  nombre: 'Jano Bisonni',      equipo: 'ACO', int: 14, yds: 110, prom: 7.8,  td: 0 },
      { pos: 3,  nombre: 'Angel Avila',        equipo: 'KRA', int: 10, yds: 94,  prom: 9.4,  td: 1 },
      { pos: 4,  nombre: 'Javier Papagni',    equipo: 'TRI', int: 8,  yds: 83,  prom: 10.3, td: 0 },
      { pos: 5,  nombre: 'Ignacio Cuesta',    equipo: 'ACO', int: 4,  yds: 34,  prom: 8.5,  td: 0 },
      { pos: 6,  nombre: 'Emanuel Rodriguez', equipo: 'TRI', int: 5,  yds: 25,  prom: 5.0,  td: 0 },
      { pos: 7,  nombre: 'Matias Rojo',       equipo: 'LIE', int: 2,  yds: 23,  prom: 11.5, td: 1 },
      { pos: 8,  nombre: 'Geronimo Ferreyra', equipo: 'TRI', int: 3,  yds: 16,  prom: 5.3,  td: 0 },
      { pos: 9,  nombre: 'Elvis Rodriguez',   equipo: 'KRA', int: 2,  yds: 11,  prom: 5.5,  td: 0 },
      { pos: 10, nombre: 'Mateo Pignol',      equipo: 'ACO', int: 3,  yds: 9,   prom: 3.0,  td: 0 },
    ],
  },
  {
    tipo: 'recepcion',
    jugadores: [
      { pos: 1,  nombre: 'Lucas Gabotto',     equipo: 'KRA', rec: 31, yds: 457, prom: 14.7, td: 7 },
      { pos: 2,  nombre: 'Matias Rojo',       equipo: 'LIE', rec: 24, yds: 342, prom: 14.2, td: 5 },
      { pos: 3,  nombre: 'Emanuel Rodriguez', equipo: 'TRI', rec: 22, yds: 308, prom: 14.0, td: 8 },
      { pos: 4,  nombre: 'Elvis Rodriguez',   equipo: 'KRA', rec: 24, yds: 267, prom: 11.1, td: 2 },
      { pos: 5,  nombre: 'Emiliano Sanchez',  equipo: 'LIE', rec: 23, yds: 248, prom: 10.7, td: 6 },
      { pos: 6,  nombre: 'Ignacio Cuesta',    equipo: 'ACO', rec: 17, yds: 176, prom: 10.3, td: 3 },
      { pos: 7,  nombre: 'Julian Fernandez',  equipo: 'KRA', rec: 23, yds: 152, prom: 6.6,  td: 4 },
      { pos: 8,  nombre: 'Geronimo Ferreyra', equipo: 'TRI', rec: 13, yds: 151, prom: 11.6, td: 2 },
      { pos: 9,  nombre: 'Ignacio Rios',      equipo: 'ACO', rec: 19, yds: 149, prom: 7.8,  td: 0 },
      { pos: 10, nombre: 'Renzo Amado',       equipo: 'KRA', rec: 16, yds: 126, prom: 7.8,  td: 4 },
    ],
  },
  {
    tipo: 'flags',
    jugadores: [
      { pos: 1,  nombre: 'Geronimo Ferreyra', equipo: 'TRI', flags: 20 },
      { pos: 2,  nombre: 'Emanuel Rodriguez', equipo: 'TRI', flags: 18 },
      { pos: 3,  nombre: 'Joel Gamarra',      equipo: 'LIE', flags: 15 },
      { pos: 4,  nombre: 'Ruben Gabotto',     equipo: 'KRA', flags: 13 },
      { pos: 5,  nombre: 'Ignacio Rios',      equipo: 'ACO', flags: 11 },
      { pos: 5,  nombre: 'Matias Rojo',       equipo: 'LIE', flags: 11 },
      { pos: 7,  nombre: 'Agustin Luporini',  equipo: 'LIE', flags: 10 },
      { pos: 8,  nombre: 'Daniel Montes',     equipo: 'ACO', flags: 9  },
      { pos: 9,  nombre: 'Lucas Gabotto',     equipo: 'KRA', flags: 8  },
      { pos: 9,  nombre: 'Julian Fernandez',  equipo: 'KRA', flags: 8  },
    ],
  },
  {
    tipo: 'intercepciones',
    jugadores: [
      { pos: 1, nombre: 'Lucas Gabotto',     equipo: 'KRA', ints: 7 },
      { pos: 2, nombre: 'Emanuel Rodriguez', equipo: 'TRI', ints: 4 },
      { pos: 2, nombre: 'Ignacio Cuesta',    equipo: 'ACO', ints: 4 },
      { pos: 4, nombre: 'Matias Rojo',       equipo: 'LIE', ints: 3 },
      { pos: 5, nombre: 'Agustin Luporini',  equipo: 'LIE', ints: 2 },
      { pos: 5, nombre: 'Mateo Pignol',      equipo: 'ACO', ints: 2 },
      { pos: 5, nombre: 'Ignacio Rios',      equipo: 'ACO', ints: 2 },
      { pos: 5, nombre: 'Julian Fernandez',  equipo: 'KRA', ints: 2 },
      { pos: 9, nombre: 'Geronimo Ferreyra', equipo: 'TRI', ints: 1 },
      { pos: 9, nombre: 'Javier Papagni',    equipo: 'TRI', ints: 1 },
    ],
  },
  {
    tipo: 'sacks',
    jugadores: [
      { pos: 1, nombre: 'Leandro Cattaneo',    equipo: 'KRA', sacks: 5, safety: 0 },
      { pos: 2, nombre: 'Iñaki Irurzun',       equipo: 'ACO', sacks: 4, safety: 0 },
      { pos: 3, nombre: 'Angel Avila',          equipo: 'KRA', sacks: 3, safety: 0 },
      { pos: 4, nombre: 'Juan Cruz Rodriguez', equipo: 'LIE', sacks: 2, safety: 1 },
      { pos: 4, nombre: 'Lucas Yuntunen',      equipo: 'LIE', sacks: 2, safety: 0 },
      { pos: 4, nombre: 'Alex Merlo',          equipo: 'KRA', sacks: 2, safety: 0 },
      { pos: 4, nombre: 'Raul Montenegro',     equipo: 'TRI', sacks: 2, safety: 0 },
      { pos: 4, nombre: 'Mauro Castillo',      equipo: 'TRI', sacks: 2, safety: 0 },
      { pos: 9, nombre: 'Santiago Antuña',     equipo: 'ACO', sacks: 1, safety: 0 },
      { pos: 9, nombre: 'Jano Bisonni',        equipo: 'ACO', sacks: 1, safety: 0 },
    ],
  },
  {
    tipo: 'deflecciones',
    jugadores: [
      { pos: 1,  nombre: 'Ignacio Cuesta',    equipo: 'ACO', deflec: 4 },
      { pos: 1,  nombre: 'Angel Avila',        equipo: 'KRA', deflec: 4 },
      { pos: 3,  nombre: 'Emanuel Rodriguez', equipo: 'TRI', deflec: 3 },
      { pos: 3,  nombre: 'Geronimo Ferreyra', equipo: 'TRI', deflec: 3 },
      { pos: 5,  nombre: 'Emiliano Sanchez',  equipo: 'LIE', deflec: 2 },
      { pos: 5,  nombre: 'Daniel Montes',     equipo: 'ACO', deflec: 2 },
      { pos: 5,  nombre: 'Luciano Escobar',   equipo: 'ACO', deflec: 2 },
      { pos: 5,  nombre: 'Elvis Rodriguez',   equipo: 'KRA', deflec: 2 },
      { pos: 5,  nombre: 'Julian Fernandez',  equipo: 'KRA', deflec: 2 },
      { pos: 10, nombre: 'Agustin Luporini',  equipo: 'LIE', deflec: 1 },
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado a MongoDB');

  // Borrar líderes anteriores de esta temporada
  await Lider.deleteMany({ temporada: TEMPORADA });
  console.log('Líderes anteriores eliminados');

  for (const d of datos) {
    await Lider.create({ temporada: TEMPORADA, tipo: d.tipo, jugadores: d.jugadores });
    console.log(`✓ ${d.tipo} cargado (${d.jugadores.length} jugadores)`);
  }

  console.log('\n✅ Tazón del Mar IX cargado correctamente');
  await mongoose.disconnect();
}

seed().catch(console.error);
