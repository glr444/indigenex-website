const express = require('express');
const router = express.Router();
const {
  submitContact,
  getAllContacts,
  getContactById,
  markAsRead,
  deleteContact
} = require('../controllers/contactController');
const { authenticate } = require('../middleware/auth');

// Public route
router.post('/submit', submitContact);

// Protected routes (admin)
router.get('/', authenticate, getAllContacts);
router.get('/:id', authenticate, getContactById);
router.patch('/:id/read', authenticate, markAsRead);
router.delete('/:id', authenticate, deleteContact);

module.exports = router;
