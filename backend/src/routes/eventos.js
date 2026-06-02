const router = require('express').Router();
const Evento = require('../models/Evento');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fileUrl = require('../middleware/fileUrl');

router.get('/', async (req, res) => {
  const eventos = await Evento.find({ activo: true }).sort({ fecha: -1 });
  res.json(eventos);
});

router.get('/all', auth, async (req, res) => {
  const eventos = await Evento.find().sort({ fecha: -1 });
  res.json(eventos);
});

router.get('/:id', async (req, res) => {
  const evento = await Evento.findById(req.params.id);
  if (!evento) return res.status(404).json({ message: 'No encontrado' });
  res.json(evento);
});

router.post('/', auth, upload.array('fotos', 20), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.length) data.fotos = req.files.map(f => fileUrl(f));
    const evento = await Evento.create(data);
    res.status(201).json(evento);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, upload.array('fotos', 20), async (req, res) => {
  try {
    const existing = await Evento.findById(req.params.id);
    const data = { ...req.body };
    const nuevasFotos = req.files?.map(f => fileUrl(f)) || [];
    // Mantener fotos existentes + agregar nuevas
    data.fotos = [...(existing.fotos || []), ...nuevasFotos];
    const evento = await Evento.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(evento);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id/foto', auth, async (req, res) => {
  try {
    const { url } = req.body;
    await Evento.findByIdAndUpdate(req.params.id, { $pull: { fotos: url } });
    res.json({ message: 'Foto eliminada' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  await Evento.findByIdAndUpdate(req.params.id, { activo: false });
  res.json({ message: 'Eliminado' });
});

module.exports = router;
