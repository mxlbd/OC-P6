const express = require('express');
const router = express.Router();

// Middleware
const auth = require('../middleware/auth');
const multer = require('../middleware/multer');

// Controlleurs
const {
  createSauce,
  getAllSauces,
  getOneSauce,
  updateSauce,
  deleteSauce,
  likeDislikeSauce,
} = require('../controllers/sauce');

// Routes
router.post('/', auth, multer, createSauce);
router.get('/', auth, getAllSauces);
router.get('/:id', auth, getOneSauce);
router.put('/:id', auth, multer, updateSauce);
router.delete('/:id', auth, multer, deleteSauce);
router.post('/:id/like', auth, likeDislikeSauce);

module.exports = router;
