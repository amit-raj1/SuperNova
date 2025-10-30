const Ticket = require('../models/Ticket');
const User = require('../models/User');

// Create a new ticket
exports.createTicket = async (req, res) => {
  try {
    const { subject, category, priority, description } = req.body;
    const userId = req.user.userId || req.user.id;

    const ticket = new Ticket({
      userId,
      subject,
      category,
      priority,
      description,
    });

    await ticket.save();
    await ticket.populate('userId', 'name email');

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket,
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Failed to create ticket', error: error.message });
  }
};

// Get all tickets for a user
exports.getUserTickets = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const tickets = await Ticket.find({ userId })
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
};

// Get a single ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findById(ticketId)
      .populate('userId', 'name email role')
      .populate('assignedTo', 'name email')
      .populate('messages.sender', 'name email role');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user has access to this ticket (owner or admin)
    if (ticket.userId._id.toString() !== (req.user.userId || req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ ticket });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ message: 'Failed to fetch ticket', error: error.message });
  }
};

// Add a message to a ticket
exports.addMessage = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const senderId = req.user.userId || req.user.id;
    const isAdmin = req.user.role === 'admin';

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check access
    if (ticket.userId.toString() !== senderId && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    ticket.messages.push({
      sender: senderId,
      message,
      isAdminReply: isAdmin,
    });

    // Update status if admin replies
    if (isAdmin && ticket.status === 'open') {
      ticket.status = 'in-progress';
    }

    await ticket.save();
    await ticket.populate('messages.sender', 'name email role');

    res.status(200).json({
      message: 'Message added successfully',
      ticket,
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ message: 'Failed to add message', error: error.message });
  }
};

// Update ticket status (Admin only)
exports.updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, assignedTo } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (status) {
      ticket.status = status;
      
      if (status === 'resolved') {
        ticket.resolvedAt = Date.now();
      } else if (status === 'closed') {
        ticket.closedAt = Date.now();
      }
    }

    if (assignedTo) {
      ticket.assignedTo = assignedTo;
    }

    await ticket.save();
    await ticket.populate('userId', 'name email');
    await ticket.populate('assignedTo', 'name email');

    res.status(200).json({
      message: 'Ticket updated successfully',
      ticket,
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Failed to update ticket', error: error.message });
  }
};

// Get all tickets (Admin only)
exports.getAllTickets = async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tickets = await Ticket.find(query)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
};

// Get ticket statistics (Admin only)
exports.getTicketStats = async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'open' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'in-progress' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });
    const closedTickets = await Ticket.countDocuments({ status: 'closed' });

    const categoryStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      stats: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
        byCategory: categoryStats,
        byPriority: priorityStats,
      },
    });
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
};

// Delete ticket (Admin only)
exports.deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const ticket = await Ticket.findByIdAndDelete(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ message: 'Failed to delete ticket', error: error.message });
  }
};
