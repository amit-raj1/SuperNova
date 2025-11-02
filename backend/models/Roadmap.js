const mongoose = require('mongoose');

const roadmapStepSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  estimatedDuration: {
    type: String // e.g., "Week 1-2", "3-4 days"
  }
});

const RoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    unique: true // One roadmap per course
  },
  steps: [roadmapStepSchema]
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', RoadmapSchema);