// File: api/src/db/reset.ts
// เวอร์ชันใหม่: ใช้ TRUNCATE เพื่อลบข้อมูลและรีเซ็ต ID

import 'dotenv/config';
import { db } from './index';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Resetting database with TRUNCATE...');

  // สร้าง list ของตารางทั้งหมด
  const tables = [
    'users',
    'posts',
    'comments',
  ];

  // ใช้ TRUNCATE เพื่อลบข้อมูลและรีเซ็ต ID ทั้งหมดในครั้งเดียว
  await db.execute(sql.raw(`TRUNCATE TABLE ${tables.join(', ')} RESTART IDENTITY CASCADE;`));

  console.log('Database has been reset successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to reset database!', err);
  process.exit(1);
});