const router = require('express').Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fileUrl = require('../middleware/fileUrl');

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ activo: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/all', auth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.activo) return res.status(404).json({ message: 'No encontrado' });
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, (req, res) => {
  upload.single('imagen')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    try {
      const data = { ...req.body };
      if (req.file) data.imagen = fileUrl(req.file);
      const product = await Product.create(data);
      res.status(201).json(product);
    } catch (e) { res.status(400).json({ message: e.message }); }
  });
});

router.put('/:id', auth, (req, res) => {
  upload.single('imagen')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    try {
      const data = { ...req.body };
      if (req.file) data.imagen = fileUrl(req.file);
      const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
      res.json(product);
    } catch (e) { res.status(400).json({ message: e.message }); }
  });
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { activo: false });
    res.json({ message: 'Producto eliminado' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
