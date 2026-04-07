const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkflowInstance = sequelize.define('WorkflowInstance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  workflowId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'workflows',
      key: 'id'
    }
  },
  entityType: {
    type: DataTypes.ENUM('EMPLOYEE', 'CANDIDATE', 'LEAVE_REQUEST', 'EXPENSE', 'DOCUMENT'),
    allowNull: false
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED'),
    defaultValue: 'PENDING'
  },
  currentStep: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalSteps: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  initiatedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  data: {
    type: DataTypes.TEXT, // JSON data for the workflow instance
    allowNull: true
  },
  stepHistory: {
    type: DataTypes.TEXT, // JSON array of completed steps
    defaultValue: '[]'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    defaultValue: 'MEDIUM'
  }
}, {
  tableName: 'workflow_instances',
  timestamps: true,
  indexes: [
    {
      fields: ['workflow_id']
    },
    {
      fields: ['entity_type', 'entity_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['assigned_to']
    },
    {
      fields: ['initiated_by']
    },
    {
      fields: ['due_date']
    }
  ]
});

// Define associations
WorkflowInstance.associate = (models) => {
  WorkflowInstance.belongsTo(models.Workflow, {
    foreignKey: 'workflowId',
    as: 'workflow'
  });

  WorkflowInstance.belongsTo(models.User, {
    foreignKey: 'assignedTo',
    as: 'assignee'
  });

  WorkflowInstance.belongsTo(models.User, {
    foreignKey: 'initiatedBy',
    as: 'initiator'
  });

  WorkflowInstance.hasMany(models.WorkflowAction, {
    foreignKey: 'workflowInstanceId',
    as: 'actions'
  });
};

module.exports = WorkflowInstance;
