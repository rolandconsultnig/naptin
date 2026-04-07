const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AnalyticsReport = sequelize.define('AnalyticsReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: { // e.g., 'HEADCOUNT', 'TURNOVER', 'DIVERSITY', 'COMPENSATION', 'PERFORMANCE'
    type: DataTypes.ENUM(
      'HEADCOUNT', 'TURNOVER', 'DIVERSITY', 'COMPENSATION', 'PERFORMANCE',
      'ATTENDANCE', 'RECRUITMENT', 'TRAINING', 'COMPLIANCE', 'CUSTOM',
      'WORKFORCE_PLANNING', 'SKILLS_GAP', 'SCENARIO_MODELING', 'HEADCOUNT_FORECASTING'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  query: {
    type: DataTypes.TEXT, // SQL query or JSON configuration
    allowNull: false
  },
  parameters: {
    type: DataTypes.TEXT, // JSON parameters for the report
    allowNull: true
  },
  schedule: {
    type: DataTypes.ENUM('MANUAL', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'),
    defaultValue: 'MANUAL'
  },
  recipients: {
    type: DataTypes.TEXT, // JSON array of user IDs or email addresses
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isConfidential: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  accessLevel: {
    type: DataTypes.ENUM('PUBLIC', 'DEPARTMENT', 'MANAGER', 'HR', 'ADMIN'),
    defaultValue: 'HR'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  lastRun: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextRun: {
    type: DataTypes.DATE,
    allowNull: true
  },
  format: {
    type: DataTypes.ENUM('PDF', 'EXCEL', 'CSV', 'JSON', 'HTML'),
    defaultValue: 'PDF'
  },
  chartConfig: {
    type: DataTypes.TEXT, // JSON configuration for charts
    allowNull: true
  },
  filters: {
    type: DataTypes.TEXT, // JSON filters for the report
    allowNull: true
  }
}, {
  tableName: 'analytics_reports',
  timestamps: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['schedule']
    },
    {
      fields: ['next_run']
    }
  ]
});

// Define associations
AnalyticsReport.associate = (models) => {
  AnalyticsReport.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  AnalyticsReport.hasMany(models.ReportExecution, {
    foreignKey: 'reportId',
    as: 'executions'
  });
};

module.exports = AnalyticsReport;
