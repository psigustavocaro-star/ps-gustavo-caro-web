const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.zxbbvokudyivgbyqrllq:GustavoPsico2026@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
});

async function test() {
  try {
    console.log('Connecting to pooler...');
    await client.connect();
    console.log('Connected!');
    const res = await client.query('SELECT current_database(), current_schema()');
    console.log('Query result:', res.rows);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
}

test();
