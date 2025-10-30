const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

console.log('✅ Admin routes file loaded');

// All routes require admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard statistics
router.get('/stats', adminController.getDashboardStats);
router.get('/activity-logs', adminController.getActivityLogs);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserById);
router.patch('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

// Course management
router.get('/courses', adminController.getAllCourses);
router.delete('/courses/:courseId', adminController.deleteCourse);

console.log('✅ Admin routes registered');

module.exports = router;
