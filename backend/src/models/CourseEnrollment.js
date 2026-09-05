const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CourseEnrollment = sequelize.define('CourseEnrollment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'dropped'),
    defaultValue: 'active'
  },
  enrolled_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'course_enrollments',
  indexes: [
    {
      unique: true,
      fields: ['course_id', 'student_id']
    }
  ]
});

module.exports = CourseEnrollment;
