const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_test_platform_2026_secure');

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid or malformed token.' });
  }
};

const requireRole = (...roles) => {
  const flattenedRoles = roles.flat();
  return (req, res, next) => {
    if (!req.user || !flattenedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Requires one of the following roles: ${flattenedRoles.join(', ')}.`
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authenticateToken: authenticate,
  requireRole
};
