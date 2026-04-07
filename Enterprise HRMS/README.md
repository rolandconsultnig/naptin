# Enterprise HRMS (Human Resources Management System)

A comprehensive, modern Human Resources Management System built with React, Node.js, and PostgreSQL. This application provides a complete solution for managing all aspects of human resources in an enterprise environment.

## 🚀 Features

### Core HR & Employee Data Management
- Employee records with demographics and gender configuration
- Organizational charts and reporting structures
- Document management for contracts and certifications
- Custom fields for compliance requirements

### Recruitment & Applicant Tracking (ATS)
- Job posting and career portal management
- Resume parsing and AI-based candidate matching
- Interview scheduling and feedback tracking
- Onboarding workflow automation

### Time & Attendance
- Clock-in/out functionality (biometric, mobile, web)
- Shift scheduling and management
- Overtime and leave tracking
- Geolocation tracking for remote/field workers

### Leave & Absence Management
- Policy configuration (gender-neutral or binary)
- Leave requests and approval workflows
- Sick leave, vacation, maternity/paternity leave
- Compliance with local labor laws

### Payroll & Compensation
- Automated payroll processing
- Tax compliance (local & international)
- Bonuses, incentives, and deductions
- Gender-based reporting (if legally required)

### Performance Management
- Goal setting (OKRs/KPIs)
- 360-degree feedback
- Performance reviews and calibration
- Succession planning

### Learning & Development (LMS)
- Course management and certifications
- AI-driven skill recommendations
- Compliance training tracking
- Integration with LinkedIn Learning, Coursera, etc.

### Employee Self-Service (ESS) & Portals
- Personal data updates (within legal gender constraints)
- Pay slips and tax documents
- Benefits enrollment

### Benefits Administration
- Health insurance and retirement plans
- Flexible benefits (gender-based if applicable)
- COBRA and compliance reporting

### Workforce Analytics & Reporting
- Custom dashboards
- Headcount, turnover, diversity metrics
- Predictive analytics for attrition

### Compliance & Security
- GDPR/local data privacy compliance
- Audit trails and role-based access
- Electronic signatures

### Mobile HR & AI Assistants
- Chatbots for HR queries
- Mobile app for managers & employees

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database with Sequelize ORM
- **JWT** authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **multer** for file uploads
- **nodemailer** for email notifications

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **React Query** for data fetching
- **React Hook Form** for form management
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Concurrently** for running multiple processes

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your-secret-key-here
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=enterprise_hrms
   DB_USER=postgres
   DB_PASSWORD=your-password
   CLIENT_URL=http://localhost:3000
   ```

3. **Set up the database:**
   ```bash
   # Create PostgreSQL database
   createdb enterprise_hrms
   
   # Run database migrations (if using Sequelize migrations)
   npx sequelize-cli db:migrate
   ```

4. **Start the backend server:**
   ```bash
   npm run server
   ```

### Frontend Setup

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

### Running Both Servers

From the root directory, you can run both servers simultaneously:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

## 🏗️ Project Structure

```
enterprise-hrms/
├── server/                 # Backend application
│   ├── config/            # Database and app configuration
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js          # Server entry point
├── client/                # Frontend application
│   ├── public/           # Static files
│   ├── src/              # Source code
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   └── index.tsx     # App entry point
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## 🔐 Authentication & Authorization

The application uses JWT-based authentication with role-based access control:

- **Admin**: Full access to all features
- **HR Manager**: Access to HR-specific features
- **Manager**: Access to team management features
- **Employee**: Limited access to personal data and self-service features

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Employees
- `GET /api/employees` - Get all employees (with pagination and filters)
- `POST /api/employees` - Create new employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee (soft delete)
- `GET /api/employees/departments` - Get all departments
- `GET /api/employees/org-chart` - Get organizational chart
- `GET /api/employees/analytics/gender-distribution` - Gender analytics

### Additional Modules
- Recruitment management
- Attendance tracking
- Leave management
- Payroll processing
- Performance management
- Learning management
- Benefits administration
- Analytics and reporting

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional design with Tailwind CSS
- **Dark/Light Mode**: Built-in theme support
- **Accessibility**: WCAG compliant components
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Secure cross-origin requests
- **Helmet**: Security headers
- **Role-based Access Control**: Granular permissions

## 📈 Performance Features

- **React Query**: Efficient data fetching and caching
- **Code Splitting**: Lazy loading for better performance
- **Optimized Images**: WebP format support
- **Database Indexing**: Optimized database queries
- **Caching**: Redis support for session management

## 🚀 Deployment

### Production Build

1. **Build the frontend:**
   ```bash
   cd client
   npm run build
   ```

2. **Set production environment variables:**
   ```env
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-production-secret
   DB_HOST=your-db-host
   DB_PORT=5432
   DB_NAME=enterprise_hrms
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   CLIENT_URL=https://your-domain.com
   ```

3. **Start the production server:**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@enterprise-hrms.com or create an issue in the repository.

## 🔄 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] AI-powered recruitment
- [ ] Integration with third-party HR tools
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Employee self-service portal
- [ ] Mobile time tracking
- [ ] Advanced leave management
- [ ] Performance analytics

## 📊 System Requirements

- **Node.js**: 16.x or higher
- **PostgreSQL**: 12.x or higher
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 10GB minimum
- **Browser**: Chrome, Firefox, Safari, Edge (latest versions)

---

**Enterprise HRMS** - Empowering modern HR management with cutting-edge technology.
