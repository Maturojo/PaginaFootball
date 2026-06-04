const router = require('express').Router();
const Team = require('../models/Team');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fileUrl = require('../middleware/fileUrl');

router.get('/', async (req, res) => {
  try {
    const teams = await Team.find({ activo: true }).sort({ nombre: 1 });
    res.json(teams);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/all', auth, async (req, res) => {
  try {
    const teams = await Team.find().sort({ nombre: 1 });
    res.json(teams);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, (req, res) => {
  upload.single('logo')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    try {
      const data = { ...req.body };
      if (req.file) data.logo = fileUrl(req.file);
      const team = await Team.create(data);
      res.status(201).json(team);
    } catch (e) { res.status(400).json({ message: e.message }); }
  });
});

router.put('/:id', auth, (req, res) => {
  upload.single('logo')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    try {
      const data = { ...req.body };
      if (req.file) data.logo = fileUrl(req.file);
      const team = await Team.findByIdAndUpdate(req.params.id, data, { new: true });
      res.json(team);
    } catch (e) { res.status(400).json({ message: e.message }); }
  });
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Team.findByIdAndUpdate(req.params.id, { activo: false });
    res.json({ message: 'Equipo eliminado' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
