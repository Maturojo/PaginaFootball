require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const SocialProfile = require('./models/social/SocialProfile');
const Post = require('./models/social/Post');
const Highlight = require('./models/social/Highlight');
const Team = require('./models/Team');
const Partido = require('./models/Partido');
const Jugador = require('./models/Jugador');

async function seedSocial() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB para seed social');

    // Verificar si ya hay posts
    const existingPostsCount = await Post.countDocuments();
    if (existingPostsCount > 0) {
      console.log(`Ya existen ${existingPostsCount} posts sociales. Omitiendo seed social.`);
      process.exit(0);
    }

    // Buscar equipos, partidos y jugadores existentes para relacionar
    const teams = await Team.find();
    const partidos = await Partido.find();
    const jugadores = await Jugador.find();

    const liebresTeam = teams.find(t => t.nombre.toLowerCase().includes('liebres'));
    const krakensTeam = teams.find(t => t.nombre.toLowerCase().includes('krakens'));
    const tazonPartido = partidos.find(p => (p.jornada || '').toLowerCase().includes('tazon') || (p.categoria || '').includes('7vs7')) || partidos[0];
    const mvpJugador = jugadores.find(j => j.esMVP) || jugadores[0];

    // Usuarios demo de la comunidad
    const demoUsers = [
      {
        email: 'matias.quarterback@ligafootballmdp.com',
        password: 'Password123!',
        username: 'matias_qb',
        displayName: 'Matías Rodríguez',
        bio: 'Quarterback #7 en Liga MDP. Apasionado del flag football y la estrategia táctica. 🏈⚡',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80',
        jugador: mvpJugador?._id,
      },
      {
        email: 'sofia.coach@ligafootballmdp.com',
        password: 'Password123!',
        username: 'sofi_football',
        displayName: 'Sofía Fernández',
        bio: 'Entrenadora de Flag Femenino. Fomentando el deporte y el compañerismo en la costa. 🌊🐬',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1200&auto=format&fit=crop&q=80',
      },
      {
        email: 'lucas.fan@ligafootballmdp.com',
        password: 'Password123!',
        username: 'lucas_mdq',
        displayName: 'Lucas Mar del Plata',
        bio: 'Hincha incondicional de los Krakens 🐙. Siguiendo cada fecha desde la tribuna.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200&auto=format&fit=crop&q=80',
      },
    ];

    const createdUsers = [];

    for (const u of demoUsers) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create({ email: u.email, password: u.password, role: 'user' });
      }
      let profile = await SocialProfile.findOne({ user: user._id });
      if (!profile) {
        profile = await SocialProfile.create({
          user: user._id,
          username: u.username,
          displayName: u.displayName,
          bio: u.bio,
          avatar: u.avatar,
          banner: u.banner,
          jugadorRef: u.jugador || null,
        });
        user.profile = profile._id;
        await user.save();
      }
      createdUsers.push({ user, profile });
    }

    console.log(`Usuarios sociales creados: ${createdUsers.length}`);

    // Publicaciones demo con referencias a Football Core
    const samplePosts = [
      {
        author: createdUsers[0].user._id,
        content: '¡Gran victoria el fin de semana! Tremendo esfuerzo de todo el equipo en las últimas jugadas. A seguir entrenando duro para la próxima fecha. 💪🏈 #MDPFootball #Touchdown',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1000&auto=format&fit=crop&q=80',
            type: 'image',
            caption: 'Festejando el pase de anotación en la zona roja',
          },
        ],
        relatedPartido: tazonPartido?._id || null,
        relatedTeam: liebresTeam?._id || null,
        relatedJugador: mvpJugador?._id || null,
        tags: ['mdpfootball', 'touchdown'],
        mentions: ['sofi_football'],
        likesCount: 14,
        commentsCount: 3,
      },
      {
        author: createdUsers[1].user._id,
        content: 'Increíble jornada de Flag Football en la cancha del club. Cada vez más nivel y más chicas sumándose a jugar. ¡Las inscripciones siguen abiertas! 🐬✨ #FlagFemenino #Comunidad',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80',
            type: 'image',
            caption: 'Formación antes del snap',
          },
        ],
        tags: ['flagfemenino', 'comunidad'],
        mentions: ['matias_qb'],
        likesCount: 22,
        commentsCount: 5,
      },
      {
        author: createdUsers[2].user._id,
        content: 'La defensa de los Krakens estuvo intratable en el segundo tiempo. ¡Esa intercepción selló el partido! 🐙🔥 ¿Quién más fue a la cancha hoy? #Krakens #Defensa',
        media: [],
        relatedTeam: krakensTeam?._id || null,
        tags: ['krakens', 'defensa'],
        mentions: [],
        likesCount: 9,
        commentsCount: 2,
      },
    ];

    for (const p of samplePosts) {
      await Post.create(p);
      await SocialProfile.findOneAndUpdate({ user: p.author }, { $inc: { postsCount: 1 } });
    }

    // Highlights demo para el primer usuario
    await Highlight.create({
      user: createdUsers[0].user._id,
      title: 'TDs 2025',
      cover: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=300&auto=format&fit=crop&q=80',
      items: [
        {
          mediaUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1000&auto=format&fit=crop&q=80',
          mediaType: 'image',
          caption: 'Pase largo contra Krakens - Jornada 4',
        },
        {
          mediaUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80',
          mediaType: 'image',
          caption: 'Celebrando con la ofensiva',
        },
      ],
    });

    console.log('Seed social completado con éxito!');
    process.exit(0);
  } catch (err) {
    console.error('Error en seed social:', err);
    process.exit(1);
  }
}

seedSocial();
