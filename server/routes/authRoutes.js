import express from 'express';
import crypto from 'crypto';
import LibraryOwner from '../models/LibraryOwner.js';
import authMiddleware from '../middleware/auth.js';
import sendOtpEmail from '../config/email.js';

const router = express.Router();

// 1. Library Owner Register (Sends Email OTP)
router.post('/register', async (req, res) => {
  try {
    const { name, libraryName, email, phone, password } = req.body;

    if (!name || !libraryName || !email || !phone || !password) {
      return res.status(400).json({ error: 'All registration fields are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Prevent Super Admin ID registration as owner
    if (cleanEmail === 'membiqsuperadmin') {
      return res.status(400).json({ error: 'This ID is reserved for system administration.' });
    }

    const existing = await LibraryOwner.findOne({ email: cleanEmail });
    if (existing && existing.isEmailVerified) {
      return res.status(400).json({ error: 'An account with this email is already registered. Please log in.' });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let owner = existing;
    if (owner) {
      owner.name = name.trim();
      owner.libraryName = libraryName.trim();
      owner.phone = phone.trim();
      owner.password = password;
      owner.otpCode = otpCode;
      owner.otpExpiresAt = otpExpiresAt;
      await owner.save();
    } else {
      owner = new LibraryOwner({
        name: name.trim(),
        libraryName: libraryName.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        password,
        isEmailVerified: false,
        otpCode,
        otpExpiresAt,
        subscriptionStatus: 'unpaid',
        subscriptionPlan: 'unpaid',
      });
      await owner.save();
    }

    // Dispatch Email OTP
    const mailResult = await sendOtpEmail(cleanEmail, otpCode, 'registration');

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      email: cleanEmail,
      demoOtp: otpCode, // Immediate fallback so user is never blocked
      emailSent: mailResult.success,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 2. Verify Email OTP and Activate Account
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, deviceName } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const owner = await LibraryOwner.findOne({ email: email.trim().toLowerCase() });
    if (!owner) {
      return res.status(404).json({ error: 'No registration session found for this email.' });
    }

    if (Date.now() > new Date(owner.otpExpiresAt).getTime()) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    if (owner.otpCode !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    // Activate owner and issue initial single-device token
    const newSessionToken = `sess_${crypto.randomBytes(16).toString('hex')}_${Date.now()}`;
    const device = deviceName || 'Initial Browser / Device';

    owner.isEmailVerified = true;
    owner.otpCode = null;
    owner.otpExpiresAt = null;
    owner.activeSessionToken = newSessionToken;
    owner.activeDeviceName = device;
    await owner.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. Account activated.',
      token: newSessionToken,
      owner: {
        id: owner._id,
        name: owner.name,
        libraryName: owner.libraryName,
        email: owner.email,
        phone: owner.phone,
        subscriptionPlan: owner.subscriptionPlan,
        subscriptionStatus: owner.subscriptionStatus,
        expiryDate: owner.subscriptionExpiryDate,
      },
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 3. Library Owner Login (Enforces Single Device Session)
router.post('/login', async (req, res) => {
  try {
    const { email, password, deviceName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'membiqsuperadmin') {
      return res.status(400).json({
        error: 'This ID is reserved for Super Admin. Please use the Super Admin Portal.',
      });
    }

    const owner = await LibraryOwner.findOne({ email: cleanEmail });
    if (!owner || owner.password !== password) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    // Enforce Single Device: generate a new session token that invalidates previous ones
    const newSessionToken = `sess_${crypto.randomBytes(16).toString('hex')}_${Date.now()}`;
    const device = deviceName || `Active Session #${Math.floor(Math.random() * 900 + 100)}`;

    owner.activeSessionToken = newSessionToken;
    owner.activeDeviceName = device;
    await owner.save();

    return res.status(200).json({
      success: true,
      message: 'Login successful. Single-device session established.',
      token: newSessionToken,
      owner: {
        id: owner._id,
        name: owner.name,
        libraryName: owner.libraryName,
        email: owner.email,
        phone: owner.phone,
        subscriptionPlan: owner.subscriptionPlan,
        subscriptionStatus: owner.subscriptionStatus,
        expiryDate: owner.subscriptionExpiryDate,
        activeDeviceName: device,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 4. Request Password Reset OTP
router.post('/forgot-password/request', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const cleanEmail = email.trim().toLowerCase();
    const owner = await LibraryOwner.findOne({ email: cleanEmail });
    if (!owner) {
      return res.status(404).json({ error: 'No registered library owner found with this email.' });
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    owner.otpCode = resetOtp;
    owner.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await owner.save();

    const mailResult = await sendOtpEmail(cleanEmail, resetOtp, 'reset');

    return res.status(200).json({
      success: true,
      message: 'Password recovery code dispatched.',
      demoOtp: resetOtp,
      emailSent: mailResult.success,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 5. Verify & Reset Password
router.post('/forgot-password/reset', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
    }

    const owner = await LibraryOwner.findOne({ email: email.trim().toLowerCase() });
    if (!owner) return res.status(404).json({ error: 'Account not found.' });

    if (Date.now() > new Date(owner.otpExpiresAt).getTime()) {
      return res.status(400).json({ error: 'Recovery OTP has expired.' });
    }

    if (owner.otpCode !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid recovery code.' });
    }

    owner.password = newPassword;
    owner.otpCode = null;
    owner.otpExpiresAt = null;
    // Invalidate all active device sessions for security
    owner.activeSessionToken = null;
    owner.activeDeviceName = null;
    await owner.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. All previous device sessions invalidated.',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 6. Current Session Info (Protected by single-device authMiddleware)
router.get('/me', authMiddleware, async (req, res) => {
  const owner = req.owner;
  const isSubValid = owner.isSubscriptionValid ? owner.isSubscriptionValid() : (owner.subscriptionStatus === 'active');

  return res.status(200).json({
    success: true,
    owner: {
      id: owner._id,
      name: owner.name,
      libraryName: owner.libraryName,
      email: owner.email,
      phone: owner.phone,
      subscriptionPlan: owner.subscriptionPlan,
      subscriptionStatus: isSubValid ? 'active' : 'expired',
      expiryDate: owner.subscriptionExpiryDate,
      activeDeviceName: owner.activeDeviceName,
      billingCycleDays: owner.billingCycleDays || 28,
    },
  });
});

// 7. Logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const owner = req.owner;
    owner.activeSessionToken = null;
    owner.activeDeviceName = null;
    await owner.save();

    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 8. Simulate Remote Login from Device B (for testing session invalidation)
router.post('/simulate-remote-login', authMiddleware, async (req, res) => {
  try {
    const owner = req.owner;
    const remoteToken = `remote_sess_${Date.now()}`;
    const remoteDevice = 'Device B (iPhone / Safari - New Login)';

    owner.activeSessionToken = remoteToken;
    owner.activeDeviceName = remoteDevice;
    await owner.save();

    return res.status(200).json({
      success: true,
      message: 'Account logged in from Device B. Old device session superseded.',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
