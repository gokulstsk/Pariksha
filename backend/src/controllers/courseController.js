const { Course, CourseEnrollment, User, Test, Assignment } = require('../models');

// Get all courses (Teacher sees created + student sees enrolled/available)
exports.getAllCourses = async (req, res) => {
  try {
    const isTeacher = req.user.role === 'teacher';

    if (isTeacher) {
      const courses = await Course.findAll({
        where: { instructor_id: req.user.id },
        include: [
          { model: CourseEnrollment, as: 'enrollments', attributes: ['id', 'student_id'] },
          { model: Test, as: 'tests', attributes: ['id', 'title', 'is_published'] },
          { model: Assignment, as: 'assignments', attributes: ['id', 'title'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      const formatted = courses.map((c) => {
        const item = c.toJSON();
        return {
          ...item,
          enrolled_count: (item.enrollments || []).length,
          tests_count: (item.tests || []).length,
          assignments_count: (item.assignments || []).length
        };
      });

      return res.json({ courses: formatted });
    } else {
      // Student sees all published courses + their enrollment status
      const courses = await Course.findAll({
        where: { is_published: true },
        include: [
          { model: User, as: 'instructor', attributes: ['id', 'name', 'email'] },
          {
            model: CourseEnrollment,
            as: 'enrollments',
            where: { student_id: req.user.id },
            required: false
          },
          { model: Test, as: 'tests', attributes: ['id', 'title', 'is_published'] },
          { model: Assignment, as: 'assignments', attributes: ['id', 'title'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      const formatted = courses.map((c) => {
        const item = c.toJSON();
        const isEnrolled = (item.enrollments || []).length > 0;
        return {
          ...item,
          is_enrolled: isEnrolled,
          tests_count: (item.tests || []).length,
          assignments_count: (item.assignments || []).length
        };
      });

      return res.json({ courses: formatted });
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ message: 'Failed to fetch courses.', error: error.message });
  }
};

// Get single course details
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [
        { model: User, as: 'instructor', attributes: ['id', 'name', 'email'] },
        {
          model: CourseEnrollment,
          as: 'enrollments',
          include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }]
        },
        { model: Test, as: 'tests' },
        { model: Assignment, as: 'assignments' }
      ]
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    return res.json({ course });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch course details.', error: error.message });
  }
};

// Create Course (Teacher)
exports.createCourse = async (req, res) => {
  try {
    const { code, title, description, category, icon_color } = req.body;
    if (!code || !title) {
      return res.status(400).json({ message: 'Course code and title are required.' });
    }

    const course = await Course.create({
      code,
      title,
      description,
      category: category || 'General',
      icon_color: icon_color || '#4f46e5',
      instructor_id: req.user.id,
      is_published: true
    });

    return res.status(201).json({ message: 'Course created successfully.', course });
  } catch (error) {
    console.error('Error creating course:', error);
    return res.status(500).json({ message: 'Failed to create course.', error: error.message });
  }
};

// Update Course (Teacher)
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne({
      where: { id, instructor_id: req.user.id }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found or unauthorized.' });
    }

    const { code, title, description, category, icon_color, is_published } = req.body;
    await course.update({
      code: code !== undefined ? code : course.code,
      title: title !== undefined ? title : course.title,
      description: description !== undefined ? description : course.description,
      category: category !== undefined ? category : course.category,
      icon_color: icon_color !== undefined ? icon_color : course.icon_color,
      is_published: is_published !== undefined ? is_published : course.is_published
    });

    return res.json({ message: 'Course updated successfully.', course });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update course.', error: error.message });
  }
};

// Delete Course (Teacher)
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne({
      where: { id, instructor_id: req.user.id }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found or unauthorized.' });
    }

    await course.destroy();
    return res.json({ message: 'Course deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete course.' });
  }
};

// Student enrolls in course
exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    const [enrollment, created] = await CourseEnrollment.findOrCreate({
      where: { course_id: courseId, student_id: studentId },
      defaults: { status: 'active' }
    });

    return res.json({
      message: created ? 'Enrolled in course successfully!' : 'Already enrolled in this course.',
      enrollment
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return res.status(500).json({ message: 'Failed to enroll in course.', error: error.message });
  }
};
