const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ForumPost = sequelize.define('ForumPost', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  topic_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_accepted_answer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  upvotes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'forum_posts'
});

module.exports = ForumPost;
