import mongoose from 'mongoose';
import { JsonSeat } from '../config/dbAdapter.js';

const seatSchema = new mongoose.Schema(
  {
    libraryId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    customSeatCode: { type: String, required: true, trim: true, uppercase: true },
    zone: { type: String, default: 'Hall A (AC Silence Zone)', trim: true },
    seatType: { type: String, enum: ['fixed', 'floating'], default: 'fixed' },
    status: { type: String, enum: ['active', 'filled', 'inactive'], default: 'active' },
    assignedStudent: { type: String, default: null, trim: true },
    nearAc: { type: Boolean, default: false },
  },
  { timestamps: true }
);

seatSchema.index({ libraryId: 1, customSeatCode: 1 }, { unique: true });

const MongooseSeat = mongoose.models.Seat || mongoose.model('Seat', seatSchema);

const SeatProxy = new Proxy(MongooseSeat, {
  get(target, prop) {
    if (mongoose.connection?.readyState === 1) {
      return target[prop];
    }
    if (prop in JsonSeat) {
      return JsonSeat[prop];
    }
    return target[prop];
  },
  construct(target, args) {
    if (mongoose.connection?.readyState === 1) {
      return new target(...args);
    }
    return JsonSeat.createInstance(...args);
  },
});

export default SeatProxy;
