const { Certificate, Badge, UserBadge, User, Test, Course } = require('../models');

// Get all certificates for student
exports.getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      where: { student_id: req.user.id },
      include: [
        { model: Test, as: 'test', attributes: ['id', 'title', 'category'] },
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] }
      ],
      order: [['issue_date', 'DESC']]
    });

    return res.json({ certificates });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return res.status(500).json({ message: 'Failed to fetch certificates.' });
  }
};

// Verify certificate by public code
exports.verifyCertificate = async (req, res) => {
  try {
    const { code } = req.params;

    const certificate = await Certificate.findOne({
      where: { certificate_code: code },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: Test, as: 'test', attributes: ['id', 'title', 'category'] }
      ]
    });

    if (!certificate) {
      return res.status(404).json({ message: 'Invalid or unverifiable certificate code.' });
    }

    return res.json({
      valid: true,
      certificate
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to verify certificate.' });
  }
};

// Get all badges & student earned badges
exports.getMyBadges = async (req, res) => {
  try {
    const allBadges = await Badge.findAll();
    const userBadges = await UserBadge.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Badge, as: 'badge' }]
    });

    const earnedBadgeIds = userBadges.map((ub) => ub.badge_id);

    const formatted = allBadges.map((b) => {
      const isEarned = earnedBadgeIds.includes(b.id);
      const award = userBadges.find((ub) => ub.badge_id === b.id);
      return {
        ...b.toJSON(),
        is_earned: isEarned,
        earned_at: award ? award.earned_at : null,
        reason: award ? award.reason : null
      };
    });

    return res.json({ badges: formatted });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch badges.' });
  }
};
