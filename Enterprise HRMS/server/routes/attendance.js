const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

const router = express.Router();

// @route   GET /api/attendance
// @desc    Get attendance records
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { employeeId, date, startDate, endDate } = req.query;
    const whereClause = {};
    
    if (employeeId) whereClause.employeeId = employeeId;
    if (date) whereClause.date = date;
    if (startDate && endDate) {
      whereClause.date = {
        [require('sequelize').Op.between]: [startDate, endDate]
      };
    }

    const attendance = await Attendance.findAll({
      where: whereClause,
      include: [
        {
        model: Employee,
        as: 'employee',
          attributes: ['firstName', 'lastName', 'email']
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/attendance/clock-in
// @desc    Clock in employee
// @access  Private
router.post('/clock-in', [
  auth,
  body('employeeId').isUUID().withMessage('Valid employee ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employeeId, location, method } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Check if already clocked in today
    const existingAttendance = await Attendance.findOne({
      where: { employeeId, date: today }
    });

    if (existingAttendance && existingAttendance.clockIn) {
      return res.status(400).json({ error: 'Already clocked in today' });
    }

    if (existingAttendance) {
      await existingAttendance.update({
        clockIn: new Date(),
        clockInLocation: location || {},
        clockInMethod: method || 'Manual'
      });
    } else {
      await Attendance.create({
        employeeId,
        date: today,
        clockIn: new Date(),
        clockInLocation: location || {},
        clockInMethod: method || 'Manual'
      });
    }

    res.json({ message: 'Clock in successful' });
  } catch (error) {
    console.error('Clock in error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/attendance/clock-out
// @desc    Clock out employee
// @access  Private
router.post('/clock-out', [
  auth,
  body('employeeId').isUUID().withMessage('Valid employee ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employeeId, location, method } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({
      where: { employeeId, date: today }
    });

    if (!attendance || !attendance.clockIn) {
      return res.status(400).json({ error: 'No clock in record found for today' });
    }

    if (attendance.clockOut) {
      return res.status(400).json({ error: 'Already clocked out today' });
    }

    const clockOut = new Date();
    const totalHours = (clockOut - attendance.clockIn) / (1000 * 60 * 60); // hours

    await attendance.update({
      clockOut,
      clockOutLocation: location || {},
      clockOutMethod: method || 'Manual',
      totalHours: parseFloat(totalHours.toFixed(2))
    });

    res.json({ message: 'Clock out successful' });
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
