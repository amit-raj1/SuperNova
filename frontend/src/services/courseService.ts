import apiRequest from './api';

// ========================
// Interface Definitions
// ========================

export interface Course {
  _id: string;
  subject: string;
  difficulty: string;
  topics: Topic[];
  progress: {
    completedTopics: number;
    totalTopics: number;
    testScores: {
      topic: string;
      score: number;
      date: string;
    }[];
  };
  createdAt: string;
  hasQuiz?: boolean;
  hasTimetable?: boolean;
  hasPdfNotes?: boolean;
  pdfNotes?: {
    _id: string;
    fileName: string;
    notes: string;
    createdAt: string;
  }[];
  hasLectures?: boolean;
  lectures?: {
    _id: string;
    title: string;
    url: string;
    duration: string;
  }[];
  hasRoadmap?: boolean; // <-- ADDED
}

export interface Topic {
  _id: string;
  title: string;
  content: string;
  notes: string;
  quiz?: any[];
  estimatedHours?: number;
  status: 'pending' | 'in-progress' | 'completed';
}

// ========================
// Course Management
// ========================

// Get all courses for the current user
export const getMyCourses = async () => {
  return apiRequest('/course/my-courses');
};

// Get a single course by ID
export const getCourseById = async (courseId: string) => {
  return apiRequest(`/course/my-courses?courseId=${courseId}`);
};

// Generate a new course
export const generateCourse = async (subject: string, difficulty: string) => {
  return apiRequest('/course/generate', 'POST', { subject, difficulty });
};

// Get course progress
export const getCourseProgress = async (courseId: string) => {
  return apiRequest(`/course/progress/${courseId}`);
};

// Mark a topic as completed
export const markTopicCompleted = async (topicId: string, courseId: string) => {
  return apiRequest(`/course/topic/${topicId}/progress/${courseId}`, 'POST');
};

// Reset course progress
export const resetCourseProgress = async (courseId: string) => {
  return apiRequest(`/course/progress/reset/${courseId}`, 'POST');
};

// Save notes for a topic
export const saveTopicNotes = async (courseId: string, topicId: string, content: string) => {
  return apiRequest(`/course/notes/${courseId}/${topicId}`, 'POST', { content });
};

// ========================
// Timetable Management
// ========================

export const generateTimetable = async (
  courseId: string,
  data: {
    startDate: string;
    endDate: string;
    topics: { title: string; hours: number }[];
  }
) => {
  const { startDate, endDate, topics } = data;

  const validatedTopics = topics && Array.isArray(topics)
    ? topics.map(topic => ({
        title: topic.title || `Topic ${Math.random().toString(36).substring(7)}`,
        hours: topic.hours <= 0 ? 1 : topic.hours,
      }))
    : [];

  try {
    const topicsToSend = validatedTopics && Array.isArray(validatedTopics) ? validatedTopics : [];

    if (topicsToSend.length === 0) {
      console.error('Error: No valid topics to send to API');
    }

    const response = await apiRequest(
      `/timetable/${courseId}`,
      'POST',
      {
        startDate,
        endDate,
        topics: topicsToSend,
        updateCourse: true,
      },
      60000 // 60s timeout
    );

    try {
      await updateCourseFlags(courseId, { hasTimetable: true });
      console.log('Updated course to mark timetable as generated');
    } catch (updateError) {
      console.error('Failed to update course flags:', updateError);
    }

    return response;
  } catch (error) {
    console.error('Error generating timetable:', error);
    throw error;
  }
};

// Mark a study session as completed
export const markSessionCompleted = async (
  courseId: string,
  dateIndex: number,
  sessionIndex: number,
  completed: boolean
) => {
  return apiRequest(`/timetable/${courseId}/${dateIndex}/${sessionIndex}`, 'PATCH', { completed });
};

// Get timetable for a course
export const getCourseTimetable = async (courseId: string) => {
  return apiRequest(`/timetable/${courseId}`);
};

// ========================
// Delete Course
// ========================

export const deleteCourse = async (courseId: string) => {
  return apiRequest(`/course/${courseId}`, 'DELETE');
};

// ========================
// Update Course Flags
// ========================

export const updateCourseFlags = async (
  courseId: string,
  flags: {
    hasTimetable?: boolean;
    hasQuiz?: boolean;
    hasPdfNotes?: boolean;
    hasLectures?: boolean;
    hasRoadmap?: boolean; // <-- ADDED
  }
) => {
  return apiRequest(`/course/${courseId}/update-flags`, 'PATCH', flags);
};

// ========================
// Lecture Management
// ========================

export const getLectures = async (courseId: string) => {
  return apiRequest(`/course/${courseId}/lectures`);
};

export const addLecture = async (
  courseId: string,
  lectureData: { title: string; url: string; duration: string }
) => {
  return apiRequest(`/course/${courseId}/lectures`, 'POST', lectureData);
};

export const deleteLecture = async (courseId: string, lectureId: string) => {
  return apiRequest(`/course/${courseId}/lectures/${lectureId}`, 'DELETE');
};

// ========================
// AI Roadmap Management
// ========================

export const getRoadmap = async (courseId: string) => {
  return apiRequest(`/roadmap/${courseId}`);
};

export const generateRoadmap = async (courseId: string) => {
  // Use a long timeout for AI-based roadmap generation
  return apiRequest(`/roadmap/${courseId}`, 'POST', {}, 60000);
};
