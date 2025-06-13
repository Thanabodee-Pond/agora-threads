// File: api/drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import 'dotenv/config'; // เพิ่มบรรทัดนี้เพื่อโหลด .env

export default defineConfig({
  schema: './src/db/schema.ts', // ตำแหน่งของไฟล์ schema ที่เราจะสร้าง
  out: './drizzle', // โฟลเดอร์สำหรับเก็บไฟล์ migrations
  dialect: 'postgresql', // ระบุว่าเราใช้ PostgreSQL
  dbCredentials: {
    url: process.env.DATABASE_URL!, // อ่านค่า DATABASE_URL จากไฟล์ .env
  },
  verbose: true,
  strict: true,
});