const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const EmployeeExperience = require('../models/EmployeeExperience');
const Employee = require('../models/Employee');

// Get all employee experience data
router.get('/', auth, async (req, res) => {
  try {
    const experiences = await EmployeeExperience.findAll({
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['firstName', 'lastName', 'email', 'position']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculate statistics
    const totalRecognitions = experiences.filter(e => e.type === 'recognition').length;
    const totalSurveys = experiences.filter(e => e.type === 'survey').length;
    const totalChatbot = experiences.filter(e => e.type === 'chatbot').length;
    const avgEngagementScore = experiences.length > 0 
      ? experiences.reduce((sum, e) => sum + (e.engagementScore || 0), 0) / experiences.length 
      : 0;

    res.json({
      experiences,
      stats: {
        totalRecognitions,
        totalSurveys,
        totalChatbot,
        avgEngagementScore: Math.round(avgEngagementScore * 100) / 100
      }
    });
  } catch (error) {
    console.error('Get employee experience error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get recognition data
router.get('/recognition', auth, async (req, res) => {
  try {
    const recognitions = await EmployeeExperience.findAll({
      where: { type: 'recognition' },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['firstName', 'lastName', 'email', 'position']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(recognitions);
  } catch (error) {
    console.error('Get recognition error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get engagement surveys
router.get('/surveys', auth, async (req, res) => {
  try {
    const surveys = await EmployeeExperience.findAll({
      where: { type: 'survey' },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['firstName', 'lastName', 'email', 'position']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(surveys);
  } catch (error) {
    console.error('Get surveys error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get chatbot interactions
router.get('/chatbot', auth, async (req, res) => {
  try {
    const chatbotInteractions = await EmployeeExperience.findAll({
      where: { type: 'chatbot' },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['firstName', 'lastName', 'email', 'position']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(chatbotInteractions);
  } catch (error) {
    console.error('Get chatbot interactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new recognition
router.post('/recognition', auth, async (req, res) => {
  try {
    const { employeeId, message, category, points } = req.body;
    
    const recognition = await EmployeeExperience.create({
      employeeId,
      type: 'recognition',
      title: 'Employee Recognition',
      description: message,
      category,
      points: points || 0,
      engagementScore: 0.9
    });

    res.status(201).json(recognition);
  } catch (error) {
    console.error('Create recognition error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new survey response
router.post('/survey', auth, async (req, res) => {
  try {
    const { employeeId, surveyType, responses, score } = req.body;
    
    const survey = await EmployeeExperience.create({
      employeeId,
      type: 'survey',
      title: `${surveyType} Survey`,
      description: JSON.stringify(responses),
      engagementScore: score || 0.7
    });

    res.status(201).json(survey);
  } catch (error) {
    console.error('Create survey error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
