const express = require('express');
const router = express.Router();

// Middleware
const auth = require('../middleware/auth');
const multer = require('../middleware/multer');

// Controlleurs
const {
  readAllSauces,
  readOneSauce,
  createSauce,
  updateSauce,
  deleteSauce,
  likeDislikeSauce,
} = require('../controllers/sauce');

// Routes
router.get('/', auth, readAllSauces);
router.get('/:id', auth, readOneSauce);
router.post('/', auth, multer, createSauce);
router.put('/:id', auth, multer, updateSauce);
router.delete('/:id', auth, multer, deleteSauce);
router.post('/:id/like', auth, likeDislikeSauce);

module.exports = router;
