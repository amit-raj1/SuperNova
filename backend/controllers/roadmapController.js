const Course = require('../models/Course');
const Roadmap = require('../models/Roadmap');
const { generateRoadmap } = require('../services/aiService');
const { handleError } = require('../utils/errorHandler');

// Generate or get a roadmap for a course
exports.generateRoadmap = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    // 1. Check if roadmap already exists
    let roadmap = await Roadmap.findOne({ courseId, userId });
    if (roadmap) {
      console.log('Roadmap already exists, returning existing one.');
      return res.status(200).json({ roadmap });
    }

    // 2. Get course details
    const course = await Course.findOne({ 
      _id: courseId, 
      $or: [{ user: userId }, { userId: userId }] 
    });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 3. Generate new roadmap content
    const steps = await generateRoadmap(course.subject, course.difficulty);

    // 4. Save the new roadmap
    roadmap = new Roadmap({
      userId,
      courseId,
      steps
    });
    await roadmap.save();

    // 5. Update the course flag
    course.hasRoadmap = true;
    await course.save();

    res.status(201).json({ roadmap });

  } catch (error) {
    handleError(res, error);
  }
};

// Get the roadmap for a course
exports.getRoadmap = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    const roadmap = await Roadmap.findOne({ courseId, userId });
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    res.status(200).json({ roadmap });
  } catch (error) {
    handleError(res, error);
  }
};