const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Candidate = sequelize.define('Candidate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  recruitmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'recruitments',
      key: 'id'
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other', 'Prefer not to say')
  },
  address: {
    type: DataTypes.TEXT
  },
  city: {
    type: DataTypes.STRING
  },
  state: {
    type: DataTypes.STRING
  },
  country: {
    type: DataTypes.STRING
  },
  zipCode: {
    type: DataTypes.STRING
  },
  currentPosition: {
    type: DataTypes.STRING
  },
  currentCompany: {
    type: DataTypes.STRING
  },
  experience: {
    type: DataTypes.INTEGER // years of experience
  },
  education: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  skills: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  certifications: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  resume: {
    type: DataTypes.STRING // file path or URL
  },
  coverLetter: {
    type: DataTypes.TEXT
  },
  portfolio: {
    type: DataTypes.STRING // URL
  },
  linkedinProfile: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('Applied', 'Screening', 'Interview', 'Technical Test', 'Reference Check', 'Offer', 'Hired', 'Rejected', 'Withdrawn'),
    defaultValue: 'Applied'
  },
  source: {
    type: DataTypes.ENUM('Career Portal', 'LinkedIn', 'Indeed', 'Referral', 'Recruiter', 'AI_Sourcing', 'Other'),
    defaultValue: 'Career Portal'
  },
  // AI-powered features
  aiScore: {
    type: DataTypes.DECIMAL(3, 2), // 0.00 to 1.00
    allowNull: true
  },
  aiMatchPercentage: {
    type: DataTypes.INTEGER, // 0-100
    allowNull: true
  },
  aiSkillsMatch: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  aiRecommendation: {
    type: DataTypes.ENUM('Strong_Match', 'Good_Match', 'Average_Match', 'Weak_Match'),
    allowNull: true
  },
  // Automated interview scheduling
  interviewScheduled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  interviewPlatform: {
    type: DataTypes.ENUM('Zoom', 'Teams', 'Google_Meet', 'In_Person'),
    allowNull: true
  },
  interviewLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Offer and onboarding
  offerLetterGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  offerLetterSigned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  onboardingStatus: {
    type: DataTypes.ENUM('Not_Started', 'In_Progress', 'Completed'),
    defaultValue: 'Not_Started'
  },
  onboardingTasks: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  recruiterId: {
    type: DataTypes.UUID,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  expectedSalary: {
    type: DataTypes.DECIMAL(10, 2)
  },
  availability: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT
  },
  customFields: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'candidates',
  indexes: [
    {
      fields: ['first_name', 'last_name']
    },
    {
      fields: ['email']
    },
    {
      fields: ['status']
    },
    {
      fields: ['recruitment_id']
    },
    {
      fields: ['source']
    }
  ]
});

// Define associations
Candidate.associate = (models) => {
  if (models.Recruitment) {
    Candidate.belongsTo(models.Recruitment, {
      foreignKey: 'recruitmentId',
      as: 'recruitment'
    });
  }
  if (models.Employee) {
    Candidate.belongsTo(models.Employee, {
      foreignKey: 'recruiterId',
      as: 'recruiter'
    });
  }
};

module.exports = Candidate;
