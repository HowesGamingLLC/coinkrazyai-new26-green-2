import { query } from './server/db/connection';

async function checkAdmin() {
  try {
    const result = await query('SELECT email, name, role, status FROM admin_users');
    console.log('Admin Users:', JSON.stringify(result.rows, null, 2));
  } catch (err) {
    console.error('Error checking admin users:', err);
  }
}

checkAdmin();
