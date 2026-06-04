require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Estadistica = require('./models/Estadistica');
const Partido = require('./models/Partido');
const Lider = require('./models/Lider');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado a MongoDB');

  // ─── 1. TABLA DE POSICIONES FASE REGULAR ───────────────────────────────────
  await Estadistica.deleteMany({ temporada: 'Tazón del Mar IX', categoria: 'Liga Football Flag' });
  await Estadistica.create({
    temporada: 'Tazón del Mar IX',
    categoria: 'Liga Football Flag',
    descripcion: 'Posiciones finales Fecha 5 — FAMDQ',
    tabla: [
      { equipo: 'Liebres',    PJ: 5, PG: 5, PP: 0, PF: 134, PC: 81,  Pts: 15 },
      { equipo: 'Krakens',    PJ: 5, PG: 3, PP: 2, PF: 137, PC: 81,  Pts: 9  },
      { equipo: 'Tridentes',  PJ: 5, PG: 2, PP: 3, PF: 91,  PC: 145, Pts: 6  },
      { equipo: 'Acorazados', PJ: 5, PG: 0, PP: 5, PF: 71,  PC: 126, Pts: 0  },
    ],
  });
  console.log('✓ Tabla de posiciones cargada');

  // ─── 2. SEMIFINAL ──────────────────────────────────────────────────────────
  await Partido.deleteMany({ jornada: 'Semifinal - Tazón del Mar IX' });
  await Partido.create({
    jornada: 'Semifinal - Tazón del Mar IX',
    categoria: 'Liga Football Flag',
    equipoLocal: 'Krakens',
    equipoVisitante: 'Tridentes',
    fecha: new Date('2026-06-01'),
    estado: 'finalizado',
    golesLocal: 39,
    golesVisitante: 34,
    notas: 'Jugadores destacados — Krakens: Lucas Gabotto (5 rec 83 yds, 3 rush 65 yds 1 TD, 2 ints, 1 deflec, 2 flags), Angel Avila (12/24 192 yds 2 TDs/3 ints, 1 rush 15 yds TD, 1 rec 11 yds, 1 int, 1 deflec, 4 flags), Elvis Rodriguez (1/2 11 yds, 2 rec 56 yds, 2 deflecs, 5 flags). Tridentes: Javier Papagni (24/45 305 yds 4 TDs/3 int, 2 rush 13 yds), Pablo Corva (8 rec 80 yds 1 TD, 1 int, 1 deflec, 4 flags), Mauro Castillo (6 rec 100 yds 2 TDs).',
    activo: true,
  });
  console.log('✓ Semifinal cargada');

  // ─── 3. FINAL ──────────────────────────────────────────────────────────────
  await Partido.deleteMany({ jornada: 'Final - Tazón del Mar IX' });
  await Partido.create({
    jornada: 'Final - Tazón del Mar IX',
    categoria: 'Liga Football Flag',
    equipoLocal: 'Liebres',
    equipoVisitante: 'Krakens',
    fecha: new Date('2026-06-08'),
    estado: 'finalizado',
    golesLocal: 36,
    golesVisitante: 26,
    notas: '🏆 LIEBRES CAMPEONES DEL TAZÓN DEL MAR IX 🏆',
    activo: true,
  });
  console.log('✓ Final cargada');

  // ─── 4. ESTADÍSTICAS DE LA FINAL ───────────────────────────────────────────
  await Lider.deleteMany({ temporada: 'Final - Tazón del Mar IX' });

  const TEMPORADA_FINAL = 'Final - Tazón del Mar IX';

  await Lider.insertMany([
    {
      temporada: TEMPORADA_FINAL,
      tipo: 'pase',
      jugadores: [
        { pos: 1, nombre: 'Agustin Luporini', equipo: 'LIE', pas: 27, com: 16, pct: 59, yds: 185, td: 4, int: 0 },
        { pos: 2, nombre: 'Angel Avila',       equipo: 'KRA', pas: 35, com: 22, pct: 62, yds: 188, td: 4, int: 2 },
        { pos: 3, nombre: 'Lucas Gabotto',     equipo: 'KRA', pas: 2,  com: 1,  pct: 50, yds: 13,  td: 0, int: 1 },
      ],
    },
    {
      temporada: TEMPORADA_FINAL,
      tipo: 'corrida',
      jugadores: [
        { pos: 1, nombre: 'Agustin Luporini', equipo: 'LIE', int: 5, yds: 46, prom: 9.2, td: 1 },
        { pos: 2, nombre: 'Angel Avila',       equipo: 'KRA', int: 2, yds: 19, prom: 9.5, td: 0 },
        { pos: 3, nombre: 'Matias Rojo',       equipo: 'LIE', int: 1, yds: 6,  prom: 6.0, td: 0 },
      ],
    },
    {
      temporada: TEMPORADA_FINAL,
      tipo: 'recepcion',
      jugadores: [
        { pos: 1, nombre: 'Matias Rojo',       equipo: 'LIE', rec: 9, yds: 128, prom: 18.3, td: 2 },
        { pos: 2, nombre: 'Emiliano Sanchez',  equipo: 'LIE', rec: 7, yds: 57,  prom: 6.33, td: 2 },
        { pos: 3, nombre: 'Lucas Gabotto',     equipo: 'KRA', rec: 7, yds: 94,  prom: 13.4, td: 0 },
        { pos: 4, nombre: 'Julian Fernandez',  equipo: 'KRA', rec: 6, yds: 40,  prom: 6.6,  td: 1 },
        { pos: 5, nombre: 'Elvis Rodriguez',   equipo: 'KRA', rec: 5, yds: 28,  prom: 5.6,  td: 2 },
        { pos: 6, nombre: 'Renzo Amado',       equipo: 'KRA', rec: 3, yds: 20,  prom: 6.6,  td: 0 },
        { pos: 7, nombre: 'Angel Avila',        equipo: 'KRA', rec: 1, yds: 13,  prom: 13.0, td: 0 },
        { pos: 8, nombre: 'Ruben Gabotto',     equipo: 'KRA', rec: 1, yds: 6,   prom: 6.0,  td: 1 },
      ],
    },
    {
      temporada: TEMPORADA_FINAL,
      tipo: 'intercepciones',
      jugadores: [
        { pos: 1, nombre: 'Emiliano Sanchez', equipo: 'LIE', ints: 1 },
        { pos: 1, nombre: 'Matias Rojo',      equipo: 'LIE', ints: 1 },
        { pos: 1, nombre: 'Joel Gamarra',     equipo: 'LIE', ints: 1 },
      ],
    },
    {
      temporada: TEMPORADA_FINAL,
      tipo: 'sacks',
      jugadores: [
        { pos: 1, nombre: 'Juan Cruz Rodriguez', equipo: 'LIE', sacks: 1, safety: 1 },
      ],
    },
    {
      temporada: TEMPORADA_FINAL,
      tipo: 'flags',
      jugadores: [
        { pos: 1, nombre: 'Agustin Luporini',    equipo: 'LIE', flags: 6 },
        { pos: 2, nombre: 'Emiliano Sanchez',     equipo: 'LIE', flags: 3 },
        { pos: 2, nombre: 'Joel Gamarra',         equipo: 'LIE', flags: 3 },
        { pos: 2, nombre: 'Angel Avila',           equipo: 'KRA', flags: 3 },
        { pos: 2, nombre: 'Lucas Gabotto',        equipo: 'KRA', flags: 3 },
        { pos: 6, nombre: 'Matias Rojo',          equipo: 'LIE', flags: 2 },
        { pos: 6, nombre: 'Elvis Rodriguez',      equipo: 'KRA', flags: 2 },
        { pos: 8, nombre: 'Lucas Yuntunen',       equipo: 'LIE', flags: 1 },
        { pos: 8, nombre: 'Juan Cruz Rodriguez',  equipo: 'LIE', flags: 1 },
      ],
    },
    {
      temporada: TEMPORADA_FINAL,
      tipo: 'deflecciones',
      jugadores: [
        { pos: 1, nombre: 'Elvis Rodriguez', equipo: 'KRA', deflec: 1 },
      ],
    },
  ]);
  console.log('✓ Estadísticas de la Final cargadas');

  console.log('\n✅ Tazón del Mar IX completo — posiciones, semifinal, final y estadísticas');
  await mongoose.disconnect();
}

seed().catch(console.error);
