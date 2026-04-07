const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Performance = require('../models/Performance');
const Employee = require('../models/Employee');

const router = express.Router();

// @route   GET /api/performance
// @desc    Get performance reviews
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { employeeId, status, reviewType } = req.query;
    const whereClause = {};
    
    if (employeeId) whereClause.employeeId = employeeId;
    if (status) whereClause.status = status;
    if (reviewType) whereClause.reviewType = reviewType;

    const performances = await Performance.findAll({
      where: whereClause,
      include: [
        {
        model: Employee,
        as: 'employee',
          attributes: ['firstName', 'lastName', 'email']
        },
        {
        model: Employee,
        as: 'reviewer',
          attributes: ['firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(performances);
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/performance
// @desc    Create performance review
// @access  Private (Admin, HR Manager)
router.post('/', [
  auth,
  authorize('Admin', 'HR Manager'),
  body('employeeId').isUUID().withMessage('Valid employee ID is required'),
  body('reviewerId').isUUID().withMessage('Valid reviewer ID is required'),
  body('reviewPeriod').notEmpty().withMessage('Review period is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const performance = await Performance.create(req.body);
    res.status(201).json(performance);
  } catch (error) {
    console.error('Create performance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
