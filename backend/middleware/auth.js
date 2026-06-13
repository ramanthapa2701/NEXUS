const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'nexus_super_secret_2026';

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ error: 'Access Denied. No token provided.' });

  const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
  if (!token) return res.status(401).json({ error: 'Access Denied. Token malformed.' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Attaches { userId: "..." } to the request
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid Token' });
  }
};