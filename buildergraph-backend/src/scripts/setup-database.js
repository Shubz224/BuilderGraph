/**
 * Database Setup Script
 * Run this to initialize the database
 */
import { initializeDatabase } from '../database/db.js';

console.log('🔧 Setting up BuilderGraph database...\n');

try {
    initializeDatabase();
    console.log('\n✅ Database setup complete!');
    console.log('📁 Database location:', process.env.DATABASE_PATH || './database/buildergraph.db');
    process.exit(0);
} catch (error) {
    console.error('\n❌ Database setup failed:', error);
    process.exit(1);
}
