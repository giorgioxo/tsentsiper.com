const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'app.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
});

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function init({ adminCredentials = [], seedAllPath, seedCategoriesPath } = {}) {
  await run(db, `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin'
  )`);

  await run(db, `CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ordinal INTEGER,
    text TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`);

  await run(db, `CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )`);

  await run(db, `CREATE TABLE IF NOT EXISTS project_categories (
    project_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (project_id, category_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  )`);

  // Seed users if empty
  const userCount = await get(db, 'SELECT COUNT(*) as c FROM users');
  if ((userCount?.c ?? 0) === 0 && Array.isArray(adminCredentials)) {
    for (const cred of adminCredentials) {
      if (!cred?.username || !cred?.password) continue;
      try {
        await run(db, 'INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', [
          String(cred.username).trim(),
          String(cred.password).trim(),
          'admin',
        ]);
      } catch {}
    }
  }

  // Seed projects and categories if empty and files provided
  const projCount = await get(db, 'SELECT COUNT(*) as c FROM projects');
  if ((projCount?.c ?? 0) === 0) {
    try {
      if (seedAllPath && fs.existsSync(seedAllPath)) {
        const raw = fs.readFileSync(seedAllPath, 'utf8');
        const entries = parseAllData(raw);
        // Insert in descending ordinal to keep top items first visually
        for (const e of entries) {
          await run(
            db,
            'INSERT INTO projects (ordinal, text, created_at) VALUES (?, ?, ?)',
            [e.ordinal, e.text, Date.now() - (entries.length - e.ordinal) * 1000]
          );
        }
      }
      if (seedCategoriesPath && fs.existsSync(seedCategoriesPath)) {
        const raw = fs.readFileSync(seedCategoriesPath, 'utf8');
        const mapping = parseCategories(raw);
        await seedCategoryMappings(mapping);
      }
    } catch (err) {
      console.error('Seeding error:', err);
    }
  }

  // Category normalization intentionally disabled per requirement to delete/remove 'Brand'
  // Leaving this block empty prevents automatic Brand→Branding merge on startup.
}

function parseAllData(content) {
  const lines = content.split(/\r?\n/);
  const entries = [];
  let i = 0;
  while (i < lines.length) {
    const numLine = (lines[i] || '').trim();
    if (/^\d+$/.test(numLine)) {
      const ordinal = parseInt(numLine, 10);
      const title = (lines[i + 1] || '').trim();
      const desc = (lines[i + 2] || '').trim();
      const text = [title, desc].filter(Boolean).join('\n');
      if (text) {
        entries.push({ ordinal, text });
      }
      i += 4; // skip blank line after each entry
      continue;
    }
    i += 1;
  }
  return entries;
}

function parseCategories(content) {
  const lines = content.split(/\r?\n/);
  const categoryToOrdinals = new Map();
  let currentCategory = null;

  const isCategoryHeader = (line) => {
    if (!line) return false;
    if (/^Projects by Tags/i.test(line)) return false;
    if (/^\d+$/.test(line.trim())) return false;
    // Consider lines without trailing colon and not purely numeric as category headers
    return !/:$/.test(line.trim());
  };

  let i = 0;
  while (i < lines.length) {
    const line = (lines[i] || '').trim();
    if (isCategoryHeader(line)) {
      currentCategory = line;
      if (!categoryToOrdinals.has(currentCategory)) {
        categoryToOrdinals.set(currentCategory, new Set());
      }
      i += 1;
      continue;
    }
    if (/^\d+$/.test(line)) {
      const ordinal = parseInt(line, 10);
      // consume title and description lines if present
      const title = (lines[i + 1] || '').trim();
      const desc = (lines[i + 2] || '').trim();
      if (currentCategory) {
        categoryToOrdinals.get(currentCategory).add(ordinal);
      }
      i += 4;
      continue;
    }
    i += 1;
  }

  // Convert sets to arrays
  const mapping = {};
  for (const [cat, set] of categoryToOrdinals.entries()) {
    mapping[cat] = Array.from(set);
  }
  return mapping;
}

