const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const authRoutes  = require('./routes/auth');
const statsRoutes = require('./routes/stats');
const catRoutes   = require('./routes/categories');
const testRoutes  = require('./routes/tests');
const quesRoutes  = require('./routes/questions');
const userRoutes  = require('./routes/users');
const attemptsRoute = require('./routes/attempts');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',       authRoutes);
app.use('/api/stats',      statsRoutes);
app.use('/api/categories', catRoutes);
app.use('/api/tests',      testRoutes);
app.use('/api/questions',  quesRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/attempts', attemptsRoute);


mongoose
  .connect('mongodb://127.0.0.1/plataforma', { useNewUrlParser:true, useUnifiedTopology:true })
  .then(() => app.listen(5000))
  .catch(console.error);
