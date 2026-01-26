
const { Pool } = require('pg');
require('dotenv').config();

const url = process.env.DATABASE_URL.replace(/"/g, ''); // remove quotes if any
console.log('Testing URL:', url.split('@')[1]); // Log host part for safety

const pool = new Pool({
    connectionString: url,
});

async function test() {
    try {
        const res = await pool.query('SELECT current_user');
        console.log('Successfully connected as:', res.rows[0]);
    } catch (err) {
        console.error('Connection failed:', err.message);
    } finally {
        await pool.end();
    }
}

test();
