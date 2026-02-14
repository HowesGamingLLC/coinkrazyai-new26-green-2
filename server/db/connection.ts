import { Pool } from 'pg';

// Clean DATABASE_URL if it includes the psql command wrapper
let connectionString = process.env.DATABASE_URL || '';
if (connectionString.startsWith('psql ')) {
  connectionString = connectionString.replace(/^psql\s+'/, '').replace(/'$/, '');
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`[DB] ${text.substring(0, 50)}... (${duration}ms)`);
    return res;
  } catch (error) {
    console.error('[DB ERROR]', error);
    throw error;
  }
};

export const getClient = async () => {
  return pool.connect();
};

export const closePool = async () => {
  await pool.end();
};

export default pool;
