import { readFileSync } from 'fs';
import { join } from 'path';
import db from './index';

async function migrate() {
  console.log('Running migrations...');
  
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  
  try {
    await db.query(schema);
    console.log('✅ Migration complete');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

migrate();
