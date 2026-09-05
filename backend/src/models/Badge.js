const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Badge = sequelize.define('Badge', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING(50),
    defaultValue: 'TrophyOutlined'
  },
  color: {
    type: DataTypes.STRING(30),
    defaultValue: '#f59e0b'
  },
  criteria_type: {
    type: DataTypes.STRING(50),
    defaultValue: 'perfect_score'
  }
}, {
  tableName: 'badges'
});

module.exports = Badge;
