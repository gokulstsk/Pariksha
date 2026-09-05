const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  test_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  attempt_number: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  total_questions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  correct_answers_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  score_obtained: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  max_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  percentage: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  is_passed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  time_taken_seconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'completed', 'disqualified'),
    defaultValue: 'completed'
  },
  is_manually_graded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  proctoring_violations_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  proctoring_logs: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of [{ timestamp, type, detail }]'
  },
  extra_time_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  started_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  submitted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'submissions'
});

module.exports = Submission;
