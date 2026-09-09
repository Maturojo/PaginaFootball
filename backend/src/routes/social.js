const router = require('express').Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const socialUpload = require('../middleware/socialUpload');
const fileUrl = require('../middleware/fileUrl');

const User = require('../models/User');
const SocialProfile = require('../models/social/SocialProfile');
const Post = require('../models/social/Post');
const Comment = require('../models/social/Comment');
const Like = require('../models/social/Like');
const Follow = require('../models/social/Follow');
const SavedPost = require('../models/social/SavedPost');
const Notification = require('../models/social/Notification');
const Highlight = require('../models/social/Highlight');
const Report = require('../models/social/Report');

// Modelos existentes del Football Core (solo lectura / referencias)
const Partido = require('../models/Partido');
const Team = require('../models/Team');
const Jugador = require('../models/Jugador');

// Helpers
function extractTagsAndMentions(text = '') {
  const tags = (text.match(/#([a-zA-Z0-9_\u00C0-\u017F]+)/g) || [])
    .map(t => t.slice(1).toLowerCase());
  const mentions = (text.match(/@([a-zA-Z0-9._]+)/g) || [])
    .map(m => m.slice(1).toLowerCase());
  return { tags: [...new Set(tags)], mentions: [...new Set(mentions)] };
}

async function attachAuthorProfiles(posts, currentUserId = null) {
  if (!posts || posts.length === 0) return [];
  const authorIds = [...new Set(posts.map(p => p.author?._id || p.author).filter(Boolean))];
  const profiles = await SocialProfile.find({ user: { $in: authorIds } })
    .populate('jugadorRef', 'nombre equipo numero posicion foto');
  const profileMap = {};
  profiles.forEach(p => { profileMap[p.user.toString()] = p; });

  let likedPostIds = new Set();
  let savedPostIds = new Set();
  if (currentUserId) {
    const postIds = posts.map(p => p._id);
    const [likes, saves] = await Promise.all([
      Like.find({ user: currentUserId, post: { $in: postIds } }).select('post'),
      SavedPost.find({ user: currentUserId, post: { $in: postIds } }).select('post'),
    ]);
    likes.forEach(l => likedPostIds.add(l.post.toString()));
    saves.forEach(s => savedPostIds.add(s.post.toString()));
  }

  return posts.map(post => {
    const pObj = post.toObject ? post.toObject() : { ...post };
    const aId = (pObj.author?._id || pObj.author || '').toString();
    pObj.authorProfile = profileMap[aId] || null;
    pObj.hasLiked = likedPostIds.has(pObj._id.toString());
    pObj.hasSaved = savedPostIds.has(pObj._id.toString());
    return pObj;
  });
}

// -------------------------------------------------------------
// UPLOADS MULTIMEDIA (FOTOS Y VIDEOS)
// -------------------------------------------------------------
router.post('/upload', auth, (req, res) => {
  socialUpload.single('file')(req, res, err => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message || 'Error al subir archivo' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No se envió ningún archivo' });
    }
    const url = fileUrl(req.file);
    const isVideo = req.file.mimetype.startsWith('video/') ||
      ['.mp4', '.webm', '.mov'].some(ext => (req.file.originalname || '').toLowerCase().endsWith(ext));

    res.json({
      url,
      type: isVideo ? 'video' : 'image',
      name: req.file.originalname,
      size: req.file.size,
    });
  });
});

// -------------------------------------------------------------
// POSTS
// -------------------------------------------------------------

