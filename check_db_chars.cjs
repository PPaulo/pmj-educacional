const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'students.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Deep Analysis: Querying SQLite for corrupt strings...\n");

db.serialize(() => {
    // 1. Get all tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
            console.error("Error fetching tables:", err);
            return;
        }

        if (tables.length === 0) {
            console.log("No tables found in database.");
            return;
        }

        console.log(`Found ${tables.length} tables. checking for text corruptions...\n`);

        tables.forEach(table => {
            const tableName = table.name;
            if (tableName.startsWith('sqlite_')) return; // skip internal

            // 2. Get columns for this table
            db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
                if (err) return;

                const textColumns = columns
                    .filter(c => c.type.toLowerCase().includes('text') || c.type.toLowerCase().includes('varchar'))
                    .map(c => c.name);

                if (textColumns.length === 0) return;

                // 3. Build query to check for corrupt characters Ã, Â, â
                const orClauses = textColumns.map(col => `"${col}" LIKE '%Ã%' OR "${col}" LIKE '%Â%' OR "${col}" LIKE '%â%'`).join(' OR ');
                
                if (!orClauses) return;

                const query = `SELECT * FROM "${tableName}" WHERE ${orClauses}`;
                
                db.all(query, (err, rows) => {
                    if (err) return;

                    if (rows.length > 0) {
                        console.log(`[TABLE: ${tableName}] -> Found ${rows.length} rows with possible corruptions.`);
                        rows.forEach((row, index) => {
                            console.log(`  Row ${index + 1}:`);
                            textColumns.forEach(col => {
                                const val = row[col];
                                if (val && (val.includes('Ã') || val.includes('Â') || val.includes('â'))) {
                                    console.log(`    - ${col}: "${val}"`);
                                }
                            });
                        });
                    }
                });
            });
        });
    });
});
