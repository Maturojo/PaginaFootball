const router = require('express').Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'src/uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', async (req, res) => {
  const products = await Product.find({ activo: true }).sort({ createdAt: -1 });
  res.json(products);
});

router.get('/all', auth, async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

router.post('/', auth, upload.single('imagen'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.imagen = `/uploads/${req.file.filename}`;
    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, upload.single('imagen'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.imagen = `/uploads/${req.file.filename}`;
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { activo: false });
  res.json({ message: 'Producto eliminado' });
});

module.exports = router;