// GET /api/social/posts - Feed con filtros
router.get('/posts', optionalAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const { tab, relatedPartido, relatedTeam, relatedJugador, tag, username, search } = req.query;
    const filter = { activo: true };

    if (relatedPartido && mongoose.isValidObjectId(relatedPartido)) {
      filter.relatedPartido = relatedPartido;
    }
    if (relatedTeam && mongoose.isValidObjectId(relatedTeam)) {
      filter.relatedTeam = relatedTeam;
    }
    if (relatedJugador && mongoose.isValidObjectId(relatedJugador)) {
      filter.relatedJugador = relatedJugador;
    }
    if (tag) {
      filter.tags = tag.toLowerCase().replace('#', '').trim();
    }
    if (search) {
      filter.$or = [
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [search.toLowerCase().replace('#', '').trim()] } },
      ];
    }

    if (username) {
      const userProfile = await SocialProfile.findOne({ username: username.toLowerCase().trim() });
      if (userProfile) {
        filter.author = userProfile.user;
      } else {
        return res.json({ posts: [], total: 0, page, hasMore: false });
      }
    }

    // Tab 'following': solo autores a los que el usuario sigue
    if (tab === 'following' && req.user?.id) {
      const follows = await Follow.find({ follower: req.user.id }).select('following');
      const followingIds = follows.map(f => f.following);
      filter.author = { $in: [...followingIds, req.user.id] };
    }

    const [rawPosts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'email role')
        .populate('relatedPartido', 'jornada categoria equipoLocal equipoVisitante fecha hora lugar estado golesLocal golesVisitante')
        .populate('relatedTeam', 'nombre ciudad logo colores categoria')
        .populate('relatedJugador', 'nombre equipo numero posicion foto stats'),
      Post.countDocuments(filter),
    ]);

    const posts = await attachAuthorProfiles(rawPosts, req.user?.id);

    res.json({
      posts,
      total,
      page,
      pages: Math.ceil(total / limit),
      hasMore: skip + rawPosts.length < total,
    });
  } catch (err) {
    console.error('Error al obtener posts:', err);
    res.status(500).json({ message: 'Error al obtener publicaciones' });
  }
});

// GET /api/social/posts/:id
router.get('/posts/:id', optionalAuth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Publicación no encontrada' });
    }
    const post = await Post.findOne({ _id: req.params.id, activo: true })
      .populate('author', 'email role')
      .populate('relatedPartido', 'jornada categoria equipoLocal equipoVisitante fecha hora lugar estado golesLocal golesVisitante')
      .populate('relatedTeam', 'nombre ciudad logo colores categoria')
      .populate('relatedJugador', 'nombre equipo numero posicion foto stats');

    if (!post) {
      return res.status(404).json({ message: 'Publicación no encontrada' });
    }

    const [postWithProfile] = await attachAuthorProfiles([post], req.user?.id);
    res.json(postWithProfile);
  } catch (err) {
    console.error('Error al obtener post:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// POST /api/social/posts - Crear publicación
router.post('/posts', auth, async (req, res) => {
  try {
    const { content, media, relatedPartido, relatedTeam, relatedJugador } = req.body;

    if (!content && (!media || media.length === 0)) {
      return res.status(400).json({ message: 'La publicación debe tener texto o contenido multimedia' });
    }

    const { tags, mentions } = extractTagsAndMentions(content || '');

    const newPostData = {
      author: req.user.id,
      content: (content || '').trim(),
      media: Array.isArray(media) ? media : [],
      tags,
      mentions,
    };

    if (relatedPartido && mongoose.isValidObjectId(relatedPartido)) {
      newPostData.relatedPartido = relatedPartido;
    }
    if (relatedTeam && mongoose.isValidObjectId(relatedTeam)) {
      newPostData.relatedTeam = relatedTeam;
    }
    if (relatedJugador && mongoose.isValidObjectId(relatedJugador)) {
      newPostData.relatedJugador = relatedJugador;
    }

    const post = await Post.create(newPostData);

    // Incrementar postsCount en el perfil social
    await SocialProfile.findOneAndUpdate(
      { user: req.user.id },
      { $inc: { postsCount: 1 } }
    );

    // Notificaciones por mención
    if (mentions.length > 0) {
      const mentionedProfiles = await SocialProfile.find({
        username: { $in: mentions },
        user: { $ne: req.user.id },
      });
      for (const p of mentionedProfiles) {
        await Notification.create({
          recipient: p.user,
          sender: req.user.id,
          type: 'mention',
          post: post._id,
        });
      }
    }

    const populated = await Post.findById(post._id)
      .populate('author', 'email role')
      .populate('relatedPartido')
      .populate('relatedTeam')
      .populate('relatedJugador');

    const [readyPost] = await attachAuthorProfiles([populated], req.user.id);
    res.status(201).json(readyPost);
  } catch (err) {
    console.error('Error al crear post:', err);
    res.status(500).json({ message: 'Error al crear la publicación', error: err.message });
  }
});

// DELETE /api/social/posts/:id
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Publicación no encontrada' });
    }

    const isAuthor = post.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta publicación' });
    }

    post.activo = false;
    await post.save();

    await SocialProfile.findOneAndUpdate(
      { user: post.author },
      { $inc: { postsCount: -1 } }
    );

    res.json({ message: 'Publicación eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar post:', err);
    res.status(500).json({ message: 'Error al eliminar publicación' });
  }
});

