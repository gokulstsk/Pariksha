const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  test_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Null if saved exclusively in Question Bank'
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Link to QuestionCategory in Question Bank'
  },
  is_in_bank: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Teacher who authored the question'
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'medium'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of string tags e.g. ["ES6", "Async"]'
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  question_type: {
    type: DataTypes.ENUM(
      'single_choice',
      'multiple_choice',
      'true_false',
      'short_answer',
      'matching',
      'numerical',
      'cloze',
      'essay',
      'ordering'
    ),
    defaultValue: 'single_choice',
    allowNull: false
  },
  points: {
    type: DataTypes.FLOAT,
    defaultValue: 1.0,
    allowNull: false
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  correct_answer_text: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'For short_answer questions'
  },
  matching_pairs: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of [{ id, left, right }] for matching questions'
  },
  numerical_answer: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Target number for numerical questions'
  },
  tolerance: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
    comment: 'Acceptable margin +/- delta for numerical answers'
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Unit e.g. "ms", "MB", "kg"'
  },
  cloze_template: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Passage with embedded [blank_1], [blank_2] markers'
  },
  cloze_answers: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Object of key-values { blank_1: "answer1", blank_2: "answer2" }'
  },
  rubric_criteria: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Rubric criteria for essay grading'
  },
  order_items: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of strings in correct chronological order'
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'questions'
});

module.exports = Question;
