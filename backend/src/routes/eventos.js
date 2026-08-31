const router = require('express').Router();
const Evento = require('../models/Evento');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fileUrl = require('../middleware/fileUrl');

const MAX_FOTOS_POR_PEDIDO = 50;
const EVENTOS_SORT = { fijado: -1, orden: 1, createdAt: -1, fecha: -1 };

function uploadFotos(req, res, next) {
  upload.array('fotos', MAX_FOTOS_POR_PEDIDO)(req, res, (err) => {
    if (!err) return next();

    const messages = {
      LIMIT_FILE_COUNT: `Podés subir hasta ${MAX_FOTOS_POR_PEDIDO} fotos por tanda.`,
      LIMIT_FILE_SIZE: 'Cada foto puede pesar hasta 10 MB.',
    };

    return res.status(400).json({ message: messages[err.code] || err.message });
  });
}

function normalizeEventoData(body) {
  const data = { ...body };

  if (data.fijado !== undefined) {
    data.fijado = data.fijado === true || data.fijado === 'true' || data.fijado === 'on';
  }

  if (data.orden !== undefined) {
    const orden = Number(data.orden);
    data.orden = Number.isFinite(orden) ? orden : 0;
  }

  return data;
}

router.get('/', async (req, res) => {
  try {
    const eventos = await Evento.find({ activo: true }).sort(EVENTOS_SORT);
    res.json(eventos);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/all', auth, async (req, res) => {
  try {
    const eventos = await Evento.find().sort(EVENTOS_SORT);
    res.json(eventos);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) return res.status(404).json({ message: 'No encontrado' });
    res.json(evento);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, uploadFotos, async (req, res) => {
  try {
    const data = normalizeEventoData(req.body);
    if (req.files?.length) data.fotos = req.files.map(f => fileUrl(f));
    const evento = await Evento.create(data);
    res.status(201).json(evento);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', auth, uploadFotos, async (req, res) => {
  try {
    const existing = await Evento.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'No encontrado' });

    const data = normalizeEventoData(req.body);
    const nuevasFotos = req.files?.map(f => fileUrl(f)) || [];
    data.fotos = [...(existing.fotos || []), ...nuevasFotos];
    const evento = await Evento.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(evento);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id/foto', auth, async (req, res) => {
  try {
    const { url } = req.body;
    await Evento.findByIdAndUpdate(req.params.id, { $pull: { fotos: url } });
    res.json({ message: 'Foto eliminada' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Evento.findByIdAndUpdate(req.params.id, { activo: false });
    res.json({ message: 'Eliminado' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
