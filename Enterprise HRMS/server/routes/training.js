const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Training = require('../models/Training');
const EmployeeTraining = require('../models/EmployeeTraining');
const Employee = require('../models/Employee');

const router = express.Router();

// @route   GET /api/training
// @desc    Get all training programs
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const trainings = await Training.findAll({
      where: { status: 'Published' },
      order: [['startDate', 'ASC']]
    });

    res.json(trainings);
  } catch (error) {
    console.error('Get trainings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/training
// @desc    Create new training program
// @access  Private (Admin, HR Manager)
router.post('/', [
  auth,
  authorize('Admin', 'HR Manager'),
  body('title').notEmpty().withMessage('Training title is required'),
  body('type').isIn(['Online Course', 'In-person Training', 'Webinar', 'Workshop', 'Certification', 'Mentoring', 'Coaching', 'Other']).withMessage('Valid training type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const training = await Training.create(req.body);
    res.status(201).json(training);
  } catch (error) {
    console.error('Create training error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/training/employee/:employeeId
// @desc    Get employee training enrollments
// @access  Private
router.get('/employee/:employeeId', auth, async (req, res) => {
  try {
    const employeeTrainings = await EmployeeTraining.findAll({
      where: { employeeId: req.params.employeeId },
      include: [
        {
          model: Training,
          attributes: ['title', 'type', 'description', 'duration']
        }
      ],
      order: [['enrollmentDate', 'DESC']]
    });

    res.json(employeeTrainings);
  } catch (error) {
    console.error('Get employee trainings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
