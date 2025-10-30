# Admin Management System & Support Tickets

## Overview

This comprehensive admin management system includes:
- **Admin Dashboard** - Complete system management and analytics
- **Support Ticket System** - User ticket creation and admin management
- **User Management** - Manage user roles and accounts
- **Course Management** - Oversee all courses in the system

## Features

### For Users
1. **Create Support Tickets** at `/help`
   - Create tickets with subject, category, priority, and description
   - Track ticket status (open, in-progress, resolved, closed)
   - View all your tickets
   - Send messages and communicate with admins
   - Real-time ticket updates

2. **AI Chatbot** at `/help`
   - Get instant help from AI assistant
   - Ask questions about courses and concepts

### For Admins
1. **Admin Dashboard** at `/admin`
   - View system statistics (users, courses, tickets)
   - User growth analytics
   - Ticket overview and statistics

2. **Ticket Management**
   - View all support tickets
   - Filter by status, category, priority
   - Update ticket status
   - Assign tickets to admins
   - Reply to user messages
   - Close and resolve tickets

3. **User Management**
   - View all users
   - Search users by name or email
   - Promote users to admin or demote to user
   - Delete user accounts
   - View user creation dates

4. **Course Management**
   - View all courses
   - See course creators
   - Delete courses
   - Monitor course creation dates

## Setup Instructions

### 1. Backend Setup

The backend routes are already configured in `server.js`:
- `/api/tickets` - Ticket management routes
- `/api/admin` - Admin management routes

### 2. Create Admin User

Run this command from the `backend` directory:

```bash
# Create admin with default credentials
node createAdmin.js

# Or specify custom credentials
node createAdmin.js admin@yourdomain.com YourPassword123 "Admin Name"
```

Default admin credentials:
- **Email:** admin@example.com
- **Password:** Admin@123
- **Name:** Admin User

### 3. Database Models

The following models have been created:
- **User Model** - Added `role` field ('user' or 'admin')
- **Ticket Model** - Complete ticket management with messages, status, priority

### 4. Frontend Pages

1. **Help & Support** (`/help`)
   - Tabs for AI Chatbot and Support Tickets
   - Create new tickets
   - View ticket list with filters
   - Real-time ticket details with messaging

2. **Admin Dashboard** (`/admin`)
   - Protected route (admin only)
   - Statistics overview
   - Tabs for Tickets, Users, and Courses
   - Complete CRUD operations

## API Endpoints

### Ticket Routes (`/api/tickets`)

**User Routes:**
- `POST /create` - Create new ticket
- `GET /my-tickets` - Get user's tickets
- `GET /:ticketId` - Get single ticket
- `POST /:ticketId/message` - Add message to ticket

**Admin Routes:**
- `GET /` - Get all tickets (with filters)
- `PATCH /:ticketId/status` - Update ticket status
- `GET /stats/overview` - Get ticket statistics
- `DELETE /:ticketId` - Delete ticket

### Admin Routes (`/api/admin`)

**All routes require admin authentication:**
- `GET /stats` - Dashboard statistics
- `GET /activity-logs` - Recent system activity
- `GET /users` - Get all users (with pagination)
- `GET /users/:userId` - Get user details
- `PATCH /users/:userId/role` - Update user role
- `DELETE /users/:userId` - Delete user
- `GET /courses` - Get all courses
- `DELETE /courses/:courseId` - Delete course

## Ticket System Features

### Ticket Properties
- **Ticket Number** - Auto-generated unique identifier
- **Subject** - Brief description
- **Category** - technical, billing, course, account, other
- **Priority** - low, medium, high, critical
- **Status** - open, in-progress, resolved, closed
- **Messages** - Threaded conversation
- **Timestamps** - Created, updated, resolved, closed dates

### Status Flow
1. **Open** - User creates ticket
2. **In Progress** - Admin starts working on it
3. **Resolved** - Issue fixed
4. **Closed** - Ticket archived

## Security

### Authentication
- All routes protected with JWT authentication
- Admin routes use `adminMiddleware` for role verification
- Users can only view/edit their own tickets
- Admins have full access to all tickets

### Authorization
- Role-based access control (RBAC)
- Admin role required for admin panel access
- Frontend checks user role before showing admin links
- Backend validates admin role on all admin endpoints

## User Interface

### Help & Support Page
- Clean tabbed interface
- Ticket creation modal with form validation
- Ticket list with search and filters
- Detailed ticket view with messaging
- Status and priority badges with color coding
- Responsive design for all screen sizes

### Admin Dashboard
- Statistics cards with key metrics
- Tabbed interface for different management areas
- Real-time filtering and search
- Inline editing for ticket status
- Confirmation dialogs for destructive actions
- Scrollable content areas

## Usage Examples

### Creating a Ticket
1. Navigate to `/help`
2. Click "Create Ticket"
3. Fill in subject, category, priority, description
4. Submit
5. Track ticket in "My Tickets" tab

### Managing Tickets (Admin)
1. Navigate to `/admin`
2. Go to "Tickets" tab
3. Filter by status if needed
4. Update ticket status inline
5. Click "View Details" to see conversation
6. Reply to user messages

### Managing Users (Admin)
1. Navigate to `/admin`
2. Go to "Users" tab
3. Search for specific users
4. Click "Make Admin" or "Remove Admin"
5. Delete users with confirmation

## Navbar Updates

The navbar now shows:
- **Admin Panel** link for admin users (both in top nav and dropdown)
- **Shield icon** to identify admin features
- Role-based conditional rendering

## Technologies Used

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React & TypeScript
- Tailwind CSS
- shadcn/ui components
- React Router for navigation
- Lucide icons

## Color Coding

### Status Badges
- **Open** - Blue
- **In Progress** - Yellow
- **Resolved** - Green
- **Closed** - Gray

### Priority Badges
- **Low** - Green
- **Medium** - Yellow
- **High** - Orange
- **Critical** - Red

## Future Enhancements

Potential improvements:
- Email notifications for ticket updates
- File attachment support
- Ticket assignment to specific admins
- Advanced analytics and reporting
- Export tickets to PDF/CSV
- Ticket templates
- Auto-close old resolved tickets
- SLA (Service Level Agreement) tracking
- Customer satisfaction ratings

## Troubleshooting

### Admin user can't access admin panel
- Verify user role is set to 'admin' in database
- Check JWT token includes role
- Clear browser cache and login again

### Tickets not loading
- Check backend server is running
- Verify MongoDB connection
- Check browser console for errors
- Verify authentication token is valid

### Can't create tickets
- Ensure user is logged in
- Check form validation
- Verify backend /api/tickets/create route is accessible

## Support

For issues or questions:
1. Check browser console for errors
2. Check backend server logs
3. Verify all environment variables are set
4. Ensure MongoDB is running
5. Create a support ticket at `/help` 😊

---

**Note:** Make sure to update admin credentials after initial setup and never commit credentials to version control!
