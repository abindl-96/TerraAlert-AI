import db from './config/db.js';

const migrations = [
    "ALTER TABLE user ADD COLUMN district VARCHAR(100) AFTER location;",
    "ALTER TABLE risk_predictions ADD COLUMN district VARCHAR(100) AFTER pincode;",
    "ALTER TABLE notifications ADD COLUMN district VARCHAR(100) AFTER pincode;"
];

async function runMigrations() {
    for (const sql of migrations) {
        try {
            await new Promise((resolve, reject) => {
                db.query(sql, (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_FIELDNAME') {
                            console.log(`Column already exists: ${sql.split(' ')[2]}.${sql.split(' ')[5]}`);
                            resolve();
                        } else {
                            reject(err);
                        }
                    } else {
                        console.log(`Migration successful: ${sql}`);
                        resolve();
                    }
                });
            });
        } catch (err) {
            console.error(`Error running migration: ${sql}`, err);
        }
    }
    process.exit();
}

runMigrations();
