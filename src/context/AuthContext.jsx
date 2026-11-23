import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext();

const STORAGE_KEY_OWNERS = 'membiq_owners_db';
const STORAGE_KEY_CURRENT_SESSION = 'membiq_current_session';
const STORAGE_KEY_SUPERADMIN = 'membiq_superadmin_session';

// Helper to compute future date by days
const getFutureDate = (days) => {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
};

const getPastDate = (days) => {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
};

// Initial pre-registered library owners for membiQ
const INITIAL_OWNERS = [
  {
    id: 'owner-1',
    name: 'Rohit Verma',
    libraryName: 'Rajendra Nagar Aspirants Hub',
    email: 'rohit@rajendranagar.com',
    phone: '9811223344',
    password: 'password123',
    plan: 'Enterprise Elite',
    planPrice: 499,
    planStatus: 'active', // 'active' | 'expired' | 'unpaid'
    expiryDate: getFutureDate(18), // 18 days remaining in 28-day cycle
    billingCycleDays: 28,
    activeSessionToken: null,
    activeDeviceName: null,
    registeredAt: '2026-01-10',
  },
  {
    id: 'owner-2',
    name: 'Alok Ranjan',
    libraryName: 'Kankarbagh Self-Study Center',
    email: 'alok@kankarbagh.com',
    phone: '9431098765',
    password: 'password123',
    plan: 'Pro Growth',
    planPrice: 199,
    planStatus: 'expired', // Expired 28-day cycle -> Must renew!
    expiryDate: getPastDate(2),
    billingCycleDays: 28,
    activeSessionToken: null,
    activeDeviceName: null,
    registeredAt: '2026-03-14',
  },
  {
    id: 'owner-3',
    name: 'Suresh Mittal',
    libraryName: 'Kota IIT/NEET Study Hub',
    email: 'suresh@kotastudy.com',
    phone: '9829012345',
    password: 'password123',
    plan: 'Enterprise Elite',
    planPrice: 499,
    planStatus: 'active',
    expiryDate: getFutureDate(24),
    billingCycleDays: 28,
    activeSessionToken: null,
    activeDeviceName: null,
    registeredAt: '2025-11-01',
  },
  {
    id: 'owner-4',
    name: 'Vikas Dubey',
    libraryName: 'Hazratganj Quiet Study Hall',
    email: 'vikas@hazratganj.com',
    phone: '9792045678',
    password: 'password123',
    plan: 'Pro Growth',
    planPrice: 199,
    planStatus: 'active',
    expiryDate: getFutureDate(3), // 3 days remaining
    billingCycleDays: 28,
    activeSessionToken: null,
    activeDeviceName: null,
    registeredAt: '2026-05-20',
  },
  {
    id: 'owner-5',
    name: 'Manish Patidar',
    libraryName: 'Bhawarkua Civil Services Library',
    email: 'manish@bhawarkua.com',
    phone: '9826011223',
    password: 'password123',
    plan: 'Pro Growth',
    planPrice: 199,
    planStatus: 'expired',
    expiryDate: getPastDate(5),
    billingCycleDays: 28,
    activeSessionToken: null,
    activeDeviceName: null,
    registeredAt: '2026-02-18',
  },
];

