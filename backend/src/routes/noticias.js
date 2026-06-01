const router = require('express').Router();
const Noticia = require('../models/Noticia');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'src/uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', async (req, res) => {
  const noticias = await Noticia.find({ activo: true }).sort({ createdAt: -1 });
  res.json(noticias);
});
router.get('/all', auth, async (req, res) => {
  const noticias = await Noticia.find().sort({ createdAt: -1 });
  res.json(noticias);
});
router.get('/:id', async (req, res) => {
  const n = await Noticia.findById(req.params.id);
  if (!n) return res.status(404).json({ message: 'No encontrada' });
  res.json(n);
});
router.post('/', auth, upload.single('imagen'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.imagen = `/uploads/${req.file.filename}`;
    res.status(201).json(await Noticia.create(data));
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.put('/:id', auth, upload.single('imagen'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.imagen = `/uploads/${req.file.filename}`;
    res.json(await Noticia.findByIdAndUpdate(req.params.id, data, { new: true }));
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  await Noticia.findByIdAndUpdate(req.params.id, { activo: false });
  res.json({ message: 'Eliminado' });
});
module.exports = router;
