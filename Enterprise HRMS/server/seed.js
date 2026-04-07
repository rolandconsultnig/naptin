const { sequelize } = require('./config/database');
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

const seedDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Create test admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@hrms.com',
      password: 'admin123',
      role: 'Admin',
      isActive: true
    });

    console.log('Test admin user created:', {
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role
    });

    // Create test HR Manager
    const hrManager = await User.create({
      username: 'hrmanager',
      email: 'hr@hrms.com',
      password: 'hr123',
      role: 'HR Manager',
      isActive: true
    });

    console.log('Test HR Manager created:', {
      username: hrManager.username,
      email: hrManager.email,
      role: hrManager.role
    });

    // Create test employee
    const employee = await User.create({
      username: 'employee',
      email: 'employee@hrms.com',
      password: 'emp123',
      role: 'Employee',
      isActive: true
    });

    console.log('Test employee created:', {
      username: employee.username,
      email: employee.email,
      role: employee.role
    });

    // Create test employees
    const testEmployees = [
      {
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        phone: '+1-555-0123',
        dateOfBirth: '1990-05-15',
        gender: 'Male',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        hireDate: '2023-01-15',
        position: 'Software Engineer',
        department: 'Engineering',
        salary: 75000.00,
        employmentType: 'Full-time',
        status: 'Active',
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        certifications: [
          {
            name: 'AWS Certified Developer',
            issuer: 'Amazon Web Services',
            dateObtained: '2023-03-15',
            expiryDate: '2026-03-15',
            id: '1'
          }
        ],
        education: [
          {
            degree: 'Bachelor of Science',
            institution: 'MIT',
            fieldOfStudy: 'Computer Science',
            startDate: '2016-09-01',
            endDate: '2020-05-15',
            gpa: '3.8',
            id: '1'
          }
        ]
      },
      {
        employeeId: 'EMP002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        phone: '+1-555-0124',
        dateOfBirth: '1988-08-22',
        gender: 'Female',
        address: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
        hireDate: '2023-02-20',
        position: 'HR Manager',
        department: 'Human Resources',
        salary: 65000.00,
        employmentType: 'Full-time',
        status: 'Active',
        skills: ['HR Management', 'Recruitment', 'Employee Relations', 'HRIS'],
        certifications: [
          {
            name: 'PHR Certification',
            issuer: 'HR Certification Institute',
            dateObtained: '2022-06-10',
            expiryDate: '2025-06-10',
            id: '1'
          }
        ]
      },
      {
        employeeId: 'EMP003',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@company.com',
        phone: '+1-555-0125',
        dateOfBirth: '1992-12-10',
        gender: 'Male',
        address: '789 Pine Street',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        hireDate: '2023-03-10',
        position: 'Marketing Specialist',
        department: 'Marketing',
        salary: 55000.00,
        employmentType: 'Full-time',
        status: 'Active',
        skills: ['Digital Marketing', 'Social Media', 'Content Creation', 'Analytics']
      },
      {
        employeeId: 'EMP004',
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@company.com',
        phone: '+1-555-0126',
        dateOfBirth: '1995-03-18',
        gender: 'Female',
        address: '321 Elm Street',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        country: 'USA',
        hireDate: '2023-04-05',
        position: 'Data Analyst',
        department: 'Analytics',
        salary: 60000.00,
        employmentType: 'Full-time',
        status: 'On Leave',
        skills: ['SQL', 'Python', 'Tableau', 'Statistics']
      },
      {
        employeeId: 'EMP005',
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@company.com',
        phone: '+1-555-0127',
        dateOfBirth: '1985-11-30',
        gender: 'Male',
        address: '654 Maple Drive',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA',
        hireDate: '2023-05-12',
        position: 'Product Manager',
        department: 'Product',
        salary: 85000.00,
        employmentType: 'Full-time',
        status: 'Active',
        skills: ['Product Management', 'Agile', 'User Research', 'Roadmapping']
      },
      {
        employeeId: 'EMP006',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@company.com',
        phone: '+1-555-0128',
        dateOfBirth: '1993-07-14',
        gender: 'Female',
        address: '987 Cedar Lane',
        city: 'Austin',
        state: 'TX',
        zipCode: '73301',
        country: 'USA',
        hireDate: '2023-06-01',
        position: 'UX Designer',
        department: 'Design',
        salary: 70000.00,
        employmentType: 'Full-time',
        status: 'Active',
        skills: ['UI/UX Design', 'Figma', 'Prototyping', 'User Testing']
      },
      {
        employeeId: 'EMP007',
        firstName: 'Alex',
        lastName: 'Taylor',
        email: 'alex.taylor@company.com',
        phone: '+1-555-0129',
        dateOfBirth: '1997-01-25',
        gender: 'Male',
        address: '147 Birch Road',
        city: 'Denver',
        state: 'CO',
        zipCode: '80201',
        country: 'USA',
        hireDate: '2023-07-15',
        position: 'Sales Representative',
        department: 'Sales',
        salary: 50000.00,
        employmentType: 'Full-time',
        status: 'Active',
        skills: ['Sales', 'CRM', 'Negotiation', 'Customer Relations']
      },
      {
        employeeId: 'EMP008',
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'lisa.anderson@company.com',
        phone: '+1-555-0130',
        dateOfBirth: '1991-09-08',
        gender: 'Female',
        address: '258 Spruce Street',
        city: 'Portland',
        state: 'OR',
        zipCode: '97201',
        country: 'USA',
        hireDate: '2023-08-20',
        position: 'Financial Analyst',
        department: 'Finance',
        salary: 65000.00,
        employmentType: 'Full-time',
        status: 'Active',
        skills: ['Financial Analysis', 'Excel', 'Budgeting', 'Forecasting']
      },
      {
        employeeId: 'EMP009',
        firstName: 'Tom',
        lastName: 'Garcia',
        email: 'tom.garcia@company.com',
        phone: '+1-555-0131',
        dateOfBirth: '1989-04-12',
        gender: 'Male',
        address: '369 Willow Way',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        country: 'USA',
        hireDate: '2023-09-10',
        position: 'Customer Support',
        department: 'Support',
        salary: 45000.00,
        employmentType: 'Part-time',
        status: 'Active',
        skills: ['Customer Service', 'Problem Solving', 'Communication', 'Zendesk']
      },
      {
        employeeId: 'EMP010',
        firstName: 'Rachel',
        lastName: 'Martinez',
        email: 'rachel.martinez@company.com',
        phone: '+1-555-0132',
        dateOfBirth: '1994-06-20',
        gender: 'Female',
        address: '741 Aspen Court',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94101',
        country: 'USA',
        hireDate: '2023-10-05',
        position: 'DevOps Engineer',
        department: 'Engineering',
        salary: 90000.00,
        employmentType: 'Full-time',
        status: 'Active',
        skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD']
      }
    ];

    for (const empData of testEmployees) {
      const employee = await Employee.create(empData);
      console.log(`Employee created: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`);
    }

    // Create sample departments
    const departments = [
      {
        name: 'Engineering',
        code: 'ENG',
        description: 'Software development and technical operations',
        location: 'San Francisco, CA',
        budget: 2000000.00
      },
      {
        name: 'Sales',
        code: 'SALES',
        description: 'Sales and business development',
        location: 'New York, NY',
        budget: 1500000.00
      },
      {
        name: 'Finance',
        code: 'FIN',
        description: 'Financial planning and accounting',
        location: 'Chicago, IL',
        budget: 800000.00
      },
      {
        name: 'Human Resources',
        code: 'HR',
        description: 'HR operations and employee management',
        location: 'Austin, TX',
        budget: 600000.00
      },
      {
        name: 'Marketing',
        code: 'MKT',
        description: 'Marketing and brand management',
        location: 'Los Angeles, CA',
        budget: 1200000.00
      }
    ];

    for (const deptData of departments) {
      const department = await Department.create(deptData);
      console.log(`Department created: ${department.name} (${department.code})`);
    }

    // Create sample jobs
    const jobs = [
      {
        title: 'Senior Software Engineer',
        code: 'SWE-SEN',
        departmentId: (await Department.findOne({ where: { code: 'ENG' } })).id,
        description: 'Lead software development projects',
        requirements: ['5+ years experience', 'JavaScript', 'React', 'Node.js'],
        responsibilities: ['Code review', 'Mentoring', 'Architecture design'],
        minSalary: 120000.00,
        maxSalary: 160000.00,
        employmentType: 'Full-time',
        location: 'San Francisco, CA',
        remoteWork: true
      },
      {
        title: 'Sales Manager',
        code: 'SALES-MGR',
        departmentId: (await Department.findOne({ where: { code: 'SALES' } })).id,
        description: 'Manage sales team and drive revenue',
        requirements: ['3+ years sales experience', 'Leadership skills'],
        responsibilities: ['Team management', 'Revenue targets', 'Client relationships'],
        minSalary: 80000.00,
        maxSalary: 120000.00,
        employmentType: 'Full-time',
        location: 'New York, NY'
      }
    ];

    for (const jobData of jobs) {
      const job = await Job.create(jobData);
      console.log(`Job created: ${job.title} (${job.code})`);
    }

    // Create sample benefits
    const benefits = [
      {
        name: 'Health Insurance',
        type: 'Health',
        description: 'Comprehensive health coverage',
        provider: 'Blue Cross Blue Shield',
        cost: 500.00,
        employeeContribution: 100.00,
        employerContribution: 400.00,
        frequency: 'Monthly'
      },
      {
        name: 'Dental Insurance',
        type: 'Dental',
        description: 'Dental coverage for employees and families',
        provider: 'Delta Dental',
        cost: 50.00,
        employeeContribution: 10.00,
        employerContribution: 40.00,
        frequency: 'Monthly'
      },
      {
        name: '401(k) Retirement Plan',
        type: 'Retirement',
        description: 'Retirement savings with company match',
        provider: 'Fidelity',
        cost: 0.00,
        employeeContribution: 0.00,
        employerContribution: 0.00,
        frequency: 'Monthly'
      }
    ];

    for (const benefitData of benefits) {
      const benefit = await Benefit.create(benefitData);
      console.log(`Benefit created: ${benefit.name} (${benefit.type})`);
    }

    // Create sample training programs
    const trainings = [
      {
        title: 'Leadership Development Program',
        type: 'Workshop',
        category: 'Leadership',
        description: 'Develop leadership skills for managers',
        duration: 480, // 8 hours
        cost: 2000.00,
        location: 'Corporate Office',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-01'),
        maxParticipants: 20
      },
      {
        title: 'Advanced JavaScript Course',
        type: 'Online Course',
        category: 'Technical',
        description: 'Advanced JavaScript concepts and best practices',
        duration: 1200, // 20 hours
        cost: 500.00,
        provider: 'Udemy',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-03-15'),
        maxParticipants: 50
      }
    ];

    for (const trainingData of trainings) {
      const training = await Training.create(trainingData);
      console.log(`Training created: ${training.title} (${training.type})`);
    }

    // Create organization chart data - get actual employee and department IDs
    const allEmployees = await Employee.findAll();
    const allDepartments = await Department.findAll();
    
    // Find specific employees by employeeId
    const johnDoe = allEmployees.find(emp => emp.employeeId === 'EMP001');
    const janeSmith = allEmployees.find(emp => emp.employeeId === 'EMP002');
    const mikeJohnson = allEmployees.find(emp => emp.employeeId === 'EMP003');
    const sarahWilson = allEmployees.find(emp => emp.employeeId === 'EMP004');
    
    // Find specific departments by code
    const engineeringDept = allDepartments.find(dept => dept.code === 'ENG');
    const hrDept = allDepartments.find(dept => dept.code === 'HR');
    
    const orgChartData = [
      {
        employeeId: johnDoe.id,
        managerId: null,
        departmentId: engineeringDept.id,
        position: 'CTO',
        level: 1,
        effectiveDate: new Date('2023-01-01')
      },
      {
        employeeId: janeSmith.id,
        managerId: johnDoe.id,
        departmentId: engineeringDept.id,
        position: 'Senior Developer',
        level: 2,
        effectiveDate: new Date('2023-01-01')
      },
      {
        employeeId: mikeJohnson.id,
        managerId: null,
        departmentId: hrDept.id,
        position: 'HR Director',
        level: 1,
        effectiveDate: new Date('2023-01-01')
      },
      {
        employeeId: sarahWilson.id,
        managerId: mikeJohnson.id,
        departmentId: hrDept.id,
        position: 'HR Specialist',
        level: 2,
        effectiveDate: new Date('2023-01-01')
      }
    ];

    for (const orgData of orgChartData) {
      const org = await OrganizationChart.create(orgData);
      console.log(`Organization chart entry created for Employee ${org.employeeId}`);
    }

    // Create custom fields
    const customFields = [
      {
        entityType: 'EMPLOYEE',
        fieldName: 'emergency_contact_relationship',
        fieldLabel: 'Emergency Contact Relationship',
        fieldType: 'SELECT',
        fieldOptions: JSON.stringify(['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other']),
        isRequired: true,
        complianceType: 'CUSTOM',
        accessLevel: 'HR'
      },
      {
        entityType: 'EMPLOYEE',
        fieldName: 'security_clearance_level',
        fieldLabel: 'Security Clearance Level',
        fieldType: 'SELECT',
        fieldOptions: JSON.stringify(['None', 'Confidential', 'Secret', 'Top Secret']),
        isRequired: false,
        complianceType: 'CUSTOM',
        accessLevel: 'ADMIN'
      },
      {
        entityType: 'PERFORMANCE',
        fieldName: 'goal_completion_rate',
        fieldLabel: 'Goal Completion Rate (%)',
        fieldType: 'NUMBER',
        isRequired: true,
        validationRules: JSON.stringify({ min: 0, max: 100 }),
        accessLevel: 'MANAGER'
      }
    ];

    for (const fieldData of customFields) {
      const field = await CustomField.create(fieldData);
      console.log(`Custom field created: ${field.fieldLabel}`);
    }

    // Create sample workflows
    const workflows = [
      {
        name: 'Employee Onboarding',
        type: 'ONBOARDING',
        description: 'Standard onboarding process for new employees',
        triggerConditions: JSON.stringify({ event: 'employee_created', status: 'hired' }),
        steps: JSON.stringify([
          { step: 1, name: 'Send Welcome Email', assignee: 'HR', duration: 1 },
          { step: 2, name: 'Prepare Workspace', assignee: 'IT', duration: 2 },
          { step: 3, name: 'Schedule Orientation', assignee: 'HR', duration: 1 },
          { step: 4, name: 'Complete Documentation', assignee: 'Employee', duration: 3 }
        ]),
        createdBy: hrManager.id,
        timeoutDays: 7,
        escalationRules: JSON.stringify({ escalate_after: 5, escalate_to: 'manager' })
      },
      {
        name: 'Leave Request Approval',
        type: 'LEAVE_APPROVAL',
        description: 'Process for approving employee leave requests',
        triggerConditions: JSON.stringify({ event: 'leave_request_submitted' }),
        steps: JSON.stringify([
          { step: 1, name: 'Manager Review', assignee: 'Manager', duration: 2 },
          { step: 2, name: 'HR Verification', assignee: 'HR', duration: 1 },
          { step: 3, name: 'Final Approval', assignee: 'Manager', duration: 1 }
        ]),
        createdBy: hrManager.id,
        timeoutDays: 5,
        autoAssign: true
      }
    ];

    for (const workflowData of workflows) {
      const workflow = await Workflow.create(workflowData);
      console.log(`Workflow created: ${workflow.name}`);
    }

    // Create sample analytics reports
    const reports = [
      {
        name: 'Monthly Headcount Report',
        type: 'HEADCOUNT',
        description: 'Monthly report showing headcount by department and status',
        query: JSON.stringify({
          type: 'headcount',
          groupBy: ['department', 'status'],
          dateRange: 'month'
        }),
        schedule: 'MONTHLY',
        createdBy: adminUser.id,
        format: 'PDF',
        accessLevel: 'HR'
      },
      {
        name: 'Diversity Analytics',
        type: 'DIVERSITY',
        description: 'Workforce diversity statistics and trends',
        query: JSON.stringify({
          type: 'diversity',
          metrics: ['gender_distribution', 'age_groups', 'nationality'],
          compliance: true
        }),
        schedule: 'QUARTERLY',
        createdBy: adminUser.id,
        format: 'EXCEL',
        accessLevel: 'ADMIN',
        isConfidential: true
      },
      {
        name: 'Turnover Analysis',
        type: 'TURNOVER',
        description: 'Employee turnover analysis with predictive insights',
        query: JSON.stringify({
          type: 'turnover',
          metrics: ['turnover_rate', 'retention_rate', 'exit_reasons'],
          prediction: true
        }),
        schedule: 'MONTHLY',
        createdBy: hrManager.id,
        format: 'PDF',
        accessLevel: 'HR'
      }
    ];

    for (const reportData of reports) {
      const report = await AnalyticsReport.create(reportData);
      console.log(`Analytics report created: ${report.name}`);
    }

    console.log('Analytics reports seeded successfully');

    // Create workforce planning data
    const workforcePlanData = [
      {
        name: 'Q4 2025 Headcount Forecast',
        type: 'HEADCOUNT_FORECAST',
        departmentId: engineeringDept.id,
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-12-31'),
        currentHeadcount: 25,
        targetHeadcount: 30,
        forecastedHeadcount: 28,
        skillsGapAnalysis: {
          'Software Development': { current: 15, needed: 20, gap: 5 },
          'Data Science': { current: 5, needed: 8, gap: 3 },
          'DevOps': { current: 5, needed: 7, gap: 2 }
        },
        diversityMetrics: {
          gender: { male: 60, female: 40 },
          ethnicity: { asian: 30, caucasian: 50, hispanic: 10, african_american: 10 }
        },
        status: 'APPROVED',
        createdBy: adminUser.id
      },
      {
        name: 'Skills Gap Analysis - Engineering',
        type: 'SKILLS_GAP',
        departmentId: engineeringDept.id,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        currentHeadcount: 25,
        targetHeadcount: 25,
        forecastedHeadcount: 25,
        skillsGapAnalysis: {
          'React': { current: 8, needed: 12, gap: 4 },
          'Python': { current: 10, needed: 15, gap: 5 },
          'AWS': { current: 5, needed: 8, gap: 3 }
        },
        status: 'IN_REVIEW',
        createdBy: hrManager.id
      }
    ];

    for (const planData of workforcePlanData) {
      const plan = await WorkforcePlan.create(planData);
      console.log(`Workforce plan created: ${plan.name}`);
    }

    // Create employee experience data
    const experienceData = [
      {
        employeeId: johnDoe.id,
        recognitionType: 'Peer_Bonus',
        recognitionTitle: 'Outstanding Team Player',
        recognitionDescription: 'For exceptional collaboration on the new product launch',
        recognitionAmount: 500.00,
        recognizedBy: janeSmith.id,
        surveyType: 'Pulse',
        surveyScore: 4.5,
        overallSatisfaction: 4.2,
        recommendationScore: 9
      },
      {
        employeeId: janeSmith.id,
        recognitionType: 'Badge',
        recognitionTitle: 'Innovation Champion',
        recognitionDescription: 'For developing the new AI-powered feature',
        recognitionAmount: 0.00,
        recognizedBy: johnDoe.id,
        surveyType: 'Annual',
        surveyScore: 4.8,
        overallSatisfaction: 4.6,
        recommendationScore: 10
      }
    ];

    for (const expData of experienceData) {
      const exp = await EmployeeExperience.create(expData);
      console.log(`Employee experience record created for ${exp.recognitionTitle}`);
    }

    // Create compliance cases
    const complianceData = [
      {
        caseNumber: 'CASE-2025-001',
        type: 'Policy_Violation',
        category: 'Labor_Law',
        title: 'Overtime Policy Violation',
        description: 'Employee reported working overtime without proper approval',
        priority: 'Medium',
        status: 'Under_Investigation',
        assignedTo: hrManager.id,
        complianceStatus: 'Under_Review',
        riskLevel: 'Medium',
        createdBy: adminUser.id
      },
      {
        caseNumber: 'CASE-2025-002',
        type: 'Whistleblower',
        category: 'Financial',
        title: 'Expense Report Irregularities',
        description: 'Anonymous report of suspicious expense submissions',
        priority: 'High',
        status: 'Open',
        assignedTo: adminUser.id,
        complianceStatus: 'Under_Review',
        riskLevel: 'High',
        createdBy: hrManager.id
      }
    ];

    for (const caseData of complianceData) {
      const caseRecord = await ComplianceCase.create(caseData);
      console.log(`Compliance case created: ${caseRecord.caseNumber}`);
    }

    // Create mobile app data
    const mobileData = [
      {
        employeeId: johnDoe.id,
        deviceType: 'iOS',
        appVersion: '2.1.0',
        lastLogin: new Date(),
        approvalType: 'Leave',
        approvalStatus: 'Approved',
        notificationType: 'Approval_Request',
        notificationTitle: 'Leave Request Approved',
        notificationBody: 'Your leave request for Aug 15-20 has been approved',
        notificationSent: true,
        notificationRead: true,
        biometricEnabled: true,
        biometricType: 'Face_ID',
        isActive: true
      },
      {
        employeeId: janeSmith.id,
        deviceType: 'Android',
        appVersion: '2.1.0',
        lastLogin: new Date(),
        documentType: 'Payslip',
        documentUrl: '/documents/payslip-jane-smith-aug-2025.pdf',
        documentDownloaded: true,
        locationEnabled: true,
        currentLocation: { lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' },
        isActive: true
      }
    ];

    for (const mobileDataItem of mobileData) {
      const mobile = await MobileApp.create(mobileDataItem);
      console.log(`Mobile app record created for employee ${mobile.employeeId}`);
    }

    // Create integration hub data
    const integrationData = [
      {
        name: 'SAP ERP Integration',
        type: 'ERP',
        category: 'SAP',
        apiEndpoint: 'https://api.sap.com/hrms',
        authType: 'OAuth2',
        syncDirection: 'Bidirectional',
        syncFrequency: 'Daily',
        status: 'Active',
        healthStatus: 'Healthy',
        dataEncryption: true,
        complianceStandards: ['SOX', 'GDPR'],
        description: 'Integration with SAP ERP for employee data synchronization',
        createdBy: adminUser.id
      },
      {
        name: 'Salesforce CRM Sync',
        type: 'CRM',
        category: 'Salesforce',
        apiEndpoint: 'https://api.salesforce.com/services/data/v52.0',
        authType: 'API_Key',
        syncDirection: 'HRMS_to_External',
        syncFrequency: 'Real_Time',
        status: 'Active',
        healthStatus: 'Healthy',
        dataEncryption: true,
        complianceStandards: ['GDPR'],
        description: 'Real-time sync of employee data to Salesforce CRM',
        createdBy: adminUser.id
      }
    ];

    for (const intData of integrationData) {
      const integration = await IntegrationHub.create(intData);
      console.log(`Integration created: ${integration.name}`);
    }

    console.log('All advanced modules seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
