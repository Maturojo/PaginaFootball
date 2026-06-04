const router = require('express').Router();
const Lider = require('../models/Lider');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  const { temporada } = req.query;
  const filter = { activo: true };
  if (temporada) filter.temporada = temporada;
  const lideres = await Lider.find(filter).sort({ tipo: 1 });
  res.json(lideres);
});

router.get('/temporadas', async (req, res) => {
  const temporadas = await Lider.distinct('temporada', { activo: true });
  res.json(temporadas);
});

router.post('/', auth, async (req, res) => {
  try {
    const lider = await Lider.create(req.body);
    res.status(201).json(lider);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const lider = await Lider.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(lider);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  await Lider.findByIdAndUpdate(req.params.id, { activo: false });
  res.json({ message: 'Eliminado' });
});

module.exports = router;
