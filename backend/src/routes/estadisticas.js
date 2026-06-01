const router = require('express').Router();
const Estadistica = require('../models/Estadistica');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  const stats = await Estadistica.find({ activo: true }).sort({ createdAt: -1 });
  res.json(stats);
});

router.get('/all', auth, async (req, res) => {
  const stats = await Estadistica.find().sort({ createdAt: -1 });
  res.json(stats);
});

router.post('/', auth, async (req, res) => {
  try {
    const stat = await Estadistica.create(req.body);
    res.status(201).json(stat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const stat = await Estadistica.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(stat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  await Estadistica.findByIdAndUpdate(req.params.id, { activo: false });
  res.json({ message: 'Eliminado' });
});

module.exports = router;
