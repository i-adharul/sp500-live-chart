if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const router = require('./routes');
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('query parser', 'extended');

app.use('/api', router);

module.exports = app;
