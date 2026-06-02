const router = require('express').Router();
const Jugador = require('../models/Jugador');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fileUrl = require('../middleware/fileUrl');

router.get('/', async (req, res) => {
  const jugadores = await Jugador.find({ activo: true }).sort({ equipo: 1, numero: 1 });
  res.json(jugadores);
});
router.get('/mvp', async (req, res) => {
  const mvps = await Jugador.find({ activo: true, esMVP: true });
  res.json(mvps);
});
router.get('/all', auth, async (req, res) => {
  const jugadores = await Jugador.find().sort({ equipo: 1, numero: 1 });
  res.json(jugadores);
});
router.post('/', auth, upload.single('foto'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.foto = fileUrl(req.file);
    if (typeof data.stats === 'string') data.stats = JSON.parse(data.stats);
    res.status(201).json(await Jugador.create(data));
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.put('/:id', auth, upload.single('foto'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.foto = fileUrl(req.file);
    if (typeof data.stats === 'string') data.stats = JSON.parse(data.stats);
    res.json(await Jugador.findByIdAndUpdate(req.params.id, data, { new: true }));
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  await Jugador.findByIdAndUpdate(req.params.id, { activo: false });
  res.json({ message: 'Eliminado' });
});
module.exports = router;
