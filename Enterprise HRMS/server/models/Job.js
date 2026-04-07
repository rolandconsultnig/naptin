const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.TEXT
  },
  requirements: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  responsibilities: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  minSalary: {
    type: DataTypes.DECIMAL(10, 2)
  },
  maxSalary: {
    type: DataTypes.DECIMAL(10, 2)
  },
  employmentType: {
    type: DataTypes.ENUM('Full-time', 'Part-time', 'Contract', 'Intern', 'Temporary'),
    defaultValue: 'Full-time'
  },
  location: {
    type: DataTypes.STRING
  },
  remoteWork: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Filled', 'On Hold'),
    defaultValue: 'Active'
  },
  customFields: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'jobs',
  indexes: [
    {
      fields: ['title']
    },
    {
      fields: ['code']
    },
    {
      fields: ['department_id']
    },
    {
      fields: ['status']
    }
  ]
});

// Define associations
Job.associate = (models) => {
  if (models.Department) {
    Job.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department'
    });
  }
};

module.exports = Job;
