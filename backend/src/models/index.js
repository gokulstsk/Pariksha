const { sequelize } = require('../config/database');
const User = require('./User');
const Course = require('./Course');
const CourseEnrollment = require('./CourseEnrollment');
const QuestionCategory = require('./QuestionCategory');
const Test = require('./Test');
const Question = require('./Question');
const Option = require('./Option');
const Submission = require('./Submission');
const SubmissionAnswer = require('./SubmissionAnswer');
const Assignment = require('./Assignment');
const AssignmentSubmission = require('./AssignmentSubmission');
const Certificate = require('./Certificate');
const Badge = require('./Badge');
const UserBadge = require('./UserBadge');
const Announcement = require('./Announcement');
const ForumTopic = require('./ForumTopic');
const ForumPost = require('./ForumPost');
const Notification = require('./Notification');

// --- User Associations ---
User.hasMany(Course, { foreignKey: 'instructor_id', as: 'instructedCourses', onDelete: 'CASCADE' });
Course.belongsTo(User, { foreignKey: 'instructor_id', as: 'instructor' });

User.hasMany(CourseEnrollment, { foreignKey: 'student_id', as: 'enrollments', onDelete: 'CASCADE' });
CourseEnrollment.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

Course.hasMany(CourseEnrollment, { foreignKey: 'course_id', as: 'enrollments', onDelete: 'CASCADE' });
CourseEnrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

User.hasMany(Test, { foreignKey: 'created_by', as: 'createdTests', onDelete: 'CASCADE' });
Test.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Course.hasMany(Test, { foreignKey: 'course_id', as: 'tests', onDelete: 'SET NULL' });
Test.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// --- Question Bank & Category Associations ---
User.hasMany(QuestionCategory, { foreignKey: 'teacher_id', as: 'categories', onDelete: 'CASCADE' });
QuestionCategory.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });

QuestionCategory.hasMany(Question, { foreignKey: 'category_id', as: 'questions', onDelete: 'SET NULL' });
Question.belongsTo(QuestionCategory, { foreignKey: 'category_id', as: 'category' });

User.hasMany(Question, { foreignKey: 'created_by', as: 'authoredQuestions', onDelete: 'SET NULL' });
Question.belongsTo(User, { foreignKey: 'created_by', as: 'author' });

// --- Test & Question Associations ---
Test.hasMany(Question, { foreignKey: 'test_id', as: 'questions', onDelete: 'CASCADE' });
Question.belongsTo(Test, { foreignKey: 'test_id', as: 'test' });

Question.hasMany(Option, { foreignKey: 'question_id', as: 'options', onDelete: 'CASCADE' });
Option.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

// --- Submissions Associations ---
User.hasMany(Submission, { foreignKey: 'student_id', as: 'submissions', onDelete: 'CASCADE' });
Submission.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

Test.hasMany(Submission, { foreignKey: 'test_id', as: 'submissions', onDelete: 'CASCADE' });
Submission.belongsTo(Test, { foreignKey: 'test_id', as: 'test' });

Submission.hasMany(SubmissionAnswer, { foreignKey: 'submission_id', as: 'answers', onDelete: 'CASCADE' });
SubmissionAnswer.belongsTo(Submission, { foreignKey: 'submission_id', as: 'submission' });

Question.hasMany(SubmissionAnswer, { foreignKey: 'question_id', as: 'submissionAnswers', onDelete: 'CASCADE' });
SubmissionAnswer.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

// --- Assignment Associations ---
Course.hasMany(Assignment, { foreignKey: 'course_id', as: 'assignments', onDelete: 'CASCADE' });
Assignment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

User.hasMany(Assignment, { foreignKey: 'created_by', as: 'createdAssignments', onDelete: 'CASCADE' });
Assignment.belongsTo(User, { foreignKey: 'created_by', as: 'author' });

Assignment.hasMany(AssignmentSubmission, { foreignKey: 'assignment_id', as: 'submissions', onDelete: 'CASCADE' });
AssignmentSubmission.belongsTo(Assignment, { foreignKey: 'assignment_id', as: 'assignment' });

User.hasMany(AssignmentSubmission, { foreignKey: 'student_id', as: 'assignmentSubmissions', onDelete: 'CASCADE' });
AssignmentSubmission.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// --- Certificate & Badge Associations ---
User.hasMany(Certificate, { foreignKey: 'student_id', as: 'certificates', onDelete: 'CASCADE' });
Certificate.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

Test.hasMany(Certificate, { foreignKey: 'test_id', as: 'certificates', onDelete: 'SET NULL' });
Certificate.belongsTo(Test, { foreignKey: 'test_id', as: 'test' });

User.hasMany(UserBadge, { foreignKey: 'user_id', as: 'earnedBadges', onDelete: 'CASCADE' });
UserBadge.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Badge.hasMany(UserBadge, { foreignKey: 'badge_id', as: 'awards', onDelete: 'CASCADE' });
UserBadge.belongsTo(Badge, { foreignKey: 'badge_id', as: 'badge' });

// --- Announcements & Forums ---
Course.hasMany(Announcement, { foreignKey: 'course_id', as: 'announcements', onDelete: 'CASCADE' });
Announcement.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

User.hasMany(Announcement, { foreignKey: 'created_by', as: 'authoredAnnouncements', onDelete: 'CASCADE' });
Announcement.belongsTo(User, { foreignKey: 'created_by', as: 'author' });

Course.hasMany(ForumTopic, { foreignKey: 'course_id', as: 'forumTopics', onDelete: 'CASCADE' });
ForumTopic.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

User.hasMany(ForumTopic, { foreignKey: 'author_id', as: 'forumTopics', onDelete: 'CASCADE' });
ForumTopic.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

ForumTopic.hasMany(ForumPost, { foreignKey: 'topic_id', as: 'posts', onDelete: 'CASCADE' });
ForumPost.belongsTo(ForumTopic, { foreignKey: 'topic_id', as: 'topic' });

User.hasMany(ForumPost, { foreignKey: 'author_id', as: 'forumPosts', onDelete: 'CASCADE' });
ForumPost.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// --- Notifications ---
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Course,
  CourseEnrollment,
  QuestionCategory,
  Test,
  Question,
  Option,
  Submission,
  SubmissionAnswer,
  Assignment,
  AssignmentSubmission,
  Certificate,
  Badge,
  UserBadge,
  Announcement,
  ForumTopic,
  ForumPost,
  Notification
};
