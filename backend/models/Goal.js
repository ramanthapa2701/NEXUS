const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Goal = sequelize.define('Goal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('checkbox', 'quantity', 'time'),
    allowNull: false
  },
  target: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  current: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  assignedDays: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'Goals'
});

module.exports = Goal;