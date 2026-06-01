const router = require('express').Router();
const Page = require('../models/Page');
const auth = require('../middleware/auth');

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

module.exports = router;
