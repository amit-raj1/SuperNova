const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    console.log('🔍 Admin middleware called');
    console.log('🔍 req.user from auth middleware:', req.user);
    
    // Check if user was already set by authMiddleware
    if (!req.user || !req.user.userId) {
      console.log('❌ No user found in request from auth middleware');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Fetch the full user object to check role
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      console.log('❌ User not found in database:', req.user.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('🔍 User found:', user.email, 'Role:', user.role);

    if (user.role !== 'admin') {
      console.log('❌ Access denied: User is not admin');
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    console.log('✅ Admin access granted');
    req.user = { ...req.user, role: user.role }; // Add role to req.user
    next();
  } catch (error) {
    console.error('❌ Admin middleware error:', error);
    res.status(500).json({ message: 'Server error in admin middleware' });
  }
};

module.exports = adminMiddleware;
