const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ComplianceCase = sequelize.define('ComplianceCase', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  caseNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Whistleblower', 'Policy_Violation', 'Audit_Finding', 'Security_Breach', 'Data_Privacy', 'Other'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('SOX', 'GDPR', 'HIPAA', 'Labor_Law', 'Safety', 'Financial', 'Other'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  // Whistleblower specific
  reporterId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  reporterAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Case management
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Medium'
  },
  status: {
    type: DataTypes.ENUM('Open', 'Under_Investigation', 'Resolved', 'Closed', 'Escalated'),
    defaultValue: 'Open'
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Audit trail
  auditTrail: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  evidenceFiles: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  // Investigation
  investigationNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  findings: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Resolution
  resolution: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolutionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  // Compliance tracking
  complianceStatus: {
    type: DataTypes.ENUM('Compliant', 'Non_Compliant', 'Under_Review'),
    defaultValue: 'Under_Review'
  },
  riskLevel: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Medium'
  },
  // Policy attestation
  policyViolated: {
    type: DataTypes.STRING,
    allowNull: true
  },
  policyVersion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Background check integration
  backgroundCheckRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  backgroundCheckStatus: {
    type: DataTypes.ENUM('Not_Required', 'Pending', 'Completed', 'Failed'),
    defaultValue: 'Not_Required'
  },
  // Metadata
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  customFields: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'compliance_cases',
  timestamps: true,
  indexes: [
    { fields: ['case_number'] },
    { fields: ['type'] },
    { fields: ['category'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['reporter_id'] },
    { fields: ['assigned_to'] },
    { fields: ['compliance_status'] }
  ]
});

ComplianceCase.associate = (models) => {
  if (models.Employee) {
    ComplianceCase.belongsTo(models.Employee, {
      foreignKey: 'reporterId',
      as: 'reportedBy'
    });
    ComplianceCase.belongsTo(models.Employee, {
      foreignKey: 'resolvedBy',
      as: 'resolver'
    });
  }
  if (models.User) {
    ComplianceCase.belongsTo(models.User, {
      foreignKey: 'assignedTo',
      as: 'assignedUser'
    });
  }
};

module.exports = ComplianceCase;
