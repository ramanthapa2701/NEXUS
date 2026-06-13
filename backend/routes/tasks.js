const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY id DESC', [req.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, priority, status, deadline } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (user_id, name, priority, status, deadline) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.userId, name, priority || 'Medium', status || 'Pending', deadline || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, priority, status, deadline } = req.body;
    const result = await pool.query(
      'UPDATE tasks SET name=$1, priority=$2, status=$3, deadline=$4 WHERE id=$5 AND user_id=$6 RETURNING *',
      [name, priority, status, deadline, req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id=$1 AND user_id=$2 RETURNING *', [req.params.id, req.userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;