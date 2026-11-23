import express from 'express';
import Seat from '../models/Seat.js';
import authMiddleware from '../middleware/auth.js';
import subscriptionMiddleware from '../middleware/subscription.js';

const router = express.Router();

// All seat routes require single-device authentication & 28-day active subscription
router.use(authMiddleware);
router.use(subscriptionMiddleware);

// 1. Get all seats for the authenticated reading hall
router.get('/', async (req, res) => {
  try {
    const seats = await Seat.find({ libraryId: req.ownerId }).sort({ customSeatCode: 1 });
    return res.status(200).json({ success: true, count: seats.length, seats });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. Add custom-named seat
router.post('/', async (req, res) => {
  try {
    const { customSeatCode, zone, seatType, status, assignedStudent, nearAc } = req.body;

    if (!customSeatCode) {
      return res.status(400).json({ error: 'Seat code is required (e.g. F-01, A-10).' });
    }

    const cleanCode = customSeatCode.trim().toUpperCase();

    // Check duplicate code in this library
    const existing = await Seat.findOne({ libraryId: req.ownerId, customSeatCode: cleanCode });
    if (existing) {
      return res.status(400).json({ error: `Seat "${cleanCode}" already exists in your library.` });
    }

    const newSeat = new Seat({
      libraryId: req.ownerId,
      customSeatCode: cleanCode,
      zone: zone || 'Hall A (AC Silence Zone)',
      seatType: seatType || 'fixed',
      status: status || 'active',
      assignedStudent: assignedStudent || null,
      nearAc: nearAc || false,
    });

    await newSeat.save();
    return res.status(201).json({ success: true, seat: newSeat });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. Quick-switch seat status ('active' | 'filled' | 'inactive')
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedStudent } = req.body;

    if (!['active', 'filled', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid seat status.' });
    }

    const seat = await Seat.findOne({ _id: id, libraryId: req.ownerId });
    if (!seat) {
      return res.status(404).json({ error: 'Seat not found.' });
    }

    seat.status = status;
    seat.assignedStudent = status === 'filled' ? (assignedStudent || 'Assigned Student') : null;
    await seat.save();

    return res.status(200).json({ success: true, seat });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. Delete seat
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Seat.findOneAndDelete({ _id: id, libraryId: req.ownerId });
    if (!deleted) {
      return res.status(404).json({ error: 'Seat not found.' });
    }
    return res.status(200).json({ success: true, message: 'Seat removed successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
