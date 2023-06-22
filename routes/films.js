const express = require('express');
const router = express.Router();
const filmsController = require('../controllers/filmsController');

// Récupérer la liste des films
router.get('/film', filmsController.getFilms);

// Récupérer un film par son ID
router.get('/film/:id', filmsController.getFilmById);

// Créer un nouveau film
router.post('/film', filmsController.createFilm);

// Mettre à jour un film
router.put('/film/:id', filmsController.updateFilm);

// Supprimer un film
router.delete('/film/:id', filmsController.deleteFilm);

module.exports = router;