// POST /api/social/posts/:id/like - Toggle like
router.post('/posts/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !post.activo) {
      return res.status(404).json({ message: 'Publicación no encontrada' });
    }

    const existing = await Like.findOne({ user: req.user.id, post: post._id });

    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      const updatedPost = await Post.findByIdAndUpdate(
        post._id,
        { $inc: { likesCount: -1 } },
        { new: true }
      );
      return res.json({ liked: false, likesCount: Math.max(0, updatedPost.likesCount) });
    } else {
      await Like.create({ user: req.user.id, post: post._id });
      const updatedPost = await Post.findByIdAndUpdate(
        post._id,
        { $inc: { likesCount: 1 } },
        { new: true }
      );

      // Notificación al autor si no es él mismo
      if (post.author.toString() !== req.user.id) {
        await Notification.create({
          recipient: post.author,
          sender: req.user.id,
          type: 'like',
          post: post._id,
        });
      }

      return res.json({ liked: true, likesCount: updatedPost.likesCount });
    }
  } catch (err) {
    console.error('Error en like:', err);
    res.status(500).json({ message: 'Error al procesar me gusta' });
  }
});

// POST /api/social/posts/:id/save - Toggle guardado
router.post('/posts/:id/save', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !post.activo) {
      return res.status(404).json({ message: 'Publicación no encontrada' });
    }

    const existing = await SavedPost.findOne({ user: req.user.id, post: post._id });

    if (existing) {
      await SavedPost.deleteOne({ _id: existing._id });
      const updatedPost = await Post.findByIdAndUpdate(
        post._id,
        { $inc: { savesCount: -1 } },
        { new: true }
      );
      return res.json({ saved: false, savesCount: Math.max(0, updatedPost.savesCount) });
    } else {
      await SavedPost.create({ user: req.user.id, post: post._id });
      const updatedPost = await Post.findByIdAndUpdate(
        post._id,
        { $inc: { savesCount: 1 } },
        { new: true }
      );
      return res.json({ saved: true, savesCount: updatedPost.savesCount });
    }
  } catch (err) {
    console.error('Error en save:', err);
    res.status(500).json({ message: 'Error al guardar publicación' });
  }
});

// -------------------------------------------------------------
// COMENTARIOS
// -------------------------------------------------------------

// GET /api/social/posts/:id/comments
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id, activo: true })
      .sort({ createdAt: 1 })
      .populate('author', 'email role');

    const authorIds = [...new Set(comments.map(c => c.author?._id).filter(Boolean))];
    const profiles = await SocialProfile.find({ user: { $in: authorIds } });
    const profileMap = {};
    profiles.forEach(p => { profileMap[p.user.toString()] = p; });

    const commentsWithProfiles = comments.map(c => {
      const cObj = c.toObject();
      const aId = (cObj.author?._id || '').toString();
      cObj.authorProfile = profileMap[aId] || null;
      return cObj;
    });

    res.json(commentsWithProfiles);
  } catch (err) {
    console.error('Error al obtener comentarios:', err);
    res.status(500).json({ message: 'Error al obtener comentarios' });
  }
});

