import LibraryOwner from '../models/LibraryOwner.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers['x-session-token'];

    if (!authHeader) {
      return res.status(401).json({
        error: 'NO_TOKEN',
        message: 'Authentication token missing. Please sign in.',
        forceLogout: true,
      });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    // Search owner by active session token
    let owner = null;
    if (LibraryOwner.findOne) {
      owner = await LibraryOwner.findOne({ activeSessionToken: token });
    }

    if (!owner) {
      return res.status(401).json({
        error: 'SESSION_SUPERSEDED',
        message: 'You have been logged out because your account was logged in from another device/browser.',
        forceLogout: true,
      });
    }

    // Strict single-device verification check
    if (owner.activeSessionToken !== token) {
      return res.status(401).json({
        error: 'SESSION_SUPERSEDED',
        message: `You have been logged out because your account was logged in from another device (${owner.activeDeviceName || 'Browser'}).`,
        forceLogout: true,
      });
    }

    req.owner = owner;
    req.ownerId = owner._id || owner.id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};

export default authMiddleware;
