const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  employeeId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other', 'Prefer not to say'),
    allowNull: false
  },
  // Enhanced demographic fields
  nationality: {
    type: DataTypes.STRING,
    allowNull: true
  },
  maritalStatus: {
    type: DataTypes.ENUM('Single', 'Married', 'Divorced', 'Widowed', 'Other'),
    allowNull: true
  },
  socialSecurityNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nationalId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passportNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  visaStatus: {
    type: DataTypes.ENUM('Citizen', 'Permanent_Resident', 'Work_Visa', 'Student_Visa', 'Other'),
    allowNull: true
  },
  hireDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  terminationDate: {
    type: DataTypes.DATEONLY
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  managerId: {
    type: DataTypes.UUID,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2)
  },
  employmentType: {
    type: DataTypes.ENUM('Full-time', 'Part-time', 'Contract', 'Intern'),
    defaultValue: 'Full-time'
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Terminated', 'On Leave'),
    defaultValue: 'Active'
  },
  emergencyContact: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  skills: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  certifications: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  education: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  workExperience: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  bankDetails: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  taxInfo: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // Compensation details
  baseSalary: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD'
  },
  payFrequency: {
    type: DataTypes.ENUM('Weekly', 'Bi-weekly', 'Semi-monthly', 'Monthly'),
    defaultValue: 'Monthly'
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true
  },
  overtimeRate: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true
  },
  // Work arrangement
  workLocation: {
    type: DataTypes.ENUM('Office', 'Remote', 'Hybrid', 'Field'),
    defaultValue: 'Office'
  },
  workSchedule: {
    type: DataTypes.JSONB, // Flexible schedule configuration
    defaultValue: {}
  },
  timezone: {
    type: DataTypes.STRING,
    defaultValue: 'UTC'
  },
  // Performance and career
  jobLevel: {
    type: DataTypes.STRING,
    allowNull: true
  },
  careerPath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  performanceRating: {
    type: DataTypes.DECIMAL(3, 2), // 1.00 to 5.00
    allowNull: true
  },
  lastReviewDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextReviewDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Compliance and security
  backgroundCheckStatus: {
    type: DataTypes.ENUM('Pending', 'Completed', 'Failed', 'Not_Required'),
    defaultValue: 'Not_Required'
  },
  securityClearance: {
    type: DataTypes.STRING,
    allowNull: true
  },
  complianceTrainingStatus: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // System fields
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isRemoteWorker: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  customFields: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'employees',
  indexes: [
    {
      fields: ['employee_id']
    },
    {
      fields: ['email']
    },
    {
      fields: ['department_id']
    },
    {
      fields: ['department']
    },
    {
      fields: ['status']
    }
  ]
});

// Define associations
Employee.associate = (models) => {
  // Employee belongs to a Department via departmentId
  if (models.Department) {
    Employee.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'departmentRef'
    });
  }

  // Employee belongs to a manager (self-reference)
  Employee.belongsTo(Employee, {
    foreignKey: 'managerId',
    as: 'manager'
  });
};

module.exports = Employee;
