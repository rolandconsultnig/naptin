const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MobileApp = sequelize.define('MobileApp', {
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
  // Mobile app features
  deviceId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deviceType: {
    type: DataTypes.ENUM('iOS', 'Android', 'Web'),
    allowNull: false
  },
  appVersion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Self-service approvals
  approvalType: {
    type: DataTypes.ENUM('Leave', 'Expense', 'Timesheet', 'Overtime', 'Training', 'Other'),
    allowNull: true
  },
  approvalStatus: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Cancelled'),
    allowNull: true
  },
  approvalData: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // Digital payslips and tax forms
  documentType: {
    type: DataTypes.ENUM('Payslip', 'Tax_Form', 'Benefits_Summary', 'Performance_Review', 'Other'),
    allowNull: true
  },
  documentUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  documentDownloaded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Push notifications
  notificationType: {
    type: DataTypes.ENUM('Approval_Request', 'Deadline_Reminder', 'System_Alert', 'News', 'Other'),
    allowNull: true
  },
  notificationTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notificationBody: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notificationSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notificationRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Voice-enabled assistants
  voiceCommand: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  voiceResponse: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  voicePlatform: {
    type: DataTypes.ENUM('Alexa', 'Google_Assistant', 'Siri', 'Cortana', 'Other'),
    allowNull: true
  },
  // Location-based features
  locationEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  currentLocation: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // Biometric authentication
  biometricEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  biometricType: {
    type: DataTypes.ENUM('Fingerprint', 'Face_ID', 'Touch_ID', 'Iris', 'Other'),
    allowNull: true
  },
  // App usage analytics
  sessionDuration: {
    type: DataTypes.INTEGER, // in seconds
    defaultValue: 0
  },
  featuresUsed: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  errorReports: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  // Security
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastActivity: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'mobile_apps',
  timestamps: true,
  indexes: [
    { fields: ['employee_id'] },
    { fields: ['device_type'] },
    { fields: ['approval_type'] },
    { fields: ['notification_type'] },
    { fields: ['is_active'] },
    { fields: ['last_activity'] }
  ]
});

MobileApp.associate = (models) => {
  if (models.Employee) {
    MobileApp.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee'
    });
  }
};

module.exports = MobileApp;
