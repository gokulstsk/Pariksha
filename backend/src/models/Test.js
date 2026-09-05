const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Test = sequelize.define('Test', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Associated Course ID'
  },
  title: {
    type: DataTypes.STRING(200),
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
  duration_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    allowNull: false
  },
  pass_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    allowNull: false
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  category: {
    type: DataTypes.STRING(100),
    defaultValue: 'General'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  shuffle_questions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  allow_review: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Advanced Moodle Quiz Settings
  max_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '1, 2, 3, or 0 for unlimited'
  },
  grading_method: {
    type: DataTypes.ENUM('highest', 'average', 'latest', 'first'),
    defaultValue: 'highest'
  },
  access_password: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Password required to start exam'
  },
  open_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Scheduled start time window'
  },
  close_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Scheduled end time window'
  },
  enable_proctoring: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Detect tab-switches and fullscreen loss'
  },
  max_proctoring_violations: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    comment: 'Max allowed focus loss warnings before auto-flagging'
  }
}, {
  tableName: 'tests'
});

module.exports = Test;
