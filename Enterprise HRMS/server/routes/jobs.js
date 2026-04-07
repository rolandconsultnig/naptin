const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Job = require('../models/Job');
const Department = require('../models/Department');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const jobs = await Job.findAll({
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['name', 'code']
        }
      ],
      order: [['title', 'ASC']]
    });

    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/jobs
// @desc    Create new job
// @access  Private (Admin, HR Manager)
router.post('/', [
  auth,
  authorize('Admin', 'HR Manager'),
  body('title').notEmpty().withMessage('Job title is required'),
  body('code').notEmpty().withMessage('Job code is required'),
  body('departmentId').isUUID().withMessage('Valid department ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
