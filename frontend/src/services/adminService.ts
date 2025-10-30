import api from './api';

export interface UserStats {
  total: number;
  admins: number;
  regular: number;
  newThisWeek: number;
  growth: Array<{ _id: string; count: number }>;
}

export interface DashboardStats {
  users: UserStats;
  courses: number;
  quizzes: number;
  tickets: {
    total: number;
    open: number;
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  googleId?: string;
  createdAt: string;
  progress?: Array<{
    courseId: string;
    completedTopics: Array<{
      topicId: string;
      completedAt: string;
    }>;
  }>;
  gamification?: {
    xp: number;
    streak: number;
    badges: string[];
  };
}

export interface Course {
  _id: string;
  title: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

// Get admin dashboard statistics
export const getDashboardStats = async () => {
  return await api('/admin/stats', 'GET');
};

// Get all users
export const getAllUsers = async (filters?: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  if (filters?.role) params.append('role', filters.role);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  return await api(`/admin/users?${params.toString()}`, 'GET');
};

// Get user by ID
export const getUserById = async (userId: string) => {
  return await api(`/admin/users/${userId}`, 'GET');
};

// Update user role
export const updateUserRole = async (userId: string, role: 'user' | 'admin') => {
  return await api(`/admin/users/${userId}/role`, 'PATCH', { role });
};

// Delete user
export const deleteUser = async (userId: string) => {
  return await api(`/admin/users/${userId}`, 'DELETE');
};

// Get all courses
export const getAllCourses = async (filters?: {
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  return await api(`/admin/courses?${params.toString()}`, 'GET');
};

// Delete course
export const deleteCourse = async (courseId: string) => {
  return await api(`/admin/courses/${courseId}`, 'DELETE');
};

// Get activity logs
export const getActivityLogs = async (limit?: number) => {
  const params = limit ? `?limit=${limit}` : '';
  return await api(`/admin/activity-logs${params}`, 'GET');
};