// POST /api/social/posts/:id/comments
router.post('/posts/:id/comments', auth, async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'El comentario no puede estar vacío' });
    }

    const post = await Post.findById(req.params.id);
    if (!post || !post.activo) {
      return res.status(404).json({ message: 'Publicación no encontrada' });
    }

    const comment = await Comment.create({
      post: post._id,
      author: req.user.id,
      content: content.trim(),
      parentComment: parentComment || null,
    });

    await Post.findByIdAndUpdate(post._id, { $inc: { commentsCount: 1 } });

    // Notificación al autor del post
    if (post.author.toString() !== req.user.id) {
      await Notification.create({
        recipient: post.author,
        sender: req.user.id,
        type: 'comment',
        post: post._id,
        comment: comment._id,
      });
    }

    // Menciones en comentario
    const { mentions } = extractTagsAndMentions(content);
    if (mentions.length > 0) {
      const mentionedProfiles = await SocialProfile.find({
        username: { $in: mentions },
        user: { $ne: req.user.id },
      });
      for (const p of mentionedProfiles) {
        if (p.user.toString() !== post.author.toString()) {
          await Notification.create({
            recipient: p.user,
            sender: req.user.id,
            type: 'mention',
            post: post._id,
            comment: comment._id,
          });
        }
      }
    }

    const authorProfile = await SocialProfile.findOne({ user: req.user.id });
    const cObj = comment.toObject();
    cObj.authorProfile = authorProfile;

    res.status(201).json(cObj);
  } catch (err) {
    console.error('Error al crear comentario:', err);
    res.status(500).json({ message: 'Error al publicar comentario' });
  }
});

// DELETE /api/social/comments/:id
router.delete('/comments/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }

    const isAuthor = comment.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    comment.activo = false;
    await comment.save();

    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
    res.json({ message: 'Comentario eliminado' });
  } catch (err) {
    console.error('Error al borrar comentario:', err);
    res.status(500).json({ message: 'Error al eliminar comentario' });
  }
});

// -------------------------------------------------------------
// PERFILES SOCIALES
// -------------------------------------------------------------

