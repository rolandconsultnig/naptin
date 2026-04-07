const express = require('express');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/learning
// @desc    Get learning courses
// @access  Private
router.get('/', auth, (req, res) => {
  res.json({ message: 'Learning module - coming soon' });
});

module.exports = router;
