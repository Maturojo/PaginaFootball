const router = require('express').Router();
const Inscripcion = require('../models/Inscripcion');
const auth = require('../middleware/auth');
const { sendInscripcionConfirmation } = require('../services/confirmationEmail');

router.post('/', async (req, res) => {
  try {
    const inscripcion = await Inscripcion.create(req.body);
    let confirmacion = { sent: false };

    try {
      confirmacion = await sendInscripcionConfirmation(inscripcion);
    } catch (emailError) {
      console.error('Error al enviar confirmacion de inscripcion:', emailError.message);
      confirmacion = { sent: false, reason: emailError.message };
    }

    res.status(201).json({ inscripcion, confirmacion });
  }
  catch (err) { res.status(400).json({ message: err.message }); }
});
router.get('/all', auth, async (req, res) => {
  const insc = await Inscripcion.find().sort({ createdAt: -1 });
  res.json(insc);
});
router.put('/:id', auth, async (req, res) => {
  res.json(await Inscripcion.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
router.delete('/:id', auth, async (req, res) => {
  await Inscripcion.findByIdAndDelete(req.params.id);
  res.json({ message: 'Eliminado' });
});
module.exports = router;
