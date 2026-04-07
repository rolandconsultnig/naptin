const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  parentDepartmentId: {
    type: DataTypes.UUID,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  managerId: {
    type: DataTypes.UUID,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  location: {
    type: DataTypes.STRING
  },
  budget: {
    type: DataTypes.DECIMAL(15, 2)
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Merged', 'Dissolved'),
    defaultValue: 'Active'
  },
  customFields: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'departments',
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['code']
    },
    {
      fields: ['status']
    }
  ]
});

// Define associations
Department.associate = (models) => {
  // Department has many employees
  Department.hasMany(models.Employee, {
    foreignKey: 'departmentId',
    as: 'employees'
  });

  // Department belongs to a manager (Employee)
  Department.belongsTo(models.Employee, {
    foreignKey: 'managerId',
    as: 'manager'
  });

  // Self-referencing association for parent departments
  Department.belongsTo(Department, {
    foreignKey: 'parentDepartmentId',
    as: 'parentDepartment'
  });

  Department.hasMany(Department, {
    foreignKey: 'parentDepartmentId',
    as: 'childDepartments'
  });
};

module.exports = Department;