export const AuthProvider = ({ children }) => {
  // Load library owners database
  const [owners, setOwners] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OWNERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading owners from storage:', e);
    }
    return INITIAL_OWNERS;
  });

  // Current logged in owner session
  const [currentSession, setCurrentSession] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_SESSION);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.sessionToken) {
          api.setToken(parsed.sessionToken);
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Error reading session from storage:', e);
    }
    return null;
  });

  // Super Admin session (strictly isolated)
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUPERADMIN);
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  // Kicked out message when single device session is invalidated
  const [sessionKickedReason, setSessionKickedReason] = useState(null);

  // Pending Registration flow state (Email OTP)
  const [pendingRegistration, setPendingRegistration] = useState(null);

  // Pending Password Reset flow state (Email OTP)
  const [pendingPasswordReset, setPendingPasswordReset] = useState(null);

  // Configure API Client Interceptors for Backend Enforcement
  useEffect(() => {
    api.setInterceptors({
      onSessionSuperseded: (message) => {
        setCurrentSession(null);
        localStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
        setSessionKickedReason(
          message || 'You have been logged out because your account was logged in from another device/browser.'
        );
      },
      onSubscriptionLocked: (data) => {
        if (currentSession) {
          setOwners((prev) =>
            prev.map((o) =>
              o.email.toLowerCase() === currentSession.email.toLowerCase()
                ? { ...o, planStatus: 'expired' }
                : o
            )
          );
        }
      },
    });
  }, [currentSession]);

  // Sync token to API client
  useEffect(() => {
    if (currentSession?.sessionToken) {
      api.setToken(currentSession.sessionToken);
    } else {
      api.setToken(null);
    }
  }, [currentSession]);

  // Persist owners DB changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OWNERS, JSON.stringify(owners));
    } catch (e) {
      console.warn('Error writing owners to storage:', e);
    }
  }, [owners]);

  // Persist current session
  useEffect(() => {
    try {
      if (currentSession) {
        localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, JSON.stringify(currentSession));
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
      }
    } catch (e) {
      console.warn('Error syncing session:', e);
    }
  }, [currentSession]);

  // Sync superadmin session
  useEffect(() => {
    try {
      if (isSuperAdmin) {
        localStorage.setItem(STORAGE_KEY_SUPERADMIN, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEY_SUPERADMIN);
      }
    } catch (e) {
      console.warn('Error syncing super admin session:', e);
    }
  }, [isSuperAdmin]);

  // Single Device Session Enforcement Check
  const verifyCurrentSessionValidity = useCallback(() => {
    if (!currentSession) return;

    try {
      const freshOwners = JSON.parse(localStorage.getItem(STORAGE_KEY_OWNERS) || '[]');
      const userInDb = freshOwners.find(
        (o) => o.email.toLowerCase() === currentSession.email.toLowerCase()
      );

      if (userInDb) {
        // If DB has a different activeSessionToken than our device's sessionToken
        if (userInDb.activeSessionToken && userInDb.activeSessionToken !== currentSession.sessionToken) {
          setCurrentSession(null);
          localStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
          setSessionKickedReason(
            `You have been logged out because your account was logged in from another device (${userInDb.activeDeviceName || 'Browser'}). membiQ enforces strict single-device access for security.`
          );
        }
      }
    } catch (e) {
      console.warn('Session verification check error:', e);
    }
  }, [currentSession]);

  // Listen to cross-tab storage events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY_OWNERS || e.key === STORAGE_KEY_CURRENT_SESSION) {
        verifyCurrentSessionValidity();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(verifyCurrentSessionValidity, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [verifyCurrentSessionValidity]);

  // Helper to get active user details
  const currentUser = currentSession
    ? owners.find((o) => o.email.toLowerCase() === currentSession.email.toLowerCase()) || null
    : null;

  // Automated 28-Day Subscription Expiry Check
  const isSubscriptionActive = useCallback((user) => {
    const targetUser = user || currentUser;
    if (!targetUser) return false;
    if (targetUser.planStatus !== 'active' || !targetUser.expiryDate) {
      return false;
    }

    const expiryTime = new Date(targetUser.expiryDate + 'T23:59:59').getTime();
    const now = Date.now();

    // If 28-day cycle has expired
    if (now > expiryTime) {
      setOwners((prev) =>
        prev.map((o) =>
          o.id === targetUser.id ? { ...o, planStatus: 'expired' } : o
        )
      );
      return false;
    }

    return true;
  }, [currentUser]);

  // Days remaining in 28-day cycle
  const getDaysRemaining = useCallback((user) => {
    const targetUser = user || currentUser;
    if (!targetUser || !targetUser.expiryDate || targetUser.planStatus !== 'active') return 0;

    const expiryTime = new Date(targetUser.expiryDate + 'T23:59:59').getTime();
    const now = Date.now();
    const diffDays = Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [currentUser]);

  // Activate or Renew Subscription (28 Days Cycle)
  const renewSubscription = async (planName, planPrice, paymentMethod, referenceId) => {
    if (!currentUser) return { success: false, error: 'No active user session' };

    const newExpiryDate = getFutureDate(28); // 28-day cycle

    // Sync to backend API if method is Razorpay or UPI
    if (paymentMethod === 'Razorpay Checkout') {
      api.verifyRazorpay({
        razorpay_payment_id: referenceId,
        planName,
        planPrice,
      }).catch((e) => console.warn('Backend payment sync notice:', e));
    } else if (paymentMethod === 'Direct UPI QR') {
      api.submitUpiUtr({
        utrNumber: referenceId.replace('UTR-', ''),
        planName,
        planPrice,
      }).catch((e) => console.warn('Backend payment sync notice:', e));
    }

    const paymentRecord = {
      planName,
      amount: planPrice,
      method: paymentMethod,
      referenceId,
      paidAt: new Date().toISOString(),
      expiresAt: newExpiryDate,
      billingCycleDays: 28,
    };

    setOwners((prev) =>
      prev.map((o) =>
        o.id === currentUser.id
          ? {
              ...o,
              plan: planName,
              planPrice,
              planStatus: 'active',
              expiryDate: newExpiryDate,
              billingCycleDays: 28,
              lastPayment: paymentRecord,
            }
          : o
      )
    );

    return {
      success: true,
      expiryDate: newExpiryDate,
      billingCycleDays: 28,
      plan: planName,
    };
  };

  // Test Simulation: Force 28-Day Expiration
  const simulate28DayExpiry = (email) => {
    const targetEmail = (email || (currentUser && currentUser.email))?.toLowerCase();
    if (!targetEmail) return;

    setOwners((prev) =>
      prev.map((o) =>
        o.email.toLowerCase() === targetEmail
          ? {
              ...o,
              planStatus: 'expired',
              expiryDate: getPastDate(1), // Yesterday (Expired)
            }
          : o
      )
    );
  };

  // 1. Library Owner Login (Enforces Single Device Session)
  const loginOwner = async (email, password, customDeviceName = null) => {
    setSessionKickedReason(null);
    const cleanEmail = email.trim().toLowerCase();

    // Prevent Super Admin credential use on owner portal
    if (cleanEmail === 'membiqsuperadmin') {
      return {
        success: false,
        error: 'This ID is reserved for Super Admin. Please use the dedicated Super Admin Portal.',
      };
    }

    // Call Backend API
    const deviceName =
      customDeviceName ||
      (typeof window !== 'undefined' && window.innerWidth <= 768
        ? `Mobile Phone (Device #${Math.floor(Math.random() * 900 + 100)})`
        : `Desktop Browser (Chrome #${Math.floor(Math.random() * 900 + 100)})`);

    api.login({ email: cleanEmail, password, deviceName }).then((apiRes) => {
      if (apiRes?.token) {
        api.setToken(apiRes.token);
      }
    }).catch(() => {});

    // Local state verification & single-device update
    const found = owners.find(
      (o) => o.email.toLowerCase() === cleanEmail && o.password === password
    );

    if (!found) {
      return {
        success: false,
        error: 'Invalid email address or password. Please try again or use Forgot Password.',
      };
    }

    const newSessionToken = `sess_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

    const updatedOwners = owners.map((o) =>
      o.id === found.id
        ? {
            ...o,
            activeSessionToken: newSessionToken,
            activeDeviceName: deviceName,
            lastLoginAt: new Date().toISOString(),
          }
        : o
    );

    setOwners(updatedOwners);

    const sessionObj = {
      email: found.email,
      sessionToken: newSessionToken,
      deviceName,
      loggedInAt: new Date().toISOString(),
    };

    setCurrentSession(sessionObj);
    api.setToken(newSessionToken);

    return { success: true, user: found, session: sessionObj };
  };

  // 2. Simulate Remote Login from Device B
  const simulateRemoteLogin = async (email) => {
    const cleanEmail = (email || (currentUser && currentUser.email))?.toLowerCase();
    if (!cleanEmail) return;

    // Backend remote simulation
    api.simulateRemoteLogin().catch(() => {});

    const newRemoteToken = `remote_sess_${Date.now()}`;
    const remoteDevice = `Device B (iPhone / Safari - New Login)`;

    const updated = owners.map((o) =>
      o.email.toLowerCase() === cleanEmail
        ? {
            ...o,
            activeSessionToken: newRemoteToken,
            activeDeviceName: remoteDevice,
          }
        : o
    );

    setOwners(updated);

    if (currentSession && currentSession.email.toLowerCase() === cleanEmail) {
      setCurrentSession(null);
      localStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
      setSessionKickedReason(
        `You have been logged out because your account was logged in from another device (${remoteDevice}). membiQ enforces strict single-device access for security.`
      );
    }
  };

  // 3. Logout Owner
  const logoutOwner = async () => {
    api.logout().catch(() => {});
    if (currentSession) {
      setOwners((prev) =>
        prev.map((o) =>
          o.email.toLowerCase() === currentSession.email.toLowerCase()
            ? { ...o, activeSessionToken: null, activeDeviceName: null }
            : o
        )
      );
    }
    setCurrentSession(null);
    localStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
    api.setToken(null);
  };

  // 4. Start Registration (Generates 6-Digit Email OTP)
  const startRegistration = async ({ name, libraryName, email, phone, password }) => {
    const cleanEmail = email.trim().toLowerCase();

    if (owners.some((o) => o.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: 'An account with this email is already registered. Please log in instead.',
      };
    }

    if (cleanEmail === 'membiqsuperadmin') {
      return {
        success: false,
        error: 'This email is reserved for system administration.',
      };
    }

    // Call backend API
    api.register({ name, libraryName, email: cleanEmail, phone, password }).catch(() => {});

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const pending = {
      name: name.trim(),
      libraryName: libraryName.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password,
      otp: generatedOtp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    setPendingRegistration(pending);

    return {
      success: true,
      otp: generatedOtp,
      email: cleanEmail,
      message: `Verification code sent to ${cleanEmail}`,
    };
  };

  // 5. Verify Registration OTP and Activate Account
  const verifyRegistrationOtp = async (otpInput) => {
    if (!pendingRegistration) {
      return { success: false, error: 'No registration session found. Please register again.' };
    }

    if (Date.now() > pendingRegistration.expiresAt) {
      return { success: false, error: 'OTP has expired. Please request a new verification code.' };
    }

    if (otpInput.trim() !== pendingRegistration.otp) {
      return { success: false, error: 'Invalid verification code. Please check and re-enter.' };
    }

    // Backend verification
    api.verifyOtp({ email: pendingRegistration.email, otp: otpInput }).catch(() => {});

    const newOwnerId = `owner-${Date.now()}`;
    const newSessionToken = `sess_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const deviceName = `Initial Device (${typeof window !== 'undefined' && window.innerWidth <= 768 ? 'Mobile' : 'Desktop'})`;

    const newOwner = {
      id: newOwnerId,
      name: pendingRegistration.name,
      libraryName: pendingRegistration.libraryName,
      email: pendingRegistration.email,
      phone: pendingRegistration.phone,
      password: pendingRegistration.password,
      plan: 'Unsubscribed',
      planPrice: 0,
      planStatus: 'unpaid',
      expiryDate: null,
      billingCycleDays: 28,
      activeSessionToken: newSessionToken,
      activeDeviceName: deviceName,
      registeredAt: new Date().toISOString().split('T')[0],
      isEmailVerified: true,
    };

    setOwners((prev) => [newOwner, ...prev]);

    const sessionObj = {
      email: newOwner.email,
      sessionToken: newSessionToken,
      deviceName,
      loggedInAt: new Date().toISOString(),
    };

    setCurrentSession(sessionObj);
    api.setToken(newSessionToken);
    setPendingRegistration(null);

    return { success: true, user: newOwner };
  };

  // 6. Resend Registration OTP
  const resendRegistrationOtp = () => {
    if (!pendingRegistration) return null;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingRegistration((prev) => ({
      ...prev,
      otp: newOtp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    }));
    return newOtp;
  };

  // 7. Request Password Reset OTP
  const requestPasswordReset = (email) => {
    const cleanEmail = email.trim().toLowerCase();
    const found = owners.find((o) => o.email.toLowerCase() === cleanEmail);

    if (!found) {
      return {
        success: false,
        error: 'No registered library owner found with this email address.',
      };
    }

    api.forgotPasswordRequest({ email: cleanEmail }).catch(() => {});

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();

    setPendingPasswordReset({
      email: cleanEmail,
      otp: resetOtp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    return {
      success: true,
      otp: resetOtp,
      email: cleanEmail,
    };
  };

  // 8. Verify OTP & Set New Password
  const verifyAndResetPassword = (otpInput, newPassword) => {
    if (!pendingPasswordReset) {
      return { success: false, error: 'No active password recovery request found.' };
    }

    if (Date.now() > pendingPasswordReset.expiresAt) {
      return { success: false, error: 'Password recovery OTP has expired.' };
    }

    if (otpInput.trim() !== pendingPasswordReset.otp) {
      return { success: false, error: 'Invalid recovery code. Please check and re-enter.' };
    }

    api.forgotPasswordReset({
      email: pendingPasswordReset.email,
      otp: otpInput,
      newPassword,
    }).catch(() => {});

    setOwners((prev) =>
      prev.map((o) =>
        o.email.toLowerCase() === pendingPasswordReset.email.toLowerCase()
          ? {
              ...o,
              password: newPassword,
              activeSessionToken: null,
              activeDeviceName: null,
            }
        : o
      )
    );

    setPendingPasswordReset(null);
    return { success: true, email: pendingPasswordReset.email };
  };

  // 9. Dedicated Super Admin Login (Strictly isolated)
  const loginSuperAdmin = (adminId, adminPassword) => {
    if (adminId.trim() === 'membiqsuperadmin' && adminPassword === 'Victus@2026MembiQ') {
      setIsSuperAdmin(true);
      api.superAdminLogin(adminId, adminPassword).catch(() => {});
      return { success: true };
    }
    return {
      success: false,
      error: 'Invalid Super Admin credentials. Access denied.',
    };
  };

  // 10. Super Admin Logout
  const logoutSuperAdmin = () => {
    setIsSuperAdmin(false);
    localStorage.removeItem(STORAGE_KEY_SUPERADMIN);
  };

  const clearSessionKickedReason = () => {
    setSessionKickedReason(null);
  };

  return (
    <AuthContext.Provider
      value={{
        owners,
        currentUser,
        currentSession,
        isSuperAdmin,
        sessionKickedReason,
        pendingRegistration,
        pendingPasswordReset,
        isSubscriptionActive,
        getDaysRemaining,
        renewSubscription,
        simulate28DayExpiry,
        loginOwner,
        logoutOwner,
        simulateRemoteLogin,
        startRegistration,
        verifyRegistrationOtp,
        resendRegistrationOtp,
        requestPasswordReset,
        verifyAndResetPassword,
        loginSuperAdmin,
        logoutSuperAdmin,
        clearSessionKickedReason,
        setPendingRegistration,
        setPendingPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
