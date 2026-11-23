import mongoose from 'mongoose';
import { JsonStudent } from '../config/dbAdapter.js';

const studentSchema = new mongoose.Schema(
  {
    libraryId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    name: { type: String, required: true, trim: true },
    fatherName: { type: String, default: null, trim: true },
    address: { type: String, default: null, trim: true },
    whatsapp: { type: String, required: true, trim: true },
    studentType: { type: String, enum: ['fixed', 'floating'], default: 'fixed' },
    seatCode: { type: String, default: null, trim: true, uppercase: true },
    shiftText: { type: String, default: 'General Study Shift', trim: true },
    paidMonths: { type: [String], default: [] },
    feeRate: { type: Number, default: 800 },
    totalFee: { type: Number, default: 800 },
    joiningDate: { type: Date, default: Date.now },
    feeExpiryDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'due', 'expired'], default: 'active' },
  },
  { timestamps: true }
);

studentSchema.methods.updateStatusFromDate = function () {
  const now = Date.now();
  const expiry = new Date(this.feeExpiryDate).getTime();
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) this.status = 'expired';
  else if (diffDays <= 5) this.status = 'due';
  else this.status = 'active';
  return this.status;
};

const MongooseStudent = mongoose.models.Student || mongoose.model('Student', studentSchema);

const StudentProxy = new Proxy(MongooseStudent, {
  get(target, prop) {
    if (mongoose.connection?.readyState === 1) {
      return target[prop];
    }
    if (prop in JsonStudent) {
      return JsonStudent[prop];
    }
    return target[prop];
  },
  construct(target, args) {
    if (mongoose.connection?.readyState === 1) {
      return new target(...args);
    }
    return JsonStudent.createInstance(...args);
  },
});

export default StudentProxy;
