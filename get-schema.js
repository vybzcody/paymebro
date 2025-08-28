import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function getTableSchema(tableName) {
  try {
    // Get table columns info
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', tableName)
      .eq('table_schema', 'public');

    if (error) {
      console.error(`Error fetching ${tableName} schema:`, error);
      return;
    }

    console.log(`\n=== ${tableName.toUpperCase()} TABLE SCHEMA ===`);
    console.log('Column Name | Data Type | Nullable | Default');
    console.log('------------|-----------|----------|--------');
    
    data.forEach(col => {
      console.log(`${col.column_name.padEnd(11)} | ${col.data_type.padEnd(9)} | ${col.is_nullable.padEnd(8)} | ${col.column_default || 'NULL'}`);
    });

    return data;
  } catch (err) {
    console.error(`Error:`, err);
  }
}

async function main() {
  console.log('🔍 Fetching database schema...\n');
  
  // Get schemas for all main tables
  await getTableSchema('transactions');
  await getTableSchema('users');
  await getTableSchema('qr_codes');
  await getTableSchema('payment_links');
  
  process.exit(0);
}

main();
