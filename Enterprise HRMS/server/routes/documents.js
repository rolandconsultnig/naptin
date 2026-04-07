const express = require('express');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/documents
// @desc    Get documents
// @access  Private
router.get('/', auth, (req, res) => {
  res.json({ message: 'Document management module - coming soon' });
});

module.exports = router;
