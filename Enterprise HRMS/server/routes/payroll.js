const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

const router = express.Router();

// @route   GET /api/payroll
// @desc    Get payroll records
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { employeeId, payDate, status } = req.query;
    const whereClause = {};
    
    if (employeeId) whereClause.employeeId = employeeId;
    if (payDate) whereClause.payDate = payDate;
    if (status) whereClause.status = status;

    const payrolls = await Payroll.findAll({
      where: whereClause,
      include: [
        {
        model: Employee,
        as: 'employee',
          attributes: ['firstName', 'lastName', 'email']
        }
      ],
      order: [['payDate', 'DESC']]
    });

    res.json(payrolls);
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/payroll
// @desc    Create payroll record
// @access  Private (Admin, HR Manager)
router.post('/', [
  auth,
  authorize('Admin', 'HR Manager'),
  body('employeeId').isUUID().withMessage('Valid employee ID is required'),
  body('payDate').isISO8601().withMessage('Valid pay date is required'),
  body('basicSalary').isNumeric().withMessage('Valid basic salary is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const payroll = await Payroll.create(req.body);
    res.status(201).json(payroll);
  } catch (error) {
    console.error('Create payroll error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
