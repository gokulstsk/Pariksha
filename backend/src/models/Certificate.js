const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  certificate_code: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  test_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  score_percentage: {
    type: DataTypes.FLOAT,
    defaultValue: 100.0
  },
  issue_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  instructor_name: {
    type: DataTypes.STRING(150),
    defaultValue: 'Academic Director'
  }
}, {
  tableName: 'certificates'
});

module.exports = Certificate;
