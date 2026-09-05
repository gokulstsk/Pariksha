const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Assignment = sequelize.define('Assignment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  max_points: {
    type: DataTypes.FLOAT,
    defaultValue: 100.0,
    allowNull: false
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rubric_criteria: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of criteria: [{ title, max_points, description }]'
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'assignments'
});

module.exports = Assignment;
