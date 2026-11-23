import mongoose from 'mongoose';
import { JsonLibraryOwner } from '../config/dbAdapter.js';

const libraryOwnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    libraryName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    otpCode: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    activeSessionToken: { type: String, default: null },
    activeDeviceName: { type: String, default: null },
    subscriptionPlan: {
      type: String,
      enum: ['Pro Growth', 'Enterprise Elite', 'unpaid'],
      default: 'unpaid',
    },
    subscriptionPrice: { type: Number, default: 0 },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'expired', 'unpaid'],
      default: 'unpaid',
    },
    billingCycleDays: { type: Number, default: 28 },
    subscriptionStartDate: { type: Date, default: null },
    subscriptionExpiryDate: { type: Date, default: null },
    lastPayment: {
      amount: Number,
      method: String,
      referenceId: String,
      paidAt: Date,
    },
  },
  { timestamps: true }
);

libraryOwnerSchema.methods.isSubscriptionValid = function () {
  if (this.subscriptionStatus !== 'active' || !this.subscriptionExpiryDate) return false;
  return new Date(this.subscriptionExpiryDate).getTime() > Date.now();
};

const MongooseLibraryOwner = mongoose.models.LibraryOwner || mongoose.model('LibraryOwner', libraryOwnerSchema);

// Hybrid proxy that delegates to Mongoose when connected or JsonStore when in local free-tier fallback
const LibraryOwnerProxy = new Proxy(MongooseLibraryOwner, {
  get(target, prop) {
    if (mongoose.connection?.readyState === 1) {
      return target[prop];
    }
    if (prop in JsonLibraryOwner) {
      return JsonLibraryOwner[prop];
    }
    return target[prop];
  },
  construct(target, args) {
    if (mongoose.connection?.readyState === 1) {
      return new target(...args);
    }
    return JsonLibraryOwner.createInstance(...args);
  },
});

export default LibraryOwnerProxy;
