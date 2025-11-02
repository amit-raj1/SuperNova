const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const authenticateJWT = require('../middleware/authMiddleware');

// Generate (or get) a roadmap for a course
router.post('/:courseId', authenticateJWT, roadmapController.generateRoadmap);

// Get an existing roadmap for a course
router.get('/:courseId', authenticateJWT, roadmapController.getRoadmap);

module.exports = router;