const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrganizationChart = sequelize.define('OrganizationChart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  managerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  reportingPath: {
    type: DataTypes.TEXT, // JSON string storing the full reporting hierarchy
    allowNull: true
  },
  effectiveDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'organization_charts',
  timestamps: true,
  indexes: [
    {
      fields: ['employee_id']
    },
    {
      fields: ['manager_id']
    },
    {
      fields: ['department_id']
    },
    {
      fields: ['is_active', 'effective_date']
    }
  ]
});

// Define associations
OrganizationChart.associate = (models) => {
  // Employee being positioned in the org chart
  OrganizationChart.belongsTo(models.Employee, {
    foreignKey: 'employeeId',
    as: 'employee'
  });

  // Manager of this employee
  OrganizationChart.belongsTo(models.Employee, {
    foreignKey: 'managerId',
    as: 'manager'
  });

  // Department
  OrganizationChart.belongsTo(models.Department, {
    foreignKey: 'departmentId',
    as: 'department'
  });
};

module.exports = OrganizationChart;
