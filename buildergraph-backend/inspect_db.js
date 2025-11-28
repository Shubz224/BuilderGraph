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
        console.log('Published Data Keys:', Object.keys(data));
        console.log('Score (root):', data.score);

        if (data.public) {
            console.log('Public Keys:', Object.keys(data.public));
            console.log('Score (public):', data.public.score);
            console.log('Score Breakdown (public):', data.public.scoreBreakdown);
        }

        // Check project and ai_analysis
        const project = db.prepare('SELECT * FROM projects WHERE ual = ?').get(row.project_ual);
        if (project) {
            console.log('Project found:', project.name);
            console.log('AI Analysis Hash:', project.ai_analysis_hash);
            if (project.ai_analysis_hash) {
                const analysis = db.prepare('SELECT * FROM ai_analysis WHERE hash = ?').get(project.ai_analysis_hash);
                if (analysis) {
                    console.log('Analysis found. Score:', analysis.score);
                    console.log('Analysis Breakdown:', analysis.score_breakdown);
                } else {
                    console.log('Analysis NOT found for hash:', project.ai_analysis_hash);
                }
            }
        } else {
            console.log('Project NOT found for UAL:', row.project_ual);
        }
    } catch (e) {
        console.log('Failed to parse published_data:', e.message);
    }
});
