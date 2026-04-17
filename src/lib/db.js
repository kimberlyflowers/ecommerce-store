const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let _db = null;
let _initialized = false;

function getDb() {
  if (_db) return _db;

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const dbPath = process.env.DATABASE_URL || path.join(dataDir, 'marketplace.db');
  _db = new Database(dbPath);

  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  _db.pragma('busy_timeout = 10000');

  if (!_initialized) {
    try {
      _db.exec(`
        CREATE TABLE IF NOT EXISTS vendors (
          id TEXT PRIMARY KEY,
          business_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          api_key TEXT UNIQUE NOT NULL,
          description TEXT,
          logo_url TEXT,
          website TEXT,
          status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'suspended')),
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          image_url TEXT
        );

        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          vendor_id TEXT NOT NULL,
          category_id TEXT,
          name TEXT NOT NULL,
          slug TEXT NOT NULL,
          description TEXT,
          price INTEGER NOT NULL,
          compare_at_price INTEGER,
          metal_type TEXT,
          stone_type TEXT,
          carat_weight REAL,
          ring_sizes TEXT DEFAULT '[]',
          images TEXT DEFAULT '[]',
          status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'archived')),
          inventory_count INTEGER DEFAULT 0,
          sku TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (vendor_id) REFERENCES vendors(id),
          FOREIGN KEY (category_id) REFERENCES categories(id)
        );

        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          customer_email TEXT NOT NULL,
          customer_name TEXT NOT NULL,
          shipping_address TEXT NOT NULL,
          items TEXT NOT NULL,
          subtotal INTEGER NOT NULL,
          tax INTEGER DEFAULT 0,
          shipping INTEGER DEFAULT 0,
          total INTEGER NOT NULL,
          stripe_payment_id TEXT,
          status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
          created_at TEXT DEFAULT (datetime('now'))
        );

        INSERT OR IGNORE INTO categories (id, name, slug, description) VALUES
          ('cat_solitaire', 'Solitaire', 'solitaire', 'Classic single stone engagement rings'),
          ('cat_halo', 'Halo', 'halo', 'Rings with a halo of smaller diamonds'),
          ('cat_vintage', 'Vintage', 'vintage', 'Vintage and antique-inspired designs'),
          ('cat_three_stone', 'Three Stone', 'three-stone', 'Symbolic past, present, and future rings'),
          ('cat_pave', 'Pavé', 'pave', 'Bands encrusted with small diamonds'),
          ('cat_cluster', 'Cluster', 'cluster', 'Multiple stones grouped together'),
          ('cat_custom', 'Custom', 'custom', 'Custom designed engagement rings');
      `);
      _initialized = true;
    } catch (e) {
      // Another worker may have already created the tables — that's fine
      if (!e.message.includes('already exists')) {
        console.warn('DB init warning:', e.message);
      }
      _initialized = true;
    }
  }

  return _db;
}

module.exports = { getDb };
