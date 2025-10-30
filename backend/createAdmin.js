const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Create admin user
const createAdmin = async () => {
  try {
    const email = process.argv[2] || 'admin@example.com';
    const password = process.argv[3] || 'Admin@123';
    const name = process.argv[4] || 'Admin User';

    // Check if admin already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log('⚠️  User already exists and is an admin');
        process.exit(0);
      } else {
        // Upgrade existing user to admin
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('✅ Existing user upgraded to admin');
        console.log(`📧 Email: ${email}`);
        console.log(`👤 Name: ${existingUser.name}`);
        process.exit(0);
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const adminUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Name: ${name}`);
    console.log(`🛡️  Role: admin`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('You can now login with these credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
