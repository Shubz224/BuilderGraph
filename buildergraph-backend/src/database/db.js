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
      experience INTEGER,
      languages TEXT,
      specializations TEXT,
      github_username TEXT,
      github_repos TEXT,
      ual TEXT UNIQUE,
      dataset_root TEXT,
      publish_status TEXT DEFAULT 'pending',
      operation_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_ual TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      repository_url TEXT NOT NULL,
      tech_stack TEXT,
      category TEXT,
      live_url TEXT,
      ual TEXT UNIQUE,
      dataset_root TEXT,
      publish_status TEXT DEFAULT 'pending',
      operation_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_ual) REFERENCES profiles(ual)
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
        full_name, username, email, location, bio, skills, experience,
        languages, specializations, github_username, github_repos,
        ual, dataset_root, publish_status, operation_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      profile.full_name,
      profile.username,
      profile.email,
      profile.location || null,
      profile.bio || null,
      profile.skills ? JSON.stringify(profile.skills) : null,
      profile.experience || null,
      profile.languages ? JSON.stringify(profile.languages) : null,
      profile.specializations ? JSON.stringify(profile.specializations) : null,
      profile.github_username || null,
      profile.github_repos ? JSON.stringify(profile.github_repos) : null,
      profile.ual || null,
      profile.dataset_root || null,
      profile.publish_status || 'pending',
      profile.operation_id || null
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

  getByOperationId: (operationId) => {
    const stmt = db.prepare('SELECT * FROM profiles WHERE operation_id = ?');
    return stmt.get(operationId);
  },

  getAll: () => {
    const stmt = db.prepare('SELECT * FROM profiles ORDER BY created_at DESC');
    return stmt.all();
  },

  updatePublishStatus: (id, status, ual = null, datasetRoot = null) => {
    const stmt = db.prepare(`
      UPDATE profiles 
      SET publish_status = ?, ual = COALESCE(?, ual), dataset_root = COALESCE(?, dataset_root), updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    return stmt.run(status, ual, datasetRoot, id);
  },

  // Legacy method for compatibility
  updateUal: (id, ual, datasetRoot) => {
    const stmt = db.prepare(`
      UPDATE profiles 
      SET ual = ?, dataset_root = ?, publish_status = 'completed', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    return stmt.run(ual, datasetRoot, id);
  }
};

/**
 * Project queries
 */
