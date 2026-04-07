const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Benefit = require('../models/Benefit');
const EmployeeBenefit = require('../models/EmployeeBenefit');
const Employee = require('../models/Employee');

const router = express.Router();

// @route   GET /api/benefits
// @desc    Get all benefits
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const benefits = await Benefit.findAll({
      where: { status: 'Active' },
      order: [['name', 'ASC']]
    });

    res.json(benefits);
  } catch (error) {
    console.error('Get benefits error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/benefits
// @desc    Create new benefit
// @access  Private (Admin, HR Manager)
router.post('/', [
  auth,
  authorize('Admin', 'HR Manager'),
  body('name').notEmpty().withMessage('Benefit name is required'),
  body('type').isIn(['Health', 'Dental', 'Vision', 'Life Insurance', 'Retirement', 'Wellness', 'Transportation', 'Education', 'Other']).withMessage('Valid benefit type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const benefit = await Benefit.create(req.body);
    res.status(201).json(benefit);
  } catch (error) {
    console.error('Create benefit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/benefits/employee/:employeeId
// @desc    Get employee benefits
// @access  Private
router.get('/employee/:employeeId', auth, async (req, res) => {
  try {
    const employeeBenefits = await EmployeeBenefit.findAll({
      where: { employeeId: req.params.employeeId },
      include: [
        {
          model: Benefit,
          attributes: ['name', 'type', 'description', 'provider']
        }
      ],
      order: [['enrollmentDate', 'DESC']]
    });

    res.json(employeeBenefits);
  } catch (error) {
    console.error('Get employee benefits error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
