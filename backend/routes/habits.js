const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET all habits for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM habits WHERE user_id = $1 ORDER BY id', [req.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a new habit
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, type, goal_value, weight } = req.body;
    const result = await pool.query(
      'INSERT INTO habits (user_id, name, type, goal_value, weight) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.userId, name, type, goal_value, weight || 10]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a habit
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, type, goal_value, weight } = req.body;
    const result = await pool.query(
      'UPDATE habits SET name=$1, type=$2, goal_value=$3, weight=$4 WHERE id=$5 AND user_id=$6 RETURNING *',
      [name, type, goal_value, weight, req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Habit not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a habit
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM habits WHERE id=$1 AND user_id=$2 RETURNING *', [req.params.id, req.userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Habit not found' });
    res.json({ message: 'Habit deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;