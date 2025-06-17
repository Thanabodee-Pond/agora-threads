import 'dotenv/config';
import { db } from './index';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Resetting database with TRUNCATE...');

  const tables = [
    'users',
    'posts',
    'comments',
  ];

  await db.execute(sql.raw(`TRUNCATE TABLE ${tables.join(', ')} RESTART IDENTITY CASCADE;`));

  console.log('Database has been reset successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to reset database!', err);
  process.exit(1);
});