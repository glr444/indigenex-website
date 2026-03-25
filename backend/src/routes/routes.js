const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const routeController = require('../controllers/routeController');

// All routes require authentication
router.use(authenticate);

// Route management routes
router.get('/', routeController.getRoutes);
router.get('/:id', routeController.getRouteById);
router.post('/', routeController.createRoute);
router.put('/:id', routeController.updateRoute);
router.delete('/:id', routeController.deleteRoute);

module.exports = router;
