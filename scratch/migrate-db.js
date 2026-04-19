const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.zxbbvokudyivgbyqrllq:GustavoPsico2026@aws-1-us-east-2.pooler.supabase.com:6543/postgres"
});

async function runSQL() {
  try {
    await client.connect();
    console.log('Connected to Supabase.');

    console.log('Adding missing columns to Booking table...');
    
    // Usamos 'IF NOT EXISTS' no es estándar en ALTER TABLE ADD COLUMN en todas las versiones, 
    // pero podemos atrapar el error o verificar existencia.
    // En Postgres 9.6+ (Supabase es 15+) podemos:
    
    const columns = [
      { name: 'firstName', type: 'TEXT' },
      { name: 'secondName', type: 'TEXT' },
      { name: 'firstSurname', type: 'TEXT' },
      { name: 'secondSurname', type: 'TEXT' },
      { name: 'country', type: 'TEXT DEFAULT \'Chile\'' },
      { name: 'region', type: 'TEXT' }
    ];

    for (const col of columns) {
      try {
        await client.query(`ALTER TABLE "Booking" ADD COLUMN "${col.name}" ${col.type}`);
        console.log(`Column ${col.name} added.`);
      } catch (e) {
        if (e.code === '42701') {
          console.log(`Column ${col.name} already exists.`);
        } else {
          console.error(`Error adding ${col.name}:`, e.message);
        }
      }
    }

    // Asegurar que 'name' sea opcional si no lo era
    try {
        await client.query('ALTER TABLE "Booking" ALTER COLUMN "name" DROP NOT NULL');
        console.log('Column "name" is now optional.');
    } catch (e) {
        console.log('Column "name" was already optional or error:', e.message);
    }

    console.log('Database sync complete.');
    await client.end();
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  }
}

runSQL();
