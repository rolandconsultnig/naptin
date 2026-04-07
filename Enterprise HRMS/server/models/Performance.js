const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Performance = sequelize.define('Performance', {
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
  reviewPeriod: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reviewType: {
    type: DataTypes.ENUM('Annual', 'Quarterly', 'Monthly', 'Project-based', '360-degree'),
    defaultValue: 'Annual'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  reviewerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('Draft', 'In Progress', 'Submitted', 'Reviewed', 'Approved', 'Completed'),
    defaultValue: 'Draft'
  },
  overallRating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  goals: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  achievements: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  strengths: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  areasForImprovement: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  feedback: {
    type: DataTypes.TEXT
  },
  employeeComments: {
    type: DataTypes.TEXT
  },
  nextSteps: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  developmentPlan: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // Continuous feedback features
  pulseSurveyScore: {
    type: DataTypes.DECIMAL(3, 2), // 0.00 to 5.00
    allowNull: true
  },
  engagementScore: {
    type: DataTypes.DECIMAL(3, 2), // 0.00 to 5.00
    allowNull: true
  },
  // 9-box grid for talent segmentation
  potentialRating: {
    type: DataTypes.INTEGER, // 1-5 scale
    allowNull: true
  },
  performanceRating: {
    type: DataTypes.INTEGER, // 1-5 scale
    allowNull: true
  },
  nineBoxPosition: {
    type: DataTypes.ENUM('High_Potential_High_Performer', 'High_Potential_Medium_Performer', 'High_Potential_Low_Performer',
                         'Medium_Potential_High_Performer', 'Medium_Potential_Medium_Performer', 'Medium_Potential_Low_Performer',
                         'Low_Potential_High_Performer', 'Low_Potential_Medium_Performer', 'Low_Potential_Low_Performer'),
    allowNull: true
  },
  // Calibration tools
  calibrationScore: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true
  },
  calibrationNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Career pathing
  careerPath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nextRole: {
    type: DataTypes.STRING,
    allowNull: true
  },
  readinessForPromotion: {
    type: DataTypes.ENUM('Ready', 'Developing', 'Not_Ready'),
    allowNull: true
  },
  // Succession planning
  successionPlan: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isSuccessor: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  successorFor: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
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
  customFields: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'performances',
  indexes: [
    {
      fields: ['employee_id']
    },
    {
      fields: ['reviewer_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['review_period']
    },
    {
      fields: ['start_date']
    }
  ]
});

// Define associations
Performance.associate = (models) => {
  if (models.Employee) {
    Performance.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee'
    });
    Performance.belongsTo(models.Employee, {
      foreignKey: 'reviewerId',
      as: 'reviewer'
    });
  }
};

module.exports = Performance;