// GET /api/social/profiles/:username
router.get('/profiles/:username', optionalAuth, async (req, res) => {
  try {
    const profile = await SocialProfile.findOne({ username: req.params.username.toLowerCase().trim() })
      .populate('user', 'email role createdAt')
      .populate('jugadorRef', 'nombre equipo numero posicion foto bio stats esMVP');

    if (!profile) {
      return res.status(404).json({ message: 'Perfil social no encontrado' });
    }

    let isFollowing = false;
    let isSelf = false;

    if (req.user?.id) {
      isSelf = profile.user?._id?.toString() === req.user.id;
      if (!isSelf) {
        const followDoc = await Follow.findOne({ follower: req.user.id, following: profile.user._id });
        isFollowing = !!followDoc;
      }
    }

    res.json({
      ...profile.toObject(),
      isFollowing,
      isSelf,
    });
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
});

// PUT /api/social/profiles/me - Editar propio perfil social
router.put('/profiles/me', auth, async (req, res) => {
  try {
    const { displayName, bio, avatar, banner, jugadorRef } = req.body;

    const update = {};
    if (displayName !== undefined) update.displayName = displayName.trim();
    if (bio !== undefined) update.bio = (bio || '').slice(0, 300).trim();
    if (avatar !== undefined) update.avatar = avatar;
    if (banner !== undefined) update.banner = banner;

    if (jugadorRef !== undefined) {
      if (jugadorRef && mongoose.isValidObjectId(jugadorRef)) {
        // Verificar que el jugador exista en Football Core
        const jugador = await Jugador.findById(jugadorRef);
        if (jugador) {
          update.jugadorRef = jugador._id;
        } else {
          update.jugadorRef = null;
        }
      } else {
        update.jugadorRef = null;
      }
    }

    const updated = await SocialProfile.findOneAndUpdate(
      { user: req.user.id },
      update,
      { new: true }
    ).populate('jugadorRef', 'nombre equipo numero posicion foto bio stats esMVP');

    res.json(updated);
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
});

// GET /api/social/player-links - Mapeo de jugadores del Football Core vinculados a perfiles comunitarios
router.get('/player-links', async (req, res) => {
  try {
    const profiles = await SocialProfile.find({ jugadorRef: { $ne: null } })
      .select('username displayName avatar jugadorRef')
      .populate('jugadorRef', 'nombre equipo numero posicion foto');

    const byId = {};
    const byName = {};

    profiles.forEach((p) => {
      const info = {
        username: p.username,
        displayName: p.displayName,
        avatar: p.avatar,
      };
      if (p.jugadorRef?._id) {
        byId[p.jugadorRef._id.toString()] = info;
      }
      if (p.jugadorRef?.nombre) {
        const normName = p.jugadorRef.nombre
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim();
        byName[normName] = info;
      }
    });

    res.json({ byId, byName });
  } catch (err) {
    console.error('Error en player-links:', err);
    res.status(500).json({ message: 'Error al consultar vínculos de jugadores' });
  }
});

// POST /api/social/link-player - Vincular o desvincular atleta deportivo
router.post('/link-player', auth, async (req, res) => {
  try {
    const { jugadorId, jugadorNombre, equipo, posicion, numero } = req.body;

    let targetJugadorId = null;

    if (jugadorId && mongoose.isValidObjectId(jugadorId)) {
      const found = await Jugador.findById(jugadorId);
      if (found) targetJugadorId = found._id;
    } else if (jugadorNombre) {
      // Buscar o registrar en MongoDB el atleta para vincular
      let found = await Jugador.findOne({
        nombre: { $regex: new RegExp(`^${jugadorNombre.trim()}$`, 'i') },
      });
      if (!found) {
        found = await Jugador.create({
          nombre: jugadorNombre.trim(),
          equipo: equipo || 'Liga Football Flag',
          posicion: posicion || 'Jugador',
          numero: numero || null,
        });
      }
      targetJugadorId = found._id;
    }

    const updated = await SocialProfile.findOneAndUpdate(
      { user: req.user.id },
      { jugadorRef: targetJugadorId },
      { new: true }
    ).populate('jugadorRef', 'nombre equipo numero posicion foto bio stats esMVP');

    res.json({
      success: true,
      profile: updated,
      jugador: updated.jugadorRef,
    });
  } catch (err) {
    console.error('Error al vincular jugador:', err);
    res.status(500).json({ message: 'Error al vincular ficha deportiva' });
  }
});

// POST /api/social/unlink-player - Desvincular ficha deportiva del usuario autenticado
router.post('/unlink-player', auth, async (req, res) => {
  try {
    const updated = await SocialProfile.findOneAndUpdate(
      { user: req.user.id },
      { jugadorRef: null },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Ficha deportiva desvinculada correctamente',
      profile: updated,
    });
  } catch (err) {
    console.error('Error al desvincular jugador:', err);
    res.status(500).json({ message: 'Error al desvincular ficha deportiva' });
  }
});

// POST /api/social/admin/unlink-player - Desvincular jugador como administrador
router.post('/admin/unlink-player', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso solo para administradores' });
    }

    const { jugadorId, username } = req.body;
    let query = {};

    if (jugadorId) {
      query.jugadorRef = jugadorId;
    } else if (username) {
      query.username = username.toLowerCase().trim();
    } else {
      return res.status(400).json({ message: 'Debe especificar jugadorId o username' });
    }

    const updated = await SocialProfile.findOneAndUpdate(
      query,
      { jugadorRef: null },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Ficha deportiva desvinculada por administrador',
      profile: updated,
    });
  } catch (err) {
    console.error('Error en admin unlink-player:', err);
    res.status(500).json({ message: 'Error al desvincular atleta' });
  }
});

