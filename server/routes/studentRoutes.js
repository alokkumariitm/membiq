import express from 'express';
import Student from '../models/Student.js';
import Seat from '../models/Seat.js';
import authMiddleware from '../middleware/auth.js';
import subscriptionMiddleware from '../middleware/subscription.js';

const router = express.Router();

// Protected by single-device auth & 28-day subscription lock
router.use(authMiddleware);
router.use(subscriptionMiddleware);

// 1. Get all students for authenticated library owner
router.get('/', async (req, res) => {
  try {
    const { status, expireWithinDays } = req.query;
    let query = { libraryId: req.ownerId };

    const students = await Student.find(query).sort({ feeExpiryDate: 1 });

    // Update statuses dynamically
    const processed = students.map((st) => {
      st.updateStatusFromDate();
      return st;
    });

    let results = processed;
    if (status) {
      results = results.filter((st) => st.status === status);
    }

    if (expireWithinDays) {
      const limitDays = Number(expireWithinDays);
      const now = Date.now();
      results = results.filter((st) => {
        const diff = Math.ceil((new Date(st.feeExpiryDate).getTime() - now) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= limitDays;
      });
    }

    return res.status(200).json({ success: true, count: results.length, students: results });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. Register New Student (Flexible Admission Form)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      fatherName,
      address,
      whatsapp,
      studentType,
      seatCode,
      shiftText,
      paidMonths,
      feeRate,
      totalFee,
      joiningDate,
      feeExpiryDate,
    } = req.body;

    if (!name || !whatsapp) {
      return res.status(400).json({ error: 'Student name and WhatsApp number are required.' });
    }

    // Default expiry date: 30 days * paidMonths.length or provided date
    let computedExpiry = feeExpiryDate;
    if (!computedExpiry) {
      const monthsCount = (paidMonths && paidMonths.length > 0) ? paidMonths.length : 1;
      computedExpiry = new Date(Date.now() + monthsCount * 30 * 24 * 60 * 60 * 1000);
    }

    const newStudent = new Student({
      libraryId: req.ownerId,
      name: name.trim(),
      fatherName: fatherName ? fatherName.trim() : null,
      address: address ? address.trim() : null,
      whatsapp: whatsapp.trim(),
      studentType: studentType || 'fixed',
      seatCode: seatCode ? seatCode.trim().toUpperCase() : null,
      shiftText: shiftText ? shiftText.trim() : 'General Study Shift',
      paidMonths: paidMonths || [],
      feeRate: feeRate || 800,
      totalFee: totalFee || 800,
      joiningDate: joiningDate || new Date(),
      feeExpiryDate: computedExpiry,
      status: 'active',
    });

    await newStudent.save();

    // If seat code is provided and studentType is fixed, update seat status to 'filled'
    if (seatCode && studentType === 'fixed') {
      const cleanCode = seatCode.trim().toUpperCase();
      await Seat.findOneAndUpdate(
        { libraryId: req.ownerId, customSeatCode: cleanCode },
        { status: 'filled', assignedStudent: name.trim() }
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Student admitted successfully.',
      student: newStudent,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. Update Student Record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOne({ _id: id, libraryId: req.ownerId });

    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    Object.assign(student, req.body);
    await student.save();

    return res.status(200).json({ success: true, student });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. Delete Student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Student.findOneAndDelete({ _id: id, libraryId: req.ownerId });

    if (!deleted) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // Free up associated seat if needed
    if (deleted.seatCode) {
      await Seat.findOneAndUpdate(
        { libraryId: req.ownerId, customSeatCode: deleted.seatCode },
        { status: 'active', assignedStudent: null }
      );
    }

    return res.status(200).json({ success: true, message: 'Student deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