export const projectQueries = {
  insert: (project) => {
    const stmt = db.prepare(`
      INSERT INTO projects (
        owner_ual, name, description, repository_url, tech_stack,
        category, live_url, ual, dataset_root, publish_status, operation_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      project.owner_ual,
      project.name,
      project.description,
      project.repository_url,
      project.tech_stack ? JSON.stringify(project.tech_stack) : null,
      project.category || null,
      project.live_url || null,
      project.ual || null,
      project.dataset_root || null,
      project.publish_status || 'pending',
      project.operation_id || null
    );
  },

  getById: (id) => {
    const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    return stmt.get(id);
  },

  getByOwnerUal: (ownerUal) => {
    const stmt = db.prepare('SELECT * FROM projects WHERE owner_ual = ? ORDER BY created_at DESC');
    return stmt.all(ownerUal);
  },

  getByUal: (ual) => {
    const stmt = db.prepare('SELECT * FROM projects WHERE ual = ?');
    return stmt.get(ual);
  },

  getByOperationId: (operationId) => {
    const stmt = db.prepare('SELECT * FROM projects WHERE operation_id = ?');
    return stmt.get(operationId);
  },

  getAll: () => {
    const stmt = db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
    return stmt.all();
  },

  updatePublishStatus: (id, status, ual = null, datasetRoot = null) => {
    const stmt = db.prepare(`
      UPDATE projects 
      SET publish_status = ?, ual = COALESCE(?, ual), dataset_root = COALESCE(?, dataset_root), updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    return stmt.run(status, ual, datasetRoot, id);
  },

  // Legacy method for compatibility
  updateUal: (id, ual, datasetRoot) => {
    const stmt = db.prepare(`
      UPDATE projects 
      SET ual = ?, dataset_root = ?, publish_status = 'completed', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    return stmt.run(ual, datasetRoot, id);
  },

  // Legacy method - kept for compatibility
  getByUserUal: (userUal) => {
    return projectQueries.getByOwnerUal(userUal);
  }
};

/**
 * Endorsement queries
 */
export const endorsementQueries = {
  // Create new endorsement
  create: (endorsementData) => {
    const stmt = db.prepare(`
      INSERT INTO endorsements (
        endorser_ual, endorser_username, endorser_name,
        target_type, target_id, target_username, skill_name, project_id,
        rating, message, trac_staked, operation_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      endorsementData.endorserUAL,
      endorsementData.endorserUsername,
      endorsementData.endorserName,
      endorsementData.targetType,
      endorsementData.targetId,
      endorsementData.targetUsername || null,
      endorsementData.skillName || null,
      endorsementData.projectId || null,
      endorsementData.rating,
      endorsementData.message,
      endorsementData.tracStaked,
      endorsementData.operationId
    );

    return info.lastInsertRowid;
  },

  // Get endorsement by ID
  getById: (id) => {
    const stmt = db.prepare('SELECT * FROM endorsements WHERE id = ?');
    return stmt.get(id);
  },

  // Get endorsements received by a user (skill endorsements)
  getByUserUal: (userUal) => {
    const stmt = db.prepare(`
      SELECT * FROM endorsements 
      WHERE target_type = 'skill' AND target_id = ? AND withdrawn_at IS NULL
      ORDER BY created_at DESC
    `);
    return stmt.all(userUal);
  },

  // Get endorsements for a project
  getByProjectId: (projectId) => {
    const stmt = db.prepare(`
      SELECT * FROM endorsements 
      WHERE target_type = 'project' AND project_id = ? AND withdrawn_at IS NULL
      ORDER BY created_at DESC
    `);
    return stmt.all(projectId);
  },

  // Get endorsements given by a user
  getGivenByUser: (endorserUal) => {
    const stmt = db.prepare(`
      SELECT * FROM endorsements 
      WHERE endorser_ual = ? 
      ORDER BY created_at DESC
    `);
    return stmt.all(endorserUal);
  },

  // Update endorsement with UAL and dataset root
  updateUal: (id, ual, datasetRoot) => {
    const stmt = db.prepare(`
      UPDATE endorsements 
      SET ual = ?, dataset_root = ?, publish_status = 'completed' 
      WHERE id = ?
    `);
    return stmt.run(ual, datasetRoot, id);
  },

  // Update publish status
  updateStatus: (id, status) => {
    const stmt = db.prepare('UPDATE endorsements SET publish_status = ? WHERE id = ?');
    return stmt.run(status, id);
  },

  // Update operation ID
  updateOperationId: (id, operationId) => {
    const stmt = db.prepare('UPDATE endorsements SET operation_id = ? WHERE id = ?');
    return stmt.run(operationId, id);
  },

  // Withdraw endorsement (mark as withdrawn)
  withdraw: (id, endorserUal) => {
    const stmt = db.prepare(`
      UPDATE endorsements 
      SET withdrawn_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND endorser_ual = ? AND withdrawn_at IS NULL
    `);
    return stmt.run(id, endorserUal);
  },

  // Get endorsement by operation ID (for status polling)
  getByOperationId: (operationId) => {
    const stmt = db.prepare('SELECT * FROM endorsements WHERE operation_id = ?');
    return stmt.get(operationId);
  },

  // Get endorsement stats for a user
  getStatsForUser: (userUal) => {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total_endorsements,
        SUM(trac_staked) as total_trac_staked,
        AVG(rating) as average_rating,
        COUNT(DISTINCT skill_name) as unique_skills_endorsed
      FROM endorsements 
      WHERE target_type = 'skill' AND target_id = ? AND withdrawn_at IS NULL
    `);
    return stmt.get(userUal);
  },

  // Get top endorsed skills for a user
  getTopSkills: (userUal, limit = 5) => {
    const stmt = db.prepare(`
      SELECT 
        skill_name,
        COUNT(*) as endorsement_count,
        SUM(trac_staked) as total_trac,
        AVG(rating) as average_rating
      FROM endorsements 
      WHERE target_type = 'skill' AND target_id = ? AND withdrawn_at IS NULL
      GROUP BY skill_name
      ORDER BY total_trac DESC, endorsement_count DESC
      LIMIT ?
    `);
    return stmt.all(userUal, limit);
  }
};

export { db };
