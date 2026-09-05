const { User, Test, Submission, SubmissionAnswer, Assignment, AssignmentSubmission, Course } = require('../models');

// Unified Gradebook Overview (Teacher view)
exports.getGradebookOverview = async (req, res) => {
  try {
    const { course_id } = req.query;

    const testWhere = { created_by: req.user.id };
    const assignmentWhere = { created_by: req.user.id };

    if (course_id) {
      testWhere.course_id = course_id;
      assignmentWhere.course_id = course_id;
    }

    const [tests, assignments, students] = await Promise.all([
      Test.findAll({
        where: testWhere,
        attributes: ['id', 'title', 'pass_percentage', 'duration_minutes', 'category']
      }),
      Assignment.findAll({
        where: assignmentWhere,
        attributes: ['id', 'title', 'max_points']
      }),
      User.findAll({
        where: { role: 'student' },
        attributes: ['id', 'name', 'email']
      })
    ]);

    const testIds = tests.map((t) => t.id);
    const assignmentIds = assignments.map((a) => a.id);

    const [testSubmissions, assignmentSubmissions] = await Promise.all([
      Submission.findAll({
        where: { test_id: testIds },
        attributes: ['id', 'test_id', 'student_id', 'percentage', 'score_obtained', 'max_score', 'is_passed', 'submitted_at']
      }),
      AssignmentSubmission.findAll({
        where: { assignment_id: assignmentIds },
        attributes: ['id', 'assignment_id', 'student_id', 'score_obtained', 'status', 'submitted_at']
      })
    ]);

    // Build Gradebook matrix per student
    const studentGrades = students.map((student) => {
      const myTestSubs = testSubmissions.filter((s) => s.student_id === student.id);
      const myAssgnSubs = assignmentSubmissions.filter((s) => s.student_id === student.id);

      const testScores = {};
      tests.forEach((t) => {
        const sub = myTestSubs.find((s) => s.test_id === t.id);
        testScores[t.id] = sub ? { score: sub.score_obtained, max: sub.max_score, percentage: sub.percentage, is_passed: sub.is_passed, submissionId: sub.id } : null;
      });

      const assignmentScores = {};
      assignments.forEach((a) => {
        const sub = myAssgnSubs.find((s) => s.assignment_id === a.id);
        assignmentScores[a.id] = sub ? { score: sub.score_obtained, status: sub.status, submissionId: sub.id } : null;
      });

      // Overall average
      const scoredPercentages = myTestSubs.map((s) => s.percentage);
      const avgPercentage = scoredPercentages.length > 0
        ? Math.round((scoredPercentages.reduce((a, b) => a + b, 0) / scoredPercentages.length) * 10) / 10
        : 0;

      // Calculate GPA (4.0 scale)
      let gpa = 0.0;
      if (avgPercentage >= 90) gpa = 4.0;
      else if (avgPercentage >= 80) gpa = 3.5;
      else if (avgPercentage >= 70) gpa = 3.0;
      else if (avgPercentage >= 60) gpa = 2.5;
      else if (avgPercentage >= 50) gpa = 2.0;
      else if (avgPercentage > 0) gpa = 1.0;

      return {
        student: {
          id: student.id,
          name: student.name,
          email: student.email
        },
        tests: testScores,
        assignments: assignmentScores,
        testsAttempted: myTestSubs.length,
        assignmentsSubmitted: myAssgnSubs.length,
        averagePercentage: avgPercentage,
        gpa
      };
    });

    return res.json({
      tests,
      assignments,
      gradebook: studentGrades
    });
  } catch (error) {
    console.error('Error fetching gradebook:', error);
    return res.status(500).json({ message: 'Failed to fetch gradebook.', error: error.message });
  }
};

// Manual Grading of an Essay or Question inside a Submission
exports.gradeSubmissionAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { points_awarded, is_correct, teacher_comment } = req.body;

    const answer = await SubmissionAnswer.findByPk(answerId, {
      include: [{ model: Submission, as: 'submission' }]
    });

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found.' });
    }

    await answer.update({
      points_awarded: Number(points_awarded),
      is_correct: is_correct !== undefined ? !!is_correct : answer.is_correct,
      teacher_comment: teacher_comment || ''
    });

    // Recalculate Submission Total
    const allAnswers = await SubmissionAnswer.findAll({
      where: { submission_id: answer.submission_id }
    });

    const totalScore = allAnswers.reduce((sum, a) => sum + (a.points_awarded || 0), 0);
    const correctCount = allAnswers.filter((a) => a.is_correct).length;
    const maxScore = answer.submission.max_score;
    const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100 * 10) / 10 : 0;

    await answer.submission.update({
      score_obtained: totalScore,
      correct_answers_count: correctCount,
      percentage: pct,
      is_passed: pct >= 50,
      is_manually_graded: true
    });

    return res.json({
      message: 'Grade updated successfully.',
      answer,
      updated_submission_score: totalScore,
      percentage: pct
    });
  } catch (error) {
    console.error('Error grading answer:', error);
    return res.status(500).json({ message: 'Failed to update answer grade.', error: error.message });
  }
};

// Export Gradebook as CSV string
exports.exportGradebookCSV = async (req, res) => {
  try {
    const [tests, assignments, students, testSubs, assgnSubs] = await Promise.all([
      Test.findAll({ where: { created_by: req.user.id } }),
      Assignment.findAll({ where: { created_by: req.user.id } }),
      User.findAll({ where: { role: 'student' } }),
      Submission.findAll(),
      AssignmentSubmission.findAll()
    ]);

    // Construct CSV header
    const headers = ['Student ID', 'Student Name', 'Email'];
    tests.forEach((t) => headers.push(`Test: ${t.title} (%)`));
    assignments.forEach((a) => headers.push(`Assignment: ${a.title} (Score)`));
    headers.push('Average Score (%)', 'GPA');

    const rows = [headers.join(',')];

    students.forEach((student) => {
      const row = [student.id, `"${student.name}"`, student.email];

      const myTestSubs = testSubs.filter((s) => s.student_id === student.id);
      const myAssgnSubs = assgnSubs.filter((s) => s.student_id === student.id);

      tests.forEach((t) => {
        const sub = myTestSubs.find((s) => s.test_id === t.id);
        row.push(sub ? sub.percentage : 'N/A');
      });

      assignments.forEach((a) => {
        const sub = myAssgnSubs.find((s) => s.assignment_id === a.id);
        row.push(sub && sub.score_obtained !== null ? sub.score_obtained : 'N/A');
      });

      const scoredPercentages = myTestSubs.map((s) => s.percentage);
      const avg = scoredPercentages.length > 0
        ? Math.round((scoredPercentages.reduce((a, b) => a + b, 0) / scoredPercentages.length) * 10) / 10
        : 0;
      let gpa = avg >= 90 ? '4.0' : avg >= 80 ? '3.5' : avg >= 70 ? '3.0' : avg >= 60 ? '2.5' : avg >= 50 ? '2.0' : '0.0';

      row.push(avg, gpa);
      rows.push(row.join(','));
    });

    const csvContent = rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="moodle_gradebook_export.csv"');
    return res.send(csvContent);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to export gradebook CSV.' });
  }
};
