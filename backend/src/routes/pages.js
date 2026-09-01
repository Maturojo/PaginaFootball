const router = require('express').Router();
const Page = require('../models/Page');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fileUrl = require('../middleware/fileUrl');

router.get('/:key', async (req, res) => {
  const page = await Page.findOne({ key: req.params.key });
  res.json(page || { key: req.params.key, contenido: {} });
});

router.put('/:key', auth, async (req, res) => {
  const page = await Page.findOneAndUpdate(
    { key: req.params.key },
    { contenido: req.body.contenido },
    { new: true, upsert: true }
  );
  res.json(page);
});

router.post('/upload/image', auth, upload.single('imagen'), async (req, res) => {
  const url = fileUrl(req.file);
  if (!url) return res.status(400).json({ message: 'No se subió ninguna imagen' });
  res.json({ url });
});

module.exports = router;
