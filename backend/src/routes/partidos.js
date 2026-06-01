const router = require('express').Router();
const Partido = require('../models/Partido');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  const partidos = await Partido.find({ activo: true }).sort({ fecha: 1 });
  res.json(partidos);
});
router.get('/all', auth, async (req, res) => {
  const partidos = await Partido.find().sort({ fecha: 1 });
  res.json(partidos);
});
router.post('/', auth, async (req, res) => {
  try { res.status(201).json(await Partido.create(req.body)); }
  catch (err) { res.status(400).json({ message: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try { res.json(await Partido.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(400).json({ message: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  await Partido.findByIdAndUpdate(req.params.id, { activo: false });
  res.json({ message: 'Eliminado' });
});
module.exports = router;
