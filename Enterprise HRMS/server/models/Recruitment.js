const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Recruitment = sequelize.define('Recruitment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
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
  location: {
    type: DataTypes.STRING
  },
  remoteWork: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  employmentType: {
    type: DataTypes.ENUM('Full-time', 'Part-time', 'Contract', 'Intern', 'Temporary'),
    defaultValue: 'Full-time'
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Published', 'Closed', 'On Hold', 'Filled'),
    defaultValue: 'Draft'
  },
  publishDate: {
    type: DataTypes.DATE
  },
  closeDate: {
    type: DataTypes.DATE
  },
  hiringManagerId: {
    type: DataTypes.UUID,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  recruiterId: {
    type: DataTypes.UUID,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  departmentId: {
    type: DataTypes.UUID,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  customFields: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'recruitments',
  indexes: [
    {
      fields: ['title']
    },
    {
      fields: ['status']
    },
    {
      fields: ['department_id']
    },
    {
      fields: ['hiring_manager_id']
    }
  ]
});

// Define associations
Recruitment.associate = (models) => {
  if (models.Job) {
    Recruitment.belongsTo(models.Job, {
      foreignKey: 'jobId',
      as: 'job'
    });
  }
  if (models.Employee) {
    Recruitment.belongsTo(models.Employee, {
      foreignKey: 'hiringManagerId',
      as: 'hiringManager'
    });
    Recruitment.belongsTo(models.Employee, {
      foreignKey: 'recruiterId',
      as: 'recruiter'
    });
  }
  if (models.Department) {
    Recruitment.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department'
    });
  }
  if (models.Candidate) {
    Recruitment.hasMany(models.Candidate, {
      foreignKey: 'recruitmentId',
      as: 'candidates'
    });
  }
};

module.exports = Recruitment;
