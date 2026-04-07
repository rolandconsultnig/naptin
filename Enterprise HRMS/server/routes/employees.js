const express = require('express');
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const { auth, authorize, canAccessEmployee } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/employees
// @desc    Get all employees with pagination and filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      status,
      gender,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters
    if (department) whereClause.department = department;
    if (status) whereClause.status = status;
    if (gender) whereClause.gender = gender;

    // Search functionality
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { firstName: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { lastName: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { employeeId: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Employee.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'departmentRef',
          attributes: ['name', 'code']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      employees: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/employees/:id
// @desc    Get employee by ID
// @access  Private
router.get('/:id', auth, canAccessEmployee, async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ employee });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/employees
// @desc    Create new employee
// @access  Private (Admin, HR Manager)
router.post('/', [
  auth,
  authorize('Admin', 'HR Manager'),
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('gender').isIn(['Male', 'Female']).withMessage('Gender must be Male or Female'),
  body('hireDate').isISO8601().withMessage('Valid hire date is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('department').notEmpty().withMessage('Department is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({
      where: { employeeId: req.body.employeeId }
    });

    if (existingEmployee) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }

    // Check if email already exists
    const existingEmail = await Employee.findOne({
      where: { email: req.body.email }
    });

    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const employee = await Employee.create(req.body);

    res.status(201).json({
      message: 'Employee created successfully',
      employee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private (Admin, HR Manager)
router.put('/:id', [
  auth,
  authorize('Admin', 'HR Manager'),
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('gender').optional().isIn(['Male', 'Female']).withMessage('Gender must be Male or Female')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== employee.email) {
      const existingEmail = await Employee.findOne({
        where: { email: req.body.email }
      });

      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    await employee.update(req.body);

    res.json({
      message: 'Employee updated successfully',
      employee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee (soft delete)
// @access  Private (Admin, HR Manager)
router.delete('/:id', auth, authorize('Admin', 'HR Manager'), async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Soft delete - update status to terminated
    await employee.update({
      status: 'Terminated',
      terminationDate: new Date()
    });

    res.json({ message: 'Employee terminated successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/employees/departments
// @desc    Get all departments
// @access  Private
router.get('/departments', auth, async (req, res) => {
  try {
    const departments = await Employee.findAll({
      attributes: [[require('sequelize').fn('DISTINCT', require('sequelize').col('department')), 'department']],
      raw: true
    });

    res.json({ departments: departments.map(d => d.department) });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/employees/org-chart
// @desc    Get organizational chart data
// @access  Private
router.get('/org-chart', auth, async (req, res) => {
  try {
    const employees = await Employee.findAll({
      attributes: ['id', 'employeeId', 'firstName', 'lastName', 'position', 'department', 'managerId'],
      where: { status: 'Active' },
      order: [['department', 'ASC'], ['position', 'ASC']]
    });

    // Build org chart structure
    const orgChart = employees.map(emp => ({
      id: emp.id,
      employeeId: emp.employeeId,
      name: `${emp.firstName} ${emp.lastName}`,
      position: emp.position,
      department: emp.department,
      managerId: emp.managerId
    }));

    res.json({ orgChart });
  } catch (error) {
    console.error('Get org chart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/employees/analytics/gender-distribution
// @desc    Get gender distribution analytics
// @access  Private (Admin, HR Manager)
router.get('/analytics/gender-distribution', auth, authorize('Admin', 'HR Manager'), async (req, res) => {
  try {
    const genderDistribution = await Employee.findAll({
      attributes: [
        'gender',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: { status: 'Active' },
      group: ['gender'],
      raw: true
    });

    res.json({ genderDistribution });
  } catch (error) {
    console.error('Get gender distribution error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/employees/analytics/department-stats
// @desc    Get department statistics
// @access  Private (Admin, HR Manager)
router.get('/analytics/department-stats', auth, authorize('Admin', 'HR Manager'), async (req, res) => {
  try {
    const departmentStats = await Employee.findAll({
      attributes: [
        'department',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('AVG', require('sequelize').col('salary')), 'avgSalary']
      ],
      where: { status: 'Active' },
      group: ['department'],
      raw: true
    });

    res.json({ departmentStats });
  } catch (error) {
    console.error('Get department stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/employees/analytics/hiring-trends
// @desc    Get hiring trends by month
// @access  Private (Admin, HR Manager)
router.get('/analytics/hiring-trends', auth, authorize('Admin', 'HR Manager'), async (req, res) => {
  try {
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
      order: [[require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('hireDate')), 'ASC']],
      raw: true
    });

    res.json({ hiringTrends });
  } catch (error) {
    console.error('Get hiring trends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/employees/:id/skills
// @desc    Add skills to employee
// @access  Private (Admin, HR Manager)
router.post('/:id/skills', auth, authorize('Admin', 'HR Manager'), async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const currentSkills = employee.skills || [];
    const newSkills = req.body.skills || [];
    
    // Merge skills and remove duplicates
    const updatedSkills = [...new Set([...currentSkills, ...newSkills])];
    
    await employee.update({ skills: updatedSkills });

    res.json({
      message: 'Skills updated successfully',
      skills: updatedSkills
    });
  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/employees/:id/certifications
// @desc    Add certifications to employee
// @access  Private (Admin, HR Manager)
router.post('/:id/certifications', auth, authorize('Admin', 'HR Manager'), async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const currentCertifications = employee.certifications || [];
    const newCertification = {
      name: req.body.name,
      issuer: req.body.issuer,
      dateObtained: req.body.dateObtained,
      expiryDate: req.body.expiryDate,
      id: Date.now().toString()
    };
    
    currentCertifications.push(newCertification);
    
    await employee.update({ certifications: currentCertifications });

    res.json({
      message: 'Certification added successfully',
      certification: newCertification
    });
  } catch (error) {
    console.error('Add certification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/employees/:id/education
// @desc    Add education to employee
// @access  Private (Admin, HR Manager)
router.post('/:id/education', auth, authorize('Admin', 'HR Manager'), async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const currentEducation = employee.education || [];
    const newEducation = {
      degree: req.body.degree,
      institution: req.body.institution,
      fieldOfStudy: req.body.fieldOfStudy,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      gpa: req.body.gpa,
      id: Date.now().toString()
    };
    
    currentEducation.push(newEducation);
    
    await employee.update({ education: currentEducation });

    res.json({
      message: 'Education added successfully',
      education: newEducation
    });
  } catch (error) {
    console.error('Add education error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/employees/:id/emergency-contact
// @desc    Update emergency contact
// @access  Private (Admin, HR Manager)
router.post('/:id/emergency-contact', auth, authorize('Admin', 'HR Manager'), async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const emergencyContact = {
      name: req.body.name,
      relationship: req.body.relationship,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address
    };
    
    await employee.update({ emergencyContact });

    res.json({
      message: 'Emergency contact updated successfully',
      emergencyContact
    });
  } catch (error) {
    console.error('Update emergency contact error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/employees/:id/bank-details
// @desc    Update bank details
// @access  Private (Admin, HR Manager)
router.post('/:id/bank-details', auth, authorize('Admin', 'HR Manager'), async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const bankDetails = {
      bankName: req.body.bankName,
      accountNumber: req.body.accountNumber,
      routingNumber: req.body.routingNumber,
      accountType: req.body.accountType
    };
    
    await employee.update({ bankDetails });

    res.json({
      message: 'Bank details updated successfully',
      bankDetails
    });
  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/employees/search/advanced
// @desc    Advanced employee search
// @access  Private
router.get('/search/advanced', auth, async (req, res) => {
  try {
    const {
      keyword,
      department,
      position,
      status,
      gender,
      employmentType,
      minSalary,
      maxSalary,
      hireDateFrom,
      hireDateTo
    } = req.query;

    const whereClause = {};

    // Basic filters
    if (department) whereClause.department = department;
    if (position) whereClause.position = position;
    if (status) whereClause.status = status;
    if (gender) whereClause.gender = gender;
    if (employmentType) whereClause.employmentType = employmentType;

    // Salary range
    if (minSalary || maxSalary) {
      whereClause.salary = {};
      if (minSalary) whereClause.salary[require('sequelize').Op.gte] = minSalary;
      if (maxSalary) whereClause.salary[require('sequelize').Op.lte] = maxSalary;
    }

    // Hire date range
    if (hireDateFrom || hireDateTo) {
      whereClause.hireDate = {};
      if (hireDateFrom) whereClause.hireDate[require('sequelize').Op.gte] = hireDateFrom;
      if (hireDateTo) whereClause.hireDate[require('sequelize').Op.lte] = hireDateTo;
    }

    // Keyword search
    if (keyword) {
      whereClause[require('sequelize').Op.or] = [
        { firstName: { [require('sequelize').Op.iLike]: `%${keyword}%` } },
        { lastName: { [require('sequelize').Op.iLike]: `%${keyword}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${keyword}%` } },
        { employeeId: { [require('sequelize').Op.iLike]: `%${keyword}%` } },
        { position: { [require('sequelize').Op.iLike]: `%${keyword}%` } }
      ];
    }

    const employees = await Employee.findAll({
      where: whereClause,
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });

    res.json({ employees });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
