require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_ID_PASSWORD}@cluster0.pu9lk.mongodb.net/?${process.env.DB_NAME}=true&w=majority`
  )
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('Could not connect to MongoDB', err);
  });

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const userRoutes = require('./routes/user');

app.use('/api/auth', userRoutes);

module.exports = app;
