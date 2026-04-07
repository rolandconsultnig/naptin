const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Recruitment = require('../models/Recruitment');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');
const Job = require('../models/Job');
const Department = require('../models/Department');
const Employee = require('../models/Employee');

const router = express.Router();

// @route   GET /api/recruitment
// @desc    Get all recruitment campaigns
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, departmentId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (departmentId) whereClause.departmentId = departmentId;

    const recruitments = await Recruitment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Job,
          attributes: ['title', 'code']
        },
        {
          model: Department,
          attributes: ['name', 'code']
        },
        {
          model: Employee,
          as: 'hiringManager',
          attributes: ['firstName', 'lastName', 'email']
        },
        {
          model: Employee,
          as: 'recruiter',
          attributes: ['firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      recruitments: recruitments.rows,
      total: recruitments.count,
      pages: Math.ceil(recruitments.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get recruitments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/recruitment/:id
// @desc    Get recruitment campaign by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const recruitment = await Recruitment.findByPk(req.params.id, {
      include: [
        {
          model: Job,
          attributes: ['title', 'code', 'description', 'requirements']
        },
        {
          model: Department,
          attributes: ['name', 'code']
        },
        {
          model: Employee,
          as: 'hiringManager',
          attributes: ['firstName', 'lastName', 'email']
        },
        {
          model: Employee,
          as: 'recruiter',
          attributes: ['firstName', 'lastName', 'email']
        }
      ]
    });

    if (!recruitment) {
      return res.status(404).json({ error: 'Recruitment campaign not found' });
    }

    res.json(recruitment);
  } catch (error) {
    console.error('Get recruitment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/recruitment
// @desc    Create new recruitment campaign
// @access  Private (Admin, HR Manager)
router.post('/', [
  auth,
  authorize('Admin', 'HR Manager'),
  body('title').notEmpty().withMessage('Title is required'),
  body('jobId').isUUID().withMessage('Valid job ID is required'),
  body('departmentId').isUUID().withMessage('Valid department ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      jobId,
      title,
      description,
      requirements,
      responsibilities,
      minSalary,
      maxSalary,
      location,
      remoteWork,
      employmentType,
      hiringManagerId,
      recruiterId,
      departmentId
    } = req.body;

    const recruitment = await Recruitment.create({
      jobId,
      title,
      description,
      requirements,
      responsibilities,
      minSalary,
      maxSalary,
      location,
      remoteWork,
      employmentType,
      hiringManagerId,
      recruiterId,
      departmentId
    });

    res.status(201).json(recruitment);
  } catch (error) {
    console.error('Create recruitment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/recruitment/:id
// @desc    Update recruitment campaign
// @access  Private (Admin, HR Manager)
router.put('/:id', [
  auth,
  authorize('Admin', 'HR Manager'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const recruitment = await Recruitment.findByPk(req.params.id);
    if (!recruitment) {
      return res.status(404).json({ error: 'Recruitment campaign not found' });
    }

    const {
      title,
      description,
      requirements,
      responsibilities,
      minSalary,
      maxSalary,
      location,
      remoteWork,
      employmentType,
      status,
      publishDate,
      closeDate,
      hiringManagerId,
      recruiterId
    } = req.body;

    await recruitment.update({
      title,
      description,
      requirements,
      responsibilities,
      minSalary,
      maxSalary,
      location,
      remoteWork,
      employmentType,
      status,
      publishDate,
      closeDate,
      hiringManagerId,
      recruiterId
    });

    res.json(recruitment);
  } catch (error) {
    console.error('Update recruitment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/recruitment/:id
// @desc    Delete recruitment campaign
// @access  Private (Admin)
router.delete('/:id', auth, authorize('Admin'), async (req, res) => {
  try {
    const recruitment = await Recruitment.findByPk(req.params.id);
    if (!recruitment) {
      return res.status(404).json({ error: 'Recruitment campaign not found' });
    }

    // Check if there are candidates
    const candidateCount = await Candidate.count({ where: { recruitmentId: req.params.id } });
    if (candidateCount > 0) {
      return res.status(400).json({ error: 'Cannot delete recruitment with candidates' });
    }

    await recruitment.destroy();
    res.json({ message: 'Recruitment campaign deleted successfully' });
  } catch (error) {
    console.error('Delete recruitment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/recruitment/:id/candidates
// @desc    Get candidates for recruitment campaign
// @access  Private
router.get('/:id/candidates', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, source } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { recruitmentId: req.params.id };
    if (status) whereClause.status = status;
    if (source) whereClause.source = source;

    const candidates = await Candidate.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'recruiter',
          attributes: ['firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      candidates: candidates.rows,
      total: candidates.count,
      pages: Math.ceil(candidates.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/recruitment/analytics/stats
// @desc    Get recruitment analytics
// @access  Private (Admin, HR Manager)
router.get('/analytics/stats', auth, authorize('Admin', 'HR Manager'), async (req, res) => {
  try {
    const stats = await Recruitment.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status']
    });

    const totalCandidates = await Candidate.count();
    const hiredCandidates = await Candidate.count({ where: { status: 'Hired' } });
    const activeRecruitments = await Recruitment.count({ where: { status: 'Published' } });

    res.json({
      recruitmentStats: stats,
      totalCandidates,
      hiredCandidates,
      activeRecruitments,
      hireRate: totalCandidates > 0 ? (hiredCandidates / totalCandidates * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Get recruitment stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
