const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('Attendance', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  clockIn: {
    type: DataTypes.DATE
  },
  clockOut: {
    type: DataTypes.DATE
  },
  breakStart: {
    type: DataTypes.DATE
  },
  breakEnd: {
    type: DataTypes.DATE
  },
  totalHours: {
    type: DataTypes.DECIMAL(4, 2)
  },
  regularHours: {
    type: DataTypes.DECIMAL(4, 2)
  },
  overtimeHours: {
    type: DataTypes.DECIMAL(4, 2)
  },
  breakHours: {
    type: DataTypes.DECIMAL(4, 2)
  },
  status: {
    type: DataTypes.ENUM('Present', 'Absent', 'Late', 'Half-day', 'Remote', 'On Leave'),
    defaultValue: 'Present'
  },
  clockInLocation: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  clockOutLocation: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  clockInMethod: {
    type: DataTypes.ENUM('Manual', 'Biometric', 'Facial_Recognition', 'Mobile_App', 'Geofencing'),
    defaultValue: 'Manual'
  },
  clockOutMethod: {
    type: DataTypes.ENUM('Manual', 'Biometric', 'Facial_Recognition', 'Mobile_App', 'Geofencing'),
    defaultValue: 'Manual'
  },
  location: {
    type: DataTypes.JSONB, // {lat: 0, lng: 0, address: "string"}
    allowNull: true
  },
  geofenceZone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  biometricData: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  fatigueLevel: {
    type: DataTypes.INTEGER, // 1-10 scale
    allowNull: true
  },
  breakDuration: {
    type: DataTypes.INTEGER, // in minutes
    defaultValue: 0
  },
  overtimeHours: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0
  },
  complianceStatus: {
    type: DataTypes.ENUM('Compliant', 'Non_Compliant', 'Warning'),
    defaultValue: 'Compliant'
  },
  notes: {
    type: DataTypes.TEXT
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
  tableName: 'attendances',
  indexes: [
    {
      fields: ['employee_id']
    },
    {
      fields: ['date']
    },
    {
      fields: ['status']
    },
    {
      fields: ['employee_id', 'date'],
      unique: true
    }
  ]
});

// Define associations
Attendance.associate = (models) => {
  if (models.Employee) {
    Attendance.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee'
    });
  }
};

module.exports = Attendance;
