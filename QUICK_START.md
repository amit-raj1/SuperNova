# Quick Start Guide - Admin System & Support Tickets

## 🚀 Getting Started

### Step 1: Create Admin User

Open a terminal in the `backend` folder and run:

```bash
node createAdmin.js
```

This creates a default admin with:
- Email: `admin@example.com`
- Password: `Admin@123`

Or create with custom credentials:
```bash
node createAdmin.js youradmin@email.com YourPassword "Your Name"
```

### Step 2: Start the Backend Server

```bash
cd backend
npm start
```

The server should start on `http://localhost:5000`

### Step 3: Start the Frontend

Open a new terminal:
```bash
cd frontend
npm run dev
```

The frontend should start on `http://localhost:8080`

### Step 4: Login as Admin

1. Go to `http://localhost:8080`
2. Click "Login"
3. Enter admin credentials:
   - Email: `admin@example.com`
   - Password: `Admin@123`
4. Click "Login"

### Step 5: Access Admin Dashboard

After logging in, you can access the admin dashboard in two ways:
1. Click on your profile dropdown → "Admin Panel"
2. Or directly navigate to `http://localhost:8080/admin`

## 📋 Testing the System

### Test Ticket Creation (As User)

1. Login as a regular user (or create a new account)
2. Navigate to `/help`
3. Click "Create Ticket"
4. Fill in the form:
   - Subject: "Test ticket"
   - Category: "Technical"
   - Priority: "Medium"
   - Description: "This is a test ticket"
5. Click "Create Ticket"
6. View your ticket in the "My Tickets" tab

### Test Ticket Management (As Admin)

1. Login as admin
2. Go to `/admin`
3. Click on "Tickets" tab
4. You should see all tickets including the test ticket
5. Update ticket status
6. Click "View Details" to see the conversation
7. Add a reply message

### Test User Management (As Admin)

1. Go to `/admin`
2. Click on "Users" tab
3. You should see all registered users
4. Try searching for a user
5. Promote a user to admin or demote admin to user
6. ⚠️ Don't delete your own admin account!

### Test Course Management (As Admin)

1. Go to `/admin`
2. Click on "Courses" tab
3. You should see all courses created in the system
4. View course details
5. Delete courses if needed

## 🎯 Key Features to Test

### Support Tickets
- [x] Create ticket
- [x] View ticket list
- [x] Filter tickets by status
- [x] Search tickets
- [x] View ticket details
- [x] Send messages
- [x] Admin reply to tickets
- [x] Update ticket status
- [x] Real-time updates

### Admin Dashboard
- [x] View statistics
- [x] User management
- [x] Ticket management
- [x] Course management
- [x] Search functionality
- [x] Role updates
- [x] Delete operations

## 🔐 Security Check

Make sure:
- ✅ Regular users cannot access `/admin`
- ✅ Users can only see their own tickets
- ✅ Admin can see all tickets
- ✅ Only admins can update ticket status
- ✅ Only admins can manage users
- ✅ JWT tokens are required for all protected routes

## 📱 UI/UX Features

### Responsive Design
- Mobile-friendly navigation
- Responsive grids and layouts
- Touch-friendly buttons and inputs

### Visual Feedback
- Color-coded status badges
- Priority indicators
- Loading states
- Success/error toasts
- Confirmation dialogs

### User Experience
- Intuitive navigation
- Search and filter options
- Inline editing
- Real-time updates
- Clear call-to-action buttons

## ⚠️ Troubleshooting

### Issue: "Access Denied" when accessing admin panel
**Solution:** Make sure the user role is set to 'admin' in the database

### Issue: Tickets not loading
**Solution:** 
1. Check if backend is running
2. Check browser console for errors
3. Verify MongoDB connection
4. Check authentication token

### Issue: Can't create admin user
**Solution:**
1. Make sure MongoDB is connected
2. Check .env file has correct MONGO_URI
3. Check if user already exists with that email

### Issue: Frontend can't connect to backend
**Solution:**
1. Verify backend is running on port 5000
2. Check CORS settings in server.js
3. Check API base URL in frontend services

## 🎨 Customization

### Change Ticket Categories
Edit in: `backend/models/Ticket.js`
```javascript
category: {
  type: String,
  enum: ['technical', 'billing', 'course', 'account', 'other'],
  default: 'other',
}
```

### Change Priority Levels
Edit in: `backend/models/Ticket.js`
```javascript
priority: {
  type: String,
  enum: ['low', 'medium', 'high', 'critical'],
  default: 'medium',
}
```

### Add New Ticket Status
Edit in: `backend/models/Ticket.js`
```javascript
status: {
  type: String,
  enum: ['open', 'in-progress', 'resolved', 'closed'],
  default: 'open',
}
```

## 📊 API Testing

You can test the API endpoints using tools like Postman or curl:

### Get All Tickets (Admin)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/tickets
```

### Create Ticket
```bash
curl -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subject":"Test","category":"technical","priority":"medium","description":"Test ticket"}' \
  http://localhost:5000/api/tickets/create
```

### Get Dashboard Stats
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/admin/stats
```

## 🎓 Next Steps

1. **Customize the UI** to match your brand
2. **Add email notifications** for ticket updates
3. **Implement file uploads** for ticket attachments
4. **Add more admin features** like analytics dashboard
5. **Set up production environment** with proper security

## 📝 Important Notes

- **Always change default admin password** in production!
- **Keep JWT_SECRET secure** and never commit to git
- **Regularly backup your database**
- **Monitor ticket response times**
- **Set up proper logging** for debugging

## ✅ Success Checklist

Before going to production:
- [ ] Change default admin credentials
- [ ] Update JWT_SECRET
- [ ] Set up proper environment variables
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Test all user flows
- [ ] Test all admin functions
- [ ] Verify security measures
- [ ] Set up error logging
- [ ] Configure email notifications
- [ ] Test on mobile devices

---

**You're all set!** 🎉 Your comprehensive admin management and support ticket system is ready to use!
