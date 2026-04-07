const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Training = sequelize.define('Training', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  type: {
    type: DataTypes.ENUM('Online Course', 'In-person Training', 'Webinar', 'Workshop', 'Certification', 'Mentoring', 'Coaching', 'Other'),
    defaultValue: 'Online Course'
  },
  category: {
    type: DataTypes.STRING
  },
  provider: {
    type: DataTypes.STRING
  },
  instructor: {
    type: DataTypes.STRING
  },
  duration: {
    type: DataTypes.INTEGER // minutes
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2)
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD'
  },
  location: {
    type: DataTypes.STRING
  },
  startDate: {
    type: DataTypes.DATE
  },
  endDate: {
    type: DataTypes.DATE
  },
  maxParticipants: {
    type: DataTypes.INTEGER
  },
  prerequisites: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  learningObjectives: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  materials: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Published', 'In Progress', 'Completed', 'Cancelled'),
    defaultValue: 'Draft'
  },
  // AI-curated learning features
  aiRecommended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  aiScore: {
    type: DataTypes.DECIMAL(3, 2), // 0.00 to 1.00
    allowNull: true
  },
  targetRoles: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  requiredSkills: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  skillLevel: {
    type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert'),
    defaultValue: 'Beginner'
  },
  // Certification tracking
  certificationType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  certificationProvider: {
    type: DataTypes.STRING,
    allowNull: true
  },
  certificationExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  certificationCredits: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Virtual instructor-led training
  isVirtual: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  virtualPlatform: {
    type: DataTypes.ENUM('Zoom', 'Teams', 'Google_Meet', 'Webex', 'Other'),
    allowNull: true
  },
  meetingLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Leadership pipeline
  isLeadershipProgram: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  leadershipLevel: {
    type: DataTypes.ENUM('Emerging_Leader', 'Mid_Level_Leader', 'Senior_Leader', 'Executive'),
    allowNull: true
  },
  customFields: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'trainings',
  indexes: [
    {
      fields: ['title']
    },
    {
      fields: ['type']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['start_date']
    }
  ]
});

// Define associations
Training.associate = (models) => {
  if (models.EmployeeTraining) {
    Training.hasMany(models.EmployeeTraining, {
      foreignKey: 'trainingId',
      as: 'enrollments'
    });
  }
};

module.exports = Training;
