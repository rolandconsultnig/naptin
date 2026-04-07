const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

const router = express.Router();

// @route   GET /api/leave
// @desc    Get leave requests
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { employeeId, status, type } = req.query;
    const whereClause = {};
    
    if (employeeId) whereClause.employeeId = employeeId;
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;

    const leaves = await Leave.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['firstName', 'lastName', 'email']
        },
        {
          model: Employee,
          as: 'approver',
          attributes: ['firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(leaves);
  } catch (error) {
    console.error('Get leave error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/leave
// @desc    Create leave request
// @access  Private
router.post('/', [
  auth,
  body('employeeId').isUUID().withMessage('Valid employee ID is required'),
  body('type').isIn(['Annual', 'Sick', 'Personal', 'Maternity', 'Paternity', 'Bereavement', 'Unpaid', 'Other']).withMessage('Valid leave type is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const leave = await Leave.create(req.body);
    res.status(201).json(leave);
  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/leave/:id/approve
// @desc    Approve/reject leave request
// @access  Private (Admin, HR Manager)
router.put('/:id/approve', [
  auth,
  authorize('Admin', 'HR Manager'),
  body('status').isIn(['Approved', 'Rejected']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const leave = await Leave.findByPk(req.params.id);
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    await leave.update({
      status: req.body.status,
      approvedBy: req.user.id,
      approvedAt: new Date(),
      rejectionReason: req.body.rejectionReason
    });

    res.json(leave);
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
