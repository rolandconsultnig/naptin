const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Workflow = sequelize.define('Workflow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'ONBOARDING', 'OFFBOARDING', 'PROMOTION', 'TRANSFER', 'DISCIPLINARY',
      'LEAVE_APPROVAL', 'EXPENSE_APPROVAL', 'TRAINING_APPROVAL', 'CUSTOM'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  triggerConditions: {
    type: DataTypes.TEXT, // JSON configuration for when workflow triggers
    allowNull: false
  },
  steps: {
    type: DataTypes.TEXT, // JSON array of workflow steps
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    defaultValue: 'MEDIUM'
  },
  autoAssign: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  timeoutDays: {
    type: DataTypes.INTEGER,
    defaultValue: 7
  },
  escalationRules: {
    type: DataTypes.TEXT, // JSON configuration for escalation
    allowNull: true
  }
}, {
  tableName: 'workflows',
  timestamps: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['department_id']
    },
    {
      fields: ['created_by']
    }
  ]
});

// Define associations
Workflow.associate = (models) => {
  Workflow.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  Workflow.belongsTo(models.Department, {
    foreignKey: 'departmentId',
    as: 'department'
  });

  Workflow.hasMany(models.WorkflowInstance, {
    foreignKey: 'workflowId',
    as: 'instances'
  });
};

module.exports = Workflow;
