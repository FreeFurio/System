import bcrypt from 'bcryptjs';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { config } from '../config/config.mjs';

const app = initializeApp(config.firebase);
const db = getDatabase(app, config.firebase.databaseURL);

async function createAdmin() {
  try {
    console.log('Creating Admin user...');
    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminData = {
      username: 'Admin',
      email: 'admin@salon.com',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'Admin',
      password: hashedPassword,
      status: 'active',
      locked: false,
      forcePasswordReset: false,
      createdAt: new Date().toISOString(),
      lastLogin: 'Never'
    };
    
    const adminRef = ref(db, 'Admin/admin');
    await set(adminRef, adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log('Username: Admin');
    console.log('Password: admin123');
    console.log('Please change the password after first login.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();