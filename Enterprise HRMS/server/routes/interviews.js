const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const Recruitment = require('../models/Recruitment');

const router = express.Router();

// @route   GET /api/interviews
// @desc    Get all interviews
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const interviews = await Interview.findAll({
      include: [
        {
          model: Candidate,
          attributes: ['firstName', 'lastName', 'email']
        },
        {
          model: Recruitment,
          attributes: ['title']
        }
      ],
      order: [['scheduledDate', 'ASC']]
    });

    res.json(interviews);
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/interviews
// @desc    Schedule new interview
// @access  Private (Admin, HR Manager)
router.post('/', [
  auth,
  authorize('Admin', 'HR Manager'),
  body('candidateId').isUUID().withMessage('Valid candidate ID is required'),
  body('recruitmentId').isUUID().withMessage('Valid recruitment ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const interview = await Interview.create(req.body);
    res.status(201).json(interview);
  } catch (error) {
    console.error('Create interview error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
