const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const carrierController = require('../controllers/carrierController');

// All routes require authentication
router.use(authenticate);

// Carrier management routes
router.get('/', carrierController.getCarriers);
router.get('/:id', carrierController.getCarrierById);
router.post('/', carrierController.createCarrier);
router.put('/:id', carrierController.updateCarrier);
router.delete('/:id', carrierController.deleteCarrier);

module.exports = router;
