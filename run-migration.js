
const { Client } = require('pg');
require('dotenv').config();

// Manually parsing the URL for the test
const client = new Client({
    user: 'postgres.zxbbvokudyivgbyqrllq',
    host: 'aws-1-us-east-2.pooler.supabase.com',
    database: 'postgres',
    password: 'z31Wid40FILKAWIi',
    port: 6543,
    ssl: {
        rejectUnauthorized: false
    }
});

async function test() {
    try {
        await client.connect();
        const res = await client.query('SELECT current_user');
        console.log('Successfully connected as:', res.rows[0]);

        console.log('Running migration...');
        await client.query('ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "calBookingId" TEXT');
        console.log('Migration successful!');

    } catch (err) {
        console.error('FAILED:', err.message);
    } finally {
        await client.end();
    }
}

test();
