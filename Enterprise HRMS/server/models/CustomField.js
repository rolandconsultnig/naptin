const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CustomField = sequelize.define('CustomField', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  entityType: {
    type: DataTypes.ENUM('EMPLOYEE', 'DEPARTMENT', 'JOB', 'CANDIDATE', 'PERFORMANCE'),
    allowNull: false
  },
  fieldName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fieldLabel: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fieldType: {
    type: DataTypes.ENUM(
      'TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'SELECT', 'MULTI_SELECT',
      'EMAIL', 'PHONE', 'URL', 'TEXTAREA', 'FILE', 'CURRENCY'
    ),
    allowNull: false
  },
  fieldOptions: {
    type: DataTypes.TEXT, // JSON array for select options
    allowNull: true
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  validationRules: {
    type: DataTypes.TEXT, // JSON object for validation rules
    allowNull: true
  },
  complianceType: {
    type: DataTypes.ENUM('GDPR', 'HIPAA', 'SOX', 'LABOR_LAW', 'CUSTOM'),
    allowNull: true
  },
  accessLevel: {
    type: DataTypes.ENUM('PUBLIC', 'DEPARTMENT', 'MANAGER', 'HR', 'ADMIN'),
    defaultValue: 'HR'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'custom_fields',
  timestamps: true,
  indexes: [
    {
      fields: ['entity_type']
    },
    {
      fields: ['field_name']
    },
    {
      fields: ['is_active', 'sort_order']
    },
    {
      unique: true,
      fields: ['entity_type', 'field_name']
    }
  ]
});

module.exports = CustomField;
