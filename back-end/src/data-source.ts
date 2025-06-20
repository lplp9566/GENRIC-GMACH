
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config(); // טוען משתני סביבה מ–.env

export const AppDataSource = new DataSource({
  type: 'postgres',

  // אם יש לך URL ב–.env, אחרת אפשר לפרט host/port/user/password/db
  url: process.env.DATABASE_URL,

  // במידה ואתה משתמש בפרודקשן עם מיגרציות:
  synchronize: false,       // תמיד false בפרודקשן!
  migrationsRun: false,     // לא להריץ מיגרציות אוטומטית
  logging: true,           // או true לצורך דיבוג

  // כאן תגדיר את כל ה־entities שלך
  // הנתיב יחפש .entity.ts ו־.entity.js
  entities: [
  __dirname + '/modules/**/*.entity.{ts,js}'
  ],

  // תיקיית המיגרציות שבה ייווצרו הקבצים
  migrations: [
    __dirname + '/migrations/*.{ts,js}'
  ],

  subscribers: [],          // אם יש לך subscribers
});
