const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./db');

// Route Imports
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

// Initialize environment configuration
dotenv.config();

const app = express();

// Configure Global Cross-Origin Resource Sharing for Local Network Devices
app.use(cors({
  origin: '*', // Allows access from your mobile phone viewport framework
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Standard Body Parser Middleware
app.use(express.json());

// Main Routing Matrix Middleware Hub
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Database Synchronicity Engine Hook
sequelize.sync()
  .then(() => {
    console.log('✔ All PostgreSQL database schema tables synced perfectly');
  })
  .catch((err) => {
    console.error('❌ Database Sync Matrix Failure:', err);
  });

// Server Listener Port Binding Configuration
const PORT = process.env.PORT || 5000;

// Host '0.0.0.0' forces Node to listen to local network routers rather than just localhost
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NEXUS Server running globally on port ${PORT}`);
  console.log(`📡 Local Network Broadcast Target Area: http://192.168.1.17:${PORT}`);
});