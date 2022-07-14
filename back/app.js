// Permet de créer des variavles d'environnement pour protégers les données sensibles dans le fichier .env
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Connexion à la base de données MongoDB
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
// Donne accès aux corps de la requête à travers req.body

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.json());

// Les routes
const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauce');

// Indique à Express qu'il faut gérer la ressource images de manière statique
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth', userRoutes);
app.use('/api/sauces', saucesRoutes);

module.exports = app;
