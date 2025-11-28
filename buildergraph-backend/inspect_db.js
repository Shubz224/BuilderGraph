import Database from 'better-sqlite3';
import path from 'path';

const dbPath = '/Users/stev3raj/Documents/main/crypto/my_dkg_node_3/BuilderGraph/buildergraph-backend/database/buildergraph.db';
const db = new Database(dbPath);

const rows = db.prepare('SELECT * FROM all_data').all();

console.log(`Found ${rows.length} rows in all_data`);

rows.forEach((row, index) => {
    console.log(`\nRow ${index + 1}:`);
    console.log(`ID: ${row.id}`);
    console.log(`UAL: ${row.ual}`);
    console.log(`User UAL: ${row.user_ual}`);
    console.log(`Project UAL: ${row.project_ual}`);

    try {
        const data = JSON.parse(row.published_data);
        const publicData = data.public || data;

        let analysisHash = null;
        if (publicData['schema:additionalProperty']) {
            const props = Array.isArray(publicData['schema:additionalProperty'])
                ? publicData['schema:additionalProperty']
                : [publicData['schema:additionalProperty']];
            const analysisProp = props.find(p => p['schema:name'] === 'aiAnalysis');
            if (analysisProp) {
                analysisHash = analysisProp['schema:value'];
                console.log('Found Hash in JSON:', analysisHash);
            }
        }

        if (analysisHash) {
            const analysis = db.prepare('SELECT * FROM ai_analysis WHERE hash = ?').get(analysisHash);
            if (analysis) {
                console.log('Analysis found in DB. Text length:', analysis.analysis_text ? analysis.analysis_text.length : 0);
            } else {
                console.log('Analysis NOT found in DB for hash:', analysisHash);
            }
        }
    } catch (e) {
        console.log('Failed to parse published_data:', e.message);
    }
});

// Check ai_analysis table columns
const tableInfo = db.prepare("PRAGMA table_info(ai_analysis)").all();
console.log('\nai_analysis Table Columns:', tableInfo.map(c => c.name));
