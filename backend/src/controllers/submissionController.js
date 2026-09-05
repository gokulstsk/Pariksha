const {
  Submission,
  SubmissionAnswer,
  Test,
  Question,
  Option,
  User,
  Certificate,
  Badge,
  UserBadge,
  Notification,
  sequelize
} = require('../models');

// Submit an assessment & calculate score with support for all 9 question types
exports.submitTest = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { testId } = req.params;
    const { answers, time_taken_seconds, started_at, proctoring_violations_count, proctoring_logs } = req.body;
    const studentId = req.user.id;

    const test = await Test.findByPk(testId, {
      include: [
        {
          model: Question,
          as: 'questions',
          include: [{ model: Option, as: 'options' }]
        }
      ]
    });

    if (!test) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Test not found.' });
    }

    if (!test.is_published && req.user.role !== 'teacher') {
      await transaction.rollback();
      return res.status(403).json({ message: 'This test is no longer accepting submissions.' });
    }

    // Check attempt limits
    const existingSubmissions = await Submission.count({
      where: { test_id: testId, student_id: studentId }
    });

    const attemptNumber = existingSubmissions + 1;
    if (test.max_attempts > 0 && attemptNumber > test.max_attempts && req.user.role !== 'teacher') {
      await transaction.rollback();
      return res.status(403).json({
        message: `Maximum attempts reached (${test.max_attempts} attempt${test.max_attempts > 1 ? 's' : ''} allowed).`
      });
    }

    // Answers mapping by question_id
    const answersMap = new Map();
    if (Array.isArray(answers)) {
      answers.forEach((ans) => {
        answersMap.set(ans.question_id, ans);
      });
    }

    let totalQuestions = test.questions.length;
    let correctAnswersCount = 0;
    let scoreObtained = 0;
    let maxScore = 0;
    let hasEssay = false;

    const submissionAnswersData = [];

    for (const question of test.questions) {
      const qPoints = question.points || 1;
      maxScore += qPoints;

      const studentAns = answersMap.get(question.id);
      let isCorrect = false;
      let pointsAwarded = 0;

      if (studentAns) {
        // 1. Single Choice & True/False
        if (question.question_type === 'single_choice' || question.question_type === 'true_false') {
          const selectedOptionId = Array.isArray(studentAns.selected_option_ids)
            ? studentAns.selected_option_ids[0]
            : studentAns.selected_option_id;

          const correctOption = (question.options || []).find((opt) => opt.is_correct);
          if (correctOption && selectedOptionId && Number(selectedOptionId) === Number(correctOption.id)) {
            isCorrect = true;
            pointsAwarded = qPoints;
            correctAnswersCount++;
          }
        }
        // 2. Multiple Choice
        else if (question.question_type === 'multiple_choice') {
          const selectedIds = (studentAns.selected_option_ids || []).map(Number).sort();
          const correctIds = (question.options || []).filter((opt) => opt.is_correct).map((opt) => opt.id).sort();

          const isExactMatch =
            selectedIds.length === correctIds.length &&
            selectedIds.every((val, index) => val === correctIds[index]);

          if (isExactMatch && correctIds.length > 0) {
            isCorrect = true;
            pointsAwarded = qPoints;
            correctAnswersCount++;
          }
        }
        // 3. Short Answer
        else if (question.question_type === 'short_answer') {
          const studentText = (studentAns.text_answer || '').trim().toLowerCase();
          const correctText = (question.correct_answer_text || '').trim().toLowerCase();

          if (studentText && correctText && studentText === correctText) {
            isCorrect = true;
            pointsAwarded = qPoints;
            correctAnswersCount++;
          }
        }
        // 4. Matching Question
        else if (question.question_type === 'matching') {
          const studentPairs = studentAns.matching_answers || {};
          const correctPairs = question.matching_pairs || [];

          if (correctPairs.length > 0) {
            let matches = 0;
            correctPairs.forEach((pair) => {
              if (studentPairs[pair.id] && String(studentPairs[pair.id]).trim().toLowerCase() === String(pair.right).trim().toLowerCase()) {
                matches++;
              }
            });

            if (matches === correctPairs.length) {
              isCorrect = true;
              pointsAwarded = qPoints;
              correctAnswersCount++;
            } else if (matches > 0) {
              // Partial credit
              pointsAwarded = Math.round((matches / correctPairs.length) * qPoints * 10) / 10;
            }
          }
        }
        // 5. Numerical Question with Tolerance
        else if (question.question_type === 'numerical') {
          const numInput = Number(studentAns.numerical_answer);
          const target = Number(question.numerical_answer);
          const tol = Number(question.tolerance) || 0;

          if (!isNaN(numInput) && !isNaN(target)) {
            if (Math.abs(numInput - target) <= tol) {
              isCorrect = true;
              pointsAwarded = qPoints;
              correctAnswersCount++;
            }
          }
        }
        // 6. Cloze / Fill in the Blanks
        else if (question.question_type === 'cloze') {
          const studentBlanks = studentAns.cloze_answers || {};
          const correctBlanks = question.cloze_answers || {};
          const keys = Object.keys(correctBlanks);

          if (keys.length > 0) {
            let correctBlanksCount = 0;
            keys.forEach((k) => {
              const sVal = (studentBlanks[k] || '').trim().toLowerCase();
              const cVal = String(correctBlanks[k] || '').trim().toLowerCase();
              if (sVal === cVal) correctBlanksCount++;
            });

            if (correctBlanksCount === keys.length) {
              isCorrect = true;
              pointsAwarded = qPoints;
              correctAnswersCount++;
            } else if (correctBlanksCount > 0) {
              pointsAwarded = Math.round((correctBlanksCount / keys.length) * qPoints * 10) / 10;
            }
          }
        }
        // 7. Ordering / Sequence
        else if (question.question_type === 'ordering') {
          const studentOrder = studentAns.ordering_answer || [];
          const correctOrder = question.order_items || [];

          if (correctOrder.length > 0 && studentOrder.length === correctOrder.length) {
            const isMatch = studentOrder.every((item, idx) => item === correctOrder[idx]);
            if (isMatch) {
              isCorrect = true;
              pointsAwarded = qPoints;
              correctAnswersCount++;
            }
          }
        }
        // 8. Essay / Long Answer (Requires manual teacher grading)
        else if (question.question_type === 'essay') {
          hasEssay = true;
          pointsAwarded = 0; // Graded manually
        }
      }

      scoreObtained += pointsAwarded;

      submissionAnswersData.push({
        question_id: question.id,
        selected_option_ids: studentAns?.selected_option_ids || (studentAns?.selected_option_id ? [studentAns.selected_option_id] : []),
        text_answer: studentAns?.text_answer || '',
        matching_answers: studentAns?.matching_answers || null,
        numerical_answer: studentAns?.numerical_answer !== undefined ? Number(studentAns.numerical_answer) : null,
        cloze_answers: studentAns?.cloze_answers || null,
        essay_answer: studentAns?.essay_answer || '',
        ordering_answer: studentAns?.ordering_answer || null,
        is_correct: isCorrect,
        points_awarded: pointsAwarded
      });
    }

    const percentage = maxScore > 0 ? Math.round((scoreObtained / maxScore) * 100 * 10) / 10 : 0;
    const isPassed = percentage >= test.pass_percentage;

    const submission = await Submission.create(
      {
        test_id: test.id,
        student_id: studentId,
        attempt_number: attemptNumber,
        total_questions: totalQuestions,
        correct_answers_count: correctAnswersCount,
        score_obtained: scoreObtained,
        max_score: maxScore,
        percentage: percentage,
        is_passed: isPassed,
        time_taken_seconds: time_taken_seconds || 0,
        status: 'completed',
        is_manually_graded: !hasEssay,
        proctoring_violations_count: proctoring_violations_count || 0,
        proctoring_logs: proctoring_logs || [],
        started_at: started_at || new Date(),
        submitted_at: new Date()
      },
      { transaction }
    );

    const answersToCreate = submissionAnswersData.map((ans) => ({
      ...ans,
      submission_id: submission.id
    }));

    await SubmissionAnswer.bulkCreate(answersToCreate, { transaction });

    // Auto-generate Certificate of Completion if Passed
    let certificate = null;
    if (isPassed) {
      const code = `CERT-${test.id}-${studentId}-${Date.now().toString(36).toUpperCase()}`;
      certificate = await Certificate.create(
        {
          certificate_code: code,
          student_id: studentId,
          test_id: test.id,
          course_id: test.course_id || null,
          title: `Certificate of Achievement in ${test.title}`,
          score_percentage: percentage,
          issue_date: new Date()
        },
        { transaction }
      );
    }

    // Auto-award Gamification Badges
    const badgeAwards = [];
    if (percentage === 100) {
      const perfectBadge = await Badge.findOne({ where: { criteria_type: 'perfect_score' } });
      if (perfectBadge) {
        await UserBadge.findOrCreate({
          where: { user_id: studentId, badge_id: perfectBadge.id },
          defaults: { reason: `Scored 100% on ${test.title}` },
          transaction
        });
        badgeAwards.push(perfectBadge.name);
      }
    }

    if (attemptNumber === 1 && isPassed) {
      const firstAceBadge = await Badge.findOne({ where: { criteria_type: 'first_attempt_pass' } });
      if (firstAceBadge) {
        await UserBadge.findOrCreate({
          where: { user_id: studentId, badge_id: firstAceBadge.id },
          defaults: { reason: `Passed ${test.title} on first attempt` },
          transaction
        });
        badgeAwards.push(firstAceBadge.name);
      }
    }

    // In-App Notification
    await Notification.create(
      {
        user_id: studentId,
        title: `Exam Graded: ${test.title}`,
        message: `You scored ${scoreObtained}/${maxScore} (${percentage}%). ${isPassed ? 'Congratulations on passing!' : 'Keep practicing!'}`,
        type: 'grade',
        link_url: `/student/result/${submission.id}`
      },
      { transaction }
    );

    await transaction.commit();

    // Fetch full submission report
    const fullSubmission = await Submission.findByPk(submission.id, {
      include: [
        {
          model: Test,
          as: 'test',
          attributes: ['id', 'title', 'pass_percentage', 'allow_review', 'category']
        },
        {
          model: SubmissionAnswer,
          as: 'answers',
          include: [
            {
              model: Question,
              as: 'question',
              include: [{ model: Option, as: 'options' }]
            }
          ]
        }
      ]
    });

    return res.status(201).json({
      message: 'Assessment submitted and graded successfully.',
      submission: fullSubmission,
      certificate,
      badges_earned: badgeAwards
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error submitting test:', error);
    return res.status(500).json({ message: 'Failed to submit test.', error: error.message });
  }
};

