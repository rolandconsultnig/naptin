// Enterprise HRMS Application JavaScript

class HRMSApp {
    constructor() {
        this.apiBase = 'http://localhost:5050/api';
        this.currentUser = null;
        this.token = localStorage.getItem('token');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
        this.loadDashboardData();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // Navigation
        document.getElementById('showRegister').addEventListener('click', () => {
            this.showScreen('registerScreen');
        });

        document.getElementById('showLogin').addEventListener('click', () => {
            this.showScreen('loginScreen');
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.navigateToSection(e.target.dataset.section);
            });
        });

        // Employee search and filters
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.performAdvancedSearch();
        });

        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            this.clearFilters();
        });

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => {
            this.changePage(-1);
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            this.changePage(1);
        });

        // Add employee button
        document.getElementById('addEmployeeBtn').addEventListener('click', () => {
            this.showAddEmployeeModal();
        });

        // Department management
        document.getElementById('addDepartmentBtn')?.addEventListener('click', () => {
            this.showAddDepartmentModal();
        });

        // Recruitment
        document.getElementById('addJobBtn')?.addEventListener('click', () => {
            this.showAddJobModal();
        });

        document.getElementById('addCandidateBtn')?.addEventListener('click', () => {
            this.showAddCandidateModal();
        });

        // Attendance
        document.getElementById('clockInBtn')?.addEventListener('click', () => {
            this.clockIn();
        });

        document.getElementById('clockOutBtn')?.addEventListener('click', () => {
            this.clockOut();
        });

        document.getElementById('viewAttendanceBtn')?.addEventListener('click', () => {
            this.loadAttendanceRecords();
        });

        // Leave management
        document.getElementById('requestLeaveBtn')?.addEventListener('click', () => {
            this.showRequestLeaveModal();
        });

        // Payroll
        document.getElementById('generatePayrollBtn')?.addEventListener('click', () => {
            this.generatePayroll();
        });

        // Performance
        document.getElementById('createReviewBtn')?.addEventListener('click', () => {
            this.showCreateReviewModal();
        });

        // Learning
        document.getElementById('addTrainingBtn')?.addEventListener('click', () => {
            this.showAddTrainingModal();
        });

        // Benefits
        document.getElementById('addBenefitBtn')?.addEventListener('click', () => {
            this.showAddBenefitModal();
        });

        // Analytics
        document.getElementById('generateReportBtn')?.addEventListener('click', () => {
            this.generateReport();
        });

        // Employee Experience
        document.getElementById('giveRecognitionBtn')?.addEventListener('click', () => {
            this.showToast('Recognition feature coming soon', 'info');
        });

        document.getElementById('createSurveyBtn')?.addEventListener('click', () => {
            this.showToast('Survey creation feature coming soon', 'info');
        });

        document.getElementById('sendMessageBtn')?.addEventListener('click', () => {
            this.handleChatbotMessage();
        });

        // Compliance & Risk Management
        document.getElementById('createCaseBtn')?.addEventListener('click', () => {
            this.showToast('Case creation feature coming soon', 'info');
        });

        // Mobile & Self-Service
        document.getElementById('updateAppBtn')?.addEventListener('click', () => {
            this.showToast('App update feature coming soon', 'info');
        });

        document.getElementById('startVoiceBtn')?.addEventListener('click', () => {
            this.showToast('Voice assistant feature coming soon', 'info');
        });

        document.getElementById('voiceSettingsBtn')?.addEventListener('click', () => {
            this.showToast('Voice settings feature coming soon', 'info');
        });

        // Integration Hub
        document.getElementById('addIntegrationBtn')?.addEventListener('click', () => {
            this.showToast('Integration setup feature coming soon', 'info');
        });

        // Update current time
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 1000);
    }

    checkAuth() {
        if (this.token) {
            this.showScreen('dashboard');
            this.loadUserInfo();
        } else {
            this.showScreen('loginScreen');
        }
    }

    showScreen(screenId) {
        // Hide all screens
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('registerScreen').classList.add('hidden');
        document.getElementById('dashboard').classList.add('hidden');

        // Show target screen
        document.getElementById(screenId).classList.remove('hidden');
    }

    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Determine if input is email or username
        const isEmail = email.includes('@');
        const loginData = isEmail ? { email, password } : { username: email, password };

        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', this.token);
                this.showToast('Login successful!', 'success');
                this.showScreen('dashboard');
                this.loadUserInfo();
                this.loadDashboardData();
            } else {
                this.showToast(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            this.showToast('Network error. Please try again.', 'error');
        }
    }

    async register() {
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const role = document.getElementById('regRole').value;

        try {
            const response = await fetch(`${this.apiBase}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password, role })
            });

            const data = await response.json();

            if (response.ok) {
                this.showToast('Registration successful! Please login.', 'success');
                this.showScreen('loginScreen');
                document.getElementById('loginForm').reset();
            } else {
                this.showToast(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            this.showToast('Network error. Please try again.', 'error');
        }
    }

    async loadUserInfo() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                document.getElementById('userInfo').textContent = `Welcome, ${data.user.username}`;
            }
        } catch (error) {
            console.error('Error loading user info:', error);
        }
    }

    async loadDashboardData() {
        if (!this.token) return;

        try {
            // Load employee statistics
            const response = await fetch(`${this.apiBase}/employees`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateDashboardStats(data);
                this.loadEmployees();
                this.loadDepartments();
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateDashboardStats(data) {
        const employees = data.employees || [];
        const total = employees.length;
        const active = employees.filter(emp => emp.status === 'Active').length;
        const onLeave = employees.filter(emp => emp.status === 'On Leave').length;
        const newHires = employees.filter(emp => {
            const hireDate = new Date(emp.hireDate);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return hireDate > thirtyDaysAgo;
        }).length;

        document.getElementById('totalEmployees').textContent = total;
        document.getElementById('activeEmployees').textContent = active;
        document.getElementById('onLeave').textContent = onLeave;
        document.getElementById('newHires').textContent = newHires;
    }

    async loadEmployees() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/employees?page=${this.currentPage}&limit=${this.itemsPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderEmployeesTable(data.employees || []);
                this.updatePagination(data.pagination);
                this.updateEmployeeStats(data.employees || []);
            }
        } catch (error) {
            console.error('Error loading employees:', error);
        }
    }

    renderEmployeesTable(employees) {
        const tbody = document.getElementById('employeesTable');
        tbody.innerHTML = '';

        employees.forEach(employee => {
            const row = document.createElement('tr');
            row.className = 'table-row';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${employee.employeeId}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${employee.firstName} ${employee.lastName}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${employee.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${employee.position}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${employee.department}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge status-${employee.employmentType?.toLowerCase().replace(' ', '-') || 'full-time'}">${employee.employmentType || 'Full-time'}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge status-${employee.status.toLowerCase().replace(' ', '-')}">${employee.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-2" onclick="app.viewEmployee('${employee.id}')">View</button>
                    <button class="text-green-600 hover:text-green-900 mr-2" onclick="app.editEmployee('${employee.id}')">Edit</button>
                    <button class="text-red-600 hover:text-red-900" onclick="app.deleteEmployee('${employee.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Enhanced employee management methods
    currentPage = 1;
    itemsPerPage = 10;

    performAdvancedSearch() {
        const keyword = document.getElementById('advancedSearch').value;
        const department = document.getElementById('departmentFilter').value;
        const status = document.getElementById('statusFilter').value;
        const employmentType = document.getElementById('employmentTypeFilter').value;

        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (department) params.append('department', department);
        if (status) params.append('status', status);
        if (employmentType) params.append('employmentType', employmentType);

        this.loadEmployeesWithFilters(params.toString());
    }

    clearFilters() {
        document.getElementById('advancedSearch').value = '';
        document.getElementById('departmentFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('employmentTypeFilter').value = '';
        this.currentPage = 1;
        this.loadEmployees();
    }

    changePage(direction) {
        this.currentPage += direction;
        if (this.currentPage < 1) this.currentPage = 1;
        this.loadEmployees();
    }

    async loadEmployeesWithFilters(filters = '') {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/employees?page=${this.currentPage}&limit=${this.itemsPerPage}&${filters}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderEmployeesTable(data.employees || []);
                this.updatePagination(data.pagination);
                this.updateEmployeeStats(data.employees || []);
            }
        } catch (error) {
            console.error('Error loading employees:', error);
        }
    }

    updatePagination(pagination) {
        document.getElementById('currentPage').textContent = pagination.currentPage;
        document.getElementById('showingStart').textContent = ((pagination.currentPage - 1) * pagination.itemsPerPage) + 1;
        document.getElementById('showingEnd').textContent = Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems);
        document.getElementById('totalItems').textContent = pagination.totalItems;
        
        document.getElementById('prevPage').disabled = pagination.currentPage <= 1;
        document.getElementById('nextPage').disabled = pagination.currentPage >= pagination.totalPages;
    }

    updateEmployeeStats(employees) {
        const total = employees.length;
        const active = employees.filter(emp => emp.status === 'Active').length;
        const onLeave = employees.filter(emp => emp.status === 'On Leave').length;
        const newThisMonth = employees.filter(emp => {
            const hireDate = new Date(emp.hireDate);
            const thisMonth = new Date();
            return hireDate.getMonth() === thisMonth.getMonth() && hireDate.getFullYear() === thisMonth.getFullYear();
        }).length;

        document.getElementById('totalEmpCount').textContent = total;
        document.getElementById('activeEmpCount').textContent = active;
        document.getElementById('leaveEmpCount').textContent = onLeave;
        document.getElementById('newEmpCount').textContent = newThisMonth;
    }

    async loadDepartments() {
        try {
            const response = await fetch(`${this.apiBase}/employees/departments`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const select = document.getElementById('departmentFilter');
                data.departments.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept;
                    option.textContent = dept;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }

    async viewEmployee(employeeId) {
        try {
            const response = await fetch(`${this.apiBase}/employees/${employeeId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.showEmployeeDetailsModal(data.employee);
            }
        } catch (error) {
            console.error('Error loading employee details:', error);
        }
    }

    showEmployeeDetailsModal(employee) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content max-w-4xl">
                <div class="modal-header">
                    <h3 class="modal-title">Employee Details - ${employee.firstName} ${employee.lastName}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Basic Information -->
                    <div>
                        <h4 class="font-semibold mb-3">Basic Information</h4>
                        <div class="space-y-2">
                            <p><strong>Employee ID:</strong> ${employee.employeeId}</p>
                            <p><strong>Name:</strong> ${employee.firstName} ${employee.lastName}</p>
                            <p><strong>Email:</strong> ${employee.email}</p>
                            <p><strong>Phone:</strong> ${employee.phone || 'N/A'}</p>
                            <p><strong>Gender:</strong> ${employee.gender}</p>
                            <p><strong>Date of Birth:</strong> ${employee.dateOfBirth || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <!-- Employment Information -->
                    <div>
                        <h4 class="font-semibold mb-3">Employment Information</h4>
                        <div class="space-y-2">
                            <p><strong>Position:</strong> ${employee.position}</p>
                            <p><strong>Department:</strong> ${employee.department}</p>
                            <p><strong>Employment Type:</strong> ${employee.employmentType}</p>
                            <p><strong>Status:</strong> ${employee.status}</p>
                            <p><strong>Hire Date:</strong> ${employee.hireDate}</p>
                            <p><strong>Salary:</strong> $${employee.salary || 'N/A'}</p>
                        </div>
                    </div>

                    <!-- Address Information -->
                    <div>
                        <h4 class="font-semibold mb-3">Address</h4>
                        <div class="space-y-2">
                            <p><strong>Address:</strong> ${employee.address || 'N/A'}</p>
                            <p><strong>City:</strong> ${employee.city || 'N/A'}</p>
                            <p><strong>State:</strong> ${employee.state || 'N/A'}</p>
                            <p><strong>Zip Code:</strong> ${employee.zipCode || 'N/A'}</p>
                            <p><strong>Country:</strong> ${employee.country || 'N/A'}</p>
                        </div>
                    </div>

                    <!-- Skills & Certifications -->
                    <div>
                        <h4 class="font-semibold mb-3">Skills & Certifications</h4>
                        <div class="space-y-2">
                            <p><strong>Skills:</strong> ${(employee.skills || []).join(', ') || 'None'}</p>
                            <p><strong>Certifications:</strong> ${(employee.certifications || []).length} certifications</p>
                            <p><strong>Education:</strong> ${(employee.education || []).length} education records</p>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6 flex justify-end space-x-2">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    <button class="btn btn-primary" onclick="app.editEmployee('${employee.id}')">Edit Employee</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    navigateToSection(section) {
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Hide all content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show target section
        document.getElementById(`${section}Section`).classList.remove('hidden');

        // Load data for the selected section
        switch(section) {
            case 'employees':
                this.loadEmployees();
                break;
            case 'departments':
                this.loadDepartments();
                break;
            case 'recruitment':
                this.loadJobs();
                this.loadCandidates();
                break;
            case 'attendance':
                this.loadAttendanceRecords();
                break;
            case 'leave':
                this.loadLeaveRequests();
                break;
            case 'payroll':
                this.loadPayrollRecords();
                break;
            case 'performance':
                this.loadPerformanceReviews();
                break;
            case 'learning':
                this.loadTrainingPrograms();
                break;
            case 'benefits':
                this.loadBenefits();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'experience':
                this.loadEmployeeExperience();
                break;
            case 'compliance':
                this.loadComplianceData();
                break;
            case 'mobile':
                this.loadMobileData();
                break;
            case 'integration':
                this.loadIntegrationData();
                break;
        }
    }

    showAddEmployeeModal() {
        // Create modal HTML
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content max-w-4xl">
                <div class="modal-header">
                    <h3 class="modal-title">Add New Employee</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <form id="addEmployeeForm" class="space-y-6">
                    <!-- Basic Information -->
                    <div>
                        <h4 class="font-semibold mb-3">Basic Information</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="form-group">
                                <label class="form-label">Employee ID *</label>
                                <input type="text" id="empId" required class="form-input">
                            </div>
                            <div class="form-group">
                                <label class="form-label">First Name *</label>
                                <input type="text" id="firstName" required class="form-input">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Last Name *</label>
                                <input type="text" id="lastName" required class="form-input">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email *</label>
                                <input type="email" id="empEmail" required class="form-input">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Phone</label>
                                <input type="tel" id="phone" class="form-input">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Date of Birth</label>
                                <input type="date" id="dateOfBirth" class="form-input">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Gender *</label>
                                <select id="gender" required class="form-input">
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Employment Information -->
                    <div>
                        <h4 class="font-semibold mb-3">Employment Information</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="form-group">
                                <label class="form-label">Position *</label>
                                <input type="text" id="position" required class="form-input">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Department *</label>
                                <input type="text" id="department" required class="form-input">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Employment Type</label>
                                <select id="employmentType" class="form-input">
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Intern">Intern</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Hire Date *</label>
                                <input type="date" id="hireDate" required class="form-input">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Salary</label>
                                <input type="number" id="salary" step="0.01" class="form-input" placeholder="0.00">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Status</label>
                                <select id="status" class="form-input">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="On Leave">On Leave</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Address Information -->
                    <div>
                        <h4 class="font-semibold mb-3">Address Information</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="form-group md:col-span-2">
                                <label class="form-label">Address</label>
                                <textarea id="address" rows="2" class="form-input"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">City</label>
                                <input type="text" id="city" class="form-input">
                            </div>
                            <div class="form-group">
                                <label class="form-label">State/Province</label>
                                <input type="text" id="state" class="form-input">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Zip/Postal Code</label>
                                <input type="text" id="zipCode" class="form-input">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Country</label>
                                <input type="text" id="country" class="form-input">
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end space-x-2 mt-6">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Add Employee</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        document.getElementById('addEmployeeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addEmployee();
        });
    }

    async addEmployee() {
        const employeeData = {
            employeeId: document.getElementById('empId').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('empEmail').value,
            phone: document.getElementById('phone').value || null,
            dateOfBirth: document.getElementById('dateOfBirth').value || null,
            gender: document.getElementById('gender').value,
            position: document.getElementById('position').value,
            department: document.getElementById('department').value,
            employmentType: document.getElementById('employmentType').value,
            hireDate: document.getElementById('hireDate').value,
            salary: document.getElementById('salary').value ? parseFloat(document.getElementById('salary').value) : null,
            status: document.getElementById('status').value,
            address: document.getElementById('address').value || null,
            city: document.getElementById('city').value || null,
            state: document.getElementById('state').value || null,
            zipCode: document.getElementById('zipCode').value || null,
            country: document.getElementById('country').value || null
        };

        try {
            const response = await fetch(`${this.apiBase}/employees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(employeeData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showToast('Employee added successfully!', 'success');
                document.querySelector('.modal').remove();
                this.loadEmployees();
                this.loadDashboardData();
            } else {
                this.showToast(data.error || 'Failed to add employee', 'error');
            }
        } catch (error) {
            this.showToast('Network error. Please try again.', 'error');
        }
    }

    async deleteEmployee(employeeId) {
        if (!confirm('Are you sure you want to delete this employee?')) return;

        try {
            const response = await fetch(`${this.apiBase}/employees/${employeeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.showToast('Employee deleted successfully!', 'success');
                this.loadEmployees();
                this.loadDashboardData();
            } else {
                this.showToast('Failed to delete employee', 'error');
            }
        } catch (error) {
            this.showToast('Network error. Please try again.', 'error');
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('token');
        this.showScreen('loginScreen');
        this.showToast('Logged out successfully', 'info');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // ===== DEPARTMENT MANAGEMENT =====
    async loadDepartments() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/departments`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const departments = await response.json();
                this.renderDepartmentsTable(departments);
                this.updateDepartmentStats(departments);
            }
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }

    renderDepartmentsTable(departments) {
        const tbody = document.getElementById('departmentsTable');
        if (!tbody) return;

        tbody.innerHTML = '';
        departments.forEach(dept => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${dept.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${dept.code}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${dept.manager?.firstName || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${dept.location || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">$${dept.budget || '0'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge status-${dept.status.toLowerCase()}">${dept.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-2" onclick="app.viewDepartment('${dept.id}')">View</button>
                    <button class="text-green-600 hover:text-green-900 mr-2" onclick="app.editDepartment('${dept.id}')">Edit</button>
                    <button class="text-red-600 hover:text-red-900" onclick="app.deleteDepartment('${dept.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateDepartmentStats(departments) {
        const total = departments.length;
        const active = departments.filter(dept => dept.status === 'Active').length;
        const totalBudget = departments.reduce((sum, dept) => sum + (parseFloat(dept.budget) || 0), 0);
        const avgEmployees = total > 0 ? Math.round(total / departments.length) : 0;

        document.getElementById('totalDepartments').textContent = total;
        document.getElementById('activeDepartments').textContent = active;
        document.getElementById('totalBudget').textContent = `$${totalBudget.toLocaleString()}`;
        document.getElementById('avgEmployeesPerDept').textContent = avgEmployees;
    }

    // ===== RECRUITMENT MANAGEMENT =====
    async loadJobs() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/jobs`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const jobs = await response.json();
                this.renderJobsTable(jobs);
                this.updateRecruitmentStats(jobs);
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
        }
    }

    async loadCandidates() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/candidates`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const candidates = await response.json();
                this.renderCandidatesTable(candidates);
            }
        } catch (error) {
            console.error('Error loading candidates:', error);
        }
    }

    renderJobsTable(jobs) {
        const tbody = document.getElementById('jobsTable');
        if (!tbody) return;

        tbody.innerHTML = '';
        jobs.forEach(job => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${job.title}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${job.department || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${job.location || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${job.employmentType || 'Full-time'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge status-${job.status.toLowerCase()}">${job.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-2" onclick="app.viewJob('${job.id}')">View</button>
                    <button class="text-green-600 hover:text-green-900 mr-2" onclick="app.editJob('${job.id}')">Edit</button>
                    <button class="text-red-600 hover:text-red-900" onclick="app.deleteJob('${job.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderCandidatesTable(candidates) {
        const tbody = document.getElementById('candidatesTable');
        if (!tbody) return;

        tbody.innerHTML = '';
        candidates.forEach(candidate => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${candidate.firstName} ${candidate.lastName}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${candidate.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${candidate.recruitment?.title || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge status-${candidate.status.toLowerCase()}">${candidate.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-2" onclick="app.viewCandidate('${candidate.id}')">View</button>
                    <button class="text-green-600 hover:text-green-900 mr-2" onclick="app.editCandidate('${candidate.id}')">Edit</button>
                    <button class="text-red-600 hover:text-red-900" onclick="app.deleteCandidate('${candidate.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateRecruitmentStats(jobs) {
        const activeJobs = jobs.filter(job => job.status === 'Active').length;
        document.getElementById('activeJobsCount').textContent = activeJobs;
    }

    // ===== ATTENDANCE MANAGEMENT =====
    async clockIn() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/attendance/clock-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    employeeId: this.currentUser.employeeId || this.currentUser.id
                })
            });

            if (response.ok) {
                this.showToast('Clock in successful!', 'success');
                this.loadAttendanceRecords();
            } else {
                this.showToast('Clock in failed', 'error');
            }
        } catch (error) {
            this.showToast('Network error', 'error');
        }
    }

    async clockOut() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/attendance/clock-out`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    employeeId: this.currentUser.employeeId || this.currentUser.id
                })
            });

            if (response.ok) {
                this.showToast('Clock out successful!', 'success');
                this.loadAttendanceRecords();
            } else {
                this.showToast('Clock out failed', 'error');
            }
        } catch (error) {
            this.showToast('Network error', 'error');
        }
    }

    async loadAttendanceRecords() {
        if (!this.token) return;

        const date = document.getElementById('attendanceDate')?.value || new Date().toISOString().split('T')[0];

        try {
            const response = await fetch(`${this.apiBase}/attendance?date=${date}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderAttendanceTable(data.records || []);
                this.updateAttendanceStats(data.records || []);
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
        }
    }

    renderAttendanceTable(records) {
        const tbody = document.getElementById('attendanceTable');
        if (!tbody) return;

        tbody.innerHTML = '';
        records.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${record.employee?.firstName} ${record.employee?.lastName}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${new Date(record.date).toLocaleDateString()}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${record.clockIn || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${record.clockOut || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${record.totalHours || '0'} hrs</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge status-${record.status.toLowerCase()}">${record.status}</span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateAttendanceStats(records) {
        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const late = records.filter(r => r.status === 'Late').length;
        const onLeave = records.filter(r => r.status === 'On Leave').length;

        document.getElementById('presentToday').textContent = present;
        document.getElementById('absentToday').textContent = absent;
        document.getElementById('lateToday').textContent = late;
        document.getElementById('onLeaveToday').textContent = onLeave;
    }

    updateCurrentTime() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = new Date().toLocaleTimeString();
        }
    }

    // ===== LEAVE MANAGEMENT =====
    async loadLeaveRequests() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/leave`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderLeaveRequestsTable(data.leaves || []);
                this.updateLeaveStats(data.leaves || []);
            }
        } catch (error) {
            console.error('Error loading leave requests:', error);
        }
    }

    renderLeaveRequestsTable(leaves) {
        const tbody = document.getElementById('leaveRequestsTable');
        if (!tbody) return;

        tbody.innerHTML = '';
        leaves.forEach(leave => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${leave.employee?.firstName} ${leave.employee?.lastName}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${leave.type}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${new Date(leave.startDate).toLocaleDateString()}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${new Date(leave.endDate).toLocaleDateString()}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${leave.totalDays}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge status-${leave.status.toLowerCase()}">${leave.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-green-600 hover:text-green-900 mr-2" onclick="app.approveLeave('${leave.id}')">Approve</button>
                    <button class="text-red-600 hover:text-red-900" onclick="app.rejectLeave('${leave.id}')">Reject</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateLeaveStats(leaves) {
        const pending = leaves.filter(l => l.status === 'Pending').length;
        const approved = leaves.filter(l => l.status === 'Approved').length;
        const onLeave = leaves.filter(l => l.status === 'Approved' && new Date(l.startDate) <= new Date() && new Date(l.endDate) >= new Date()).length;
        const totalDays = leaves.reduce((sum, l) => sum + (l.totalDays || 0), 0);

        document.getElementById('pendingLeaveRequests').textContent = pending;
        document.getElementById('approvedLeaveThisMonth').textContent = approved;
        document.getElementById('onLeaveTodayCount').textContent = onLeave;
        document.getElementById('totalLeaveDays').textContent = totalDays;
    }

    // ===== PAYROLL MANAGEMENT =====
    async loadPayrollRecords() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/payroll`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderPayrollTable(data.payrolls || []);
                this.updatePayrollStats(data.payrolls || []);
            }
        } catch (error) {
            console.error('Error loading payroll:', error);
        }
    }

    renderPayrollTable(payrolls) {
        const tbody = document.getElementById('payrollTable');
        if (!tbody) return;

        tbody.innerHTML = '';
        payrolls.forEach(payroll => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${payroll.employee?.firstName} ${payroll.employee?.lastName}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${payroll.payPeriod}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">$${payroll.basicSalary?.toLocaleString() || '0'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">$${payroll.allowances?.toLocaleString() || '0'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">$${payroll.deductions?.toLocaleString() || '0'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">$${payroll.netPay?.toLocaleString() || '0'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge status-${payroll.status.toLowerCase()}">${payroll.status}</span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updatePayrollStats(payrolls) {
        const total = payrolls.reduce((sum, p) => sum + (p.netPay || 0), 0);
        const average = payrolls.length > 0 ? total / payrolls.length : 0;
        const thisMonth = payrolls.filter(p => new Date(p.payDate).getMonth() === new Date().getMonth()).reduce((sum, p) => sum + (p.netPay || 0), 0);
        const processed = payrolls.filter(p => p.status === 'Processed').length;

        document.getElementById('totalPayroll').textContent = `$${total.toLocaleString()}`;
        document.getElementById('averageSalary').textContent = `$${average.toLocaleString()}`;
        document.getElementById('thisMonthPayroll').textContent = `$${thisMonth.toLocaleString()}`;
        document.getElementById('processedPayroll').textContent = processed;
    }

    // ===== PERFORMANCE MANAGEMENT =====
    async loadPerformanceReviews() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/performance`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderPerformanceTable(data.reviews || []);
                this.updatePerformanceStats(data.reviews || []);
            }
        } catch (error) {
            console.error('Error loading performance reviews:', error);
        }
    }

    renderPerformanceTable(reviews) {
        const tbody = document.getElementById('performanceTable');
        if (!tbody) return;

        tbody.innerHTML = '';
        reviews.forEach(review => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${review.employee?.firstName} ${review.employee?.lastName}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${review.reviewPeriod}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${review.reviewer?.firstName || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${review.overallRating || 'N/A'}/5</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge status-${review.status.toLowerCase()}">${review.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-2" onclick="app.viewPerformance('${review.id}')">View</button>
                    <button class="text-green-600 hover:text-green-900 mr-2" onclick="app.editPerformance('${review.id}')">Edit</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updatePerformanceStats(reviews) {
        const active = reviews.filter(r => r.status === 'In Progress').length;
        const completed = reviews.filter(r => r.status === 'Completed').length;
        const average = reviews.length > 0 ? reviews.reduce((sum, r) => sum + (r.overallRating || 0), 0) / reviews.length : 0;
        const dueThisMonth = reviews.filter(r => r.status === 'Pending' && new Date(r.startDate).getMonth() === new Date().getMonth()).length;

        document.getElementById('activeReviews').textContent = active;
        document.getElementById('completedReviews').textContent = completed;
        document.getElementById('averageRating').textContent = average.toFixed(1);
        document.getElementById('dueThisMonth').textContent = dueThisMonth;
    }

    // ===== LEARNING & DEVELOPMENT =====
    async loadTrainingPrograms() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/training`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderTrainingTable(data.trainings || []);
                this.updateLearningStats(data.trainings || []);
            }
        } catch (error) {
            console.error('Error loading training programs:', error);
        }
    }

    renderTrainingTable(trainings) {
        const tbody = document.getElementById('trainingTable');
        if (!tbody) return;

        tbody.innerHTML = '';
        trainings.forEach(training => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${training.title}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${training.category}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${training.duration}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${training.enrolledCount || 0}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge status-${training.status.toLowerCase()}">${training.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-2" onclick="app.viewTraining('${training.id}')">View</button>
                    <button class="text-green-600 hover:text-green-900 mr-2" onclick="app.editTraining('${training.id}')">Edit</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateLearningStats(trainings) {
        const active = trainings.filter(t => t.status === 'Active').length;
        const enrolled = trainings.reduce((sum, t) => sum + (t.enrolledCount || 0), 0);
        const completed = trainings.filter(t => t.status === 'Completed').length;
        const averageScore = trainings.length > 0 ? trainings.reduce((sum, t) => sum + (t.averageScore || 0), 0) / trainings.length : 0;

        document.getElementById('activeCourses').textContent = active;
        document.getElementById('enrolledEmployees').textContent = enrolled;
        document.getElementById('completedThisMonth').textContent = completed;
        document.getElementById('averageScore').textContent = `${averageScore.toFixed(1)}%`;
    }

    // ===== BENEFITS ADMINISTRATION =====
    async loadBenefits() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/benefits`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderBenefitsTable(data.benefits || []);
                this.updateBenefitsStats(data.benefits || []);
            }
        } catch (error) {
            console.error('Error loading benefits:', error);
        }
    }

    renderBenefitsTable(benefits) {
        const tbody = document.getElementById('benefitsTable');
        if (!tbody) return;

        tbody.innerHTML = '';
        benefits.forEach(benefit => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${benefit.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${benefit.type}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${benefit.provider}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">$${benefit.cost?.toLocaleString() || '0'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${benefit.enrolledCount || 0}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge status-${benefit.status.toLowerCase()}">${benefit.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-2" onclick="app.viewBenefit('${benefit.id}')">View</button>
                    <button class="text-green-600 hover:text-green-900 mr-2" onclick="app.editBenefit('${benefit.id}')">Edit</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateBenefitsStats(benefits) {
        const active = benefits.filter(b => b.status === 'Active').length;
        const enrolled = benefits.reduce((sum, b) => sum + (b.enrolledCount || 0), 0);
        const totalCost = benefits.reduce((sum, b) => sum + (b.cost || 0), 0);
        const coverageRate = enrolled > 0 ? Math.round((enrolled / (enrolled + 100)) * 100) : 0;

        document.getElementById('activeBenefits').textContent = active;
        document.getElementById('enrolledInBenefits').textContent = enrolled;
        document.getElementById('totalBenefitsCost').textContent = `$${totalCost.toLocaleString()}`;
        document.getElementById('coverageRate').textContent = `${coverageRate}%`;
    }

    // ===== ANALYTICS =====
    async loadAnalytics() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/analytics/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateAnalyticsStats(data);
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    updateAnalyticsStats(data) {
        document.getElementById('totalWorkforce').textContent = data.totalWorkforce || 0;
        document.getElementById('turnoverRate').textContent = `${data.turnoverRate || 0}%`;
        document.getElementById('avgTenure').textContent = `${data.avgTenure || 0} years`;
        document.getElementById('diversityIndex').textContent = `${data.diversityIndex || 0}%`;
    }

    async generateReport() {
        const reportType = document.getElementById('reportType')?.value;
        if (!reportType) return;

        try {
            const response = await fetch(`${this.apiBase}/analytics/reports/${reportType}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.displayReport(data);
            }
        } catch (error) {
            console.error('Error generating report:', error);
        }
    }

    displayReport(data) {
        const reportContent = document.getElementById('reportContent');
        if (!reportContent) return;

        reportContent.innerHTML = `
            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold mb-2">${data.title || 'Report'}</h4>
                <p class="text-gray-600">${data.description || 'Report generated successfully.'}</p>
                <div class="mt-4">
                    <pre class="text-sm bg-white p-4 rounded border">${JSON.stringify(data.data, null, 2)}</pre>
                </div>
            </div>
        `;
    }

    // ===== NEW MODULE METHODS =====
    async loadEmployeeExperience() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/employee-experience`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderRecognitionTable(data.experiences || []);
                this.updateExperienceStats(data.stats || {});
            }
        } catch (error) {
            console.error('Error loading employee experience data:', error);
            this.showToast('Failed to load employee experience data', 'error');
        }
    }

    renderRecognitionTable(recognitions) {
        const tbody = document.getElementById('recognitionTable');
        if (!tbody) return;

        tbody.innerHTML = recognitions.map(recognition => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${recognition.employeeName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${recognition.recognitionType}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${recognition.givenBy}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${recognition.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${recognition.points}</td>
            </tr>
        `).join('');
    }

    updateExperienceStats(data) {
        // Update experience overview stats
        document.getElementById('engagementScore').textContent = '85%';
        document.getElementById('recognitionAwards').textContent = '24';
        document.getElementById('exitInterviews').textContent = '12';
        document.getElementById('chatbotQueries').textContent = '156';
    }

    async loadComplianceData() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/compliance-cases`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderComplianceCasesTable(data.cases || []);
                this.updateComplianceStats(data.stats || {});
            } else {
                console.error('Failed to load compliance data:', response.status);
                this.showToast('Failed to load compliance data', 'error');
            }
        } catch (error) {
            console.error('Error loading compliance data:', error);
            this.showToast('Failed to load compliance data', 'error');
        }
    }

    renderComplianceCasesTable(cases) {
        const tbody = document.getElementById('complianceCasesTable');
        if (!tbody) return;

        tbody.innerHTML = cases.map(caseItem => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${caseItem.caseNumber || `CASE-${caseItem.id}`}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${caseItem.caseType || caseItem.type}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${caseItem.title || caseItem.description}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        caseItem.priority === 'high' ? 'bg-red-100 text-red-800' : 
                        caseItem.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                    }">${caseItem.priority}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${caseItem.status}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${caseItem.assignedTo?.firstName ? `${caseItem.assignedTo.firstName} ${caseItem.assignedTo.lastName}` : caseItem.assignedTo}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900">View</button>
                </td>
            </tr>
        `).join('');
    }

    updateComplianceStats(stats) {
        // Update compliance overview stats with real data
        document.getElementById('activeCases').textContent = stats.openCases || '0';
        document.getElementById('policyViolations').textContent = stats.totalCases || '0';
        document.getElementById('whistleblowerReports').textContent = stats.highPriorityCases || '0';
        document.getElementById('auditScore').textContent = stats.resolvedCases ? `${Math.round((stats.resolvedCases / stats.totalCases) * 100)}%` : '0%';
    }

    async loadMobileData() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/mobile-app`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderDeviceManagementTable(data.mobileData || []);
                this.updateMobileStats(data.stats || {});
            } else {
                console.error('Failed to load mobile data:', response.status);
                this.showToast('Failed to load mobile data', 'error');
            }
        } catch (error) {
            console.error('Error loading mobile data:', error);
            this.showToast('Failed to load mobile data', 'error');
        }
    }

    renderDeviceManagementTable(devices) {
        const tbody = document.getElementById('deviceManagementTable');
        if (!tbody) return;

        tbody.innerHTML = devices.map(device => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${device.employee?.firstName ? `${device.employee.firstName} ${device.employee.lastName}` : device.employeeName || 'Unknown'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${device.deviceType || device.type}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${device.osVersion || device.version}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${device.lastSync || device.updatedAt}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        device.status === 'active' ? 'bg-green-100 text-green-800' : 
                        device.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                    }">${device.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900">Manage</button>
                </td>
            </tr>
        `).join('');
    }

    updateMobileStats(stats) {
        // Update mobile overview stats with real data
        document.getElementById('mobileUsers').textContent = stats.totalDevices || '0';
        document.getElementById('appDownloads').textContent = stats.activeDevices || '0';
        document.getElementById('pushNotifications').textContent = stats.totalNotifications || '0';
        document.getElementById('voiceCommands').textContent = stats.voiceInteractions || '0';
    }

    async loadIntegrationData() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiBase}/integration-hub`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderIntegrationTable(data.integrations || []);
                this.updateIntegrationStats(data.stats || {});
            } else {
                console.error('Failed to load integration data:', response.status);
                this.showToast('Failed to load integration data', 'error');
            }
        } catch (error) {
            console.error('Error loading integration data:', error);
            this.showToast('Failed to load integration data', 'error');
        }
    }

    renderIntegrationTable(integrations) {
        const tbody = document.getElementById('integrationTable');
        if (!tbody) return;

        tbody.innerHTML = integrations.map(integration => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${integration.name || integration.type}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${integration.type}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${integration.status}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${integration.lastSync || integration.updatedAt}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        integration.status === 'active' ? 'bg-green-100 text-green-800' : 
                        integration.status === 'error' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                    }">${integration.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900">Configure</button>
                </td>
            </tr>
        `).join('');
    }

    updateIntegrationStats(stats) {
        // Update integration overview stats with real data
        document.getElementById('activeIntegrations').textContent = stats.activeIntegrations || '0';
        document.getElementById('dataSyncStatus').textContent = stats.totalIntegrations ? `${Math.round((stats.activeIntegrations / stats.totalIntegrations) * 100)}%` : '0%';
        document.getElementById('apiCallsToday').textContent = stats.apiIntegrations || '0';
        document.getElementById('customWorkflows').textContent = stats.customWorkflows || '0';
    }

    handleChatbotMessage() {
        const input = document.getElementById('chatbotInput');
        const messagesContainer = document.getElementById('chatbotMessages');
        
        if (!input || !messagesContainer || !input.value.trim()) return;

        const userMessage = input.value.trim();
        
        // Add user message
        messagesContainer.innerHTML += `
            <div class="text-sm text-blue-600 mb-2">You: ${userMessage}</div>
        `;

        // Simple chatbot responses
        let response = 'I understand your question. Let me help you with that.';
        
        if (userMessage.toLowerCase().includes('leave') || userMessage.toLowerCase().includes('pto')) {
            response = 'You have 15 days of PTO remaining. Would you like to request time off?';
        } else if (userMessage.toLowerCase().includes('payslip') || userMessage.toLowerCase().includes('salary')) {
            response = 'Your latest payslip is available in the Payroll section. Would you like me to show it to you?';
        } else if (userMessage.toLowerCase().includes('benefits') || userMessage.toLowerCase().includes('insurance')) {
            response = 'Your benefits information is available in the Benefits section. You can view your health insurance, retirement plans, and other benefits there.';
        } else if (userMessage.toLowerCase().includes('clock') || userMessage.toLowerCase().includes('time')) {
            response = 'You can clock in/out using the Attendance section. Your current status is tracked automatically.';
        }

        // Add bot response
        messagesContainer.innerHTML += `
            <div class="text-sm text-gray-600 mb-2">AI Assistant: ${response}</div>
        `;

        // Clear input and scroll to bottom
        input.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // ===== MODAL METHODS =====
    showAddDepartmentModal() {
        this.showToast('Department modal coming soon', 'info');
    }

    showAddJobModal() {
        this.showToast('Job posting modal coming soon', 'info');
    }

    showAddCandidateModal() {
        this.showToast('Candidate modal coming soon', 'info');
    }

    showRequestLeaveModal() {
        this.showToast('Leave request modal coming soon', 'info');
    }

    showCreateReviewModal() {
        this.showToast('Performance review modal coming soon', 'info');
    }

    showAddTrainingModal() {
        this.showToast('Training modal coming soon', 'info');
    }

    showAddBenefitModal() {
        this.showToast('Benefit modal coming soon', 'info');
    }

    generatePayroll() {
        this.showToast('Payroll generation coming soon', 'info');
    }

    // ===== NAVIGATION ENHANCEMENT =====
    navigateToSection(section) {
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Hide all content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show target section
        const targetSection = document.getElementById(`${section}Section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            
            // Load section-specific data
            switch(section) {
                case 'departments':
                    this.loadDepartments();
                    break;
                case 'recruitment':
                    this.loadJobs();
                    this.loadCandidates();
                    break;
                case 'attendance':
                    this.loadAttendanceRecords();
                    break;
                case 'leave':
                    this.loadLeaveRequests();
                    break;
                case 'payroll':
                    this.loadPayrollRecords();
                    break;
                case 'performance':
                    this.loadPerformanceReviews();
                    break;
                case 'learning':
                    this.loadTrainingPrograms();
                    break;
                case 'benefits':
                    this.loadBenefits();
                    break;
                case 'analytics':
                    this.loadAnalytics();
                    break;
                case 'experience':
                    this.loadEmployeeExperience();
                    break;
                case 'compliance':
                    this.loadComplianceData();
                    break;
                case 'mobile':
                    this.loadMobileData();
                    break;
                case 'integration':
                    this.loadIntegrationData();
                    break;
            }
        }
    }
}

// Initialize the application
const app = new HRMSApp();
