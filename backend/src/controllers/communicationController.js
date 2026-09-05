const { Announcement, ForumTopic, ForumPost, Notification, Course, User } = require('../models');

// --- Announcements ---
exports.getAnnouncements = async (req, res) => {
  try {
    const { course_id } = req.query;
    const where = {};
    if (course_id) where.course_id = course_id;

    const announcements = await Announcement.findAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'role'] },
        { model: Course, as: 'course', attributes: ['id', 'title', 'code'] }
      ],
      order: [
        ['is_pinned', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    return res.json({ announcements });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch announcements.' });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { course_id, title, content, priority, is_pinned } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const announcement = await Announcement.create({
      course_id: course_id || null,
      created_by: req.user.id,
      title,
      content,
      priority: priority || 'normal',
      is_pinned: !!is_pinned
    });

    // Send notifications to all students
    const students = await User.findAll({ where: { role: 'student' } });
    if (students.length > 0) {
      await Notification.bulkCreate(
        students.map((s) => ({
          user_id: s.id,
          title: `New Announcement: ${title}`,
          message: content.substring(0, 100) + '...',
          type: 'announcement',
          link_url: '/announcements'
        }))
      );
    }

    return res.status(201).json({ message: 'Announcement posted successfully.', announcement });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create announcement.' });
  }
};

// --- Discussion Forums ---
exports.getForumTopics = async (req, res) => {
  try {
    const { course_id, search } = req.query;
    const where = {};
    if (course_id) where.course_id = course_id;

    const topics = await ForumTopic.findAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'role'] },
        { model: Course, as: 'course', attributes: ['id', 'title', 'code'] },
        { model: ForumPost, as: 'posts', attributes: ['id'] }
      ],
      order: [
        ['is_pinned', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    const formatted = topics.map((t) => {
      const item = t.toJSON();
      return {
        ...item,
        posts_count: (item.posts || []).length
      };
    });

    return res.json({ topics: formatted });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch forum topics.' });
  }
};

exports.getTopicById = async (req, res) => {
  try {
    const { id } = req.params;

    const topic = await ForumTopic.findByPk(id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'role'] },
        { model: Course, as: 'course', attributes: ['id', 'title', 'code'] },
        {
          model: ForumPost,
          as: 'posts',
          include: [{ model: User, as: 'author', attributes: ['id', 'name', 'role'] }],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!topic) {
      return res.status(404).json({ message: 'Discussion thread not found.' });
    }

    return res.json({ topic });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch topic details.' });
  }
};

exports.createTopic = async (req, res) => {
  try {
    const { course_id, title, content, category_tag } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const topic = await ForumTopic.create({
      course_id: course_id || null,
      author_id: req.user.id,
      title,
      content,
      category_tag: category_tag || 'General Discussion',
      is_pinned: req.user.role === 'teacher' ? req.body.is_pinned : false
    });

    return res.status(201).json({ message: 'Topic published.', topic });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create topic.' });
  }
};

exports.replyToTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Reply content cannot be empty.' });
    }

    const topic = await ForumTopic.findByPk(id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found.' });
    }

    const post = await ForumPost.create({
      topic_id: id,
      author_id: req.user.id,
      content
    });

    const fullPost = await ForumPost.findByPk(post.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'role'] }]
    });

    return res.status(201).json({ message: 'Reply posted.', post: fullPost });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to post reply.' });
  }
};

exports.markPostAsAccepted = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await ForumPost.findByPk(postId, {
      include: [{ model: ForumTopic, as: 'topic' }]
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Must be topic author or teacher
    if (post.topic.author_id !== req.user.id && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Unauthorized to mark as solved.' });
    }

    await post.update({ is_accepted_answer: true });
    await post.topic.update({ is_solved: true });

    return res.json({ message: 'Post marked as accepted solution.', post });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to mark accepted answer.' });
  }
};

// --- Notifications ---
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return res.json({ notifications, unreadCount });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );

    return res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update notifications.' });
  }
};
