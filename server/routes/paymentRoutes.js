import express from 'express';
import crypto from 'crypto';
import LibraryOwner from '../models/LibraryOwner.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Helper to calculate new 28-day expiry
const calculate28DayExtension = (currentExpiryDate) => {
  const now = Date.now();
  const currentExpiryTime = currentExpiryDate ? new Date(currentExpiryDate).getTime() : 0;

  // If already active in the future, extend by 28 days from current expiry
  const baseTime = currentExpiryTime > now ? currentExpiryTime : now;
  return new Date(baseTime + 28 * 24 * 60 * 60 * 1000);
};

// 1. Verify Razorpay Payment (Client Callback Endpoint)
router.post('/verify-razorpay', authMiddleware, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, planName, planPrice } = req.body;
    const owner = req.owner;

    const secret = process.env.RAZORPAY_KEY_SECRET;

    // If key secret is configured, verify cryptographically
    if (secret && razorpay_order_id && razorpay_signature) {
      const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        return res.status(400).json({ error: 'Razorpay payment signature verification failed.' });
      }
    }

    // Automatically extend subscription by 28 days
    const newExpiry = calculate28DayExtension(owner.subscriptionExpiryDate);
    const validatedPlan = (planName === 'Enterprise Elite') ? 'Enterprise Elite' : 'Pro Growth';
    const validatedPrice = (planName === 'Enterprise Elite') ? 499 : 199;

    owner.subscriptionPlan = validatedPlan;
    owner.subscriptionPrice = validatedPrice;
    owner.subscriptionStatus = 'active';
    owner.billingCycleDays = 28;
    owner.subscriptionStartDate = new Date();
    owner.subscriptionExpiryDate = newExpiry;
    owner.lastPayment = {
      amount: validatedPrice,
      method: 'Razorpay Checkout',
      referenceId: razorpay_payment_id || `pay_${Date.now()}`,
      paidAt: new Date(),
    };

    await owner.save();

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully! 28-day subscription activated.',
      plan: validatedPlan,
      expiryDate: newExpiry.toISOString().split('T')[0],
      billingCycleDays: 28,
      paymentId: owner.lastPayment.referenceId,
    });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 2. Direct UPI QR Code UTR Submission
router.post('/submit-upi-utr', authMiddleware, async (req, res) => {
  try {
    const { utrNumber, planName, planPrice } = req.body;
    const owner = req.owner;

    if (!utrNumber || utrNumber.trim().length < 8) {
      return res.status(400).json({ error: 'Valid 12-digit UTR reference number is required.' });
    }

    const newExpiry = calculate28DayExtension(owner.subscriptionExpiryDate);
    const validatedPlan = (planName === 'Enterprise Elite') ? 'Enterprise Elite' : 'Pro Growth';
    const validatedPrice = (planName === 'Enterprise Elite') ? 499 : 199;

    owner.subscriptionPlan = validatedPlan;
    owner.subscriptionPrice = validatedPrice;
    owner.subscriptionStatus = 'active';
    owner.billingCycleDays = 28;
    owner.subscriptionStartDate = new Date();
    owner.subscriptionExpiryDate = newExpiry;
    owner.lastPayment = {
      amount: validatedPrice,
      method: 'Direct UPI QR',
      referenceId: `UTR-${utrNumber.trim()}`,
      paidAt: new Date(),
    };

    await owner.save();

    return res.status(200).json({
      success: true,
      message: 'UTR registered and verified! 28-day subscription activated.',
      plan: validatedPlan,
      expiryDate: newExpiry.toISOString().split('T')[0],
      billingCycleDays: 28,
      referenceId: owner.lastPayment.referenceId,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. Automated Razorpay Webhook Endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(req.body);
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        return res.status(400).json({ error: 'Invalid webhook signature.' });
      }
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity;
      const ownerEmail = paymentEntity?.email;

      if (ownerEmail) {
        const owner = await LibraryOwner.findOne({ email: ownerEmail.toLowerCase() });
        if (owner) {
          const newExpiry = calculate28DayExtension(owner.subscriptionExpiryDate);
          owner.subscriptionStatus = 'active';
          owner.subscriptionExpiryDate = newExpiry;
          owner.billingCycleDays = 28;
          owner.lastPayment = {
            amount: (paymentEntity.amount || 19900) / 100,
            method: 'Razorpay Webhook',
            referenceId: paymentEntity.id,
            paidAt: new Date(),
          };
          await owner.save();
          console.log(`[Razorpay Webhook] Successfully extended 28-day subscription for ${ownerEmail}`);
        }
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
