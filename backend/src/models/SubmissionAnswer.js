const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SubmissionAnswer = sequelize.define('SubmissionAnswer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  submission_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  selected_option_ids: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of option IDs for single/multi/true_false'
  },
  text_answer: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'For short_answer'
  },
  matching_answers: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Object of { [leftItemId]: selectedRightOption }'
  },
  numerical_answer: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Student numerical input'
  },
  cloze_answers: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Object of { [blankKey]: studentAnswerText }'
  },
  essay_answer: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Long text essay response'
  },
  ordering_answer: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of ordered items submitted by student'
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  points_awarded: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  teacher_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Teacher feedback on essay/manual grading'
  }
}, {
  tableName: 'submission_answers'
});

module.exports = SubmissionAnswer;
