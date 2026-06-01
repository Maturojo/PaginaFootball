require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    /\.vercel\.app$/,
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión MongoDB reutilizable (crítico para serverless)
let isConnected = false;
const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
};

// Middleware que conecta ANTES de cada request (para serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: 'Error de conexión a la base de datos' });
  }
});

// Rutas
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
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

// Arranque local
if (process.env.LOCAL === 'true') {
  connectDB().then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Servidor corriendo en puerto ${process.env.PORT || 5000}`)
    );
  }).catch(err => {
    console.error('Error conectando MongoDB:', err.message);
    process.exit(1);
  });
}

module.exports = app;
