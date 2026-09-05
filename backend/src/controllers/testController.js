const { Test, Question, Option, Submission, User, Course } = require('../models');

// Get all tests for teacher or student view
exports.getAllTests = async (req, res) => {
  try {
    const isTeacher = req.user.role === 'teacher';

    if (isTeacher) {
      const tests = await Test.findAll({
        where: { created_by: req.user.id },
        include: [
          {
            model: Question,
            as: 'questions',
            attributes: ['id', 'points']
          },
          {
            model: Submission,
            as: 'submissions',
            attributes: ['id', 'score_obtained', 'is_passed', 'submitted_at']
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'code']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      const formatted = tests.map((t) => {
        const testData = t.toJSON();
        const totalPoints = (testData.questions || []).reduce((acc, q) => acc + (q.points || 0), 0);
        return {
          ...testData,
          total_questions_count: (testData.questions || []).length,
          total_points: totalPoints,
          submissions_count: (testData.submissions || []).length
        };
      });

      return res.json({ tests: formatted });
    } else {
      // Students see all published tests + their past submission status
      const tests = await Test.findAll({
        where: { is_published: true },
        include: [
          {
            model: Question,
            as: 'questions',
            attributes: ['id', 'points']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name']
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'code']
          },
          {
            model: Submission,
            as: 'submissions',
            where: { student_id: req.user.id },
            required: false,
            attributes: ['id', 'score_obtained', 'max_score', 'percentage', 'is_passed', 'submitted_at']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      const formatted = tests.map((t) => {
        const testData = t.toJSON();
        const totalPoints = (testData.questions || []).reduce((acc, q) => acc + (q.points || 0), 0);
        const mySubmissions = (testData.submissions || []).sort(
          (a, b) => new Date(b.submitted_at || b.createdAt || 0) - new Date(a.submitted_at || a.createdAt || 0)
        );
        const hasAttempted = mySubmissions.length > 0;
        const latestSubmission = hasAttempted ? mySubmissions[0] : null;

        return {
          id: testData.id,
          course_id: testData.course_id,
          course: testData.course,
          title: testData.title,
          description: testData.description,
          instructions: testData.instructions,
          duration_minutes: testData.duration_minutes,
          pass_percentage: testData.pass_percentage,
          category: testData.category,
          creator: testData.creator,
          total_questions_count: (testData.questions || []).length,
          total_points: totalPoints,
          allow_review: testData.allow_review,
          max_attempts: testData.max_attempts,
          grading_method: testData.grading_method,
          has_password: !!testData.access_password,
          enable_proctoring: testData.enable_proctoring,
          has_attempted: hasAttempted,
          latest_submission: latestSubmission,
          attempts_count: mySubmissions.length,
          createdAt: testData.createdAt
        };
      });

      return res.json({ tests: formatted });
    }
  } catch (error) {
    console.error('Error fetching tests:', error);
    return res.status(500).json({ message: 'Failed to fetch tests.', error: error.message });
  }
};

// Get single test by ID
exports.getTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.query;
    const isTeacher = req.user.role === 'teacher';

    const test = await Test.findByPk(id, {
      include: [
        {
          model: Question,
          as: 'questions',
          include: [
            {
              model: Option,
              as: 'options',
              attributes: isTeacher
                ? ['id', 'option_text', 'is_correct', 'order_index']
                : ['id', 'option_text', 'order_index']
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'code']
        }
      ],
      order: [
        [{ model: Question, as: 'questions' }, 'order_index', 'ASC'],
        [{ model: Question, as: 'questions' }, { model: Option, as: 'options' }, 'order_index', 'ASC']
      ]
    });

    if (!test) {
      return res.status(404).json({ message: 'Test not found.' });
    }

    // If student is accessing an unpublished test, reject
    if (!isTeacher && !test.is_published) {
      return res.status(403).json({ message: 'This test is not currently available to students.' });
    }

    // Password validation for students
    if (!isTeacher && test.access_password) {
      if (!password || password !== test.access_password) {
        return res.status(401).json({
          message: 'This assessment is password protected. Please enter the valid test access key.',
          requiresPassword: true
        });
      }
    }

    const testData = test.toJSON();

    // Mask secret keys/answers for students
    if (!isTeacher) {
      testData.questions = testData.questions.map((q) => {
        const {
          correct_answer_text,
          explanation,
          numerical_answer,
          tolerance,
          cloze_answers,
          ...safeQuestion
        } = q;

        // If matching question, scramble the right items so student doesn't see direct 1:1 order
        if (safeQuestion.question_type === 'matching' && Array.isArray(safeQuestion.matching_pairs)) {
          const rightOptions = safeQuestion.matching_pairs.map((p) => p.right).sort(() => Math.random() - 0.5);
          safeQuestion.matching_pairs = safeQuestion.matching_pairs.map((p) => ({
            id: p.id,
            left: p.left
          }));
          safeQuestion.available_match_options = rightOptions;
        }

        return safeQuestion;
      });

      if (test.shuffle_questions) {
        testData.questions.sort(() => Math.random() - 0.5);
      }
    }

    return res.json({ test: testData });
  } catch (error) {
    console.error('Error fetching test by ID:', error);
    return res.status(500).json({ message: 'Failed to fetch test details.', error: error.message });
  }
};

// Create new test (Teacher only)
exports.createTest = async (req, res) => {
  try {
    const {
      course_id,
      title,
      description,
      instructions,
      duration_minutes,
      pass_percentage,
      category,
      shuffle_questions,
      allow_review,
      is_published,
      max_attempts,
      grading_method,
      access_password,
      open_time,
      close_time,
      enable_proctoring,
      max_proctoring_violations
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Test title is required.' });
    }

    const test = await Test.create({
      course_id: course_id || null,
      title,
      description,
      instructions,
      duration_minutes: duration_minutes || 30,
      pass_percentage: pass_percentage || 50,
      category: category || 'General',
      shuffle_questions: !!shuffle_questions,
      allow_review: allow_review !== false,
      is_published: !!is_published,
      max_attempts: max_attempts !== undefined ? Number(max_attempts) : 1,
      grading_method: grading_method || 'highest',
      access_password: access_password || null,
      open_time: open_time || null,
      close_time: close_time || null,
      enable_proctoring: enable_proctoring !== false,
      max_proctoring_violations: max_proctoring_violations || 3,
      created_by: req.user.id
    });

    return res.status(201).json({
      message: 'Assessment created successfully.',
      test
    });
  } catch (error) {
    console.error('Error creating test:', error);
    return res.status(500).json({ message: 'Failed to create test.', error: error.message });
  }
};

// Update test (Teacher only)
exports.updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await Test.findOne({
      where: { id, created_by: req.user.id }
    });

    if (!test) {
      return res.status(404).json({ message: 'Test not found or unauthorized.' });
    }

    const {
      course_id,
      title,
      description,
      instructions,
      duration_minutes,
      pass_percentage,
      category,
      shuffle_questions,
      allow_review,
      is_published,
      max_attempts,
      grading_method,
      access_password,
      open_time,
      close_time,
      enable_proctoring,
      max_proctoring_violations
    } = req.body;

    await test.update({
      course_id: course_id !== undefined ? course_id : test.course_id,
      title: title !== undefined ? title : test.title,
      description: description !== undefined ? description : test.description,
      instructions: instructions !== undefined ? instructions : test.instructions,
      duration_minutes: duration_minutes !== undefined ? duration_minutes : test.duration_minutes,
      pass_percentage: pass_percentage !== undefined ? pass_percentage : test.pass_percentage,
      category: category !== undefined ? category : test.category,
      shuffle_questions: shuffle_questions !== undefined ? shuffle_questions : test.shuffle_questions,
      allow_review: allow_review !== undefined ? allow_review : test.allow_review,
      is_published: is_published !== undefined ? is_published : test.is_published,
      max_attempts: max_attempts !== undefined ? max_attempts : test.max_attempts,
      grading_method: grading_method !== undefined ? grading_method : test.grading_method,
      access_password: access_password !== undefined ? access_password : test.access_password,
      open_time: open_time !== undefined ? open_time : test.open_time,
      close_time: close_time !== undefined ? close_time : test.close_time,
      enable_proctoring: enable_proctoring !== undefined ? enable_proctoring : test.enable_proctoring,
      max_proctoring_violations: max_proctoring_violations !== undefined ? max_proctoring_violations : test.max_proctoring_violations
    });

    return res.json({
      message: 'Assessment updated successfully.',
      test
    });
  } catch (error) {
    console.error('Error updating test:', error);
    return res.status(500).json({ message: 'Failed to update test.', error: error.message });
  }
};

// Toggle publish status (Teacher only)
exports.togglePublish = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await Test.findOne({
      where: { id, created_by: req.user.id }
    });

    if (!test) {
      return res.status(404).json({ message: 'Test not found or unauthorized.' });
    }

    test.is_published = !test.is_published;
    await test.save();

    return res.json({
      message: `Test is now ${test.is_published ? 'Published' : 'Saved as Draft'}.`,
      is_published: test.is_published
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to toggle test status.' });
  }
};

// Delete test (Teacher only)
exports.deleteTest = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await Test.findOne({
      where: { id, created_by: req.user.id }
    });

    if (!test) {
      return res.status(404).json({ message: 'Test not found or unauthorized.' });
    }

    await test.destroy();
    return res.json({ message: 'Test and all associated questions/submissions deleted successfully.' });
  } catch (error) {
    console.error('Error deleting test:', error);
    return res.status(500).json({ message: 'Failed to delete test.', error: error.message });
  }
};
