const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const ComplianceCase = require('../models/ComplianceCase');
const Employee = require('../models/Employee');
const User = require('../models/User');

// Get all compliance cases
router.get('/', auth, async (req, res) => {
  try {
    const cases = await ComplianceCase.findAll({
      include: [
        {
          model: Employee,
          as: 'reportedBy',
          attributes: ['firstName', 'lastName', 'email', 'position']
        },
        {
          model: User,
          as: 'assignedUser',
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculate statistics
    const totalCases = cases.length;
    const openCases = cases.filter(c => c.status === 'Open').length;
    const resolvedCases = cases.filter(c => c.status === 'Resolved').length;
    const highPriorityCases = cases.filter(c => c.priority === 'High').length;

    res.json({
      cases,
      stats: {
        totalCases,
        openCases,
        resolvedCases,
        highPriorityCases
      }
    });
  } catch (error) {
    console.error('Get compliance cases error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get cases by status
router.get('/status/:status', auth, async (req, res) => {
  try {
    const { status } = req.params;
    const cases = await ComplianceCase.findAll({
      where: { status },
      include: [
        {
          model: Employee,
          as: 'reportedBy',
          attributes: ['firstName', 'lastName', 'email', 'position']
        },
        {
          model: User,
          as: 'assignedUser',
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(cases);
  } catch (error) {
    console.error('Get cases by status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get cases by priority
router.get('/priority/:priority', auth, async (req, res) => {
  try {
    const { priority } = req.params;
    const cases = await ComplianceCase.findAll({
      where: { priority },
      include: [
        {
          model: Employee,
          as: 'reportedBy',
          attributes: ['firstName', 'lastName', 'email', 'position']
        },
        {
          model: User,
          as: 'assignedUser',
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(cases);
  } catch (error) {
    console.error('Get cases by priority error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get whistleblower cases
router.get('/whistleblower', auth, async (req, res) => {
  try {
    const cases = await ComplianceCase.findAll({
      where: { type: 'Whistleblower' },
      include: [
        {
          model: Employee,
          as: 'reportedBy',
          attributes: ['firstName', 'lastName', 'email', 'position']
        },
        {
          model: User,
          as: 'assignedUser',
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(cases);
  } catch (error) {
    console.error('Get whistleblower cases error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get audit trails
router.get('/audit-trails', auth, async (req, res) => {
  try {
    const auditTrails = await ComplianceCase.findAll({
      where: { type: 'Audit_Finding' },
      include: [
        {
          model: Employee,
          as: 'reportedBy',
          attributes: ['firstName', 'lastName', 'email', 'position']
        },
        {
          model: User,
          as: 'assignedUser',
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(auditTrails);
  } catch (error) {
    console.error('Get audit trails error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new compliance case
router.post('/', auth, async (req, res) => {
  try {
    const { 
      type, 
      title, 
      description, 
      priority, 
      reportedById, 
      assignedToId,
      category,
      riskLevel 
    } = req.body;
    
    const complianceCase = await ComplianceCase.create({
      type,
      title,
      description,
      priority: priority || 'medium',
      status: 'open',
      reportedById,
      assignedToId,
      category,
      riskLevel: riskLevel || 'medium'
    });

    res.status(201).json(complianceCase);
  } catch (error) {
    console.error('Create compliance case error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update case status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution, resolvedById } = req.body;
    
    const complianceCase = await ComplianceCase.findByPk(id);
    if (!complianceCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    complianceCase.status = status;
    if (resolution) complianceCase.resolution = resolution;
    if (resolvedById) complianceCase.resolvedById = resolvedById;
    
    await complianceCase.save();

    res.json(complianceCase);
  } catch (error) {
    console.error('Update case status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