async function seedCategoryMappings(mapping) {
  // Ensure categories
  for (const name of Object.keys(mapping)) {
    try {
      await run(db, 'INSERT OR IGNORE INTO categories (name) VALUES (?)', [name]);
    } catch {}
  }
  // Link projects by ordinal
  for (const [name, ordinals] of Object.entries(mapping)) {
    const cat = await get(db, 'SELECT id FROM categories WHERE name = ?', [name]);
    if (!cat) continue;
    for (const ord of ordinals) {
      const proj = await get(db, 'SELECT id FROM projects WHERE ordinal = ?', [ord]);
      if (!proj) continue;
      try {
        await run(db, 'INSERT OR IGNORE INTO project_categories (project_id, category_id) VALUES (?, ?)', [proj.id, cat.id]);
      } catch {}
    }
  }
}

async function validateUser(username, password) {
  const user = await get(db, 'SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [username]);
  if (!user) return false;
  return String(user.password) === String(password);
}

async function getProjectsStrings() {
  // Exclude projects that belong to the 'Brand' category from the global feed
  const rows = await all(
    db,
    `SELECT text FROM projects
     WHERE id NOT IN (
       SELECT pc.project_id
       FROM project_categories pc
       JOIN categories c ON c.id = pc.category_id
       WHERE LOWER(c.name) = LOWER(?)
     )
     ORDER BY created_at DESC`,
    ['Brand']
  );
  return rows.map(r => r.text);
}

async function getProjectsStringsByCategory(categoryName) {
  const rows = await all(
    db,
    `SELECT p.text
     FROM projects p
     JOIN project_categories pc ON pc.project_id = p.id
     JOIN categories c ON c.id = pc.category_id
     WHERE LOWER(c.name) = LOWER(?)
     ORDER BY p.created_at DESC`,
    [String(categoryName).trim()]
  );
  return rows.map(r => r.text);
}

async function getCategoriesWithCounts() {
  const rows = await all(
    db,
    `SELECT c.name as name, COUNT(pc.project_id) as count
     FROM categories c
     LEFT JOIN project_categories pc ON pc.category_id = c.id
     GROUP BY c.id
     ORDER BY c.name ASC`
  );
  return rows;
}

async function mergeCategory(fromName, toName) {
  const from = await get(db, 'SELECT id, name FROM categories WHERE LOWER(name) = LOWER(?)', [fromName]);
  if (!from) return; // nothing to do
  let to = await get(db, 'SELECT id, name FROM categories WHERE LOWER(name) = LOWER(?)', [toName]);
  if (!to) {
    await run(db, 'INSERT INTO categories (name) VALUES (?)', [toName]);
    to = await get(db, 'SELECT id, name FROM categories WHERE LOWER(name) = LOWER(?)', [toName]);
  }
  if (!to) return;

  // Copy relations and avoid duplicates via INSERT OR IGNORE
  await run(db, `INSERT OR IGNORE INTO project_categories (project_id, category_id)
                SELECT project_id, ? FROM project_categories WHERE category_id = ?`, [to.id, from.id]);
  // Remove old relations
  await run(db, 'DELETE FROM project_categories WHERE category_id = ?', [from.id]);
  // Delete old category
  await run(db, 'DELETE FROM categories WHERE id = ?', [from.id]);
}

async function addProjectText(text) {
  await run(db, 'INSERT INTO projects (text, created_at) VALUES (?, ?)', [String(text).trim(), Date.now()]);
}

async function getProjectIdByIndex(index) {
  const row = await get(db, 'SELECT id FROM projects ORDER BY created_at DESC LIMIT 1 OFFSET ?', [index]);
  return row?.id || null;
}

async function updateProjectByIndex(index, text) {
  const id = await getProjectIdByIndex(index);
  if (!id) return false;
  await run(db, 'UPDATE projects SET text = ? WHERE id = ?', [String(text).trim(), id]);
  return true;
}

async function deleteProjectByIndex(index) {
  const id = await getProjectIdByIndex(index);
  if (!id) return false;
  await run(db, 'DELETE FROM projects WHERE id = ?', [id]);
  return true;
}

module.exports = {
  db,
  init,
  validateUser,
  getProjectsStrings,
  getProjectsStringsByCategory,
  getCategoriesWithCounts,
  addProjectText,
  updateProjectByIndex,
  deleteProjectByIndex,
  // exposed for potential future use
  parseAllData,
  parseCategories,
};