// GET /api/social/profiles/:username/saved - Publicaciones guardadas (solo dueño)
router.get('/profiles/:username/saved', auth, async (req, res) => {
  try {
    const profile = await SocialProfile.findOne({ username: req.params.username.toLowerCase().trim() });
    if (!profile) {
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }

    if (profile.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo puedes ver tus publicaciones guardadas' });
    }

    const savedRecords = await SavedPost.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'post',
        match: { activo: true },
        populate: [
          { path: 'author', select: 'email role' },
          { path: 'relatedPartido' },
          { path: 'relatedTeam' },
          { path: 'relatedJugador' },
        ],
      });

    const validPosts = savedRecords.map(s => s.post).filter(Boolean);
    const postsWithProfiles = await attachAuthorProfiles(validPosts, req.user.id);

    res.json(postsWithProfiles);
  } catch (err) {
    console.error('Error al obtener guardados:', err);
    res.status(500).json({ message: 'Error al obtener guardados' });
  }
});

// POST /api/social/follow/:userId - Toggle follow
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    if (targetUserId === req.user.id) {
      return res.status(400).json({ message: 'No puedes seguirte a ti mismo' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const existing = await Follow.findOne({ follower: req.user.id, following: targetUserId });

    if (existing) {
      await Follow.deleteOne({ _id: existing._id });
      await Promise.all([
        SocialProfile.findOneAndUpdate({ user: req.user.id }, { $inc: { followingCount: -1 } }),
        SocialProfile.findOneAndUpdate({ user: targetUserId }, { $inc: { followersCount: -1 } }),
      ]);
      const targetProfile = await SocialProfile.findOne({ user: targetUserId });
      return res.json({ following: false, followersCount: Math.max(0, targetProfile.followersCount) });
    } else {
      await Follow.create({ follower: req.user.id, following: targetUserId });
      await Promise.all([
        SocialProfile.findOneAndUpdate({ user: req.user.id }, { $inc: { followingCount: 1 } }),
        SocialProfile.findOneAndUpdate({ user: targetUserId }, { $inc: { followersCount: 1 } }),
        Notification.create({
          recipient: targetUserId,
          sender: req.user.id,
          type: 'follow',
        }),
      ]);
      const targetProfile = await SocialProfile.findOne({ user: targetUserId });
      return res.json({ following: true, followersCount: targetProfile.followersCount });
    }
  } catch (err) {
    console.error('Error en follow:', err);
    res.status(500).json({ message: 'Error al procesar seguimiento' });
  }
});

// -------------------------------------------------------------
// HIGHLIGHTS PERSONALES
// -------------------------------------------------------------

// GET /api/social/highlights/:username
router.get('/highlights/:username', async (req, res) => {
  try {
    const profile = await SocialProfile.findOne({ username: req.params.username.toLowerCase().trim() });
    if (!profile) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const highlights = await Highlight.find({ user: profile.user }).sort({ order: 1, createdAt: -1 });
    res.json(highlights);
  } catch (err) {
    console.error('Error al obtener highlights:', err);
    res.status(500).json({ message: 'Error al obtener historias destacadas' });
  }
});

