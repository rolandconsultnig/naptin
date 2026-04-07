const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReportExecution = sequelize.define('ReportExecution', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reportId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'analytics_reports',
      key: 'id'
    }
  },
  executedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'),
    defaultValue: 'RUNNING'
  },
  startTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  executionTime: {
    type: DataTypes.INTEGER, // Execution time in milliseconds
    allowNull: true
  },
  resultCount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  parameters: {
    type: DataTypes.TEXT, // JSON parameters used for this execution
    allowNull: true
  },
  metadata: {
    type: DataTypes.TEXT, // JSON metadata about the execution
    allowNull: true
  },
  isScheduled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastDownloaded: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'report_executions',
  timestamps: true,
  indexes: [
    {
      fields: ['report_id']
    },
    {
      fields: ['executed_by']
    },
    {
      fields: ['status']
    },
    {
      fields: ['start_time']
    },
    {
      fields: ['is_scheduled']
    }
  ]
});

// Define associations
ReportExecution.associate = (models) => {
  ReportExecution.belongsTo(models.AnalyticsReport, {
    foreignKey: 'reportId',
    as: 'report'
  });

  ReportExecution.belongsTo(models.User, {
    foreignKey: 'executedBy',
    as: 'executor'
  });
};

module.exports = ReportExecution;
