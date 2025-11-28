-- Migration: Create endorsements table for TRAC-staked endorsements
-- Supports both skill and project endorsements with DKG publishing

CREATE TABLE IF NOT EXISTS endorsements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Endorser (who is giving the endorsement)
    endorser_ual TEXT NOT NULL,
    endorser_username TEXT NOT NULL,
    endorser_name TEXT NOT NULL,
    
    -- Target (who/what is being endorsed)
    target_type TEXT NOT NULL CHECK(target_type IN ('skill', 'project')),
    target_id TEXT NOT NULL, -- UAL for profile, project_id for project
    target_username TEXT, -- For skill endorsements (profile username)
    skill_name TEXT, -- For skill endorsements (e.g., "React", "TypeScript")
    project_id INTEGER, -- For project endorsements
    
    -- Endorsement details
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    message TEXT NOT NULL CHECK(LENGTH(message) >= 10 AND LENGTH(message) <= 500),
    trac_staked REAL NOT NULL CHECK(trac_staked >= 100 AND trac_staked <= 10000),
    
    -- DKG publishing data
    ual TEXT, -- Endorsement UAL on DKG
    dataset_root TEXT,
    publish_status TEXT DEFAULT 'pending' CHECK(publish_status IN ('pending', 'publishing', 'completed', 'failed')),
    operation_id TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    withdrawn_at TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Prevent duplicate endorsements (same endorser + target + skill)
    UNIQUE(endorser_ual, target_type, target_id, skill_name)
);

-- Indexes for performance
CREATE INDEX idx_endorsements_target ON endorsements(target_type, target_id);
CREATE INDEX idx_endorsements_endorser ON endorsements(endorser_ual);
CREATE INDEX idx_endorsements_project ON endorsements(project_id);
CREATE INDEX idx_endorsements_status ON endorsements(publish_status);
CREATE INDEX idx_endorsements_created ON endorsements(created_at DESC);
