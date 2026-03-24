const express = require('express');
const router = express.Router();
const {
  getAllNews,
  getPublishedNews,
  getNewsBySlug,
  getNewsById,
  createNews,
  updateNews,
  deleteNews
} = require('../controllers/newsController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/public', getPublishedNews);
router.get('/public/:slug', getNewsBySlug);

// Protected routes (admin)
router.get('/', authenticate, getAllNews);
router.get('/:id', authenticate, getNewsById);
router.post('/', authenticate, createNews);
router.put('/:id', authenticate, updateNews);
router.delete('/:id', authenticate, deleteNews);

module.exports = router;
