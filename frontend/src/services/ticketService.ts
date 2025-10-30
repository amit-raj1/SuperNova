import api from './api';

export interface Ticket {
  _id: string;
  ticketNumber: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  };
  subject: string;
  category: 'technical' | 'billing' | 'course' | 'account' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  messages: Array<{
    _id: string;
    sender: {
      _id: string;
      name: string;
      email: string;
      role?: string;
    };
    message: string;
    isAdminReply: boolean;
    timestamp: string;
  }>;
  attachments?: Array<{
    filename: string;
    url: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface CreateTicketData {
  subject: string;
  category: string;
  priority: string;
  description: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byCategory: Array<{ _id: string; count: number }>;
  byPriority: Array<{ _id: string; count: number }>;
}

// Create a new ticket
export const createTicket = async (ticketData: CreateTicketData) => {
  return await api('/tickets/create', 'POST', ticketData);
};

// Get user's tickets
export const getUserTickets = async () => {
  return await api('/tickets/my-tickets', 'GET');
};

// Get single ticket by ID
export const getTicketById = async (ticketId: string) => {
  return await api(`/tickets/${ticketId}`, 'GET');
};

// Add message to ticket
export const addTicketMessage = async (ticketId: string, message: string, isAdminReply: boolean = false) => {
  return await api(`/tickets/${ticketId}/message`, 'POST', { message, isAdminReply });
};

// Get all tickets (Admin only)
export const getAllTickets = async (filters?: {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
}) => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.search) params.append('search', filters.search);

  return await api(`/tickets/all?${params.toString()}`, 'GET');
};

// Update ticket status (Admin only)
export const updateTicketStatus = async (
  ticketId: string,
  data: { status?: string; assignedTo?: string }
) => {
  return await api(`/tickets/${ticketId}/status`, 'PATCH', data);
};

// Get ticket statistics (Admin only)
export const getTicketStats = async () => {
  return await api('/tickets/stats/overview', 'GET');
};

// Delete ticket (Admin only)
export const deleteTicket = async (ticketId: string) => {
  return await api(`/tickets/${ticketId}`, 'DELETE');
};
