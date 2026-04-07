const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkforcePlan = sequelize.define('WorkforcePlan', {
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
    type: DataTypes.ENUM('HEADCOUNT_FORECAST', 'SKILLS_GAP', 'SCENARIO_MODELING', 'DIVERSITY_PLANNING'),
    allowNull: false
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  currentHeadcount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  targetHeadcount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  forecastedHeadcount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  skillsGapAnalysis: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  diversityMetrics: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  scenarioData: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  assumptions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'IN_REVIEW', 'APPROVED', 'IMPLEMENTED'),
    defaultValue: 'DRAFT'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'workforce_plans',
  timestamps: true,
  indexes: [
    { fields: ['type'] },
    { fields: ['department_id'] },
    { fields: ['status'] },
    { fields: ['created_by'] },
    { fields: ['start_date', 'end_date'] }
  ]
});

WorkforcePlan.associate = (models) => {
  if (models.Department) {
    WorkforcePlan.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department'
    });
  }
  if (models.User) {
    WorkforcePlan.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    WorkforcePlan.belongsTo(models.User, {
      foreignKey: 'approvedBy',
      as: 'approver'
    });
  }
};

module.exports = WorkforcePlan;
