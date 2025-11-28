import Database from 'better-sqlite3';
import path from 'path';

const dbPath = '/Users/stev3raj/Documents/main/crypto/my_dkg_node_3/BuilderGraph/buildergraph-backend/database/buildergraph.db';
const db = new Database(dbPath);

console.log('Updating scores in all_data table...');

const rows = db.prepare('SELECT * FROM all_data').all();

const updateStmt = db.prepare('UPDATE all_data SET published_data = ? WHERE id = ?');

let updatedCount = 0;

rows.forEach((row) => {
    try {
        const data = JSON.parse(row.published_data);

        // Add sample score if missing
        if (!data.score) {
            data.score = 85;
            data.scoreBreakdown = {
                commitScore: 20,
                structureScore: 25,
                readmeScore: 20,
                metadataScore: 20
            };

            updateStmt.run(JSON.stringify(data), row.id);
            updatedCount++;
            console.log(`Updated row ID ${row.id} with score 85`);
        } else {
            console.log(`Row ID ${row.id} already has score: ${data.score}`);
        }
    } catch (e) {
        console.error(`Failed to update row ID ${row.id}:`, e.message);
    }
});

console.log(`\nSuccessfully updated ${updatedCount} rows.`);
