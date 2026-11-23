import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/store.json');

// Ensure data directory exists safely (no-op on read-only serverless filesystems)
try {
  if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  }
} catch {
  // Read-only serverless environment
}

const getFutureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const getPastDate = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const INITIAL_STORE = {
  owners: [
    {
      _id: 'owner-1',
      id: 'owner-1',
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
      subscriptionExpiryDate: getFutureDate(18),
      activeSessionToken: null,
      activeDeviceName: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'owner-2',
      id: 'owner-2',
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
      subscriptionExpiryDate: getPastDate(2),
      activeSessionToken: null,
      activeDeviceName: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  seats: [
    { _id: 's-1', id: 's-1', libraryId: 'owner-1', customSeatCode: 'F-01', zone: 'Hall A (AC Silence Zone)', seatType: 'fixed', status: 'filled', assignedStudent: 'Rohan Sharma', nearAc: true },
    { _id: 's-2', id: 's-2', libraryId: 'owner-1', customSeatCode: 'F-02', zone: 'Hall A (AC Silence Zone)', seatType: 'fixed', status: 'filled', assignedStudent: 'Priya Verma', nearAc: true },
    { _id: 's-3', id: 's-3', libraryId: 'owner-1', customSeatCode: 'F-03', zone: 'Hall A (AC Silence Zone)', seatType: 'fixed', status: 'active', nearAc: true },
    { _id: 's-4', id: 's-4', libraryId: 'owner-1', customSeatCode: 'A-01', zone: 'Hall A (AC Silence Zone)', seatType: 'fixed', status: 'filled', assignedStudent: 'Aman Gupta', nearAc: true },
    { _id: 's-5', id: 's-5', libraryId: 'owner-1', customSeatCode: 'A-10', zone: 'Hall A (AC Silence Zone)', seatType: 'fixed', status: 'filled', assignedStudent: 'Deepak Patel', nearAc: true },
    { _id: 's-6', id: 's-6', libraryId: 'owner-1', customSeatCode: 'B-01', zone: 'Hall B (Discussion Pods)', seatType: 'floating', status: 'active', nearAc: true },
  ],
  students: [
    {
      _id: 'st-1',
      id: 'st-1',
      libraryId: 'owner-1',
      name: 'Rohan Sharma',
      fatherName: 'Manoj Sharma',
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
      _id: 'st-2',
      id: 'st-2',
      libraryId: 'owner-1',
      name: 'Priya Verma',
      fatherName: 'Rajesh Verma',
      whatsapp: '9876543210',
      studentType: 'fixed',
      seatCode: 'F-02',
      shiftText: 'Evening 02:00 PM – 10:00 PM',
      paidMonths: ['Nov 2026'],
      feeRate: 800,
      totalFee: 800,
      joiningDate: getPastDate(25),
      feeExpiryDate: getFutureDate(3),
      status: 'due',
    },
    {
      _id: 'st-3',
      id: 'st-3',
      libraryId: 'owner-1',
      name: 'Deepak Patel',
      fatherName: 'Ramesh Patel',
      whatsapp: '9792045678',
      studentType: 'fixed',
      seatCode: 'A-10',
      shiftText: 'Night Owl 10:00 PM – 06:00 AM',
      paidMonths: ['Oct 2026'],
      feeRate: 750,
      totalFee: 750,
      joiningDate: getPastDate(60),
      feeExpiryDate: getPastDate(3),
      status: 'expired',
    },
  ],
};

try {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_STORE, null, 2));
  }
} catch {
  // Read-only serverless environment
}

let memoryStore = JSON.parse(JSON.stringify(INITIAL_STORE));

class JsonStore {
  read() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      }
    } catch {}
    return memoryStore;
  }

  write(data) {
    memoryStore = data;
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch {}
  }

  createHelper(collectionName) {
    const store = this;

    class DocumentWrapper {
      constructor(data) {
        Object.assign(this, data);
        if (!this._id) {
          this._id = `${collectionName}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        }
        if (!this.id) {
          this.id = this._id;
        }
      }

      async save() {
        const db = store.read();
        const list = db[collectionName] || [];
        const idx = list.findIndex((x) => x._id === this._id || x.id === this._id);

        const serialized = { ...this };
        delete serialized.save;

        if (idx >= 0) {
          list[idx] = serialized;
        } else {
          list.push(serialized);
        }

        db[collectionName] = list;
        store.write(db);
        return this;
      }

      updateStatusFromDate() {
        if (this.feeExpiryDate) {
          const diff = Math.ceil((new Date(this.feeExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (diff < 0) this.status = 'expired';
          else if (diff <= 5) this.status = 'due';
          else this.status = 'active';
        }
        return this.status;
      }

      isSubscriptionValid() {
        if (this.subscriptionStatus !== 'active' || !this.subscriptionExpiryDate) return false;
        return new Date(this.subscriptionExpiryDate).getTime() > Date.now();
      }
    }

    return {
      find(query = {}) {
        const execute = () => {
          const db = store.read();
          let items = db[collectionName] || [];

          items = items.filter((item) => {
            for (const [k, v] of Object.entries(query)) {
              if (v && typeof v === 'object' && v.$ne !== undefined) {
                if (item[k] === v.$ne) return false;
              } else if (item[k] !== v) {
                return false;
              }
            }
            return true;
          });

          return items.map((i) => new DocumentWrapper(i));
        };

        const queryObj = {
          sort(s) { return queryObj; },
          select(s) { return queryObj; },
          then(resolve, reject) {
            try {
              resolve(execute());
            } catch (err) {
              if (reject) reject(err);
            }
          },
          catch(reject) {
            try {
              execute();
            } catch (err) {
              if (reject) reject(err);
            }
          },
        };

        return queryObj;
      },

      async findOne(query = {}) {
        const db = store.read();
        const list = db[collectionName] || [];

        const found = list.find((item) => {
          for (const [k, v] of Object.entries(query)) {
            if (typeof v === 'string') {
              if (item[k]?.toLowerCase() !== v.toLowerCase()) return false;
            } else if (item[k] !== v) {
              return false;
            }
          }
          return true;
        });

        return found ? new DocumentWrapper(found) : null;
      },

      async findOneAndUpdate(query, update, options = {}) {
        const doc = await this.findOne(query);
        if (doc) {
          Object.assign(doc, update);
          await doc.save();
          return doc;
        }
        return null;
      },

      async findOneAndDelete(query) {
        const db = store.read();
        const list = db[collectionName] || [];
        const idx = list.findIndex((item) => {
          for (const [k, v] of Object.entries(query)) {
            if (item[k] !== v && item._id !== v) return false;
          }
          return true;
        });

        if (idx >= 0) {
          const removed = list.splice(idx, 1)[0];
          db[collectionName] = list;
          store.write(db);
          return removed;
        }
        return null;
      },

      async countDocuments(query = {}) {
        const db = store.read();
        return (db[collectionName] || []).length;
      },

      async create(data) {
        const doc = new DocumentWrapper(data);
        await doc.save();
        return doc;
      },

      async insertMany(arr) {
        for (const item of arr) {
          await this.create(item);
        }
        return arr;
      },

      // Constructor for `new Model(data)`
      createInstance(data) {
        return new DocumentWrapper(data);
      },
    };
  }
}

export const jsonStore = new JsonStore();
export const JsonLibraryOwner = jsonStore.createHelper('owners');
export const JsonSeat = jsonStore.createHelper('seats');
export const JsonStudent = jsonStore.createHelper('students');
