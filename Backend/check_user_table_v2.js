import db from './config/db.js';
import fs from 'fs';

db.query("DESCRIBE user", (err, result) => {
    if (err) {
        fs.writeFileSync('table_structure.txt', "Error describing user table: " + err.message);
    } else {
        fs.writeFileSync('table_structure.txt', JSON.stringify(result, null, 2));
    }
    process.exit();
});
