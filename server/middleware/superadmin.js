export const superAdminMiddleware = (req, res, next) => {
  const adminId = req.headers['x-superadmin-id'] || req.headers['superadmin-id'];
  const adminPass = req.headers['x-superadmin-password'] || req.headers['superadmin-password'];
  const authHeader = req.headers.authorization;

  let isValid = false;

  if (adminId === 'membiqsuperadmin' && adminPass === 'Victus@2026MembiQ') {
    isValid = true;
  } else if (authHeader && authHeader.startsWith('SuperAdmin ')) {
    const creds = Buffer.from(authHeader.slice(11), 'base64').toString('ascii');
    const [u, p] = creds.split(':');
    if (u === 'membiqsuperadmin' && p === 'Victus@2026MembiQ') {
      isValid = true;
    }
  }

  if (!isValid) {
    return res.status(403).json({
      error: 'SUPERADMIN_ACCESS_DENIED',
      message: 'Unauthorized Super Admin access. Restricted platform console.',
    });
  }

  req.isSuperAdmin = true;
  next();
};

export default superAdminMiddleware;
