const express = require('express');
const router = express.Router();
const genresController = require('../controllers/genresController');

// Routes pour les genres
router.get('/genre', genresController.getGenres);
router.post('/genre', genresController.createGenre);
router.delete('/genre/:id', genresController.deleteGenre);

module.exports = router;
