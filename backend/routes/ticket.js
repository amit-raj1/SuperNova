const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

console.log('✅ Ticket routes file loaded');

// Admin routes (protected) - More specific routes MUST come before parameterized routes
router.get('/stats/overview', authMiddleware, adminMiddleware, ticketController.getTicketStats);
router.get('/all', authMiddleware, adminMiddleware, ticketController.getAllTickets);
router.patch('/:ticketId/status', authMiddleware, adminMiddleware, ticketController.updateTicketStatus);
router.delete('/:ticketId', authMiddleware, adminMiddleware, ticketController.deleteTicket);

// User routes (protected)
router.post('/create', authMiddleware, ticketController.createTicket);
router.get('/my-tickets', authMiddleware, ticketController.getUserTickets);
router.get('/:ticketId', authMiddleware, ticketController.getTicketById);
router.post('/:ticketId/message', authMiddleware, ticketController.addMessage);

console.log('✅ Ticket routes registered');

module.exports = router;
