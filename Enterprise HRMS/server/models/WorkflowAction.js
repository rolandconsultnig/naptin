const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkflowAction = sequelize.define('WorkflowAction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  workflowInstanceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'workflow_instances',
      key: 'id'
    }
  },
  stepNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action: {
    type: DataTypes.ENUM(
      'APPROVE', 'REJECT', 'REQUEST_INFO', 'DELEGATE', 'ESCALATE', 
      'COMPLETE_TASK', 'START_TASK', 'SKIP', 'COMMENT'
    ),
    allowNull: false
  },
  actionBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  actionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attachments: {
    type: DataTypes.TEXT, // JSON array of file paths
    allowNull: true
  },
  delegatedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isSystemAction: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.TEXT, // JSON for additional action metadata
    allowNull: true
  }
}, {
  tableName: 'workflow_actions',
  timestamps: true,
  indexes: [
    {
      fields: ['workflow_instance_id']
    },
    {
      fields: ['action_by']
    },
    {
      fields: ['action_date']
    },
    {
      fields: ['step_number']
    }
  ]
});

// Define associations
WorkflowAction.associate = (models) => {
  WorkflowAction.belongsTo(models.WorkflowInstance, {
    foreignKey: 'workflowInstanceId',
    as: 'workflowInstance'
  });

  WorkflowAction.belongsTo(models.User, {
    foreignKey: 'actionBy',
    as: 'actor'
  });

  WorkflowAction.belongsTo(models.User, {
    foreignKey: 'delegatedTo',
    as: 'delegate'
  });
};

module.exports = WorkflowAction;
