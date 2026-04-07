const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const MobileApp = require('../models/MobileApp');
const Employee = require('../models/Employee');

// Get all mobile app data
router.get('/', auth, async (req, res) => {
  try {
    const mobileData = await MobileApp.findAll({
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
    const totalDevices = mobileData.filter(m => m.type === 'device').length;
    const activeDevices = mobileData.filter(m => m.type === 'device' && m.status === 'active').length;
    const totalApprovals = mobileData.filter(m => m.type === 'approval').length;
    const totalNotifications = mobileData.filter(m => m.type === 'notification').length;
    const voiceInteractions = mobileData.filter(m => m.type === 'voice').length;

    res.json({
      mobileData,
      stats: {
        totalDevices,
        activeDevices,
        totalApprovals,
        totalNotifications,
        voiceInteractions
      }
    });
  } catch (error) {
    console.error('Get mobile app data error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get device management data
router.get('/devices', auth, async (req, res) => {
  try {
    const devices = await MobileApp.findAll({
      where: { type: 'device' },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['firstName', 'lastName', 'email', 'position']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(devices);
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get mobile approvals
router.get('/approvals', auth, async (req, res) => {
  try {
    const approvals = await MobileApp.findAll({
      where: { type: 'approval' },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['firstName', 'lastName', 'email', 'position']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(approvals);
  } catch (error) {
    console.error('Get approvals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get push notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await MobileApp.findAll({
      where: { type: 'notification' },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['firstName', 'lastName', 'email', 'position']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get voice assistant interactions
router.get('/voice', auth, async (req, res) => {
  try {
    const voiceInteractions = await MobileApp.findAll({
      where: { type: 'voice' },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['firstName', 'lastName', 'email', 'position']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(voiceInteractions);
  } catch (error) {
    console.error('Get voice interactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payslips and tax forms
router.get('/payslips', auth, async (req, res) => {
  try {
    const payslips = await MobileApp.findAll({
      where: { type: 'payslip' },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['firstName', 'lastName', 'email', 'position']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(payslips);
  } catch (error) {
    console.error('Get payslips error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register new device
router.post('/devices', auth, async (req, res) => {
  try {
    const { 
      employeeId, 
      deviceType, 
      deviceId, 
      osVersion, 
      appVersion,
      biometricEnabled 
    } = req.body;
    
    const device = await MobileApp.create({
      employeeId,
      type: 'device',
      title: `${deviceType} Device`,
      description: `Device ID: ${deviceId}`,
      deviceType,
      deviceId,
      osVersion,
      appVersion,
      biometricEnabled: biometricEnabled || false,
      status: 'active'
    });

    res.status(201).json(device);
  } catch (error) {
    console.error('Register device error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create mobile approval
router.post('/approvals', auth, async (req, res) => {
  try {
    const { 
      employeeId, 
      approvalType, 
      requestData, 
      urgency 
    } = req.body;
    
    const approval = await MobileApp.create({
      employeeId,
      type: 'approval',
      title: `${approvalType} Approval`,
      description: JSON.stringify(requestData),
      approvalType,
      urgency: urgency || 'normal',
      status: 'pending'
    });

    res.status(201).json(approval);
  } catch (error) {
    console.error('Create approval error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send push notification
router.post('/notifications', auth, async (req, res) => {
  try {
    const { 
      employeeId, 
      notificationType, 
      message, 
      priority 
    } = req.body;
    
    const notification = await MobileApp.create({
      employeeId,
      type: 'notification',
      title: notificationType,
      description: message,
      notificationType,
      priority: priority || 'normal',
      status: 'sent'
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Record voice interaction
router.post('/voice', auth, async (req, res) => {
  try {
    const { 
      employeeId, 
      voiceCommand, 
      response, 
      accuracy 
    } = req.body;
    
    const voiceInteraction = await MobileApp.create({
      employeeId,
      type: 'voice',
      title: 'Voice Assistant',
      description: `Command: ${voiceCommand}`,
      voiceCommand,
      response,
      accuracy: accuracy || 0.8,
      status: 'completed'
    });

    res.status(201).json(voiceInteraction);
  } catch (error) {
    console.error('Record voice interaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
