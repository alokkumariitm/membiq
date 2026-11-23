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
  owners: [],
  seats: [],
  students: [],
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
