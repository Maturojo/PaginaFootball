try { require('dotenv').config(); } catch {}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Servir uploads locales
const uploadsDir = path.join(__dirname, 'uploads');
try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch {}
app.use('/uploads', express.static(uploadsDir));

// MongoDB
let isConnected = false;
const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
  console.log('MongoDB conectado');
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB Error:', err.message);
    res.status(500).json({ message: 'Error de base de datos', error: err.message });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.json({
      status: 'ok',
      mongo: 'conectado',
      env: !!process.env.MONGODB_URI,
      cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
      cloudinaryName: process.env.CLOUDINARY_CLOUD_NAME || 'NO CONFIGURADO'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message, env: !!process.env.MONGODB_URI });
  }
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/products', require('./routes/products'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/estadisticas', require('./routes/estadisticas'));
app.use('/api/eventos', require('./routes/eventos'));
app.use('/api/partidos', require('./routes/partidos'));
app.use('/api/jugadores', require('./routes/jugadores'));
app.use('/api/noticias', require('./routes/noticias'));
app.use('/api/inscripciones', require('./routes/inscripciones'));

if (process.env.LOCAL === 'true') {
  connectDB().then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Servidor en puerto ${process.env.PORT || 5000}`)
    );
  }).catch(err => { console.error(err.message); process.exit(1); });
}

module.exports = app;
