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

// LOG/UPDATE today's entry for a habit
router.post('/:id/log', authMiddleware, async (req, res) => {
  try {
    const { log_date, value, completed } = req.body;
    const habitId = req.params.id;

    const habitResult = await pool.query('SELECT * FROM habits WHERE id=$1 AND user_id=$2', [habitId, req.userId]);
    if (habitResult.rows.length === 0) return res.status(404).json({ error: 'Habit not found' });

    const habit = habitResult.rows[0];
    let completionPercent = 0;

    if (habit.type === 'numeric') {
      completionPercent = Math.min((value / habit.goal_value) * 100, 100);
    } else {
      completionPercent = completed ? 100 : 0;
    }

    const result = await pool.query(
      `INSERT INTO habit_logs (habit_id, log_date, value, completed, completion_percent)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (habit_id, log_date)
       DO UPDATE SET value=$3, completed=$4, completion_percent=$5
       RETURNING *`,
      [habitId, log_date, value || null, completed || null, completionPercent]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all logs for a habit
router.get('/:id/logs', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT hl.* FROM habit_logs hl
       JOIN habits h ON hl.habit_id = h.id
       WHERE hl.habit_id=$1 AND h.user_id=$2
       ORDER BY hl.log_date DESC`,
      [req.params.id, req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;