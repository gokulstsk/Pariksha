const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuestionCategory = sequelize.define('QuestionCategory', {
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
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(20),
    defaultValue: '#4f46e5'
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'question_categories'
});

module.exports = QuestionCategory;
