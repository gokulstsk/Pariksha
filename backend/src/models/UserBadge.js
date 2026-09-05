const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserBadge = sequelize.define('UserBadge', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  badge_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  earned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'user_badges',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'badge_id']
    }
  ]
});

module.exports = UserBadge;
