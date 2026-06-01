const router = require('express').Router();
const Team = require('../models/Team');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', async (req, res) => {
  const teams = await Team.find({ activo: true }).sort({ nombre: 1 });
  res.json(teams);
});

router.get('/all', auth, async (req, res) => {
  const teams = await Team.find().sort({ nombre: 1 });
  res.json(teams);
});

router.post('/', auth, upload.single('logo'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.logo = `/uploads/${req.file.filename}`;
    const team = await Team.create(data);
    res.status(201).json(team);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, upload.single('logo'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.logo = `/uploads/${req.file.filename}`;
    const team = await Team.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(team);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  await Team.findByIdAndUpdate(req.params.id, { activo: false });
  res.json({ message: 'Equipo eliminado' });
});

module.exports = router;
