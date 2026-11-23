export const subscriptionMiddleware = (req, res, next) => {
  const owner = req.owner;

  if (!owner) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Owner authentication required.' });
  }

  // Check 28-day subscription status
  const isStatusActive = owner.subscriptionStatus === 'active';
  const hasExpiryDate = !!owner.subscriptionExpiryDate;
  const isDateValid = hasExpiryDate && new Date(owner.subscriptionExpiryDate).getTime() > Date.now();

  if (!isStatusActive || !isDateValid) {
    return res.status(403).json({
      error: 'SUBSCRIPTION_LOCKED',
      message: 'Your 28-day reading hall SaaS subscription has ended. Access to desk allocation and student operations is locked until renewed.',
      subscriptionStatus: owner.subscriptionStatus,
      expiryDate: owner.subscriptionExpiryDate,
      billingCycleDays: 28,
      plansAvailable: [
        { name: 'Pro Growth', price: 199, cycle: '28 Days' },
        { name: 'Enterprise Elite', price: 499, cycle: '28 Days' }
      ]
    });
  }

  next();
};

export default subscriptionMiddleware;