// Get single submission details
exports.getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const isTeacher = req.user.role === 'teacher';

    const submission = await Submission.findByPk(id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Test,
          as: 'test',
          include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }]
        },
        {
          model: SubmissionAnswer,
          as: 'answers',
          include: [
            {
              model: Question,
              as: 'question',
              include: [{ model: Option, as: 'options' }]
            }
          ]
        }
      ]
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    if (!isTeacher && submission.student_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to view this submission.' });
    }

    return res.json({ submission });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return res.status(500).json({ message: 'Failed to fetch submission details.', error: error.message });
  }
};

// Get all submissions for a test (Teacher view)
exports.getTestSubmissions = async (req, res) => {
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
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['submitted_at', 'DESC']]
    });

    return res.json({
      test: {
        id: test.id,
        title: test.title,
        pass_percentage: test.pass_percentage
      },
      submissions
    });
  } catch (error) {
    console.error('Error fetching test submissions:', error);
    return res.status(500).json({ message: 'Failed to fetch test submissions.', error: error.message });
  }
};

// Get all submissions for current student (Student Gradebook History)
exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      where: { student_id: req.user.id },
      include: [
        {
          model: Test,
          as: 'test',
          attributes: ['id', 'title', 'category', 'duration_minutes', 'pass_percentage', 'allow_review'],
          include: [{ model: User, as: 'creator', attributes: ['name'] }]
        }
      ],
      order: [['submitted_at', 'DESC']]
    });

    return res.json({ submissions });
  } catch (error) {
    console.error('Error fetching my submissions:', error);
    return res.status(500).json({ message: 'Failed to fetch your submissions.', error: error.message });
  }
};
