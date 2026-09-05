const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ForumTopic = sequelize.define('ForumTopic', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  test_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category_tag: {
    type: DataTypes.STRING(50),
    defaultValue: 'General Discussion'
  },
  is_pinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_solved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  upvotes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'forum_topics'
});

module.exports = ForumTopic;
