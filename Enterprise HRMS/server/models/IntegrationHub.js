const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const IntegrationHub = sequelize.define('IntegrationHub', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('ERP', 'CRM', 'IT_SYSTEM', 'THIRD_PARTY', 'CUSTOM'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('SAP', 'Oracle', 'Workday', 'Salesforce', 'Active_Directory', 'Okta', 'Other'),
    allowNull: false
  },
  // Connection details
  apiEndpoint: {
    type: DataTypes.STRING,
    allowNull: true
  },
  apiKey: {
    type: DataTypes.STRING,
    allowNull: true
  },
  apiSecret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Authentication
  authType: {
    type: DataTypes.ENUM('OAuth2', 'API_Key', 'Basic_Auth', 'SAML', 'SSO'),
    allowNull: true
  },
  authConfig: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // Data sync configuration
  syncDirection: {
    type: DataTypes.ENUM('Bidirectional', 'HRMS_to_External', 'External_to_HRMS'),
    defaultValue: 'Bidirectional'
  },
  syncFrequency: {
    type: DataTypes.ENUM('Real_Time', 'Hourly', 'Daily', 'Weekly', 'Monthly'),
    defaultValue: 'Daily'
  },
  lastSync: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextSync: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Data mapping
  dataMapping: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  syncFields: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  // Status and monitoring
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Error', 'Maintenance'),
    defaultValue: 'Inactive'
  },
  healthStatus: {
    type: DataTypes.ENUM('Healthy', 'Warning', 'Critical', 'Unknown'),
    defaultValue: 'Unknown'
  },
  lastHealthCheck: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Error handling
  errorCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastError: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  errorLog: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  // Custom workflow builders
  workflowEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  workflowConfig: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // API marketplace
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  documentation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  version: {
    type: DataTypes.STRING,
    defaultValue: '1.0.0'
  },
  // Security and compliance
  dataEncryption: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  complianceStandards: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  // Metadata
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'integration_hubs',
  timestamps: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['type'] },
    { fields: ['category'] },
    { fields: ['status'] },
    { fields: ['health_status'] },
    { fields: ['created_by'] }
  ]
});

IntegrationHub.associate = (models) => {
  if (models.User) {
    IntegrationHub.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  }
};

module.exports = IntegrationHub;
