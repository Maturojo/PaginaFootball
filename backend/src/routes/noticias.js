const router = require('express').Router();
const Noticia = require('../models/Noticia');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fileUrl = require('../middleware/fileUrl');

router.get('/', async (req, res) => {
  try {
    const noticias = await Noticia.find({ activo: true }).sort({ createdAt: -1 });
    res.json(noticias);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/all', auth, async (req, res) => {
  try {
    const noticias = await Noticia.find().sort({ createdAt: -1 });
    res.json(noticias);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const n = await Noticia.findById(req.params.id);
    if (!n) return res.status(404).json({ message: 'No encontrada' });
    res.json(n);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, (req, res) => {
  upload.single('imagen')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    try {
      const data = { ...req.body };
      if (req.file) data.imagen = fileUrl(req.file);
      res.status(201).json(await Noticia.create(data));
    } catch (e) { res.status(400).json({ message: e.message }); }
  });
});

router.put('/:id', auth, (req, res) => {
  upload.single('imagen')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    try {
      const data = { ...req.body };
      if (req.file) data.imagen = fileUrl(req.file);
      res.json(await Noticia.findByIdAndUpdate(req.params.id, data, { new: true }));
    } catch (e) { res.status(400).json({ message: e.message }); }
  });
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Noticia.findByIdAndUpdate(req.params.id, { activo: false });
    res.json({ message: 'Eliminado' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