// GET /api/social/highlights-feed - Highlights recientes para la barra superior del feed
router.get('/highlights-feed', async (req, res) => {
  try {
    const recentHighlights = await Highlight.find()
      .sort({ updatedAt: -1 })
      .limit(15)
      .populate('user', 'email');

    const userIds = recentHighlights.map(h => h.user?._id).filter(Boolean);
    const profiles = await SocialProfile.find({ user: { $in: userIds } });
    const profileMap = {};
    profiles.forEach(p => { profileMap[p.user.toString()] = p; });

    const results = recentHighlights.map(h => {
      const hObj = h.toObject();
      const uId = (hObj.user?._id || '').toString();
      hObj.authorProfile = profileMap[uId] || null;
      return hObj;
    });

    res.json(results);
  } catch (err) {
    console.error('Error al obtener highlights feed:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// POST /api/social/highlights - Crear highlight
router.post('/highlights', auth, async (req, res) => {
  try {
    const { title, cover, items } = req.body;
    if (!title || !items || items.length === 0) {
      return res.status(400).json({ message: 'El título y al menos un elemento multimedia son requeridos' });
    }

    const highlight = await Highlight.create({
      user: req.user.id,
      title: title.trim(),
      cover: cover || (items[0]?.mediaUrl || ''),
      items,
    });

    res.status(201).json(highlight);
  } catch (err) {
    console.error('Error al crear highlight:', err);
    res.status(500).json({ message: 'Error al crear historia destacada' });
  }
});

// DELETE /api/social/highlights/:id
router.delete('/highlights/:id', auth, async (req, res) => {
  try {
    const highlight = await Highlight.findById(req.params.id);
    if (!highlight) {
      return res.status(404).json({ message: 'Historia no encontrada' });
    }
    if (highlight.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }
    await Highlight.deleteOne({ _id: highlight._id });
    res.json({ message: 'Historia eliminada' });
  } catch (err) {
    console.error('Error al borrar highlight:', err);
    res.status(500).json({ message: 'Error al eliminar historia destacada' });
  }
});

// -------------------------------------------------------------
// NOTIFICACIONES
// -------------------------------------------------------------

// GET /api/social/notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(40)
      .populate('sender', 'email')
      .populate('post', 'content media');

    const senderIds = notifications.map(n => n.sender?._id).filter(Boolean);
    const profiles = await SocialProfile.find({ user: { $in: senderIds } });
    const profileMap = {};
    profiles.forEach(p => { profileMap[p.user.toString()] = p; });

    const results = notifications.map(n => {
      const nObj = n.toObject();
      const sId = (nObj.sender?._id || '').toString();
      nObj.senderProfile = profileMap[sId] || null;
      return nObj;
    });

    res.json(results);
  } catch (err) {
    console.error('Error al obtener notificaciones:', err);
    res.status(500).json({ message: 'Error al obtener notificaciones' });
  }
});

// PUT /api/social/notifications/read - Marcar todas como leídas
router.put('/notifications/read', auth, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    console.error('Error al marcar leídas:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// -------------------------------------------------------------
// EXPLORAR & TENDENCIAS
// -------------------------------------------------------------
router.get('/explore', optionalAuth, async (req, res) => {
  try {
    // 1. Tags más populares
    const tagAggregate = await Post.aggregate([
      { $match: { activo: true, tags: { $exists: true, $ne: [] } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const trendingTags = tagAggregate.map(t => ({ tag: t._id, count: t.count }));

    // 2. Posts más populares (más likes y comentarios)
    const topPostsRaw = await Post.find({ activo: true })
      .sort({ likesCount: -1, commentsCount: -1, createdAt: -1 })
      .limit(12)
      .populate('author', 'email')
      .populate('relatedPartido')
      .populate('relatedTeam')
      .populate('relatedJugador');
    const topPosts = await attachAuthorProfiles(topPostsRaw, req.user?.id);

    // 3. Usuarios recomendados
    const recommendedProfiles = await SocialProfile.find()
      .sort({ followersCount: -1, postsCount: -1 })
      .limit(6)
      .populate('jugadorRef', 'nombre equipo numero posicion foto');

    res.json({
      trendingTags,
      topPosts,
      recommendedProfiles,
    });
  } catch (err) {
    console.error('Error en explore:', err);
    res.status(500).json({ message: 'Error al cargar explorar' });
  }
});

// -------------------------------------------------------------
// REPORTES
// -------------------------------------------------------------
router.post('/report', auth, async (req, res) => {
  try {
    const { postId, commentId, reason, description } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'El motivo del reporte es requerido' });
    }

    await Report.create({
      reporter: req.user.id,
      post: postId || null,
      comment: commentId || null,
      reason,
      description: (description || '').trim(),
    });

    res.status(201).json({ message: 'Reporte recibido. Gracias por ayudar a cuidar la comunidad.' });
  } catch (err) {
    console.error('Error en reporte:', err);
    res.status(500).json({ message: 'Error al enviar reporte' });
  }
});

module.exports = router;
