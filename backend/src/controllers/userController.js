const { User, Submission, Test } = require('../models');
const bcrypt = require('bcryptjs');

// Get all registered students with performance statistics (Teacher only)
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Submission,
          as: 'submissions',
          attributes: ['id', 'score_obtained', 'max_score', 'percentage', 'is_passed', 'submitted_at'],
          include: [{ model: Test, as: 'test', attributes: ['id', 'title'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formatted = students.map((student) => {
      const data = student.toJSON();
      const submissions = data.submissions || [];
      const totalAttempted = submissions.length;
      const passedCount = submissions.filter((s) => s.is_passed).length;
      const avgScore = totalAttempted > 0
        ? Math.round((submissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / totalAttempted) * 10) / 10
        : 0;

      const sortedSubmissions = [...submissions].sort(
        (a, b) => new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0)
      );
      const lastActiveAt = sortedSubmissions.length > 0 ? sortedSubmissions[0].submitted_at : null;

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: data.createdAt,
        total_attempted: totalAttempted,
        total_passed: passedCount,
        average_score: avgScore,
        last_active_at: lastActiveAt,
        submissions: submissions
      };
    });

    return res.json({ students: formatted });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ message: 'Failed to fetch students.', error: error.message });
  }
};

// Create a new student (Teacher only)
exports.createStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Student full name and email are required.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'A student or user with this email already exists.' });
    }

    const studentPassword = password && password.trim().length >= 6 ? password.trim() : 'student123';

    const newStudent = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: studentPassword,
      role: 'student'
    });

    return res.status(201).json({
      message: 'Student enrolled successfully.',
      student: {
        id: newStudent.id,
        name: newStudent.name,
        email: newStudent.email,
        role: newStudent.role,
        createdAt: newStudent.createdAt,
        total_attempted: 0,
        total_passed: 0,
        average_score: 0,
        last_active_at: null
      },
      defaultPasswordUsed: !password || password.trim().length < 6
    });
  } catch (error) {
    console.error('Error creating student:', error);
    return res.status(500).json({ message: 'Failed to enroll student.', error: error.message });
  }
};

// Update student (Teacher only)
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const student = await User.findOne({
      where: { id, role: 'student' }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (email && email !== student.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: 'Another user is already registered with this email.' });
      }
      student.email = email;
    }

    if (name) {
      student.name = name;
    }

    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(password.trim(), salt);
    }

    await student.save();

    return res.json({
      message: 'Student details updated successfully.',
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role
      }
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).json({ message: 'Failed to update student.', error: error.message });
  }
};

// Delete student (Teacher only)
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findOne({
      where: { id, role: 'student' }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    await student.destroy();

    return res.json({ message: 'Student removed successfully.' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return res.status(500).json({ message: 'Failed to delete student.', error: error.message });
  }
};
