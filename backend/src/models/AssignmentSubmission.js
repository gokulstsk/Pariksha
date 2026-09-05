const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AssignmentSubmission = sequelize.define('AssignmentSubmission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  assignment_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  submission_text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attachment_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  attachment_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  score_obtained: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  teacher_feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rubric_scores: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array or Object with points awarded per criterion'
  },
  status: {
    type: DataTypes.ENUM('submitted', 'graded', 'resubmission_requested'),
    defaultValue: 'submitted'
  },
  submitted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  graded_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  graded_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'assignment_submissions',
  indexes: [
    {
      unique: true,
      fields: ['assignment_id', 'student_id']
    }
  ]
});

module.exports = AssignmentSubmission;
