
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: 'postgres',
    host: 'db.zxbbvokudyivgbyqrllq.supabase.co',
    database: 'postgres',
    password: 'z31Wid40FILKAWIi',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

async function test() {
    try {
        console.log('Connecting to Direct URL...');
        await client.connect();
        console.log('Connected!');

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
