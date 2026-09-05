const { Assignment, AssignmentSubmission, Course, User } = require('../models');

// Get all assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const isTeacher = req.user.role === 'teacher';

    if (isTeacher) {
      const assignments = await Assignment.findAll({
        where: { created_by: req.user.id },
        include: [
          { model: Course, as: 'course', attributes: ['id', 'title', 'code'] },
          { model: AssignmentSubmission, as: 'submissions', attributes: ['id', 'status', 'score_obtained'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      const formatted = assignments.map((a) => {
        const item = a.toJSON();
        return {
          ...item,
          submissions_count: (item.submissions || []).length,
          graded_count: (item.submissions || []).filter((s) => s.status === 'graded').length
        };
      });

      return res.json({ assignments: formatted });
    } else {
      // Student view: assignments + their submission status
      const assignments = await Assignment.findAll({
        where: { is_published: true },
        include: [
          { model: Course, as: 'course', attributes: ['id', 'title', 'code'] },
          { model: User, as: 'author', attributes: ['id', 'name'] },
          {
            model: AssignmentSubmission,
            as: 'submissions',
            where: { student_id: req.user.id },
            required: false
          }
        ],
        order: [['due_date', 'ASC']]
      });

      const formatted = assignments.map((a) => {
        const item = a.toJSON();
        const mySubmission = (item.submissions && item.submissions.length > 0) ? item.submissions[0] : null;
        return {
          ...item,
          my_submission: mySubmission,
          has_submitted: !!mySubmission
        };
      });

      return res.json({ assignments: formatted });
    }
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({ message: 'Failed to fetch assignments.', error: error.message });
  }
};

// Get single assignment
exports.getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByPk(id, {
      include: [
        { model: Course, as: 'course', attributes: ['id', 'title', 'code'] },
        { model: User, as: 'author', attributes: ['id', 'name'] },
        {
          model: AssignmentSubmission,
          as: 'submissions',
          include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }]
        }
      ]
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    return res.json({ assignment });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch assignment.' });
  }
};

// Create Assignment (Teacher)
exports.createAssignment = async (req, res) => {
  try {
    const { course_id, title, description, instructions, max_points, due_date, rubric_criteria } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Assignment title is required.' });
    }

    const assignment = await Assignment.create({
      course_id: course_id || null,
      created_by: req.user.id,
      title,
      description,
      instructions,
      max_points: max_points || 100,
      due_date: due_date || null,
      rubric_criteria: rubric_criteria || null,
      is_published: true
    });

    return res.status(201).json({ message: 'Assignment created successfully.', assignment });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({ message: 'Failed to create assignment.', error: error.message });
  }
};

// Student Submit Assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { submission_text, attachment_url, attachment_name } = req.body;
    const studentId = req.user.id;

    const assignment = await Assignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    const [submission, created] = await AssignmentSubmission.findOrCreate({
      where: { assignment_id: id, student_id: studentId },
      defaults: {
        submission_text,
        attachment_url: attachment_url || null,
        attachment_name: attachment_name || null,
        status: 'submitted',
        submitted_at: new Date()
      }
    });

    if (!created) {
      await submission.update({
        submission_text: submission_text !== undefined ? submission_text : submission.submission_text,
        attachment_url: attachment_url !== undefined ? attachment_url : submission.attachment_url,
        attachment_name: attachment_name !== undefined ? attachment_name : submission.attachment_name,
        status: 'submitted',
        submitted_at: new Date()
      });
    }

    return res.json({ message: 'Assignment submitted successfully!', submission });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return res.status(500).json({ message: 'Failed to submit assignment.', error: error.message });
  }
};

// Teacher Grade Assignment Submission
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score_obtained, teacher_feedback, rubric_scores } = req.body;

    const submission = await AssignmentSubmission.findByPk(submissionId, {
      include: [{ model: Assignment, as: 'assignment' }]
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    await submission.update({
      score_obtained: Number(score_obtained),
      teacher_feedback: teacher_feedback || '',
      rubric_scores: rubric_scores || null,
      status: 'graded',
      graded_at: new Date(),
      graded_by: req.user.id
    });

    return res.json({ message: 'Submission graded successfully.', submission });
  } catch (error) {
    console.error('Error grading submission:', error);
    return res.status(500).json({ message: 'Failed to grade submission.', error: error.message });
  }
};
