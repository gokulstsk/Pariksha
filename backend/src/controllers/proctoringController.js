const { Submission, Test, User, sequelize } = require('../models');

// Live active test attempts monitor (Teacher view)
exports.getLiveTestSession = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findOne({
      where: { id: testId, created_by: req.user.id }
    });

    if (!test) {
      return res.status(404).json({ message: 'Test not found or unauthorized.' });
    }

    const submissions = await Submission.findAll({
      where: { test_id: testId },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] }
      ],
      order: [['started_at', 'DESC']]
    });

    return res.json({
      test: {
        id: test.id,
        title: test.title,
        duration_minutes: test.duration_minutes,
        enable_proctoring: test.enable_proctoring,
        max_proctoring_violations: test.max_proctoring_violations
      },
      sessions: submissions
    });
  } catch (error) {
    console.error('Error fetching live proctoring session:', error);
    return res.status(500).json({ message: 'Failed to fetch live sessions.', error: error.message });
  }
};

// Log Proctoring Violation (Focus Loss / Tab Switch from Student)
exports.logProctoringViolation = async (req, res) => {
  try {
    const { testId } = req.params;
    const { violation_type, details } = req.body;
    const studentId = req.user.id;

    // Find active submission or create/update in-progress record
    let submission = await Submission.findOne({
      where: { test_id: testId, student_id: studentId, status: 'in_progress' }
    });

    if (!submission) {
      // Find latest submission
      submission = await Submission.findOne({
        where: { test_id: testId, student_id: studentId },
        order: [['createdAt', 'DESC']]
      });
    }

    if (submission) {
      const logs = submission.proctoring_logs || [];
      logs.push({
        timestamp: new Date().toISOString(),
        type: violation_type || 'tab_switch',
        details: details || 'Window blur / tab changed'
      });

      const count = (submission.proctoring_violations_count || 0) + 1;
      await submission.update({
        proctoring_violations_count: count,
        proctoring_logs: logs
      });

      return res.json({
        message: 'Violation recorded.',
        current_violations_count: count
      });
    }

    return res.json({ message: 'No active submission found to attach violation.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to log proctoring violation.' });
  }
};

// Teacher Grant Extra Time to Student (+5m, +10m)
exports.grantExtraTime = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { extra_minutes } = req.body;

    const submission = await Submission.findByPk(submissionId, {
      include: [{ model: Test, as: 'test' }]
    });

    if (!submission || submission.test.created_by !== req.user.id) {
      return res.status(404).json({ message: 'Submission not found or unauthorized.' });
    }

    const newExtra = (submission.extra_time_minutes || 0) + (Number(extra_minutes) || 5);
    await submission.update({ extra_time_minutes: newExtra });

    return res.json({
      message: `Granted +${extra_minutes} minutes extra time to student.`,
      submission
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to grant extra time.' });
  }
};

// Teacher Force Submit / Disqualify Student Attempt
exports.forceSubmitSession = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { disqualify } = req.body;

    const submission = await Submission.findByPk(submissionId, {
      include: [{ model: Test, as: 'test' }]
    });

    if (!submission || submission.test.created_by !== req.user.id) {
      return res.status(404).json({ message: 'Submission not found or unauthorized.' });
    }

    await submission.update({
      status: disqualify ? 'disqualified' : 'completed',
      submitted_at: new Date()
    });

    return res.json({
      message: disqualify ? 'Exam disqualified due to integrity breaches.' : 'Exam marked as completed.',
      submission
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to force submit session.' });
  }
};
