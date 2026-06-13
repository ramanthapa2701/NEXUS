const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');

// GET ALL TASKS
router.get('/', auth, async (req, res) => {
  try {
    const records = await Goal.findAll({ 
      where: { userId: req.user.userId } 
    });
    res.json(records);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Database read error' });
  }
});

// CREATE A FRESH TASK
router.post('/', auth, async (req, res) => {
  try {
    const { text, type, target, unit, assignedDays } = req.body;

    const newRow = await Goal.create({
      userId: req.user.userId,
      text,
      type,
      target: type === 'checkbox' ? 0 : parseFloat(target) || 0,
      unit: type === 'checkbox' ? '' : unit,
      assignedDays
    });

    res.status(201).json(newRow);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Database write error' });
  }
});

// UPDATE TASK METRICS
router.patch('/:id', auth, async (req, res) => {
  try {
    const targetRow = await Goal.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!targetRow) {
      return res.status(404).json({ error: 'Record missing' });
    }

    if (req.body.current !== undefined) targetRow.current = req.body.current;
    if (req.body.completed !== undefined) targetRow.completed = req.body.completed;

    await targetRow.save();
    res.json(targetRow);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Database update error' });
  }
});

// DELETE ROUTE
router.delete('/:id', auth, async (req, res) => {
  try {
    const droppedCount = await Goal.destroy({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (droppedCount === 0) {
      return res.status(404).json({ error: 'Record missing' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Database deletion error' });
  }
});

module.exports = router;