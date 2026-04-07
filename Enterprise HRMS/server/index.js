const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Database connection
const { sequelize } = require('./config/database');

// Import models
require('./models/User');
require('./models/Employee');
require('./models/Department');
require('./models/Job');
require('./models/Recruitment');
require('./models/Candidate');
require('./models/Interview');
require('./models/Attendance');
require('./models/Leave');
require('./models/Payroll');
require('./models/Benefit');
require('./models/EmployeeBenefit');
require('./models/Performance');
require('./models/Training');
require('./models/EmployeeTraining');
// Advanced models
require('./models/OrganizationChart');
require('./models/Document');
require('./models/CustomField');
require('./models/CustomFieldValue');
require('./models/Workflow');
require('./models/WorkflowInstance');
require('./models/WorkflowAction');
require('./models/AnalyticsReport');
require('./models/ReportExecution');
require('./models/WorkforcePlan');
require('./models/EmployeeExperience');
require('./models/ComplianceCase');
require('./models/MobileApp');
require('./models/IntegrationHub');

// Setup model associations
const User = require('./models/User');
const Employee = require('./models/Employee');
const Department = require('./models/Department');
const Job = require('./models/Job');
const Recruitment = require('./models/Recruitment');
const Candidate = require('./models/Candidate');
const Interview = require('./models/Interview');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Payroll = require('./models/Payroll');
const Benefit = require('./models/Benefit');
const EmployeeBenefit = require('./models/EmployeeBenefit');
const Performance = require('./models/Performance');
const Training = require('./models/Training');
const EmployeeTraining = require('./models/EmployeeTraining');
// Advanced models
const OrganizationChart = require('./models/OrganizationChart');
const Document = require('./models/Document');
const CustomField = require('./models/CustomField');
const CustomFieldValue = require('./models/CustomFieldValue');
const Workflow = require('./models/Workflow');
const WorkflowInstance = require('./models/WorkflowInstance');
const WorkflowAction = require('./models/WorkflowAction');
const AnalyticsReport = require('./models/AnalyticsReport');
const ReportExecution = require('./models/ReportExecution');
const WorkforcePlan = require('./models/WorkforcePlan');
const EmployeeExperience = require('./models/EmployeeExperience');
const ComplianceCase = require('./models/ComplianceCase');
const MobileApp = require('./models/MobileApp');
const IntegrationHub = require('./models/IntegrationHub');

// Initialize associations
const models = {
  User,
  Employee,
  Department,
  Job,
  Recruitment,
  Candidate,
  Interview,
  Attendance,
  Leave,
  Payroll,
  Benefit,
  EmployeeBenefit,
  Performance,
  Training,
  EmployeeTraining,
  OrganizationChart,
  Document,
  CustomField,
  CustomFieldValue,
  Workflow,
  WorkflowInstance,
  WorkflowAction,
  AnalyticsReport,
  ReportExecution,
  WorkforcePlan,
  EmployeeExperience,
  ComplianceCase,
  MobileApp,
  IntegrationHub
};

// Call associate functions if they exist
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/recruitment', require('./routes/recruitment'));
app.use('/api/candidates', require('./routes/candidates'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leave', require('./routes/leave'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/benefits', require('./routes/benefits'));
app.use('/api/performance', require('./routes/performance'));
app.use('/api/training', require('./routes/training'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/documents', require('./routes/documents'));
// Advanced routes
app.use('/api/organization', require('./routes/organization'));
app.use('/api/document-management', require('./routes/documentManagement'));
// New module routes
app.use('/api/employee-experience', require('./routes/employeeExperience'));
app.use('/api/compliance-cases', require('./routes/complianceCases'));
app.use('/api/mobile-app', require('./routes/mobileApp'));
app.use('/api/integration-hub', require('./routes/integrationHub'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Enterprise HRMS API is running' });
});

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync database models (in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database models synchronized.');
    }
    
    app.listen(PORT, () => {
      console.log(`Enterprise HRMS server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
