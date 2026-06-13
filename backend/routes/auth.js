const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'nexus_super_secret_2026';

// ==========================================
// ROUTE 1: REGISTER NEW USER (POST /api/auth/signup)
// ==========================================
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate request inputs
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user already exists in your database table
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Securely hash the plain text password before database insertion
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to database
    const newUser = await User.create({
      username,
      password: hashedPassword
    });

    // Sign the JWT deployment token for automatic user onboarding authentication
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ 
      message: 'Account created successfully', 
      token, 
      username: newUser.username 
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==========================================
// ROUTE 2: USER LOGIN AUTHENTICATION (POST /api/auth/login)
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Lookup user profile by username match
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid login credentials' });
    }

    // Compare incoming password with encrypted database hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid login credentials' });
    }

    // Issue new verification token payload access keys
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      message: 'Logged in successfully', 
      token, 
      username: user.username 
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;