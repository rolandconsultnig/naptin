const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Candidate = require('../models/Candidate');
const Recruitment = require('../models/Recruitment');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private (Admin, HR Manager)
router.get('/dashboard', auth, authorize('Admin', 'HR Manager'), async (req, res) => {
  try {
    // Employee statistics
    const totalEmployees = await Employee.count();
    const activeEmployees = await Employee.count({ where: { status: 'Active' } });
    const newEmployeesThisMonth = await Employee.count({
      where: {
        hireDate: {
          [require('sequelize').Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    // Department statistics
    const departmentStats = await Department.findAll({
      attributes: [
        'name',
        [require('sequelize').fn('COUNT', require('sequelize').col('employees.id')), 'employeeCount']
      ],
      include: [
        {
          model: Employee,
          as: 'employees',
          attributes: [],
          where: { status: 'Active' }
        }
      ],
      group: ['Department.id'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('employees.id')), 'DESC']]
    });

    // Attendance statistics
    const today = new Date().toISOString().split('T')[0];
    const presentToday = await Attendance.count({
      where: { date: today, status: 'Present' }
    });

    // Leave statistics
    const pendingLeaves = await Leave.count({ where: { status: 'Pending' } });

    // Recruitment statistics
    const totalCandidates = await Candidate.count();
    const activeRecruitments = await Recruitment.count({ where: { status: 'Published' } });

    res.json({
      employeeStats: {
        total: totalEmployees,
        active: activeEmployees,
        newThisMonth: newEmployeesThisMonth
      },
      departmentStats,
      attendanceStats: {
        presentToday
      },
      leaveStats: {
        pending: pendingLeaves
      },
      recruitmentStats: {
        totalCandidates,
        activeRecruitments
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/employees
// @desc    Get employee analytics
// @access  Private (Admin, HR Manager)
router.get('/employees', auth, authorize('Admin', 'HR Manager'), async (req, res) => {
  try {
    const genderStats = await Employee.findAll({
      attributes: [
        'gender',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['gender']
    });

    const departmentStats = await Employee.findAll({
      attributes: [
        'department',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('AVG', require('sequelize').col('salary')), 'avgSalary']
      ],
      where: { status: 'Active' },
      group: ['department']
    });

    const hiringTrends = await Employee.findAll({
      attributes: [
        [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('hireDate')), 'month'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: {
        hireDate: {
          [require('sequelize').Op.gte]: new Date(new Date().getFullYear() - 1, 0, 1)
        }
      },
      group: [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('hireDate'))],
      order: [[require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('hireDate')), 'ASC']]
    });

    res.json({
      genderStats,
      departmentStats,
      hiringTrends
    });
  } catch (error) {
    console.error('Get employee analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
