const { Test, Question, Submission, User, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getTeacherDashboardStats = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Get all tests created by teacher
    const tests = await Test.findAll({
      where: { created_by: teacherId },
      include: [
        {
          model: Question,
          as: 'questions',
          attributes: ['id']
        },
        {
          model: Submission,
          as: 'submissions',
          attributes: ['id', 'score_obtained', 'max_score', 'percentage', 'is_passed', 'time_taken_seconds', 'submitted_at'],
          include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }]
        }
      ]
    });

    const totalTests = tests.length;
    const publishedTests = tests.filter((t) => t.is_published).length;
    const draftTests = totalTests - publishedTests;

    let totalQuestions = 0;
    let totalSubmissions = 0;
    let totalPassed = 0;
    let sumPercentage = 0;
    const allSubmissions = [];

    tests.forEach((test) => {
      totalQuestions += (test.questions || []).length;
      const subs = test.submissions || [];
      totalSubmissions += subs.length;
      subs.forEach((sub) => {
        if (sub.is_passed) totalPassed++;
        sumPercentage += sub.percentage || 0;
        allSubmissions.push({
          id: sub.id,
          testId: test.id,
          testTitle: test.title,
          studentName: sub.student ? sub.student.name : 'Unknown Student',
          studentEmail: sub.student ? sub.student.email : '',
          percentage: sub.percentage,
          isPassed: sub.is_passed,
          scoreObtained: sub.score_obtained,
          maxScore: sub.max_score,
          timeTakenSeconds: sub.time_taken_seconds,
          submittedAt: sub.submitted_at
        });
      });
    });

    const overallPassRate = totalSubmissions > 0 ? Math.round((totalPassed / totalSubmissions) * 100) : 0;
    const averageScore = totalSubmissions > 0 ? Math.round((sumPercentage / totalSubmissions) * 10) / 10 : 0;

    // Recent submissions sorted by submittedAt DESC
    allSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    const recentSubmissions = allSubmissions.slice(0, 5);

    // Performance distribution (0-40, 41-60, 61-80, 81-100)
    const scoreBuckets = {
      '0-49%': 0,
      '50-69%': 0,
      '70-84%': 0,
      '85-100%': 0
    };

    allSubmissions.forEach((s) => {
      const p = s.percentage || 0;
      if (p < 50) scoreBuckets['0-49%']++;
      else if (p < 70) scoreBuckets['50-69%']++;
      else if (p < 85) scoreBuckets['70-84%']++;
      else scoreBuckets['85-100%']++;
    });

    return res.json({
      stats: {
        totalTests,
        publishedTests,
        draftTests,
        totalQuestions,
        totalSubmissions,
        overallPassRate,
        averageScore,
        recentSubmissions,
        scoreDistribution: scoreBuckets
      }
    });
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    return res.status(500).json({ message: 'Failed to fetch analytics.', error: error.message });
  }
};
