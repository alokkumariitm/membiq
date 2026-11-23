import express from 'express';
import LibraryOwner from '../models/LibraryOwner.js';
import superAdminMiddleware from '../middleware/superadmin.js';

const router = express.Router();

// 1. Super Admin Login
router.post('/login', (req, res) => {
  const { adminId, password } = req.body;

  if (adminId === 'membiqsuperadmin' && password === 'Victus@2026MembiQ') {
    return res.status(200).json({
      success: true,
      message: 'Super Admin authenticated successfully.',
      adminId: 'membiqsuperadmin',
      role: 'SUPERADMIN',
    });
  }

  return res.status(401).json({
    error: 'INVALID_CREDENTIALS',
    message: 'Invalid Super Admin credentials. Access denied.',
  });
});

// All routes below require Super Admin authentication
router.use(superAdminMiddleware);

// 2. Get ONLY Library Owner profiles & subscription statuses
router.get('/owners', async (req, res) => {
  try {
    // Strictly select ONLY owner metadata and subscription status
    const owners = await LibraryOwner.find({})
      .select('name libraryName email phone subscriptionPlan subscriptionPrice subscriptionStatus subscriptionExpiryDate billingCycleDays createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: owners.length,
      owners,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. Strict Student Data Privacy Guard (STRICTLY BLOCKED)
router.use('/students', (req, res) => {
  return res.status(403).json({
    error: 'PRIVACY_PROTECTION_VIOLATION',
    message: 'Tenant Privacy Protocol Enforced: Super Administrators are strictly restricted from accessing reading hall student rosters, student contact numbers, or desk allocation records.',
    accessDenied: true,
  });
});

export default router;
