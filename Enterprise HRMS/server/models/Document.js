const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  documentType: {
    type: DataTypes.ENUM(
      'CONTRACT', 'CERTIFICATION', 'POLICY', 'HANDBOOK', 'ONBOARDING',
      'PERFORMANCE_REVIEW', 'DISCIPLINARY', 'TRAINING_CERTIFICATE',
      'ID_DOCUMENT', 'TAX_DOCUMENT', 'BENEFIT_DOCUMENT', 'OTHER'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isConfidential: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  accessLevel: {
    type: DataTypes.ENUM('PUBLIC', 'DEPARTMENT', 'MANAGER', 'HR', 'ADMIN'),
    defaultValue: 'DEPARTMENT'
  },
  expirationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tags: {
    type: DataTypes.TEXT, // JSON array of tags
    allowNull: true
  },
  version: {
    type: DataTypes.STRING,
    defaultValue: '1.0'
  },
  parentDocumentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'documents',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  metadata: {
    type: DataTypes.TEXT, // JSON object for additional metadata
    allowNull: true
  }
}, {
  tableName: 'documents',
  timestamps: true,
  indexes: [
    {
      fields: ['employee_id']
    },
    {
      fields: ['department_id']
    },
    {
      fields: ['document_type']
    },
    {
      fields: ['uploaded_by']
    },
    {
      fields: ['is_active', 'created_at']
    },
    {
      fields: ['expiration_date']
    }
  ]
});

// Define associations
Document.associate = (models) => {
  // Employee who owns the document
  Document.belongsTo(models.Employee, {
    foreignKey: 'employeeId',
    as: 'employee'
  });

  // Department that owns the document
  Document.belongsTo(models.Department, {
    foreignKey: 'departmentId',
    as: 'department'
  });

  // User who uploaded the document
  Document.belongsTo(models.User, {
    foreignKey: 'uploadedBy',
    as: 'uploader'
  });

  // Parent document (for versioning)
  Document.belongsTo(Document, {
    foreignKey: 'parentDocumentId',
    as: 'parentDocument'
  });

  // Child documents (versions)
  Document.hasMany(Document, {
    foreignKey: 'parentDocumentId',
    as: 'versions'
  });
};

module.exports = Document;
