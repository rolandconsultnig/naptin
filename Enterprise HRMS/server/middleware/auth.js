const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if user still exists
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Token is not valid' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Access denied' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Check if user can access employee data
const canAccessEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    
    // Admins and HR Managers can access all employees
    if (['Admin', 'HR Manager'].includes(req.user.role)) {
      return next();
    }

    // Managers can access their direct reports
    if (req.user.role === 'Manager') {
      // TODO: Implement manager-employee relationship check
      // For now, allow access
      return next();
    }

    // Employees can only access their own data
    if (req.user.role === 'Employee') {
      // TODO: Implement employee self-access check
      // For now, allow access
      return next();
    }

    res.status(403).json({ error: 'Access denied' });
  } catch (error) {
    console.error('Employee access check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { auth, authorize, canAccessEmployee };
