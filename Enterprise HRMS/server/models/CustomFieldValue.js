const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CustomFieldValue = sequelize.define('CustomFieldValue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customFieldId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'custom_fields',
      key: 'id'
    }
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  numericValue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  dateValue: {
    type: DataTypes.DATE,
    allowNull: true
  },
  booleanValue: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  encryptedValue: {
    type: DataTypes.TEXT, // For sensitive compliance data
    allowNull: true
  },
  lastModifiedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'custom_field_values',
  timestamps: true,
  indexes: [
    {
      fields: ['custom_field_id']
    },
    {
      fields: ['entity_id']
    },
    {
      unique: true,
      fields: ['custom_field_id', 'entity_id']
    },
    {
      fields: ['last_modified_by']
    }
  ]
});

// Define associations
CustomFieldValue.associate = (models) => {
  // Custom field definition
  CustomFieldValue.belongsTo(models.CustomField, {
    foreignKey: 'customFieldId',
    as: 'customField'
  });

  // User who last modified the value
  CustomFieldValue.belongsTo(models.User, {
    foreignKey: 'lastModifiedBy',
    as: 'modifier'
  });
};

module.exports = CustomFieldValue;
