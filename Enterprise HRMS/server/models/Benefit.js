const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Benefit = sequelize.define('Benefit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Health', 'Dental', 'Vision', 'Life Insurance', 'Retirement', 'Wellness', 'Transportation', 'Education', 'Other'),
    allowNull: false
  },
  // Global benefits features
  country: {
    type: DataTypes.STRING,
    defaultValue: 'US'
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true
  },
  complianceType: {
    type: DataTypes.ENUM('ACA', 'EHIC', 'GDPR', 'HIPAA', 'SOX', 'CUSTOM'),
    allowNull: true
  },
  // Health insurance specific
  healthPlanType: {
    type: DataTypes.ENUM('PPO', 'HMO', 'EPO', 'HDHP', 'Medicare', 'Medicaid'),
    allowNull: true
  },
  networkProvider: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Retirement plans
  retirementPlanType: {
    type: DataTypes.ENUM('401k', '403b', 'IRA', 'Roth_IRA', 'Pension', 'Other'),
    allowNull: true
  },
  employerMatch: {
    type: DataTypes.DECIMAL(5, 2), // percentage
    defaultValue: 0
  },
  vestingSchedule: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // Flexible spending accounts
  fsaType: {
    type: DataTypes.ENUM('Healthcare_FSA', 'Dependent_Care_FSA', 'Limited_Purpose_FSA'),
    allowNull: true
  },
  fsaLimit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  // Global mobility benefits
  expatriateBenefits: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  housingAllowance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  relocationBenefits: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  description: {
    type: DataTypes.TEXT
  },
  provider: {
    type: DataTypes.STRING
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2)
  },
  employeeContribution: {
    type: DataTypes.DECIMAL(10, 2)
  },
  employerContribution: {
    type: DataTypes.DECIMAL(10, 2)
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD'
  },
  frequency: {
    type: DataTypes.ENUM('Monthly', 'Quarterly', 'Annual', 'One-time'),
    defaultValue: 'Monthly'
  },
  eligibilityCriteria: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  enrollmentPeriod: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Suspended'),
    defaultValue: 'Active'
  },
  customFields: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'benefits',
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['type']
    },
    {
      fields: ['status']
    }
  ]
});

// Define associations
Benefit.associate = (models) => {
  if (models.EmployeeBenefit) {
    Benefit.hasMany(models.EmployeeBenefit, {
      foreignKey: 'benefitId',
      as: 'enrollments'
    });
  }
};

module.exports = Benefit;
