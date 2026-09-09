const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SocialProfile = require('../models/social/SocialProfile');
const auth = require('../middleware/auth');

function sanitizeUsername(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._]/g, '_')
    .slice(0, 30);
}

// Asegura que el usuario tenga un perfil social asociado
async function getOrCreateProfile(user) {
  let profile = await SocialProfile.findOne({ user: user._id }).populate('jugadorRef', 'nombre equipo numero posicion foto');
  if (!profile) {
    let baseUsername = sanitizeUsername(user.email.split('@')[0]) || 'usuario';
    let candidate = baseUsername;
    let counter = 1;
    while (await SocialProfile.findOne({ username: candidate })) {
      candidate = `${baseUsername}${counter++}`;
    }
    profile = await SocialProfile.create({
      user: user._id,
      username: candidate,
      displayName: user.role === 'admin' ? 'Administrador Liga' : candidate,
      avatar: '',
      bio: '',
    });
    user.profile = profile._id;
    await user.save();
  }
  return profile;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, displayName } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Email, contraseña y nombre de usuario son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const cleanUsername = sanitizeUsername(username);
    if (cleanUsername.length < 3) {
      return res.status(400).json({ message: 'El nombre de usuario debe tener al menos 3 caracteres alfanuméricos' });
    }

    const emailNormalized = email.toLowerCase().trim();
    const existingEmail = await User.findOne({ email: emailNormalized });
    if (existingEmail) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    const existingUsername = await SocialProfile.findOne({ username: cleanUsername });
    if (existingUsername) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
    }

    const user = await User.create({
      email: emailNormalized,
      password,
      role: 'user',
    });

    const profile = await SocialProfile.create({
      user: user._id,
      username: cleanUsername,
      displayName: (displayName || cleanUsername).trim(),
      avatar: '',
      bio: '',
    });

    user.profile = profile._id;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '14d' });

    res.status(201).json({
      token,
      email: user.email,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: {
          id: profile._id,
          username: profile.username,
          displayName: profile.displayName,
          avatar: profile.avatar,
          banner: profile.banner,
          bio: profile.bio,
          jugadorRef: profile.jugadorRef,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
        },
      },
    });
  } catch (err) {
    console.error('Error en register:', err);
    res.status(500).json({ message: 'Error al registrar usuario', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const profile = await getOrCreateProfile(user);

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '14d' });

    res.json({
      token,
      email: user.email,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: {
          id: profile._id,
          username: profile.username,
          displayName: profile.displayName,
          avatar: profile.avatar,
          banner: profile.banner,
          bio: profile.bio,
          jugadorRef: profile.jugadorRef,
          followersCount: profile.followersCount || 0,
          followingCount: profile.followingCount || 0,
          postsCount: profile.postsCount || 0,
        },
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const profile = await getOrCreateProfile(user);

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      profile: {
        id: profile._id,
        username: profile.username,
        displayName: profile.displayName,
        avatar: profile.avatar,
        banner: profile.banner,
        bio: profile.bio,
        jugadorRef: profile.jugadorRef,
        followersCount: profile.followersCount || 0,
        followingCount: profile.followingCount || 0,
        postsCount: profile.postsCount || 0,
      },
    });
  } catch (err) {
    console.error('Error en me:', err);
    res.status(500).json({ message: 'Error al obtener sesión' });
  }
});

module.exports = router;
