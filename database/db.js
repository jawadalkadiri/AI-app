const Database = require('better-sqlite3');
const db = new Database('users.db');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

const appliedMigrations = db.prepare('SELECT name FROM migrations').all().map(row => row.name);

const migration = db.transaction(() => {
    if (!appliedMigrations.includes('add_company_and_position_to_analytics')) {
        db.exec(`
            ALTER TABLE analytics ADD COLUMN companyName TEXT;
            ALTER TABLE analytics ADD COLUMN position TEXT;
        `);
        db.prepare('INSERT INTO migrations (name) VALUES (?)').run('add_company_and_position_to_analytics');
    }
});

migration();

db.exec(`
    CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cv TEXT NOT NULL,
        jobDescription TEXT NOT NULL,
        matchScore INTEGER NOT NULL,
        strengths TEXT NOT NULL,
        missingSkills TEXT NOT NULL,
        recommendation TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

module.exports = {db};