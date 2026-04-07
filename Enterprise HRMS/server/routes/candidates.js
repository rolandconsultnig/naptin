const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Candidate = require('../models/Candidate');
const Recruitment = require('../models/Recruitment');
const Interview = require('../models/Interview');
const Employee = require('../models/Employee');

const router = express.Router();

// @route   GET /api/candidates
// @desc    Get all candidates
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, source, recruitmentId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (source) whereClause.source = source;
    if (recruitmentId) whereClause.recruitmentId = recruitmentId;

    const candidates = await Candidate.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Recruitment,
          as: 'recruitment',
          attributes: ['title', 'id']
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

// @route   GET /api/candidates/:id
// @desc    Get candidate by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id, {
      include: [
        {
          model: Recruitment,
          attributes: ['title', 'description', 'requirements']
        },
        {
          model: Employee,
          as: 'recruiter',
          attributes: ['firstName', 'lastName', 'email']
        },
        {
          model: Interview,
          attributes: ['id', 'type', 'status', 'scheduledDate', 'rating', 'decision']
        }
      ]
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/candidates
// @desc    Create new candidate
// @access  Private (Admin, HR Manager)
router.post('/', [
  auth,
  authorize('Admin', 'HR Manager'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('recruitmentId').isUUID().withMessage('Valid recruitment ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      recruitmentId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      country,
      zipCode,
      currentPosition,
      currentCompany,
      experience,
      education,
      skills,
      certifications,
      resume,
      coverLetter,
      portfolio,
      linkedinProfile,
      source,
      recruiterId,
      expectedSalary,
      availability,
      notes
    } = req.body;

    // Check if candidate already exists for this recruitment
    const existingCandidate = await Candidate.findOne({
      where: { email, recruitmentId }
    });
    if (existingCandidate) {
      return res.status(400).json({ error: 'Candidate already exists for this recruitment' });
    }

    const candidate = await Candidate.create({
      recruitmentId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      country,
      zipCode,
      currentPosition,
      currentCompany,
      experience,
      education,
      skills,
      certifications,
      resume,
      coverLetter,
      portfolio,
      linkedinProfile,
      source,
      recruiterId,
      expectedSalary,
      availability,
      notes
    });

    res.status(201).json(candidate);
  } catch (error) {
    console.error('Create candidate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/candidates/:id
// @desc    Update candidate
// @access  Private (Admin, HR Manager)
router.put('/:id', [
  auth,
  authorize('Admin', 'HR Manager'),
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      country,
      zipCode,
      currentPosition,
      currentCompany,
      experience,
      education,
      skills,
      certifications,
      resume,
      coverLetter,
      portfolio,
      linkedinProfile,
      status,
      source,
      recruiterId,
      expectedSalary,
      availability,
      notes
    } = req.body;

    await candidate.update({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      country,
      zipCode,
      currentPosition,
      currentCompany,
      experience,
      education,
      skills,
      certifications,
      resume,
      coverLetter,
      portfolio,
      linkedinProfile,
      status,
      source,
      recruiterId,
      expectedSalary,
      availability,
      notes
    });

    res.json(candidate);
  } catch (error) {
    console.error('Update candidate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/candidates/:id
// @desc    Delete candidate
// @access  Private (Admin)
router.delete('/:id', auth, authorize('Admin'), async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Check if candidate has interviews
    const interviewCount = await Interview.count({ where: { candidateId: req.params.id } });
    if (interviewCount > 0) {
      return res.status(400).json({ error: 'Cannot delete candidate with interviews' });
    }

    await candidate.destroy();
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/candidates/:id/status
// @desc    Update candidate status
// @access  Private (Admin, HR Manager)
router.put('/:id/status', [
  auth,
  authorize('Admin', 'HR Manager'),
  body('status').isIn(['Applied', 'Screening', 'Interview', 'Technical Test', 'Reference Check', 'Offer', 'Hired', 'Rejected', 'Withdrawn']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    await candidate.update({ status: req.body.status });
    res.json(candidate);
  } catch (error) {
    console.error('Update candidate status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/candidates/analytics/stats
// @desc    Get candidate analytics
// @access  Private (Admin, HR Manager)
router.get('/analytics/stats', auth, authorize('Admin', 'HR Manager'), async (req, res) => {
  try {
    const statusStats = await Candidate.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status']
    });

    const sourceStats = await Candidate.findAll({
      attributes: [
        'source',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['source']
    });

    const totalCandidates = await Candidate.count();
    const hiredCandidates = await Candidate.count({ where: { status: 'Hired' } });
    const rejectedCandidates = await Candidate.count({ where: { status: 'Rejected' } });

    res.json({
      statusStats,
      sourceStats,
      totalCandidates,
      hiredCandidates,
      rejectedCandidates,
      hireRate: totalCandidates > 0 ? (hiredCandidates / totalCandidates * 100).toFixed(2) : 0,
      rejectionRate: totalCandidates > 0 ? (rejectedCandidates / totalCandidates * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Get candidate stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
