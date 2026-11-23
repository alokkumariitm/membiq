import LibraryOwner from '../models/LibraryOwner.js';
import Seat from '../models/Seat.js';
import Student from '../models/Student.js';

export const seedInitialDatabase = async () => {
  try {
    const ownerCount = await LibraryOwner.countDocuments();
    if (ownerCount > 0) return; // Already seeded

    console.log('[Database Seed]: Initializing database with realistic reading hall data...');

    const getFutureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const getPastDate = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Seed 1: Rohit Verma (Active 28-day Enterprise Plan)
    const owner1 = await LibraryOwner.create({
      name: 'Rohit Verma',
      libraryName: 'Rajendra Nagar Aspirants Hub',
      email: 'rohit@rajendranagar.com',
      phone: '9811223344',
      password: 'password123',
      isEmailVerified: true,
      subscriptionPlan: 'Enterprise Elite',
      subscriptionPrice: 499,
      subscriptionStatus: 'active',
      billingCycleDays: 28,
      subscriptionStartDate: getPastDate(10),
      subscriptionExpiryDate: getFutureDate(18), // 18 days left in 28-day cycle
    });

    // Seed 2: Alok Ranjan (Expired 28-day Plan -> Locked)
    await LibraryOwner.create({
      name: 'Alok Ranjan',
      libraryName: 'Kankarbagh Self-Study Center',
      email: 'alok@kankarbagh.com',
      phone: '9431098765',
      password: 'password123',
      isEmailVerified: true,
      subscriptionPlan: 'Pro Growth',
      subscriptionPrice: 199,
      subscriptionStatus: 'expired',
      billingCycleDays: 28,
      subscriptionStartDate: getPastDate(30),
      subscriptionExpiryDate: getPastDate(2), // Expired 2 days ago
    });

    // Seed Seats for owner1
    const seatsData = [
      { libraryId: owner1._id, customSeatCode: 'F-01', zone: 'Hall A (AC Silence Zone)', seatType: 'fixed', status: 'filled', assignedStudent: 'Rohan Sharma', nearAc: true },
      { libraryId: owner1._id, customSeatCode: 'F-02', zone: 'Hall A (AC Silence Zone)', seatType: 'fixed', status: 'filled', assignedStudent: 'Priya Verma', nearAc: true },
      { libraryId: owner1._id, customSeatCode: 'F-03', zone: 'Hall A (AC Silence Zone)', seatType: 'fixed', status: 'active', nearAc: true },
      { libraryId: owner1._id, customSeatCode: 'F-04', zone: 'Hall A (AC Silence Zone)', seatType: 'fixed', status: 'inactive', nearAc: false },
      { libraryId: owner1._id, customSeatCode: 'A-01', zone: 'Hall A (AC Silence Zone)', seatType: 'fixed', status: 'filled', assignedStudent: 'Aman Gupta', nearAc: true },
      { libraryId: owner1._id, customSeatCode: 'A-02', zone: 'Hall A (AC Silence Zone)', seatType: 'fixed', status: 'active', nearAc: false },
      { libraryId: owner1._id, customSeatCode: 'A-10', zone: 'Hall A (AC Silence Zone)', seatType: 'fixed', status: 'filled', assignedStudent: 'Deepak Patel', nearAc: true },
      { libraryId: owner1._id, customSeatCode: 'B-01', zone: 'Hall B (Discussion Pods)', seatType: 'floating', status: 'active', nearAc: true },
      { libraryId: owner1._id, customSeatCode: 'B-02', zone: 'Hall B (Discussion Pods)', seatType: 'floating', status: 'filled', assignedStudent: 'Ananya Roy', nearAc: false },
    ];
    await Seat.insertMany(seatsData);

    // Seed Students for owner1
    const studentsData = [
      {
        libraryId: owner1._id,
        name: 'Rohan Sharma',
        fatherName: 'Manoj Sharma',
        address: 'Shanti Kunj, Flat 102',
        whatsapp: '9811223344',
        studentType: 'fixed',
        seatCode: 'F-01',
        shiftText: 'Morning 06:00 AM – 02:00 PM',
        paidMonths: ['Nov 2026', 'Dec 2026'],
        feeRate: 800,
        totalFee: 1600,
        joiningDate: getPastDate(40),
        feeExpiryDate: getFutureDate(22),
        status: 'active',
      },
      {
        libraryId: owner1._id,
        name: 'Priya Verma',
        fatherName: 'Rajesh Verma',
        address: 'Boring Road Colony',
        whatsapp: '9876543210',
        studentType: 'fixed',
        seatCode: 'F-02',
        shiftText: 'Evening 02:00 PM – 10:00 PM',
        paidMonths: ['Nov 2026'],
        feeRate: 800,
        totalFee: 800,
        joiningDate: getPastDate(25),
        feeExpiryDate: getFutureDate(3), // Due in 3 days!
        status: 'due',
      },
      {
        libraryId: owner1._id,
        name: 'Deepak Patel',
        fatherName: 'Ramesh Patel',
        address: 'Civil Lines Hostel',
        whatsapp: '9792045678',
        studentType: 'fixed',
        seatCode: 'A-10',
        shiftText: 'Night Owl 10:00 PM – 06:00 AM',
        paidMonths: ['Oct 2026'],
        feeRate: 750,
        totalFee: 750,
        joiningDate: getPastDate(60),
        feeExpiryDate: getPastDate(3), // Expired!
        status: 'expired',
      },
    ];
    await Student.insertMany(studentsData);

    console.log('[Database Seed]: Realistic test data seeded successfully.');
  } catch (error) {
    console.warn('[Database Seed Notice]:', error.message);
  }
};

export default seedInitialDatabase;
