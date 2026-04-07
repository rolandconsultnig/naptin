const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Department = require('../models/Department');
const Employee = require('../models/Employee');

const router = express.Router();

// @route   GET /api/departments
// @desc    Get all departments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.findAll({
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['name', 'ASC']]
    });

    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/departments/:id
// @desc    Get department by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Employee,
          as: 'employees',
          attributes: ['id', 'firstName', 'lastName', 'email', 'position', 'status']
        }
      ]
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/departments
// @desc    Create new department
// @access  Private (Admin, HR Manager)
router.post('/', [
  auth,
  authorize('Admin', 'HR Manager'),
  body('name').notEmpty().withMessage('Department name is required'),
  body('code').notEmpty().withMessage('Department code is required'),
  body('managerId').optional().isUUID().withMessage('Invalid manager ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code, description, parentDepartmentId, managerId, location, budget } = req.body;

    // Check if department code already exists
    const existingDepartment = await Department.findOne({ where: { code } });
    if (existingDepartment) {
      return res.status(400).json({ error: 'Department code already exists' });
    }

    const department = await Department.create({
      name,
      code,
      description,
      parentDepartmentId,
      managerId,
      location,
      budget
    });

    res.status(201).json(department);
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private (Admin, HR Manager)
router.put('/:id', [
  auth,
  authorize('Admin', 'HR Manager'),
  body('name').optional().notEmpty().withMessage('Department name cannot be empty'),
  body('code').optional().notEmpty().withMessage('Department code cannot be empty'),
  body('managerId').optional().isUUID().withMessage('Invalid manager ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const { name, code, description, parentDepartmentId, managerId, location, budget, status } = req.body;

    // Check if department code already exists (if code is being updated)
    if (code && code !== department.code) {
      const existingDepartment = await Department.findOne({ where: { code } });
      if (existingDepartment) {
        return res.status(400).json({ error: 'Department code already exists' });
      }
    }

    await department.update({
      name,
      code,
      description,
      parentDepartmentId,
      managerId,
      location,
      budget,
      status
    });

    res.json(department);
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/departments/:id
// @desc    Delete department
// @access  Private (Admin)
router.delete('/:id', auth, authorize('Admin'), async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Check if department has employees
    const employeeCount = await Employee.count({ where: { departmentId: req.params.id } });
    if (employeeCount > 0) {
      return res.status(400).json({ error: 'Cannot delete department with employees' });
    }

    await department.destroy();
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/departments/:id/employees
// @desc    Get employees in department
// @access  Private
router.get('/:id/employees', auth, async (req, res) => {
  try {
    const employees = await Employee.findAll({
      where: { departmentId: req.params.id },
      attributes: ['id', 'firstName', 'lastName', 'email', 'position', 'status', 'hireDate'],
      order: [['firstName', 'ASC']]
    });

    res.json(employees);
  } catch (error) {
    console.error('Get department employees error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/departments/analytics/stats
// @desc    Get department statistics
// @access  Private (Admin, HR Manager)
router.get('/analytics/stats', auth, authorize('Admin', 'HR Manager'), async (req, res) => {
  try {
    const departmentStats = await Department.findAll({
      attributes: [
        'id',
        'name',
        'code',
        [require('sequelize').fn('COUNT', require('sequelize').col('employees.id')), 'employeeCount'],
        [require('sequelize').fn('AVG', require('sequelize').col('employees.salary')), 'avgSalary']
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

    res.json(departmentStats);
  } catch (error) {
    console.error('Get department stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
