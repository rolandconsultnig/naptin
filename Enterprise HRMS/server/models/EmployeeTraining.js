const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EmployeeTraining = sequelize.define('EmployeeTraining', {
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
  trainingId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'trainings',
      key: 'id'
    }
  },
  enrollmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  completionDate: {
    type: DataTypes.DATEONLY
  },
  status: {
    type: DataTypes.ENUM('Enrolled', 'In Progress', 'Completed', 'Failed', 'Withdrawn'),
    defaultValue: 'Enrolled'
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  score: {
    type: DataTypes.DECIMAL(5, 2)
  },
  certificate: {
    type: DataTypes.STRING // file path or URL
  },
  certificateExpiryDate: {
    type: DataTypes.DATEONLY
  },
  feedback: {
    type: DataTypes.TEXT
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  notes: {
    type: DataTypes.TEXT
  },
  customFields: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'employee_trainings',
  indexes: [
    {
      fields: ['employee_id']
    },
    {
      fields: ['training_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['enrollment_date']
    },
    {
      fields: ['employee_id', 'training_id'],
      unique: true
    }
  ]
});

// Define associations
EmployeeTraining.associate = (models) => {
  if (models.Employee) {
    EmployeeTraining.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee'
    });
  }
  if (models.Training) {
    EmployeeTraining.belongsTo(models.Training, {
      foreignKey: 'trainingId',
      as: 'training'
    });
  }
};

module.exports = EmployeeTraining;
