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

router.post('/testimonios', (req, res) => {
  upload.single('imagen')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    try {
      const nombre = String(req.body.nombre || '').trim();
      const rol = String(req.body.rol || '').trim();
      const texto = String(req.body.texto || '').trim();
      const imagen = fileUrl(req.file) || '';

      if (!nombre || !texto) {
        return res.status(400).json({ message: 'Nombre y testimonio son obligatorios' });
      }

      const page = await Page.findOne({ key: 'testimonios' });
      const items = Array.isArray(page?.contenido?.items) ? page.contenido.items : [];
      const testimonio = {
        nombre: nombre.slice(0, 80),
        rol: rol.slice(0, 100),
        texto: texto.slice(0, 700),
        imagen,
        activo: true,
        enviadoDesdeWeb: true,
        createdAt: new Date().toISOString(),
      };

      const updatedPage = await Page.findOneAndUpdate(
        { key: 'testimonios' },
        { contenido: { ...(page?.contenido || {}), items: [testimonio, ...items] } },
        { new: true, upsert: true }
      );

      res.status(201).json({ testimonio, page: updatedPage });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });
});

router.post('/upload/image', auth, upload.single('imagen'), async (req, res) => {
  const url = fileUrl(req.file);
  if (!url) return res.status(400).json({ message: 'No se subió ninguna imagen' });
  res.json({ url });
});

module.exports = router;
