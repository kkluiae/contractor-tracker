-- Run this once after creating the D1 database

CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  notes TEXT,
  updated_at TEXT NOT NULL
);

-- Optional sample data
-- INSERT INTO locations (name, lat, lng, notes, updated_at)
-- VALUES ('John Chan', 22.3193, 114.1694, 'Site A', datetime('now'));
