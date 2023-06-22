const express = require('express');
const router = express.Router();
const actorsController = require('../controllers/actorsController');

// Routes pour les acteurs
router.get('/actor', actorsController.getActors);
router.get('/actor/:id', actorsController.getActorById);
router.post('/actor', actorsController.createActor);
router.put('/actor/:id', actorsController.updateActor);
router.delete('/actor/:id', actorsController.deleteActor);

module.exports = router;
