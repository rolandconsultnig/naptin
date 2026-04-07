const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payroll = sequelize.define('Payroll', {
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
  payPeriod: {
    type: DataTypes.ENUM('Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Annual'),
    defaultValue: 'Monthly'
  },
  payDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  basicSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  allowances: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  bonuses: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  overtime: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  grossPay: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  deductions: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  taxes: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  netPay: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD'
  },
  exchangeRate: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 1.0000
  },
  // Multi-country payroll features
  country: {
    type: DataTypes.STRING,
    defaultValue: 'US'
  },
  taxYear: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  taxCalculations: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  socialSecurityContributions: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  // Executive compensation
  stockOptions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  stockOptionValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  performanceBonus: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  signingBonus: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  // Pay equity analysis
  payEquityScore: {
    type: DataTypes.DECIMAL(3, 2), // 0.00 to 1.00
    allowNull: true
  },
  payEquityFactors: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // Garnishment management
  garnishments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  garnishmentTotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Calculated', 'Approved', 'Paid', 'Cancelled'),
    defaultValue: 'Draft'
  },
  approvedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE
  },
  paymentMethod: {
    type: DataTypes.ENUM('Bank Transfer', 'Check', 'Cash', 'Direct Deposit'),
    defaultValue: 'Bank Transfer'
  },
  paymentReference: {
    type: DataTypes.STRING
  },
  notes: {
    type: DataTypes.TEXT
  },
  customFields: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'payrolls',
  indexes: [
    {
      fields: ['employee_id']
    },
    {
      fields: ['pay_date']
    },
    {
      fields: ['status']
    },
    {
      fields: ['employee_id', 'pay_date'],
      unique: true
    }
  ]
});

// Define associations
Payroll.associate = (models) => {
  if (models.Employee) {
    Payroll.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee'
    });
  }
};

module.exports = Payroll;
