const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'candidates',
      key: 'id'
    }
  },
  recruitmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'recruitments',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('Phone Screen', 'Video Call', 'On-site', 'Technical', 'Panel', 'Final', 'Reference'),
    defaultValue: 'Phone Screen'
  },
  status: {
    type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'No Show'),
    defaultValue: 'Scheduled'
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER // minutes
  },
  location: {
    type: DataTypes.STRING
  },
  videoUrl: {
    type: DataTypes.STRING
  },
  interviewers: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT
  },
  feedback: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  decision: {
    type: DataTypes.ENUM('Pass', 'Fail', 'Hold', 'Next Round'),
    defaultValue: 'Hold'
  },
  customFields: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'interviews',
  indexes: [
    {
      fields: ['candidate_id']
    },
    {
      fields: ['recruitment_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['scheduled_date']
    },
    {
      fields: ['type']
    }
  ]
});

module.exports = Interview;
