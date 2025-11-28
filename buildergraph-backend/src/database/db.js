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
      github_id TEXT UNIQUE,
      avatar_url TEXT,
      access_token TEXT,
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
      ai_analysis_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_ual) REFERENCES profiles(ual)
    )
  `);

  // Add ai_analysis_hash column to projects table if it doesn't exist
  try {
    db.exec(`
      ALTER TABLE projects ADD COLUMN ai_analysis_hash TEXT
    `);
  } catch (error) {
    // Column already exists, ignore error
    if (!error.message.includes('duplicate column')) {
      console.warn('Warning adding ai_analysis_hash column:', error.message);
    }
  }

  // Create ai_analysis table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT UNIQUE NOT NULL,
      analysis_text TEXT NOT NULL,
      score INTEGER,
      score_breakdown TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create index on hash for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_ai_analysis_hash ON ai_analysis(hash)
  `);

  // Create endorsements table
  db.exec(`
    CREATE TABLE IF NOT EXISTS endorsements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      endorser_ual TEXT NOT NULL,
      endorser_username TEXT NOT NULL,
      endorser_name TEXT NOT NULL,
      target_type TEXT NOT NULL CHECK(target_type IN ('skill', 'project')),
      target_id TEXT NOT NULL,
      target_username TEXT,
      skill_name TEXT,
      project_id INTEGER,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      message TEXT NOT NULL,
      trac_staked REAL NOT NULL DEFAULT 0,
      ual TEXT UNIQUE,
      dataset_root TEXT,
      publish_status TEXT DEFAULT 'pending',
      operation_id TEXT,
      withdrawn_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create all_data table to store all published DKG data
  // ual = user's/profile's UAL (not unique, as one user can have multiple projects)
  // project_ual = project's UAL (unique per project)
  db.exec(`
    CREATE TABLE IF NOT EXISTS all_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ual TEXT NOT NULL,
      dataset_root TEXT,
      project_ual TEXT UNIQUE,
      user_ual TEXT,
      published_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add user_ual column if it doesn't exist (for existing databases)
  try {
    db.exec(`
      ALTER TABLE all_data ADD COLUMN user_ual TEXT
    `);
  } catch (error) {
    // Column already exists, ignore error
    if (!error.message.includes('duplicate column')) {
      console.warn('Warning adding user_ual column:', error.message);
    }
  }

  // Create index on UAL for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_all_data_ual ON all_data(ual)
  `);

  // Create index on project_ual for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_all_data_project_ual ON all_data(project_ual)
  `);

  // Create index on user_ual for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_all_data_user_ual ON all_data(user_ual)
  `);

  // Create profile_access table for payment tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile_access (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payer_wallet_address TEXT NOT NULL,
      profile_username TEXT NOT NULL,
      transaction_hash TEXT UNIQUE NOT NULL,
      amount_paid TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME
    )
  `);

  // Create index on payer_wallet_address and profile_username for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_profile_access_payer_profile 
    ON profile_access(payer_wallet_address, profile_username)
  `);

  // Migrate existing all_data rows to populate user_ual and project_ual
  try {
    console.log('🔄 Migrating existing all_data rows...');
    const selectStmt = db.prepare('SELECT * FROM all_data WHERE user_ual IS NULL OR project_ual IS NULL');
    const allDataRows = selectStmt.all();

    let migratedCount = 0;
    const updateStmt = db.prepare(`
      UPDATE all_data 
      SET ual = ?, user_ual = ?, project_ual = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);

    // Prepare statement to get project by UAL
    const getProjectByUalStmt = db.prepare('SELECT * FROM projects WHERE ual = ?');

    for (const row of allDataRows) {
      try {
        // Try to find project by UAL (row.ual is currently the project UAL)
        // First try row.ual as project UAL
        let project = getProjectByUalStmt.get(row.ual);

        // If not found, try project_ual field
        if (!project && row.project_ual) {
          project = getProjectByUalStmt.get(row.project_ual);
        }

        if (project) {
          // Update: ual = user's UAL (owner_ual), project_ual = project's UAL
          const projectUAL = row.project_ual || row.ual; // Use existing project_ual or row.ual as project UAL
          const userUAL = project.owner_ual; // User's/profile's UAL
          updateStmt.run(userUAL, userUAL, projectUAL, row.id);
          migratedCount++;
        } else {
          // If project not found, try to extract from published_data
          try {
            const publishedData = typeof row.published_data === 'string'
              ? JSON.parse(row.published_data)
              : row.published_data;

            // Try to find creator/owner UAL from published data
            let ownerUal = null;
            if (publishedData?.public) {
              const creator = publishedData.public['schema:creator'] || publishedData.public['prov:wasAttributedTo'];
              if (creator && creator['@id']) {
                ownerUal = creator['@id'];
              }
            }

            if (ownerUal) {
              // row.ual is the project UAL, ownerUal is the user UAL
              const projectUAL = row.project_ual || row.ual;
              updateStmt.run(ownerUal, ownerUal, projectUAL, row.id);
              migratedCount++;
            } else {
              console.warn(`⚠️ Could not find owner UAL for all_data row with UAL: ${row.ual}`);
            }
          } catch (parseError) {
            console.warn(`⚠️ Could not parse published_data for UAL: ${row.ual}`, parseError.message);
          }
        }
      } catch (error) {
        console.error(`❌ Error migrating all_data row with UAL: ${row.ual}`, error.message);
      }
    }

    if (migratedCount > 0) {
      console.log(`✅ Migrated ${migratedCount} all_data row(s)`);
    } else {
      console.log('✅ No all_data rows needed migration');
    }
  } catch (error) {
    console.warn('⚠️ Error during all_data migration:', error.message);
  }

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

  // Upsert profile from GitHub data
  upsertFromGithub: (profileData) => {
    const stmt = db.prepare(`
      INSERT INTO profiles (
        github_id, username, full_name, email, avatar_url, bio, location,
        github_username, access_token, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(github_id) DO UPDATE SET
        username = excluded.username,
        full_name = excluded.full_name,
        email = excluded.email,
        avatar_url = excluded.avatar_url,
        bio = COALESCE(excluded.bio, profiles.bio),
        location = COALESCE(excluded.location, profiles.location),
        github_username = excluded.github_username,
        access_token = excluded.access_token,
        updated_at = CURRENT_TIMESTAMP
    `);

    return stmt.run(
      profileData.github_id,
      profileData.username,
      profileData.full_name,
      profileData.email,
      profileData.avatar_url,
      profileData.bio,
      profileData.location,
      profileData.github_username,
      profileData.access_token
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

  getByGithubId: (githubId) => {
    const stmt = db.prepare('SELECT * FROM profiles WHERE github_id = ?');
    return stmt.get(githubId);
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
        category, live_url, ual, dataset_root, publish_status, operation_id, ai_analysis_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      project.operation_id || null,
      project.ai_analysis_hash || null
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
  },

  // Delete project by ID
  deleteById: (id) => {
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    return stmt.run(id);
  },

  updateAiAnalysisHash: (id, hash) => {
    const stmt = db.prepare(`
      UPDATE projects 
      SET ai_analysis_hash = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    return stmt.run(hash, id);
  },
};

/**
 * AI Analysis queries
 */
export const aiAnalysisQueries = {
  insert: (hash, analysisText, score, scoreBreakdown) => {
    const stmt = db.prepare(`
      INSERT INTO ai_analysis (hash, analysis_text, score, score_breakdown)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(
      hash,
      analysisText,
      score,
      scoreBreakdown ? JSON.stringify(scoreBreakdown) : null
    );
  },

  getByHash: (hash) => {
    const stmt = db.prepare('SELECT * FROM ai_analysis WHERE hash = ?');
    const result = stmt.get(hash);
    if (result && result.score_breakdown) {
      try {
        result.score_breakdown = JSON.parse(result.score_breakdown);
      } catch (e) {
        // Keep as string if parsing fails
      }
    }
    return result;
  },

  update: (hash, analysisText, score, scoreBreakdown) => {
    const stmt = db.prepare(`
      UPDATE ai_analysis 
      SET analysis_text = ?, score = ?, score_breakdown = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE hash = ?
    `);
    return stmt.run(
      analysisText,
      score,
      scoreBreakdown ? JSON.stringify(scoreBreakdown) : null,
      hash
    );
  },
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

/**
 * All Data queries - stores all published DKG data
 */
export const allDataQueries = {
  // Insert published data
  insert: (data) => {
    const stmt = db.prepare(`
      INSERT INTO all_data (ual, dataset_root, project_ual, user_ual, published_data)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.ual,
      data.dataset_root || null,
      data.project_ual || null,
      data.user_ual || null,
      JSON.stringify(data.published_data)
    );
  },

  // Get by UAL
  getByUal: (ual) => {
    const stmt = db.prepare('SELECT * FROM all_data WHERE ual = ?');
    const result = stmt.get(ual);
    if (result && result.published_data) {
      try {
        result.published_data = JSON.parse(result.published_data);
      } catch (e) {
        // Keep as string if parsing fails
      }
    }
    return result;
  },

  // Get by project UAL
  getByProjectUal: (projectUal) => {
    const stmt = db.prepare('SELECT * FROM all_data WHERE project_ual = ?');
    const results = stmt.all(projectUal);
    return results.map(result => {
      if (result.published_data) {
        try {
          result.published_data = JSON.parse(result.published_data);
        } catch (e) {
          // Keep as string if parsing fails
        }
      }
      return result;
    });
  },

  // Get by user UAL (user's/profile's UAL)
  getByUserUal: (userUal) => {
    const stmt = db.prepare('SELECT * FROM all_data WHERE ual = ? OR user_ual = ?');
    const results = stmt.all(userUal, userUal);
    return results.map(result => {
      if (result.published_data) {
        try {
          result.published_data = JSON.parse(result.published_data);
        } catch (e) {
          // Keep as string if parsing fails
        }
      }
      return result;
    });
  },

  // Get all
  getAll: () => {
    const stmt = db.prepare('SELECT * FROM all_data ORDER BY created_at DESC');
    const results = stmt.all();
    return results.map(result => {
      if (result.published_data) {
        try {
          result.published_data = JSON.parse(result.published_data);
        } catch (e) {
          // Keep as string if parsing fails
        }
      }
      return result;
    });
  },

  // Delete by UAL
  deleteByUal: (ual) => {
    const stmt = db.prepare('DELETE FROM all_data WHERE ual = ?');
    return stmt.run(ual);
  }
};

/**
 * Profile Access queries
 */
export const profileAccessQueries = {
  // Grant access after payment
  grantAccess: (payerWalletAddress, profileUsername, transactionHash, amountPaid) => {
    const stmt = db.prepare(`
      INSERT INTO profile_access (payer_wallet_address, profile_username, transaction_hash, amount_paid)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(payerWalletAddress, profileUsername, transactionHash, amountPaid);
  },

  // Check if user has access
  hasAccess: (payerWalletAddress, profileUsername) => {
    const stmt = db.prepare(`
      SELECT * FROM profile_access 
      WHERE payer_wallet_address = ? AND profile_username = ?
      AND (expires_at IS NULL OR expires_at > datetime('now'))
      LIMIT 1
    `);
    return stmt.get(payerWalletAddress, profileUsername);
  },

  // Get all access records for a wallet
  getAccessByWallet: (payerWalletAddress) => {
    const stmt = db.prepare(`
      SELECT * FROM profile_access 
      WHERE payer_wallet_address = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(payerWalletAddress);
  },
};

export { db };
