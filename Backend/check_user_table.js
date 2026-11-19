import db from './config/db.js';

db.query("DESCRIBE user", (err, result) => {
    if (err) {
        console.error("Error describing user table:", err);
    } else {
        console.table(result);
    }
    process.exit();
});
