import db from './config/db.js';
import fs from 'fs';

async function checkTables() {
    const tables = ['risk_predictions', 'notifications'];
    let report = "";
    for (const table of tables) {
        try {
            const result = await new Promise((resolve, reject) => {
                db.query(`DESCRIBE ${table}`, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            report += `Table: ${table}\n${JSON.stringify(result, null, 2)}\n\n`;
        } catch (err) {
            report += `Error describing ${table}: ${err.message}\n\n`;
        }
    }
    fs.writeFileSync('tables_status.txt', report);
    process.exit();
}

checkTables();
