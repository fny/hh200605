const fs = require('fs');

const DB_FILE = 'database.json';
exports.set = (key, value) => {
    const database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    database[key] = value;
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 4));
}

exports.get = (key) => {
    const database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    return database[key];
}
