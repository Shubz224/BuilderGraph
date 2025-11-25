/**
 * Database initialization and query functions for BuilderGraph
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/buildergraph.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;

/**
 * Initialize database and create tables
 */
export function initializeDatabase() {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Create profiles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      location TEXT,
      bio TEXT,
      skills TEXT,
      github_username TEXT,
      github_repos TEXT,
      ual TEXT UNIQUE,
      dkg_asset_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_ual TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      repository_url TEXT NOT NULL,
      tech_stack TEXT,
      category TEXT,
      live_url TEXT,
      ual TEXT UNIQUE,
      dkg_asset_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_ual) REFERENCES profiles(ual)
    )
  `);

  console.log('✅ Database initialized at:', dbPath);
  return db;
}

/**
 * Profile queries
 */
export const profileQueries = {
  insert: (profile) => {
    const stmt = db.prepare(`
      INSERT INTO profiles (
        full_name, username, email, location, bio, skills,
        github_username, github_repos, ual, dkg_asset_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      profile.full_name,
      profile.username,
      profile.email,
      profile.location || null,
      profile.bio || null,
      profile.skills ? JSON.stringify(profile.skills) : null,
      profile.github_username || null,
      profile.github_repos ? JSON.stringify(profile.github_repos) : null,
      profile.ual || null,
      profile.dkg_asset_id || null
    );
  },

  getById: (id) => {
    const stmt = db.prepare('SELECT * FROM profiles WHERE id = ?');
    return stmt.get(id);
  },

  getByUsername: (username) => {
    const stmt = db.prepare('SELECT * FROM profiles WHERE username = ?');
    return stmt.get(username);
  },

  getByUal: (ual) => {
    const stmt = db.prepare('SELECT * FROM profiles WHERE ual = ?');
    return stmt.get(ual);
  },

  getAll: () => {
    const stmt = db.prepare('SELECT * FROM profiles ORDER BY created_at DESC');
    return stmt.all();
  },

  updateUal: (id, ual, dkgAssetId) => {
    const stmt = db.prepare(`
      UPDATE profiles 
      SET ual = ?, dkg_asset_id = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    return stmt.run(ual, dkgAssetId, id);
  }
};

/**
 * Project queries
 */
export const projectQueries = {
  insert: (project) => {
    const stmt = db.prepare(`
      INSERT INTO projects (
        user_ual, name, description, repository_url, tech_stack,
        category, live_url, ual, dkg_asset_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      project.user_ual,
      project.name,
      project.description,
      project.repository_url,
      project.tech_stack ? JSON.stringify(project.tech_stack) : null,
      project.category || null,
      project.live_url || null,
      project.ual || null,
      project.dkg_asset_id || null
    );
  },

  getById: (id) => {
    const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    return stmt.get(id);
  },

  getByUserUal: (userUal) => {
    const stmt = db.prepare('SELECT * FROM projects WHERE user_ual = ? ORDER BY created_at DESC');
    return stmt.all(userUal);
  },

  getByUal: (ual) => {
    const stmt = db.prepare('SELECT * FROM projects WHERE ual = ?');
    return stmt.get(ual);
  },

  getAll: () => {
    const stmt = db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
    return stmt.all();
  },

  updateUal: (id, ual, dkgAssetId) => {
    const stmt = db.prepare(`
      UPDATE projects 
      SET ual = ?, dkg_asset_id = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    return stmt.run(ual, dkgAssetId, id);
  }
};

export { db };
