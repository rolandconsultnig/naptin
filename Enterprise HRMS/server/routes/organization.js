const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const OrganizationChart = require('../models/OrganizationChart');
const Employee = require('../models/Employee');
const Department = require('../models/Department');

// Get organizational chart
router.get('/chart', auth, async (req, res) => {
  try {
    const { departmentId, level } = req.query;
    
    let whereClause = { isActive: true };
    if (departmentId) {
      whereClause.departmentId = departmentId;
    }
    if (level) {
      whereClause.level = level;
    }

    const orgChart = await OrganizationChart.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'position', 'email', 'profilePicture']
        },
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'firstName', 'lastName', 'position', 'email']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['level', 'ASC'], ['position', 'ASC']]
    });

    // Build hierarchical structure
    const hierarchy = buildHierarchy(orgChart);

    res.json({
      success: true,
      data: hierarchy,
      total: orgChart.length
    });
  } catch (error) {
    console.error('Error fetching organization chart:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Build hierarchical structure helper function
function buildHierarchy(orgChart) {
  const nodeMap = {};
  const roots = [];

  // Create a map of all nodes
  orgChart.forEach(item => {
    nodeMap[item.employeeId] = {
      ...item.toJSON(),
      children: []
    };
  });

  // Build the hierarchy
  orgChart.forEach(item => {
    if (item.managerId && nodeMap[item.managerId]) {
      nodeMap[item.managerId].children.push(nodeMap[item.employeeId]);
    } else {
      roots.push(nodeMap[item.employeeId]);
    }
  });

  return roots;
}

// Get direct reports for an employee
router.get('/reports/:employeeId', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;

    const directReports = await OrganizationChart.findAll({
      where: { managerId: employeeId, isActive: true },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'position', 'email', 'profilePicture']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['position', 'ASC']]
    });

    res.json({
      success: true,
      data: directReports
    });
  } catch (error) {
    console.error('Error fetching direct reports:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update organizational position
router.put('/position/:id', auth, authorize(['HR Manager', 'Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { managerId, departmentId, position, level, effectiveDate } = req.body;

    // End current position
    await OrganizationChart.update(
      { isActive: false, endDate: new Date() },
      { where: { id } }
    );

    // Create new position
    const newPosition = await OrganizationChart.create({
      employeeId: (await OrganizationChart.findByPk(id)).employeeId,
      managerId,
      departmentId,
      position,
      level,
      effectiveDate: effectiveDate || new Date(),
      isActive: true
    });

    const updatedPosition = await OrganizationChart.findByPk(newPosition.id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'firstName', 'lastName', 'position']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedPosition,
      message: 'Organizational position updated successfully'
    });
  } catch (error) {
    console.error('Error updating organizational position:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get reporting path for an employee
router.get('/path/:employeeId', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;

    const orgPosition = await OrganizationChart.findOne({
      where: { employeeId, isActive: true },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'position']
        }
      ]
    });

    if (!orgPosition) {
      return res.status(404).json({ error: 'Employee not found in organization chart' });
    }

    const reportingPath = await buildReportingPath(employeeId);

    res.json({
      success: true,
      data: {
        employee: orgPosition.employee,
        reportingPath
      }
    });
  } catch (error) {
    console.error('Error fetching reporting path:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Build reporting path helper function
async function buildReportingPath(employeeId) {
  const path = [];
  let currentEmployeeId = employeeId;

  while (currentEmployeeId) {
    const orgPosition = await OrganizationChart.findOne({
      where: { employeeId: currentEmployeeId, isActive: true },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'position']
        },
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'firstName', 'lastName', 'position']
        }
      ]
    });

    if (!orgPosition) break;

    path.push({
      employee: orgPosition.employee,
      level: orgPosition.level,
      position: orgPosition.position
    });

    currentEmployeeId = orgPosition.managerId;
  }

  return path;
}

// Department analytics
router.get('/analytics/departments', auth, authorize(['HR Manager', 'Admin']), async (req, res) => {
  try {
    const departments = await Department.findAll({
      include: [
        {
          model: OrganizationChart,
          as: 'organizationCharts',
          where: { isActive: true },
          required: false,
          include: [{
            model: Employee,
            as: 'employee',
            attributes: ['id', 'firstName', 'lastName', 'baseSalary']
          }]
        }
      ]
    });

    const analytics = departments.map(dept => {
      const employees = dept.organizationCharts || [];
      const headcount = employees.length;
      const averageSalary = headcount > 0 
        ? employees.reduce((sum, org) => sum + (org.employee?.baseSalary || 0), 0) / headcount
        : 0;

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        headcount,
        averageSalary: Math.round(averageSalary),
        managerId: dept.managerId
      };
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching department analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
