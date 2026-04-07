const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EmployeeBenefit = sequelize.define('EmployeeBenefit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  benefitId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'benefits',
      key: 'id'
    }
  },
  enrollmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  effectiveDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Suspended', 'Terminated'),
    defaultValue: 'Active'
  },
  employeeContribution: {
    type: DataTypes.DECIMAL(10, 2)
  },
  employerContribution: {
    type: DataTypes.DECIMAL(10, 2)
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2)
  },
  dependents: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  coverageDetails: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  notes: {
    type: DataTypes.TEXT
  },
  customFields: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'employee_benefits',
  indexes: [
    {
      fields: ['employee_id']
    },
    {
      fields: ['benefit_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['employee_id', 'benefit_id'],
      unique: true
    }
  ]
});

// Define associations
EmployeeBenefit.associate = (models) => {
  if (models.Employee) {
    EmployeeBenefit.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee'
    });
  }
  if (models.Benefit) {
    EmployeeBenefit.belongsTo(models.Benefit, {
      foreignKey: 'benefitId',
      as: 'benefit'
    });
  }
};

module.exports = EmployeeBenefit;
