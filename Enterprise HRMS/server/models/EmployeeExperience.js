const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EmployeeExperience = sequelize.define('EmployeeExperience', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  // Recognition platform
  recognitionType: {
    type: DataTypes.ENUM('Peer_Bonus', 'Badge', 'Award', 'Thank_You', 'Milestone'),
    allowNull: false
  },
  recognitionTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recognitionDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recognitionAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  recognizedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  // Engagement surveys
  surveyType: {
    type: DataTypes.ENUM('Pulse', 'Annual', 'Exit', 'Onboarding', 'Custom'),
    allowNull: true
  },
  surveyScore: {
    type: DataTypes.DECIMAL(3, 2), // 0.00 to 5.00
    allowNull: true
  },
  surveyResponses: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // Exit interview analytics
  exitInterviewDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  exitReason: {
    type: DataTypes.ENUM('Better_Opportunity', 'Career_Change', 'Relocation', 'Retirement', 'Dissatisfaction', 'Other'),
    allowNull: true
  },
  exitFeedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rehireEligible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // AI chatbot interactions
  chatbotQuery: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  chatbotResponse: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  chatbotSatisfaction: {
    type: DataTypes.INTEGER, // 1-5 scale
    allowNull: true
  },
  // Workplace collaboration
  collaborationTools: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  teamEngagement: {
    type: DataTypes.DECIMAL(3, 2), // 0.00 to 5.00
    allowNull: true
  },
  // Overall experience metrics
  overallSatisfaction: {
    type: DataTypes.DECIMAL(3, 2), // 0.00 to 5.00
    allowNull: true
  },
  recommendationScore: {
    type: DataTypes.INTEGER, // 0-10 scale
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Archived'),
    defaultValue: 'Active'
  }
}, {
  tableName: 'employee_experiences',
  timestamps: true,
  indexes: [
    { fields: ['employee_id'] },
    { fields: ['recognition_type'] },
    { fields: ['survey_type'] },
    { fields: ['exit_reason'] },
    { fields: ['status'] }
  ]
});

EmployeeExperience.associate = (models) => {
  if (models.Employee) {
    EmployeeExperience.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee'
    });
    EmployeeExperience.belongsTo(models.Employee, {
      foreignKey: 'recognizedBy',
      as: 'recognizer'
    });
  }
};

module.exports = EmployeeExperience;
